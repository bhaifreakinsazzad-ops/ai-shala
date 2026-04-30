/**
 * AI SHALA - Bangladesh's First AI Super App
 * Backend API v3.0
 *
 * Stack: Express.js + Supabase + JWT
 * Free LLMs: Groq, Gemini, OpenRouter, Cohere
 * Paid LLMs: OpenAI, Anthropic
 * Image Gen: Pollinations.ai (free, no key)
 * Payment: Manual bKash/Nagad confirmation
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('node:fs');
const path = require('node:path');
const { getRuntimeConfig, validateRuntimeConfig } = require('./lib/config');
const { supabase } = require('./middleware/auth');

const config = getRuntimeConfig();
const runtimeValidation = validateRuntimeConfig(config);

const app = express();
const PORT = config.port;

app.disable('x-powered-by');
app.set('trust proxy', 1);

// ============ MIDDLEWARE ============

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.allowedOrigins.includes(origin)) return cb(null, true);
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  res.setHeader('X-API-Version', '3.0.0');
  next();
});

app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. অনুগ্রহ করে কিছুক্ষণ পরে চেষ্টা করুন।' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts. Please try again later.' },
}));

// ============ ROUTES ============

app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/image', require('./routes/image'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/models', require('./routes/models'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AI Shala',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    configuredProviders: config.providers,
  });
});

app.get('/api/ready', async (req, res) => {
  const checks = {
    env: {
      ready: runtimeValidation.missing.length === 0,
      missing: runtimeValidation.missing,
    },
    providers: config.providers,
  };

  if (!checks.env.ready) {
    return res.status(503).json({ status: 'not_ready', checks });
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      return res.status(503).json({
        status: 'not_ready',
        checks: {
          ...checks,
          database: { ready: false, error: error.message },
        },
      });
    }

    return res.json({
      status: 'ready',
      checks: {
        ...checks,
        database: { ready: true },
      },
    });
  } catch (err) {
    return res.status(503).json({
      status: 'not_ready',
      checks: {
        ...checks,
        database: { ready: false, error: err.message },
      },
    });
  }
});

const frontendDist = path.resolve(__dirname, '..', 'frontend', 'dist');
const frontendIndex = path.join(frontendDist, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndex);

if (hasFrontendBuild) {
  app.use(express.static(frontendDist, {
    extensions: ['html'],
    maxAge: config.nodeEnv === 'production' ? '1y' : 0,
  }));

  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (!fs.existsSync(frontendIndex)) return next();
    res.sendFile(frontendIndex);
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'AI Shala API',
      version: '3.0.0',
      description: "Bangladesh's First AI Super App",
      docs: '/api/health',
    });
  });
}

// ============ ERROR HANDLING ============

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message || 'Request failed',
  });
});

// ============ START ============

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   AI SHALA BACKEND v3.0                                   ║
║   Bangladesh's First AI Super App                        ║
║                                                            ║
║   http://localhost:${PORT}                                ║
║   Environment: ${config.nodeEnv.padEnd(35)}║
║                                                            ║
║   Providers: ${Object.entries(config.providers).map(([name, enabled]) => `${name}=${enabled ? 'on' : 'off'}`).join(', ')}║
║   Payments: ${config.paymentPhone.padEnd(43)}║
║   Admins: ${(config.adminEmails.join(', ') || 'not set').padEnd(44)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
