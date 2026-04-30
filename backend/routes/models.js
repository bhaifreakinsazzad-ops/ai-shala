const express = require('express');
const router = express.Router();
const { AUTO_FREE_MODEL, getAutoFreeCandidates, isModelAvailable, getProviderStatus } = require('./llm');

const ALL_MODELS = [
  { id: AUTO_FREE_MODEL, name: 'Autopilot Free', provider: 'System', free: true, category: 'chat', contextWindow: 128000, description: 'Auto-select best available free model with fallback', badge: 'Recommended' },
  { id: 'groq/llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', provider: 'Groq', free: true, category: 'chat', contextWindow: 128000, description: 'Most capable free model', badge: 'Best Free' },
  { id: 'groq/llama-3.1-8b-instant', name: 'LLaMA 3.1 8B Instant', provider: 'Groq', free: true, category: 'chat', contextWindow: 128000, description: 'Ultra-fast responses', badge: '⚡ Fast' },
  { id: 'groq/llama-3.2-11b-vision-preview', name: 'LLaMA 3.2 11B Vision', provider: 'Groq', free: true, category: 'vision', contextWindow: 128000, description: 'Vision + text', badge: '👁 Vision' },
  { id: 'groq/llama-3.2-90b-vision-preview', name: 'LLaMA 3.2 90B Vision', provider: 'Groq', free: true, category: 'vision', contextWindow: 128000, description: 'Best vision model', badge: '👁 Vision' },
  { id: 'groq/gemma2-9b-it', name: 'Gemma 2 9B', provider: 'Groq', free: true, category: 'chat', contextWindow: 8192, description: "Google's open model" },
  { id: 'groq/mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', free: true, category: 'chat', contextWindow: 32768, description: 'MoE architecture', badge: '🔀 MoE' },

  { id: 'gemini/gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', free: true, category: 'chat', contextWindow: 1048576, description: 'Fastest Gemini, 1M ctx', badge: '🆕 New' },
  { id: 'gemini/gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'Google', free: true, category: 'chat', contextWindow: 1048576, description: 'Lightweight & fast' },
  { id: 'gemini/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', free: true, category: 'chat', contextWindow: 2097152, description: '2M context window', badge: '🔑 Pro' },

  { id: 'openrouter/google/gemma-3-12b-it:free', name: 'Gemma 3 12B', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: "Google's Gemma 3", badge: '✅ Verified' },
  { id: 'openrouter/nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 120B', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: 'NVIDIA 120B powerhouse', badge: '⚡ NVIDIA' },
  { id: 'openrouter/nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: 'Massive 405B model', badge: '🔥 Giant' },
  { id: 'openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition:free', name: 'Dolphin 24B', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 32768, description: 'Uncensored assistant' },
  { id: 'openrouter/arcee-ai/trinity-large-preview:free', name: 'Trinity Large', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: 'Arcee AI model' },
  { id: 'openrouter/arcee-ai/trinity-mini:free', name: 'Trinity Mini', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: 'Arcee AI compact' },
  { id: 'openrouter/z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', provider: 'OpenRouter', free: true, category: 'chat', contextWindow: 131072, description: 'Z.ai fast model' },

  { id: 'cohere/command-a-03-2025', name: 'Command A (2025)', provider: 'Cohere', free: true, category: 'chat', contextWindow: 256000, description: 'Latest Cohere model', badge: '🆕 2025' },
  { id: 'cohere/command-r-plus-08-2024', name: 'Command R+ (Aug 2024)', provider: 'Cohere', free: true, category: 'chat', contextWindow: 128000, description: 'Advanced reasoning + RAG', badge: '📚 RAG' },
  { id: 'cohere/command-r-08-2024', name: 'Command R (Aug 2024)', provider: 'Cohere', free: true, category: 'chat', contextWindow: 128000, description: 'Balanced RAG model' },
  { id: 'together/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', name: 'Llama 3.3 70B Turbo Free', provider: 'Together', free: true, category: 'chat', contextWindow: 32768, description: 'Together free high-quality model', badge: '🧠 Turbo' },
  { id: 'together/meta-llama/Llama-3.1-8B-Instruct-Turbo', name: 'Llama 3.1 8B Turbo', provider: 'Together', free: true, category: 'chat', contextWindow: 32768, description: 'Fast Together model' },

  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', free: false, pro: true, category: 'chat', contextWindow: 128000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', free: false, pro: true, category: 'chat', contextWindow: 128000 },
  { id: 'anthropic/claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', free: false, pro: true, category: 'chat', contextWindow: 200000 },
  { id: 'anthropic/claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'Anthropic', free: false, pro: true, category: 'chat', contextWindow: 200000 },
];

function decorateModel(model) {
  return {
    ...model,
    available: isModelAvailable(model.id),
  };
}

router.get('/', (req, res) => {
  const { free, category, available } = req.query;
  let models = ALL_MODELS.map(decorateModel);

  if (free === 'true') models = models.filter((m) => m.free);
  if (category) models = models.filter((m) => m.category === category);
  if (available === 'true') models = models.filter((m) => m.available);

  const grouped = {
    system: models.filter((m) => m.provider === 'System'),
    groq: models.filter((m) => m.provider === 'Groq'),
    google: models.filter((m) => m.provider === 'Google'),
    openrouter: models.filter((m) => m.provider === 'OpenRouter'),
    cohere: models.filter((m) => m.provider === 'Cohere'),
    together: models.filter((m) => m.provider === 'Together'),
    openai: models.filter((m) => m.provider === 'OpenAI'),
    anthropic: models.filter((m) => m.provider === 'Anthropic'),
    pro: models.filter((m) => m.pro),
  };

  res.json({
    models,
    grouped,
    total: models.length,
    providers: getProviderStatus(),
    autoFallbackCandidates: getAutoFreeCandidates(),
  });
});

module.exports = router;
module.exports.ALL_MODELS = ALL_MODELS;
