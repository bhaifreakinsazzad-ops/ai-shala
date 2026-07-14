// Approximate USD pricing per 1M tokens, keyed by "provider/model" prefix match.
// Manually maintained — providers don't expose pricing APIs reliably. Free-tier
// models (Groq, most OpenRouter ":free" models, Together's free tier, Pollinations)
// are priced at 0. Update as pricing changes or new providers are added.
const PRICING_PER_MILLION_TOKENS = [
  { match: /^groq\//, input: 0, output: 0 },
  { match: /^gemini\/gemini-2\.0-flash/, input: 0, output: 0 },
  { match: /^gemini\/gemini-1\.5-flash/, input: 0.075, output: 0.3 },
  { match: /^gemini\/gemini-1\.5-pro/, input: 1.25, output: 5 },
  { match: /:free$/, input: 0, output: 0 }, // openrouter free-tier models
  { match: /^openrouter\//, input: 0.5, output: 1.5 }, // rough default for paid openrouter models
  { match: /^together\//, input: 0, output: 0 }, // Free tier models used in this app
  { match: /^cohere\//, input: 0.5, output: 1.5 },
  { match: /^openai\/gpt-4o-mini/, input: 0.15, output: 0.6 },
  { match: /^openai\/gpt-4o/, input: 2.5, output: 10 },
  { match: /^anthropic\/claude-3-haiku/, input: 0.25, output: 1.25 },
  { match: /^anthropic\/claude-3-5-sonnet/, input: 3, output: 15 },
  { match: /^cerebras\//, input: 0, output: 0 }, // free tier (rate-limited: 5 rpm, 1M tokens/day)
  { match: /^huggingface\/meta-llama\/Llama-3\.1-8B-Instruct/, input: 0.02, output: 0.05 }, // via novita, confirmed live
  { match: /^huggingface\//, input: 0.15, output: 0.6 }, // conservative default for other HF-routed models — verify actual per-model pricing via GET /v1/models before relying on this
  { match: /^llm7\//, input: 0, output: 0 }, // free community-run proxy
  { match: /^cloudflare\//, input: 0, output: 0 }, // free within daily Neuron allowance
];

const DEFAULT_PRICING = { input: 1, output: 3 }; // conservative fallback for unlisted models

function pricingFor(modelId) {
  const entry = PRICING_PER_MILLION_TOKENS.find((p) => p.match.test(modelId));
  return entry || DEFAULT_PRICING;
}

function callCostUsd(modelId, promptTokens, completionTokens) {
  const { input, output } = pricingFor(modelId);
  const cost = ((promptTokens || 0) / 1_000_000) * input + ((completionTokens || 0) / 1_000_000) * output;
  return Math.round(cost * 1_000_000) / 1_000_000; // 6 decimal places
}

function totalCostUsd(usageEntries) {
  return (usageEntries || []).reduce(
    (sum, u) => sum + callCostUsd(u.modelId, u.promptTokens, u.completionTokens),
    0
  );
}

module.exports = { callCostUsd, totalCostUsd, pricingFor };
