const express = require('express');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { AUTO_FREE_MODEL, callLLMWithFallback, isModelAvailable, isModelAvailableStrict } = require('./llm');
const { orchestrate, OrchestratorError } = require('../lib/orchestrator');
const { callCostUsd } = require('../lib/cost');

const MIN_FUSION_MODELS = 2;
const MAX_FUSION_MODELS = 4;

// List conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: 'Failed to fetch conversations' });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { title, model, system_prompt } = req.body;

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: req.user.id,
        title: title || 'নতুন চ্যাট',
        model: model || AUTO_FREE_MODEL,
        system_prompt: system_prompt || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: 'Failed to create conversation' });
    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update conversation
router.patch('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { title, model, pinned } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (model !== undefined) updates.model = model;
    if (pinned !== undefined) updates.pinned = pinned;

    const { data: conv, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ conversation: conv });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete conversation
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages in a conversation
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: 'Failed to fetch messages' });
    res.json({ messages, conversation: conv });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check daily limit for free users
    if (user.subscription === 'free' && user.daily_usage >= user.daily_limit) {
      return res.status(429).json({
        error: 'দৈনিক সীমা শেষ। আরো মেসেজ করতে Pro প্ল্যান নিন।',
        upgradeRequired: true,
        dailyUsage: user.daily_usage,
        dailyLimit: user.daily_limit,
      });
    }

    const { content, model, mode: requestedMode, models: requestedModels } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content required' });

    let wantsFusion = requestedMode === 'fuse';
    let fusionModels = [];
    let fusionQuotaExceeded = false;

    if (wantsFusion) {
      if (!Array.isArray(requestedModels) || requestedModels.length < MIN_FUSION_MODELS) {
        return res.status(400).json({
          error: `Fusion mode requires at least ${MIN_FUSION_MODELS} models`,
        });
      }
      fusionModels = requestedModels.slice(0, MAX_FUSION_MODELS);
      const unavailable = fusionModels.filter((m) => !isModelAvailableStrict(m));
      if (unavailable.length > 0) {
        return res.status(503).json({
          error: 'One or more selected models are not configured on this server',
          unavailable,
        });
      }

      const fusionUsage = user.fusion_daily_usage ?? 0;
      const fusionLimit = user.fusion_daily_limit ?? 3;
      if (user.subscription === 'free' && fusionUsage >= fusionLimit) {
        // Quota exhausted — fall back to single-model chat instead of blocking the message.
        wantsFusion = false;
        fusionQuotaExceeded = true;
      }
    }

    // Verify ownership
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();

    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Save user message
    const { data: userMsg, error: msgErr } = await supabase
      .from('messages')
      .insert([{
        conversation_id: req.params.id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (msgErr) return res.status(500).json({ error: 'Failed to save message' });

    // Get conversation history (last 20 messages for context)
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(20);

    const contextMessages = (history || []).reverse().map(m => ({
      role: m.role,
      content: m.content,
    }));

    const activeModel = model || conv.model || AUTO_FREE_MODEL;
    if (!wantsFusion && !isModelAvailable(activeModel)) {
      return res.status(503).json({
        error: 'Selected model is not configured on this server',
        model: activeModel,
      });
    }

    let aiContent;
    let usedModel;
    let fallbackUsed = false;
    let orchestration = null; // { mode, modelsUsed, fusionModel, rawResponses, failedModels }
    let usageEntries = [];

    if (wantsFusion) {
      try {
        const result = await orchestrate({
          models: fusionModels,
          messages: contextMessages,
          systemPrompt: conv.system_prompt,
        });
        aiContent = result.content;
        usedModel = result.fused ? result.fusionModel : result.modelsUsed[0];
        orchestration = {
          mode: 'fuse',
          modelsUsed: result.modelsUsed,
          fusionModel: result.fusionModel,
          rawResponses: result.rawResponses,
          failedModels: result.failures,
        };
        usageEntries = result.usage;
      } catch (orchErr) {
        const failures = orchErr instanceof OrchestratorError ? orchErr.failures : [];
        aiContent = `দুঃখিত, AI রেসপন্স পেতে সমস্যা হয়েছে (fusion): ${orchErr.message}`;
        usedModel = fusionModels[0];
        orchestration = { mode: 'fuse', modelsUsed: [], fusionModel: null, rawResponses: [], failedModels: failures };
      }
    } else {
      let llmResult;
      try {
        llmResult = await callLLMWithFallback(activeModel, contextMessages, conv.system_prompt);
      } catch (llmErr) {
        llmResult = {
          content: `দুঃখিত, AI রেসপন্স পেতে সমস্যা হয়েছে: ${llmErr.message}`,
          modelUsed: activeModel,
          fallbackUsed: false,
        };
      }
      aiContent = llmResult.content;
      usedModel = llmResult.modelUsed || activeModel;
      fallbackUsed = Boolean(llmResult.fallbackUsed);
      orchestration = { mode: 'single', modelsUsed: [usedModel], fusionModel: null, rawResponses: null, failedModels: null };
      if (llmResult.promptTokens !== undefined) {
        usageEntries = [{ modelId: usedModel, callType: 'single', promptTokens: llmResult.promptTokens, completionTokens: llmResult.completionTokens }];
      }
    }

    // Save AI response
    const { data: aiMsg, error: aiErr } = await supabase
      .from('messages')
      .insert([{
        conversation_id: req.params.id,
        role: 'assistant',
        content: aiContent,
        model: usedModel,
        mode: orchestration.mode,
        models_used: orchestration.modelsUsed,
        fusion_model: orchestration.fusionModel,
        raw_responses: orchestration.rawResponses,
        failed_models: orchestration.failedModels,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (aiErr) return res.status(500).json({ error: 'Failed to save AI response' });

    // Update daily usage for free users (every message, regardless of mode)
    const newUsage = user.daily_usage + 1;
    const userUpdates = { daily_usage: newUsage, updated_at: new Date().toISOString() };
    if (orchestration.mode === 'fuse') {
      userUpdates.fusion_daily_usage = (user.fusion_daily_usage || 0) + 1;
    }
    if (user.subscription === 'free' || orchestration.mode === 'fuse') {
      await supabase.from('users').update(userUpdates).eq('id', user.id);
    }

    // Update conversation metadata
    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
        model: activeModel,
        title: conv.title === 'নতুন চ্যাট' ? content.slice(0, 50) : conv.title,
      })
      .eq('id', req.params.id);

    // Log usage (one row per underlying provider call, with token/cost data when available)
    const usageRows = (usageEntries.length > 0 ? usageEntries : [{ modelId: usedModel }]).map((u) => ({
      user_id: user.id,
      type: 'chat',
      model: u.modelId,
      prompt_tokens: u.promptTokens ?? null,
      completion_tokens: u.completionTokens ?? null,
      cost_usd: u.promptTokens !== undefined ? callCostUsd(u.modelId, u.promptTokens, u.completionTokens) : null,
      created_at: new Date().toISOString(),
    }));
    await supabase.from('usage_logs').insert(usageRows);

    res.json({
      userMessage: userMsg,
      assistantMessage: aiMsg,
      modelRequested: wantsFusion ? fusionModels : activeModel,
      modelUsed: usedModel,
      fallbackUsed,
      fused: orchestration.mode === 'fuse',
      fusionQuotaExceeded,
      dailyUsage: user.subscription === 'free' ? newUsage : null,
      dailyLimit: user.subscription === 'free' ? user.daily_limit : null,
      fusionDailyUsage: orchestration.mode === 'fuse' ? (user.fusion_daily_usage || 0) + 1 : (user.fusion_daily_usage ?? 0),
      fusionDailyLimit: user.fusion_daily_limit ?? 3,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
