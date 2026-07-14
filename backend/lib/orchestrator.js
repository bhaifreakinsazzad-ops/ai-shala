// Multi-model orchestration: fan-out a prompt to several models in parallel,
// then fuse their answers into one final response via a synthesis call.
//
// Reuses the existing per-provider call functions in routes/llm.js
// (callSingleModel) — this module only adds the fan-out/fuse control flow
// on top of them; it does not reimplement any provider integration.

const { callSingleModel, isModelAvailableStrict } = require('../routes/llm');
const { buildFusionPrompt } = require('./fusion-prompt');

const FAN_OUT_TIMEOUT_MS = 25_000;

// Preference-ordered list of models used for the fusion/synthesis step itself.
// Picked at call time from whichever of these is actually configured, so this
// works regardless of which provider keys the deployment has set.
const FUSION_MODEL_PREFERENCE = [
  'groq/llama-3.3-70b-versatile',
  'gemini/gemini-2.0-flash',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku-20240307',
  'openrouter/google/gemma-3-12b-it:free',
  'together/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
  'cohere/command-a-03-2025',
];

function pickFusionModel(excludeModelIds) {
  const exclude = new Set(excludeModelIds || []);
  const preferred = FUSION_MODEL_PREFERENCE.find(
    (m) => isModelAvailableStrict(m) && !exclude.has(m)
  );
  if (preferred) return preferred;
  // Fall back to any configured fusion candidate even if it was also fanned out to.
  return FUSION_MODEL_PREFERENCE.find((m) => isModelAvailableStrict(m)) || null;
}

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

class OrchestratorError extends Error {
  constructor(code, failures) {
    super(code);
    this.code = code;
    this.failures = failures;
  }
}

/**
 * Fan out `messages` to every model in `models`, then fuse the successful
 * responses into one final answer.
 *
 * @param {object} params
 * @param {string[]} params.models - 2-4 model ids, e.g. ['groq/llama-3.3-70b-versatile', 'openai/gpt-4o-mini']
 * @param {Array<{role:string, content:string}>} params.messages - conversation history + latest user turn
 * @param {string|null} [params.systemPrompt]
 * @returns {Promise<{content:string, fused:boolean, modelsUsed:string[], fusionModel:string|null, rawResponses:Array, failures:Array, usage:Array}>}
 */
async function orchestrate({ models, messages, systemPrompt = null }) {
  if (!Array.isArray(models) || models.length < 2) {
    throw new Error('orchestrate() requires at least 2 models to fan out to');
  }

  const allMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const settled = await Promise.allSettled(
    models.map((m) => withTimeout(callSingleModel(m, allMessages), FAN_OUT_TIMEOUT_MS, m))
  );

  const successes = [];
  const failures = [];
  settled.forEach((s, i) => {
    if (s.status === 'fulfilled') {
      successes.push({ modelId: models[i], ...s.value });
    } else {
      failures.push({ modelId: models[i], error: s.reason?.message || String(s.reason) });
    }
  });

  if (successes.length === 0) {
    throw new OrchestratorError('ALL_PROVIDERS_FAILED', failures);
  }

  const usage = successes.map((s) => ({
    modelId: s.modelId,
    callType: 'fanout',
    promptTokens: s.promptTokens,
    completionTokens: s.completionTokens,
  }));

  if (successes.length === 1) {
    // Nothing to fuse — return the single surviving response directly.
    return {
      content: successes[0].content,
      fused: false,
      modelsUsed: [successes[0].modelId],
      fusionModel: null,
      rawResponses: successes,
      failures,
      usage,
    };
  }

  const fusionModel = pickFusionModel(successes.map((s) => s.modelId));
  if (!fusionModel) {
    // No configured model left to do the fusion step — return the first
    // successful raw response rather than failing the whole request.
    return {
      content: successes[0].content,
      fused: false,
      modelsUsed: successes.map((s) => s.modelId),
      fusionModel: null,
      rawResponses: successes,
      failures,
      usage,
    };
  }

  const fusionPrompt = buildFusionPrompt(
    [...messages].reverse().find((m) => m.role === 'user')?.content || '',
    successes,
    failures
  );

  const fusionResult = await callSingleModel(fusionModel, [{ role: 'user', content: fusionPrompt }]);

  usage.push({
    modelId: fusionModel,
    callType: 'fusion',
    promptTokens: fusionResult.promptTokens,
    completionTokens: fusionResult.completionTokens,
  });

  return {
    content: fusionResult.content,
    fused: true,
    modelsUsed: successes.map((s) => s.modelId),
    fusionModel,
    rawResponses: successes,
    failures,
    usage,
  };
}

module.exports = { orchestrate, OrchestratorError, pickFusionModel };
