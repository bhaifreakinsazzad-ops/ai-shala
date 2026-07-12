const express = require('express');
const router = express.Router();
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { v4: uuidv4 } = require('uuid');
const { supabase, authenticateToken } = require('../middleware/auth');

const MAX_CHARS = 2000;

const VOICES = [
  { id: 'bn-BD-NabanitaNeural', label: 'বাংলা (নারী কণ্ঠ)', labelEn: 'Bengali (Female)', locale: 'bn-BD' },
  { id: 'bn-BD-PradeepNeural', label: 'বাংলা (পুরুষ কণ্ঠ)', labelEn: 'Bengali (Male)', locale: 'bn-BD' },
  { id: 'en-US-AriaNeural', label: 'English (Female)', labelEn: 'English (Female)', locale: 'en-US' },
  { id: 'en-US-AndrewNeural', label: 'English (Male)', labelEn: 'English (Male)', locale: 'en-US' },
];
const DEFAULT_VOICE = VOICES[0].id;

function isValidVoice(voiceId) {
  return VOICES.some((v) => v.id === voiceId);
}

async function synthesize(text, voiceId) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = await tts.toStream(text);

  return new Promise((resolve, reject) => {
    const chunks = [];
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('end', () => resolve(Buffer.concat(chunks)));
    audioStream.on('error', reject);
  });
}

// GET /api/audio/voices
router.get('/voices', (req, res) => {
  res.json({ voices: VOICES });
});

// POST /api/audio/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { text, voice } = req.body;

    if (!text?.trim()) return res.status(400).json({ error: 'Text required' });
    if (text.trim().length > MAX_CHARS) {
      return res.status(400).json({ error: `Text too long (max ${MAX_CHARS} characters)` });
    }

    if (user.subscription === 'free' && user.daily_usage >= user.daily_limit) {
      return res.status(429).json({
        error: 'দৈনিক সীমা শেষ। Pro প্ল্যানে আনলিমিটেড ব্যবহার করুন।',
        upgradeRequired: true,
      });
    }

    const voiceId = isValidVoice(voice) ? voice : DEFAULT_VOICE;
    const buffer = await synthesize(text.trim(), voiceId);
    const fileName = `audio/${user.id}/${uuidv4()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('generated-files')
      .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('generated-files').getPublicUrl(fileName);
    const fileUrl = publicUrlData.publicUrl;

    if (user.subscription === 'free') {
      await supabase.from('users').update({
        daily_usage: user.daily_usage + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
    }

    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'audio',
      model: `edge-tts:${voiceId}`,
      created_at: new Date().toISOString(),
    }]);

    await supabase.from('audio_history').insert([{
      user_id: user.id,
      text: text.trim().slice(0, 2000),
      voice: voiceId,
      file_url: fileUrl,
      created_at: new Date().toISOString(),
    }]);

    res.json({ fileUrl, voice: voiceId });
  } catch (err) {
    console.error('Audio generation error:', err);
    res.status(500).json({ error: err.message || 'Audio generation failed' });
  }
});

// GET /api/audio/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audio_history')
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
