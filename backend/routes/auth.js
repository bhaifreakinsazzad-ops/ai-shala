const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { getRuntimeConfig, validateRuntimeConfig } = require('../lib/config');

const config = getRuntimeConfig();
const runtimeValidation = validateRuntimeConfig(config);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// Register
router.post('/register', async (req, res) => {
  try {
    if (runtimeValidation.missing.length > 0) {
      return res.status(503).json({
        error: 'Authentication database is not configured',
        missing: runtimeValidation.missing,
      });
    }

    const { email, password, name, phone } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + config.freeTrialDays);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email: normalizedEmail,
        password: hashedPassword,
        name,
        phone: phone || null,
        subscription: 'free',
        daily_usage: 0,
        daily_limit: config.freeDailyLimit,
        image_daily_usage: 0,
        image_daily_limit: config.freeImageDailyLimit,
        is_admin: false,
        trial_ends_at: trialEndsAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    if (runtimeValidation.missing.length > 0) {
      return res.status(503).json({
        error: 'Authentication database is not configured',
        missing: runtimeValidation.missing,
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'ইমেইল বা পাসওয়ার্ড ভুল' });
    }

    const lastReset = new Date(user.last_reset_at || 0);
    const today = new Date();
    if (lastReset.toDateString() !== today.toDateString()) {
      await supabase
        .from('users')
        .update({
          daily_usage: 0,
          image_daily_usage: 0,
          last_reset_at: today.toISOString()
        })
        .eq('id', user.id);
      user.daily_usage = 0;
      user.image_daily_usage = 0;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// Update profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to update profile' });

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const validPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'বর্তমান পাসওয়ার্ড ভুল' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ success: true, message: 'পাসওয়ার্ড পরিবর্তন হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

module.exports = router;
