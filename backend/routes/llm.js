const axios = require('axios');
const { getRuntimeConfig } = require('../lib/config');

const config = getRuntimeConfig();

const PROVIDER_KEYS = {
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  together: 'TOGETHER_API_KEY',
  cohere: 'COHERE_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
};

const AUTO_FREE_MODEL = 'auto/free';
const AUTO_FREE_CANDIDATES = [
  'groq/llama-3.3-70b-versatile',
  'groq/llama-3.1-8b-instant',
  'gemini/gemini-2.0-flash',
  'openrouter/google/gemma-3-12b-it:free',
  'openrouter/z-ai/glm-4.5-air:free',
  'together/meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
  'cohere/command-a-03-2025',
];

function hasProviderAccess(provider) {
  return Boolean(config.providers[provider]);
}

function isModelAvailable(modelId) {
  const provider = String(modelId || '').split('/')[0];
  if (modelId === AUTO_FREE_MODEL) return getAutoFreeCandidates().length > 0;
  return Boolean(PROVIDER_KEYS[provider] && hasProviderAccess(provider));
}

function getProviderStatus() {
  return Object.fromEntries(
    Object.entries(PROVIDER_KEYS).map(([provider, envKey]) => [
      provider,
      {
        enabled: hasProviderAccess(provider),
        envKey,
      },
    ])
  );
}

function getAutoFreeCandidates() {
  return AUTO_FREE_CANDIDATES.filter((modelId) => isModelAvailableStrict(modelId));
}

function isModelAvailableStrict(modelId) {
  const provider = String(modelId || '').split('/')[0];
  return Boolean(PROVIDER_KEYS[provider] && hasProviderAccess(provider));
}

function getFallbackCandidates(modelId) {
  if (modelId === AUTO_FREE_MODEL) {
    return getAutoFreeCandidates();
  }

  if (isModelAvailableStrict(modelId)) {
    return [modelId, ...getAutoFreeCandidates().filter((candidate) => candidate !== modelId)];
  }

  return getAutoFreeCandidates();
}

async function callLLM(modelId, messages, systemPrompt = null) {
  const result = await callLLMWithFallback(modelId, messages, systemPrompt);
  return result.content;
}

async function callLLMWithFallback(modelId, messages, systemPrompt = null) {
  const candidates = getFallbackCandidates(modelId);

  if (candidates.length === 0) {
    throw new Error('No free model providers are currently configured on this server.');
  }

  const allMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const errors = [];
  for (const candidate of candidates) {
    try {
      const content = await callSingleModel(candidate, allMessages);
      return {
        content,
        modelUsed: candidate,
        fallbackUsed: candidate !== modelId,
        fallbackFrom: modelId,
      };
    } catch (err) {
      const message = err?.response?.data?.error?.message
        || err?.response?.data?.message
        || err.message
        || 'Unknown error';
      errors.push({ model: candidate, message });
      console.error(`LLM error [${candidate}]:`, err?.response?.data || err.message);
    }
  }

  const summary = errors.map((item) => `${item.model}: ${item.message}`).join(' | ');
  throw new Error(`All model fallbacks failed. ${summary}`);
}

async function callSingleModel(modelId, messages) {
  const parts = String(modelId || '').split('/');
  const provider = parts[0];
  const providerModel = parts.slice(1).join('/');

  switch (provider) {
    case 'groq':
      return callGroq(providerModel, messages);
    case 'gemini':
      return callGemini(providerModel, messages);
    case 'openrouter':
      return callOpenRouter(providerModel, messages);
    case 'together':
      return callTogether(providerModel, messages);
    case 'cohere':
      return callCohere(providerModel, messages);
    case 'openai':
      return callOpenAI(providerModel, messages);
    case 'anthropic':
      return callAnthropic(providerModel, messages);
    default:
      throw new Error('Unsupported model provider');
  }
}

function assertProvider(provider) {
  if (!hasProviderAccess(provider)) {
    throw new Error(`${provider} provider is not configured on this server`);
  }
}

async function callGroq(model, messages) {
  assertProvider('groq');

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    { model, messages, temperature: 0.7, max_tokens: 4096 },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content;
}

const GEMINI_MODEL_MAP = {
  'gemini-2.0-flash-exp': 'gemini-2.0-flash',
  'gemini-2.0-flash': 'gemini-2.0-flash',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-flash-8b': 'gemini-1.5-flash-8b',
  'gemini-1.5-pro': 'gemini-1.5-pro',
};

async function callGemini(rawModel, messages) {
  assertProvider('gemini');

  const model = GEMINI_MODEL_MAP[rawModel] || rawModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const systemMsg = messages.find((m) => m.role === 'system');
  const convMsgs = messages.filter((m) => m.role !== 'system');

  const body = {
    contents: convMsgs.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
  };

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const response = await axios.post(url, body, { timeout: 30000 });
  return response.data.candidates[0].content.parts[0].text;
}

async function callOpenRouter(model, messages) {
  assertProvider('openrouter');

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { model, messages, temperature: 0.7, max_tokens: 4096 },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': config.frontendUrl || 'https://aishala.com',
        'X-Title': 'AI Shala Bangladesh',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}

async function callTogether(model, messages) {
  assertProvider('together');

  const response = await axios.post(
    'https://api.together.xyz/v1/chat/completions',
    { model, messages, temperature: 0.7, max_tokens: 4096 },
    {
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}

const COHERE_MODEL_MAP = {
  'command-r': 'command-r-08-2024',
  'command-r-plus': 'command-r-plus-08-2024',
};

async function callCohere(rawModel, messages) {
  assertProvider('cohere');

  const model = COHERE_MODEL_MAP[rawModel] || rawModel;
  const chatHistory = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'USER' : 'CHATBOT',
    message: m.content,
  }));
  const lastMessage = messages[messages.length - 1].content;

  const response = await axios.post(
    'https://api.cohere.ai/v1/chat',
    { model, chat_history: chatHistory, message: lastMessage, temperature: 0.7 },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.text;
}

const OPENAI_MODEL_MAP = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o-mini',
};

async function callOpenAI(rawModel, messages) {
  assertProvider('openai');

  const model = OPENAI_MODEL_MAP[rawModel] || rawModel;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model, messages, temperature: 0.7, max_tokens: 4096 },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}

const ANTHROPIC_MODEL_MAP = {
  'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
  'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
};

async function callAnthropic(rawModel, messages) {
  assertProvider('anthropic');

  const model = ANTHROPIC_MODEL_MAP[rawModel] || rawModel;
  const systemMsg = messages.find((m) => m.role === 'system');
  const convMsgs = messages.filter((m) => m.role !== 'system');

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      max_tokens: 4096,
      temperature: 0.7,
      system: systemMsg ? systemMsg.content : undefined,
      messages: convMsgs.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.content.map((part) => part.text).join('');
}

module.exports = {
  AUTO_FREE_MODEL,
  callLLM,
  callLLMWithFallback,
  isModelAvailable,
  getProviderStatus,
  getAutoFreeCandidates,
};
