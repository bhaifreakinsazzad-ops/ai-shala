const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Music generation has no configured provider yet — there is no free/no-key
// music-generation API comparable to Pollinations (image) or the Edge TTS
// service (audio/speech). This route intentionally reports "not configured"
// instead of faking output. Wire a real provider (e.g. Replicate MusicGen,
// Suno, ElevenLabs Music) here once one is chosen and paid for.
const MUSIC_PROVIDER_CONFIGURED = false;

router.get('/status', (req, res) => {
  res.json({ configured: MUSIC_PROVIDER_CONFIGURED });
});

router.post('/generate', authenticateToken, async (req, res) => {
  res.status(503).json({
    error: 'মিউজিক জেনারেশন এখনো চালু হয়নি — একটি প্রোভাইডার নির্বাচন বাকি আছে।',
    configured: MUSIC_PROVIDER_CONFIGURED,
  });
});

module.exports = router;
