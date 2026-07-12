const express = require('express');
const router = express.Router();
const PptxGenJS = require('pptxgenjs');
const { v4: uuidv4 } = require('uuid');
const { supabase, authenticateToken } = require('../middleware/auth');
const { AUTO_FREE_MODEL, callLLMWithFallback, isModelAvailable } = require('./llm');

const DEFAULT_MODEL = AUTO_FREE_MODEL;
const MIN_SLIDES = 3;
const MAX_SLIDES = 15;

function clampSlideCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 8;
  return Math.max(MIN_SLIDES, Math.min(parsed, MAX_SLIDES));
}

function buildOutlinePrompt(topic, slideCount) {
  return `You are a presentation writer. Create an outline for a ${slideCount}-slide deck about: "${topic}".

Respond with ONLY valid JSON in this exact shape, no markdown fences, no commentary:
{"title": "Deck Title", "slides": [{"heading": "Slide heading", "bullets": ["point 1", "point 2", "point 3"]}]}

Rules:
- Exactly ${slideCount} entries in "slides".
- Each slide has 3-5 short, concrete bullets (not full sentences, no trailing periods).
- The first slide should be an introduction/agenda, the last a summary/conclusion.
- Write in the same language as the topic (Bengali topic -> Bengali outline, English topic -> English outline).`;
}

function parseOutline(raw, fallbackTopic, slideCount) {
  const cleaned = String(raw || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
      return {
        title: String(parsed.title || fallbackTopic).slice(0, 120),
        slides: parsed.slides.slice(0, MAX_SLIDES).map((s) => ({
          heading: String(s.heading || '').slice(0, 120) || 'Untitled',
          bullets: Array.isArray(s.bullets) ? s.bullets.map((b) => String(b).slice(0, 200)).slice(0, 6) : [],
        })),
      };
    }
  } catch {
    // fall through to naive fallback below
  }

  // Fallback: treat the raw text as a single-slide outline so generation never hard-fails.
  return {
    title: fallbackTopic.slice(0, 120),
    slides: [{ heading: fallbackTopic.slice(0, 120), bullets: cleaned.split('\n').filter(Boolean).slice(0, 6) }],
  };
}

function renderPptx(outline) {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'YUSRA_16x9', width: 10, height: 5.63 });
  pptx.layout = 'YUSRA_16x9';

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '041107' };
  titleSlide.addText(outline.title, {
    x: 0.5, y: 2.0, w: 9, h: 1.5,
    fontSize: 36, bold: true, color: '00FF41', align: 'center',
  });
  titleSlide.addText('Yusra Synthetic Intelligence', {
    x: 0.5, y: 3.6, w: 9, h: 0.5,
    fontSize: 14, color: '888888', align: 'center',
  });

  for (const slide of outline.slides) {
    const s = pptx.addSlide();
    s.background = { color: 'FFFFFF' };
    s.addText(slide.heading, {
      x: 0.5, y: 0.4, w: 9, h: 0.8,
      fontSize: 26, bold: true, color: '041107',
    });
    if (slide.bullets.length > 0) {
      s.addText(
        slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        { x: 0.6, y: 1.4, w: 8.8, h: 3.8, fontSize: 18, color: '222222', valign: 'top' }
      );
    }
  }

  return pptx.write({ outputType: 'nodebuffer' });
}

// POST /api/slides/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { topic, slideCount, model } = req.body;

    if (!topic?.trim()) return res.status(400).json({ error: 'Topic required' });

    if (user.subscription === 'free' && user.daily_usage >= user.daily_limit) {
      return res.status(429).json({
        error: 'দৈনিক সীমা শেষ। Pro প্ল্যানে আনলিমিটেড ব্যবহার করুন।',
        upgradeRequired: true,
      });
    }

    const activeModel = model || DEFAULT_MODEL;
    if (!isModelAvailable(activeModel)) {
      return res.status(503).json({ error: 'Selected model is not configured on this server', model: activeModel });
    }

    const count = clampSlideCount(slideCount);
    const llmResult = await callLLMWithFallback(activeModel, [
      { role: 'user', content: buildOutlinePrompt(topic.trim(), count) },
    ]);
    const outline = parseOutline(llmResult.content, topic.trim(), count);
    const usedModel = llmResult.modelUsed || activeModel;

    const buffer = await renderPptx(outline);
    const fileName = `slides/${user.id}/${uuidv4()}.pptx`;

    const { error: uploadError } = await supabase.storage
      .from('generated-files')
      .upload(fileName, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        upsert: false,
      });
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
      type: 'slides',
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    await supabase.from('slide_history').insert([{
      user_id: user.id,
      topic: topic.trim(),
      outline,
      file_url: fileUrl,
      slide_count: outline.slides.length,
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    res.json({
      fileUrl,
      outline,
      slideCount: outline.slides.length,
      modelRequested: activeModel,
      modelUsed: usedModel,
      fallbackUsed: Boolean(llmResult.fallbackUsed),
    });
  } catch (err) {
    console.error('Slide generation error:', err);
    res.status(500).json({ error: err.message || 'Slide generation failed' });
  }
});

// GET /api/slides/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('slide_history')
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
