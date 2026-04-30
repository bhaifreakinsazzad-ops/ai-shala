const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { getRuntimeConfig, validateRuntimeConfig } = require('../lib/config');
const { normalizeUserState } = require('./user-state');

const config = getRuntimeConfig();
const runtimeValidation = validateRuntimeConfig(config);
const supabase = createClient(config.supabaseUrl || 'https://example.supabase.co', config.supabaseServiceKey || 'placeholder-key');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if (runtimeValidation.missing.length > 0) {
      return res.status(503).json({
        error: 'Authentication is not configured',
        missing: runtimeValidation.missing,
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account is suspended' });
    }

    req.user = await normalizeUserState(supabase, user);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  const adminEmails = config.adminEmails;
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, requireAdmin, supabase };
