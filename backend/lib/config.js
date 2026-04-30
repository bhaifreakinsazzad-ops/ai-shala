const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://powered-by-bhaisazzad.online',
  'https://www.powered-by-bhaisazzad.online',
];

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function splitCsv(value) {
  return (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isPlaceholderValue(value) {
  if (!value) return true;
  const normalized = String(value).trim().toLowerCase();
  return [
    'your-project.supabase.co',
    'your-supabase-service-role-key',
    'your_groq_api_key_here',
    'your_gemini_api_key_here',
    'your_openrouter_api_key_here',
    'your_together_api_key_here',
    'your_cohere_api_key_here',
    'your_openai_api_key_here',
    'your_anthropic_api_key_here',
    'change-this-to-a-long-random-secret-string-min-32-chars',
    'placeholder-key',
    'example',
    'not set',
  ].some((placeholder) => normalized.includes(placeholder));
}

function normalizeOrigin(origin) {
  return origin ? origin.trim().replace(/\/$/, '') : origin;
}

function getAllowedOrigins() {
  const configuredOrigins = splitCsv(process.env.ALLOWED_ORIGINS);
  const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:5173');
  const renderUrl = normalizeOrigin(process.env.RENDER_EXTERNAL_URL || '');
  const merged = [...configuredOrigins, frontendUrl, renderUrl, ...DEFAULT_ALLOWED_ORIGINS];
  return [...new Set(merged.map(normalizeOrigin))];
}

function getProviderConfig() {
  return {
    groq: !isPlaceholderValue(process.env.GROQ_API_KEY),
    gemini: !isPlaceholderValue(process.env.GEMINI_API_KEY),
    openrouter: !isPlaceholderValue(process.env.OPENROUTER_API_KEY),
    cohere: !isPlaceholderValue(process.env.COHERE_API_KEY),
    openai: !isPlaceholderValue(process.env.OPENAI_API_KEY),
    anthropic: !isPlaceholderValue(process.env.ANTHROPIC_API_KEY),
  };
}

function getRuntimeConfig() {
  return {
    appName: process.env.APP_NAME || 'AI Shala',
    appUrl: process.env.APP_URL || 'http://localhost:5173',
    frontendUrl: normalizeOrigin(process.env.FRONTEND_URL || 'http://localhost:5173'),
    appUrl: normalizeOrigin(process.env.APP_URL || ''),
    renderExternalUrl: normalizeOrigin(process.env.RENDER_EXTERNAL_URL || ''),
    port: toInt(process.env.PORT, 3001),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    paymentPhone: process.env.PAYMENT_PHONE || '01778307704',
    freeTrialDays: toInt(process.env.FREE_TRIAL_DAYS, 7),
    freeDailyLimit: toInt(process.env.FREE_DAILY_LIMIT, 50),
    freeImageDailyLimit: toInt(process.env.FREE_IMAGE_DAILY_LIMIT, 5),
    adminEmails: splitCsv(process.env.ADMIN_EMAILS),
    allowedOrigins: getAllowedOrigins(),
    providers: getProviderConfig(),
  };
}

function validateRuntimeConfig(config) {
  const missing = [];

  if (isPlaceholderValue(config.jwtSecret)) missing.push('JWT_SECRET');
  if (isPlaceholderValue(config.supabaseUrl)) missing.push('SUPABASE_URL');
  if (isPlaceholderValue(config.supabaseServiceKey)) missing.push('SUPABASE_SERVICE_KEY');

  if (config.nodeEnv === 'production' && missing.length > 0) {
    throw new Error(`Missing required production env vars: ${missing.join(', ')}`);
  }

  return {
    missing,
    providerWarnings: Object.entries(config.providers)
      .filter(([, enabled]) => !enabled)
      .map(([provider]) => provider),
  };
}

module.exports = {
  getRuntimeConfig,
  validateRuntimeConfig,
  normalizeOrigin,
  toInt,
  splitCsv,
  isPlaceholderValue,
};
