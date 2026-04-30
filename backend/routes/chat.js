const express = require('express');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { callLLM, isModelAvailable } = require('./llm');

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
        model: model || 'groq/llama-3.3-70b-versatile',
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

    const { content, model } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content required' });

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

    const activeModel = model || conv.model;
    if (!isModelAvailable(activeModel)) {
      return res.status(503).json({
        error: 'Selected model is not configured on this server',
        model: activeModel,
      });
    }
    let aiContent;

    try {
      aiContent = await callLLM(activeModel, contextMessages, conv.system_prompt);
    } catch (llmErr) {
      aiContent = `দুঃখিত, AI রেসপন্স পেতে সমস্যা হয়েছে: ${llmErr.message}`;
    }

    // Save AI response
    const { data: aiMsg, error: aiErr } = await supabase
      .from('messages')
      .insert([{
        conversation_id: req.params.id,
        role: 'assistant',
        content: aiContent,
        model: activeModel,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (aiErr) return res.status(500).json({ error: 'Failed to save AI response' });

    // Update daily usage for free users
    const newUsage = user.daily_usage + 1;
    if (user.subscription === 'free') {
      await supabase
        .from('users')
        .update({ daily_usage: newUsage, updated_at: new Date().toISOString() })
        .eq('id', user.id);
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

    // Log usage
    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'chat',
      model: activeModel,
      created_at: new Date().toISOString(),
    }]);

    res.json({
      userMessage: userMsg,
      assistantMessage: aiMsg,
      dailyUsage: user.subscription === 'free' ? newUsage : null,
      dailyLimit: user.subscription === 'free' ? user.daily_limit : null,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
