/**
 * YUSRA SYNTHETIC INTELLIGENCE - Bangladesh's First AI Super App
 * Backend API v4.0
 *
 * Stack: Express.js + Supabase + JWT
 * Free LLMs: Groq, Gemini, OpenRouter, Cohere
 * Paid LLMs: OpenAI, Anthropic
 * Image Gen: Pollinations.ai (free, no key)
 * Slides: LLM outline + pptxgenjs
 * Payment: Manual bKash/Nagad confirmation
 */

require('dotenv').config();

// Render's container network resolves Supabase's dual-stack *.supabase.co
// hostnames to an IPv6 address it can't actually route egress traffic to,
// so undici's fetch hangs on the IPv6 attempt before falling back to IPv4 —
// manifesting as "TypeError: fetch failed" after ~30-45s. Forcing IPv4-first
// resolution avoids the doomed attempt entirely. Must run before any module
// (e.g. middleware/auth, which builds the Supabase client at load time)
// performs its first DNS lookup.
require('dns').setDefaultResultOrder('ipv4first');

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
// Static assets (and any same-origin request) must never be blocked by CORS —
// browsers attach an Origin header even to same-origin `type="module"` script
// fetches, and without this check the app's own JS bundle gets rejected as
// cross-origin when frontend+backend are served from one origin (the
// single-service Render deployment this app actually uses).
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin === `${req.protocol}://${req.get('host')}`) {
    req.headers.origin = undefined;
  }
  next();
});

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (config.allowedOrigins.includes(origin)) return cb(null, true);
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    if (origin.endsWith('.onrender.com')) return cb(null, true);
    if (origin === 'https://meet-yusra.online' || origin === 'https://www.meet-yusra.online') return cb(null, true);
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
app.use('/api/slides', require('./routes/slides'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/music', require('./routes/music'));
app.use('/api/video', require('./routes/video'));
app.use('/api/search', require('./routes/search'));
app.use('/api/research', require('./routes/research'));
app.use('/api/tools', require('./routes/tools'));
app.use('/api/models', require('./routes/models'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Yusra Synthetic Intelligence',
    version: '4.0.0',
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

// This build doesn't content-hash output filenames (always /assets/app.js,
// /assets/app.css) — a long max-age on those would mean a browser NEVER
// re-checks with the server after the first load, so a new deploy would be
// invisible to already-visiting users for up to a year. Only cache files
// whose content genuinely doesn't change (images/icons/fonts) long-term;
// everything else must always revalidate.
const LONG_CACHE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf']);

if (hasFrontendBuild) {
  app.use(express.static(frontendDist, {
    extensions: ['html'],
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (config.nodeEnv === 'production' && LONG_CACHE_EXTENSIONS.has(ext)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));

  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (!fs.existsSync(frontendIndex)) return next();
    res.sendFile(frontendIndex);
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'Yusra Synthetic Intelligence API',
      version: '4.0.0',
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
║   YUSRA SYNTHETIC INTELLIGENCE BACKEND v4.0                ║
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
