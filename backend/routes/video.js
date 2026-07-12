const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Video generation has no configured provider yet — there is no credible free
// video-generation API, so this route intentionally reports "not configured"
// instead of faking output. Wire a real provider (e.g. Replicate, fal.ai,
// Runway) here once one is chosen and paid for.
const VIDEO_PROVIDER_CONFIGURED = false;

router.get('/status', (req, res) => {
  res.json({ configured: VIDEO_PROVIDER_CONFIGURED });
});

router.post('/generate', authenticateToken, async (req, res) => {
  res.status(503).json({
    error: 'ভিডিও জেনারেশন এখনো চালু হয়নি — একটি প্রোভাইডার নির্বাচন বাকি আছে।',
    configured: VIDEO_PROVIDER_CONFIGURED,
  });
});

module.exports = router;
