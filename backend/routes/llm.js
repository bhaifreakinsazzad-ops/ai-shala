const axios = require('axios');

/**
 * Central LLM caller — supports Groq, Gemini, OpenRouter, Cohere
 * Model ID format: "provider/model-name"
 */
async function callLLM(modelId, messages, systemPrompt = null) {
  const parts = modelId.split('/');
  const provider = parts[0];  // groq | gemini | openrouter | cohere

  const allMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  try {
    switch (provider) {
      case 'groq':
        return await callGroq(parts.slice(1).join('/'), allMessages);

      case 'gemini':
        return await callGemini(parts.slice(1).join('/'), allMessages);

      case 'openrouter':
        // openrouter/org/model:free  →  "org/model:free"
        return await callOpenRouter(parts.slice(1).join('/'), allMessages);

      case 'cohere':
        return await callCohere(parts.slice(1).join('/'), allMessages);

      default:
        return 'দুঃখিত, এই মডেলটি সংযুক্ত নয়।';
    }
  } catch (err) {
    console.error(`LLM error [${modelId}]:`, err?.response?.data || err.message);
    const msg = err?.response?.data?.error?.message
             || err?.response?.data?.message
             || err.message
             || 'Unknown error';
    throw new Error(msg);
  }
}

// ── Groq ──────────────────────────────────────────────────────────────────────
async function callGroq(model, messages) {
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

// ── Google Gemini ──────────────────────────────────────────────────────────────
// Model IDs stored as "gemini/gemini-2.0-flash" → modelName = "gemini-2.0-flash"
const GEMINI_MODEL_MAP = {
  'gemini-2.0-flash-exp': 'gemini-2.0-flash',   // alias fix
  'gemini-2.0-flash':     'gemini-2.0-flash',
  'gemini-1.5-flash':     'gemini-1.5-flash',
  'gemini-1.5-flash-8b':  'gemini-1.5-flash-8b',
  'gemini-1.5-pro':       'gemini-1.5-pro',
};

async function callGemini(rawModel, messages) {
  const model = GEMINI_MODEL_MAP[rawModel] || rawModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const systemMsg = messages.find(m => m.role === 'system');
  const convMsgs  = messages.filter(m => m.role !== 'system');

  const body = {
    contents: convMsgs.map(m => ({
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

// ── OpenRouter ─────────────────────────────────────────────────────────────────
async function callOpenRouter(model, messages) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    { model, messages, temperature: 0.7, max_tokens: 4096 },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'https://aishala.com',
        'X-Title': 'AI Shala Bangladesh',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );
  return response.data.choices[0].message.content;
}

// ── Cohere ─────────────────────────────────────────────────────────────────────
const COHERE_MODEL_MAP = {
  'command-r':       'command-r-08-2024',
  'command-r-plus':  'command-r-plus-08-2024',
};

async function callCohere(rawModel, messages) {
  const model = COHERE_MODEL_MAP[rawModel] || rawModel;
  const chatHistory = messages.slice(0, -1).map(m => ({
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

module.exports = { callLLM };
