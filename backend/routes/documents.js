const express = require('express');
const router = express.Router();
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx');
const { v4: uuidv4 } = require('uuid');
const { supabase, authenticateToken } = require('../middleware/auth');
const { AUTO_FREE_MODEL, callLLMWithFallback, isModelAvailable } = require('./llm');

const DEFAULT_MODEL = AUTO_FREE_MODEL;

function buildDocPrompt(topic) {
  return `Write a well-organized document about: "${topic}".

Respond with ONLY valid JSON in this exact shape, no markdown fences, no commentary:
{"title": "Document Title", "sections": [{"heading": "Section heading", "paragraphs": ["paragraph 1", "paragraph 2"]}]}

Rules:
- 4-8 sections covering the topic thoroughly.
- Each paragraph should be 2-5 sentences of real prose (not bullet fragments).
- Write in the same language as the topic (Bengali topic -> Bengali document, English topic -> English document).`;
}

function parseDocOutline(raw, fallbackTopic) {
  const cleaned = String(raw || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      return {
        title: String(parsed.title || fallbackTopic).slice(0, 150),
        sections: parsed.sections.map((s) => ({
          heading: String(s.heading || '').slice(0, 150) || 'Untitled',
          paragraphs: Array.isArray(s.paragraphs) ? s.paragraphs.map((p) => String(p)).slice(0, 10) : [],
        })),
      };
    }
  } catch {
    // fall through
  }
  return {
    title: fallbackTopic.slice(0, 150),
    sections: [{ heading: fallbackTopic.slice(0, 150), paragraphs: cleaned.split('\n').filter(Boolean) }],
  };
}

function renderDocx(outline) {
  const children = [new Paragraph({ text: outline.title, heading: HeadingLevel.TITLE })];
  for (const section of outline.sections) {
    children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
    for (const p of section.paragraphs) {
      children.push(new Paragraph({ children: [new TextRun(p)] }));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}

// POST /api/documents/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { topic, model } = req.body;

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

    const llmResult = await callLLMWithFallback(activeModel, [
      { role: 'user', content: buildDocPrompt(topic.trim()) },
    ]);
    const outline = parseDocOutline(llmResult.content, topic.trim());
    const usedModel = llmResult.modelUsed || activeModel;

    const buffer = await renderDocx(outline);
    const fileName = `documents/${user.id}/${uuidv4()}.docx`;

    const { error: uploadError } = await supabase.storage
      .from('generated-files')
      .upload(fileName, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
      type: 'document',
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    await supabase.from('document_history').insert([{
      user_id: user.id,
      topic: topic.trim(),
      file_url: fileUrl,
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    res.json({ fileUrl, title: outline.title, modelUsed: usedModel });
  } catch (err) {
    console.error('Document generation error:', err);
    res.status(500).json({ error: err.message || 'Document generation failed' });
  }
});

// GET /api/documents/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('document_history')
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
