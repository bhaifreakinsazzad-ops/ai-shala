const express = require('express');
const router = express.Router();
const axios = require('axios');
const { supabase, authenticateToken } = require('../middleware/auth');
const { getRuntimeConfig, isPlaceholderValue } = require('../lib/config');

const config = getRuntimeConfig();
const TAVILY_URL = 'https://api.tavily.com/search';

function isSearchConfigured() {
  return Boolean(config.searchProviders.tavily);
}

// Internal helper — used directly by the research route, not just the HTTP handler.
async function runWebSearch(query, { maxResults = 5, includeAnswer = true } = {}) {
  if (!isSearchConfigured()) {
    throw Object.assign(new Error('Web search is not configured on this server'), { statusCode: 503 });
  }

  const response = await axios.post(TAVILY_URL, {
    api_key: process.env.TAVILY_API_KEY,
    query,
    max_results: maxResults,
    include_answer: includeAnswer,
    search_depth: 'basic',
  }, { timeout: 20000 });

  const data = response.data;
  return {
    answer: data.answer || null,
    results: (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    })),
  };
}

// GET /api/search/status
router.get('/status', (req, res) => {
  res.json({ configured: isSearchConfigured() });
});

// POST /api/search
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { query } = req.body;

    if (!query?.trim()) return res.status(400).json({ error: 'Query required' });

    if (user.subscription === 'free' && user.daily_usage >= user.daily_limit) {
      return res.status(429).json({
        error: 'দৈনিক সীমা শেষ। Pro প্ল্যানে আনলিমিটেড ব্যবহার করুন।',
        upgradeRequired: true,
      });
    }

    if (!isSearchConfigured()) {
      return res.status(503).json({
        error: 'ইন্টারনেট সার্চ এখনো চালু হয়নি — সার্ভার কনফিগারেশন বাকি আছে।',
        configured: false,
      });
    }

    const result = await runWebSearch(query.trim());

    if (user.subscription === 'free') {
      await supabase.from('users').update({
        daily_usage: user.daily_usage + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
    }

    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'search',
      model: 'tavily',
      created_at: new Date().toISOString(),
    }]);

    await supabase.from('search_history').insert([{
      user_id: user.id,
      query: query.trim(),
      results: result,
      created_at: new Date().toISOString(),
    }]);

    res.json(result);
  } catch (err) {
    console.error('Search error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Search failed' });
  }
});

// GET /api/search/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return res.status(500).json({ error: 'Failed to fetch history' });
    res.json({ history: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
module.exports.runWebSearch = runWebSearch;
module.exports.isSearchConfigured = isSearchConfigured;
