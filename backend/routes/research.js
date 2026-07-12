const express = require('express');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { AUTO_FREE_MODEL, callLLMWithFallback, isModelAvailable } = require('./llm');
const { runWebSearch, isSearchConfigured } = require('./search');

const DEFAULT_MODEL = AUTO_FREE_MODEL;
const MAX_SUBQUESTIONS = 4;

function parseSubquestions(raw, fallbackQuestion) {
  const cleaned = String(raw || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q) => String(q)).filter(Boolean).slice(0, MAX_SUBQUESTIONS);
    }
  } catch {
    // fall through
  }
  return [fallbackQuestion];
}

function buildPlanPrompt(question) {
  return `You are a research planner. Break the following research question into ${MAX_SUBQUESTIONS} or fewer focused, independently-searchable sub-questions that together would let someone answer it thoroughly.

Question: "${question}"

Respond with ONLY a valid JSON array of strings, no markdown fences, no commentary. Example: ["sub-question 1", "sub-question 2"]`;
}

function buildSynthesisPrompt(question, subResults, searchUsed) {
  const context = subResults.map((sr, i) => {
    if (!sr.sources.length) return `### ${i + 1}. ${sr.subQuestion}\n(no search results)`;
    const sourceLines = sr.sources.map((s, j) => `[${i + 1}.${j + 1}] ${s.title} — ${s.url}\n${s.content?.slice(0, 500) || ''}`).join('\n\n');
    return `### ${i + 1}. ${sr.subQuestion}\n${sourceLines}`;
  }).join('\n\n');

  const searchNote = searchUsed
    ? 'Use the source material below. Cite sources inline using the bracket IDs (e.g. [1.2]) next to each claim they support.'
    : 'No live web search was available for this report — answer from your own knowledge and clearly note that no live sources were consulted.';

  return `You are a research analyst writing a thorough, well-organized report.

Research question: "${question}"

${searchNote}

${context ? `Source material:\n${context}\n\n` : ''}Write a clear, structured report (with headings) that answers the research question directly, synthesizes the findings, and notes any open uncertainties. Write in the same language as the question.`;
}

// POST /api/research/generate
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { question, model } = req.body;

    if (!question?.trim()) return res.status(400).json({ error: 'Question required' });

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

    const searchUsed = isSearchConfigured();

    const planResult = await callLLMWithFallback(activeModel, [
      { role: 'user', content: buildPlanPrompt(question.trim()) },
    ]);
    const subQuestions = parseSubquestions(planResult.content, question.trim());

    const subResults = [];
    for (const subQuestion of subQuestions) {
      let sources = [];
      if (searchUsed) {
        try {
          const searchResult = await runWebSearch(subQuestion, { maxResults: 4, includeAnswer: false });
          sources = searchResult.results;
        } catch (err) {
          console.error('Research sub-search failed:', err.message);
        }
      }
      subResults.push({ subQuestion, sources });
    }

    const synthesisResult = await callLLMWithFallback(activeModel, [
      { role: 'user', content: buildSynthesisPrompt(question.trim(), subResults, searchUsed) },
    ]);
    const usedModel = synthesisResult.modelUsed || activeModel;

    const allSources = subResults.flatMap((sr, i) =>
      sr.sources.map((s, j) => ({ id: `${i + 1}.${j + 1}`, subQuestion: sr.subQuestion, ...s }))
    );

    if (user.subscription === 'free') {
      await supabase.from('users').update({
        daily_usage: user.daily_usage + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
    }

    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'research',
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    await supabase.from('research_history').insert([{
      user_id: user.id,
      question: question.trim(),
      report: synthesisResult.content,
      sources: allSources,
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    res.json({
      report: synthesisResult.content,
      subQuestions,
      sources: allSources,
      searchUsed,
      modelUsed: usedModel,
    });
  } catch (err) {
    console.error('Research error:', err);
    res.status(500).json({ error: err.message || 'Research failed' });
  }
});

// GET /api/research/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('research_history')
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
