const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const { supabase, authenticateToken } = require('../middleware/auth');

const IMAGE_STYLES = {
  realistic:   'photorealistic, ultra detailed, 8k, professional photography, sharp focus',
  anime:       'anime style, manga art, vibrant colors, Studio Ghibli inspired, beautiful illustration',
  cartoon:     'cartoon style, colorful, fun, Disney Pixar inspired, clean lines',
  oil_painting:'oil painting, classical art, museum quality, detailed brushwork, renaissance style',
  watercolor:  'watercolor painting, soft colors, artistic, hand-painted, delicate washes',
  digital_art: 'digital art, concept art, fantasy illustration, trending on ArtStation',
  sketch:      'pencil sketch, detailed line art, black and white, cross hatching',
  bangladeshi: 'Bangladesh traditional art, local culture, rickshaw art style, vibrant colors',
};

// Build Pollinations URL — public API, no auth required
function pollinationsUrl(prompt, style, width, height, seed) {
  const styleEnhancer = IMAGE_STYLES[style] || IMAGE_STYLES.realistic;
  const fullPrompt    = `${prompt}, ${styleEnhancer}`;
  const encoded       = encodeURIComponent(fullPrompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true&model=flux`;
}

// POST /api/image/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    if (user.subscription === 'free' && (user.image_daily_usage || 0) >= (user.image_daily_limit || 5)) {
      return res.status(429).json({
        error: 'দৈনিক ছবি তৈরির সীমা শেষ। Pro প্ল্যানে আনলিমিটেড ছবি তৈরি করুন।',
        upgradeRequired: true,
      });
    }

    const { prompt, style = 'realistic', width = 1024, height = 1024, seed } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Prompt required' });

    const randomSeed = seed || Math.floor(Math.random() * 9999999);
    const imageUrl   = pollinationsUrl(prompt.trim(), style, width, height, randomSeed);

    // Track usage
    await supabase.from('users').update({
      image_daily_usage: (user.image_daily_usage || 0) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    // Save history
    await supabase.from('image_history').insert([{
      user_id:   user.id,
      prompt:    prompt.trim(),
      style,
      image_url: imageUrl,
      width, height,
      seed: randomSeed,
      created_at: new Date().toISOString(),
    }]);

    // Log usage
    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type:    'image',
      model:   'pollinations-flux',
      created_at: new Date().toISOString(),
    }]);

    res.json({
      url:            imageUrl,
      prompt,
      enhanced_prompt: `${prompt}, ${IMAGE_STYLES[style] || ''}`,
      style,
      seed: randomSeed,
      width, height,
    });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: 'ছবি তৈরিতে সমস্যা হয়েছে' });
  }
});

// GET /api/image/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('image_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: 'Failed to fetch history' });
    res.json({ images: data });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/image/styles
router.get('/styles', (req, res) => {
  res.json({
    styles: Object.entries(IMAGE_STYLES).map(([id, desc]) => ({
      id,
      name:        id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: desc.split(',')[0],
    })),
  });
});

module.exports = router;
