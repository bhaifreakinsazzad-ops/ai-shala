const express = require('express');
const router = express.Router();
const { supabase, authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// ============ DASHBOARD STATS ============

router.get('/stats', async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: proUsers },
      { count: pendingPayments },
      { count: totalMessages },
      { count: totalImages },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).neq('subscription', 'free'),
      supabase.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('image_history').select('*', { count: 'exact', head: true }),
    ]);

    // Revenue from approved payments this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthPayments } = await supabase
      .from('payment_requests')
      .select('amount')
      .eq('status', 'approved')
      .gte('created_at', monthStart.toISOString());

    const monthlyRevenue = (monthPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

    // Recent signups (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        pendingPayments: pendingPayments || 0,
        totalMessages: totalMessages || 0,
        totalImages: totalImages || 0,
        monthlyRevenue,
        newUsersThisWeek: newUsers || 0,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ PAYMENT MANAGEMENT ============

// List all payment requests
router.get('/payments', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) query = query.eq('status', status);

    const { data: payments, error, count } = await query;

    if (error) return res.status(500).json({ error: 'Failed to fetch payments' });
    res.json({ payments, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve payment
router.post('/payments/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const { data: payment, error: fetchErr } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    // Calculate subscription end date (30 days from now)
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 30);

    // Update payment status
    await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        admin_note: note || null,
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Update user subscription
    const planLimits = {
      pro: { daily_limit: 999999, image_daily_limit: 999999 },
      premium: { daily_limit: 999999, image_daily_limit: 999999 },
    };

    const limits = planLimits[payment.plan_id] || planLimits.pro;

    await supabase
      .from('users')
      .update({
        subscription: payment.plan_id,
        subscription_ends_at: endsAt.toISOString(),
        daily_limit: limits.daily_limit,
        image_daily_limit: limits.image_daily_limit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.user_id);

    res.json({
      success: true,
      message: `পেমেন্ট অ্যাপ্রুভ করা হয়েছে। ব্যবহারকারীর ${payment.plan_id} প্ল্যান সক্রিয় হয়েছে।`,
    });
  } catch (err) {
    console.error('Approve payment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject payment
router.post('/payments/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: payment } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await supabase
      .from('payment_requests')
      .update({
        status: 'rejected',
        admin_note: reason || 'Transaction could not be verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    res.json({ success: true, message: 'পেমেন্ট রিজেক্ট করা হয়েছে।' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ USER MANAGEMENT ============

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, subscription } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('id, email, name, phone, subscription, daily_usage, daily_limit, created_at, subscription_ends_at, is_admin')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    if (subscription) query = query.eq('subscription', subscription);

    const { data: users, error } = await query;

    if (error) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manually upgrade/downgrade user
router.patch('/users/:id/subscription', async (req, res) => {
  try {
    const { subscription, days = 30 } = req.body;
    const validSubs = ['free', 'pro', 'premium'];

    if (!validSubs.includes(subscription)) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    const endsAt = subscription !== 'free' ? new Date(Date.now() + days * 86400000).toISOString() : null;
    const limits = {
      free: { daily_limit: 50, image_daily_limit: 5 },
      pro: { daily_limit: 999999, image_daily_limit: 999999 },
      premium: { daily_limit: 999999, image_daily_limit: 999999 },
    };

    await supabase
      .from('users')
      .update({
        subscription,
        subscription_ends_at: endsAt,
        daily_limit: limits[subscription].daily_limit,
        image_daily_limit: limits[subscription].image_daily_limit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id);

    res.json({ success: true, message: 'ব্যবহারকারীর সাবস্ক্রিপশন আপডেট হয়েছে' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ban/unban user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { banned, reason } = req.body;
    await supabase
      .from('users')
      .update({ is_banned: banned, ban_reason: reason || null, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ USAGE ANALYTICS ============

router.get('/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const { data: usage } = await supabase
      .from('usage_logs')
      .select('type, model, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    // Group by type
    const byType = (usage || []).reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    // Top models
    const byModel = (usage || []).reduce((acc, log) => {
      if (log.model) acc[log.model] = (acc[log.model] || 0) + 1;
      return acc;
    }, {});

    const topModels = Object.entries(byModel)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([model, count]) => ({ model, count }));

    res.json({ usage: byType, topModels, totalRequests: (usage || []).length, days: parseInt(days) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
