const express = require('express');
const router = express.Router();
const { supabase, authenticateToken } = require('../middleware/auth');
const { AUTO_FREE_MODEL, callLLMWithFallback, isModelAvailable } = require('./llm');

const DEFAULT_MODEL = AUTO_FREE_MODEL;

const TOOLS = [
  { id: 'writer', name: 'লেখার সহকারী', nameEn: 'Writing Assistant', icon: '✍️', category: 'writing', description: 'চিঠি, ইমেইল, প্রবন্ধ লিখুন', free: true },
  { id: 'translator', name: 'অনুবাদক', nameEn: 'Translator', icon: '🌐', category: 'language', description: 'বাংলা, English, Arabic এবং আরও ভাষা', free: true },
  { id: 'summarizer', name: 'সারসংক্ষেপ', nameEn: 'Summarizer', icon: '📝', category: 'writing', description: 'যেকোনো টেক্সট সংক্ষেপ করুন', free: true },
  { id: 'code_generator', name: 'কোড জেনারেটর', nameEn: 'Code Generator', icon: '💻', category: 'coding', description: 'যেকোনো ভাষায় কোড লিখুন', free: true },
  { id: 'code_explainer', name: 'কোড ব্যাখ্যা', nameEn: 'Code Explainer', icon: '🔍', category: 'coding', description: 'কোড বুঝুন বাংলায়', free: true },
  { id: 'seo_writer', name: 'SEO লেখক', nameEn: 'SEO Writer', icon: '🔎', category: 'marketing', description: 'SEO অপ্টিমাইজড কন্টেন্ট', free: true },
  { id: 'social_media', name: 'সোশ্যাল মিডিয়া', nameEn: 'Social Media', icon: '📱', category: 'marketing', description: 'Facebook, Instagram পোস্ট', free: true },
  { id: 'cv_builder', name: 'CV বিল্ডার', nameEn: 'CV Builder', icon: '📄', category: 'career', description: 'পেশাদার CV তৈরি করুন', free: true },
  { id: 'cover_letter', name: 'কভার লেটার', nameEn: 'Cover Letter', icon: '📧', category: 'career', description: 'চাকরির আবেদন পত্র', free: true },
  { id: 'business_plan', name: 'বিজনেস প্ল্যান', nameEn: 'Business Plan', icon: '📊', category: 'business', description: 'ব্যবসায়িক পরিকল্পনা তৈরি', free: true },
  { id: 'product_desc', name: 'পণ্য বিবরণ', nameEn: 'Product Description', icon: '🛍️', category: 'ecommerce', description: 'পণ্যের আকর্ষণীয় বিবরণ', free: true },
  { id: 'bangla_grammar', name: 'বাংলা ব্যাকরণ', nameEn: 'Bangla Grammar', icon: '📚', category: 'language', description: 'বাংলা বানান ও ব্যাকরণ ঠিক করুন', free: true },
  { id: 'email_writer', name: 'ইমেইল লেখক', nameEn: 'Email Writer', icon: '📨', category: 'writing', description: 'পেশাদার ইমেইল লিখুন', free: true },
  { id: 'story_writer', name: 'গল্প লেখক', nameEn: 'Story Writer', icon: '📖', category: 'creative', description: 'সৃজনশীল গল্প লিখুন', free: true },
  { id: 'poem_writer', name: 'কবিতা লেখক', nameEn: 'Poem Writer', icon: '🎭', category: 'creative', description: 'বাংলা কবিতা লিখুন', free: true },
  { id: 'quiz_maker', name: 'কুইজ মেকার', nameEn: 'Quiz Maker', icon: '❓', category: 'education', description: 'পরীক্ষার প্রশ্ন তৈরি করুন', free: true },
  { id: 'lesson_planner', name: 'পাঠ পরিকল্পনা', nameEn: 'Lesson Planner', icon: '🏫', category: 'education', description: 'শিক্ষা পরিকল্পনা তৈরি', free: true },
  { id: 'legal_helper', name: 'আইনি সহায়তা', nameEn: 'Legal Helper', icon: '⚖️', category: 'legal', description: 'সাধারণ আইনি তথ্য', free: false },
  { id: 'financial_calc', name: 'আর্থিক বিশ্লেষণ', nameEn: 'Financial Analyzer', icon: '💰', category: 'finance', description: 'ব্যবসায়িক আর্থিক বিশ্লেষণ', free: false },
];

const TOOL_PROMPTS = {
  writer: (input) => `আপনি একজন পেশাদার বাংলা লেখক। নিচের বিষয়ে একটি সুন্দর, প্রবাহমান লেখা তৈরি করুন। বাংলায় লিখুন:\n\n${input}`,
  translator: (input, opts) => `Translate the following text to ${opts?.targetLang || 'Bengali (Bangla)'}. Provide only the translation:\n\n${input}`,
  summarizer: (input) => `নিচের টেক্সটির একটি সংক্ষিপ্ত সারসংক্ষেপ বাংলায় তৈরি করুন। মূল বিষয়গুলো বুলেট পয়েন্টে দিন:\n\n${input}`,
  code_generator: (input, opts) => `Write clean, well-commented ${opts?.language || 'Python'} code for the following requirement. Add brief comments explaining each part:\n\n${input}`,
  code_explainer: (input) => `নিচের কোডটি বাংলায় সহজ ভাষায় ব্যাখ্যা করুন। প্রতিটি গুরুত্বপূর্ণ অংশ আলাদাভাবে বুঝিয়ে দিন:\n\n${input}`,
  seo_writer: (input) => `আপনি একজন SEO বিশেষজ্ঞ। নিচের বিষয়ে একটি SEO-অপ্টিমাইজড আর্টিকেল বাংলায় লিখুন। H2 শিরোনাম, কীওয়ার্ড, এবং মেটা ডেসক্রিপশন সহ:\n\n${input}`,
  social_media: (input, opts) => `Create engaging ${opts?.platform || 'Facebook'} post(s) in Bengali about:\n${input}\n\nInclude: catchy caption, relevant emojis, hashtags in both Bangla and English.`,
  cv_builder: (input) => `আপনি একজন HR বিশেষজ্ঞ। নিচের তথ্য দিয়ে একটি পেশাদার CV তৈরি করুন। বাংলা ও English দুটোতে সেকশন দিন:\n\n${input}`,
  cover_letter: (input) => `আপনি একজন Career Coach। নিচের তথ্য দিয়ে একটি আকর্ষণীয় Cover Letter লিখুন (বাংলায়):\n\n${input}`,
  business_plan: (input) => `আপনি একজন Business Consultant। নিচের ব্যবসায়িক ধারণার জন্য একটি বিস্তারিত বিজনেস প্ল্যান বাংলায় তৈরি করুন:\n\n${input}`,
  product_desc: (input) => `আপনি একজন E-commerce Copywriter। নিচের পণ্যের জন্য একটি আকর্ষণীয় বিবরণ বাংলায় লিখুন যা বিক্রয় বাড়াবে:\n\n${input}`,
  bangla_grammar: (input) => `নিচের বাংলা টেক্সটের বানান ও ব্যাকরণ ঠিক করুন। ভুলগুলো চিহ্নিত করে সংশোধিত টেক্সট দিন:\n\n${input}`,
  email_writer: (input) => `আপনি একজন Professional Email Writer। নিচের বিষয়ে একটি পেশাদার ইমেইল বাংলা ও English এ লিখুন:\n\n${input}`,
  story_writer: (input) => `আপনি একজন সৃজনশীল গল্পকার। নিচের বিষয়ে একটি আকর্ষণীয় গল্প বাংলায় লিখুন:\n\n${input}`,
  poem_writer: (input) => `আপনি একজন বাংলা কবি। নিচের বিষয়ে একটি সুন্দর বাংলা কবিতা লিখুন:\n\n${input}`,
  quiz_maker: (input, opts) => `Create ${opts?.count || 10} multiple-choice quiz questions about: ${input}\n\nFormat each question with 4 options (A, B, C, D) and mark the correct answer. Provide questions in Bengali if the subject is Bangla-related.`,
  lesson_planner: (input) => `আপনি একজন শিক্ষা বিশেষজ্ঞ। নিচের বিষয়ে একটি সম্পূর্ণ পাঠ পরিকল্পনা বাংলায় তৈরি করুন:\n\n${input}`,
  legal_helper: (input) => `আপনি একজন বাংলাদেশের আইন বিশেষজ্ঞ। নিচের আইনি প্রশ্নের উত্তর সহজ বাংলায় দিন। (দ্রষ্টব্য: এটি সাধারণ তথ্য, পেশাদার আইনজীবীর পরামর্শ নেওয়া উচিত):\n\n${input}`,
  financial_calc: (input) => `আপনি একজন আর্থিক বিশ্লেষক। নিচের বিষয়ে বিস্তারিত আর্থিক বিশ্লেষণ বাংলায় দিন:\n\n${input}`,
};

// List all tools
router.get('/', (req, res) => {
  const categories = [...new Set(TOOLS.map(t => t.category))];
  res.json({ tools: TOOLS, categories });
});

// Use a tool
router.post('/:toolId/run', authenticateToken, async (req, res) => {
  try {
    const { toolId } = req.params;
    const { input, options, model } = req.body;
    const user = req.user;

    if (!input) return res.status(400).json({ error: 'Input required' });

    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return res.status(404).json({ error: 'Tool not found' });

    // Check daily limit for free users
    if (user.subscription === 'free' && user.daily_usage >= user.daily_limit) {
      return res.status(429).json({
        error: 'দৈনিক সীমা শেষ। Pro প্ল্যানে আনলিমিটেড টুলস ব্যবহার করুন।',
        upgradeRequired: true,
      });
    }

    // Check if tool is premium
    if (!tool.free && user.subscription === 'free') {
      return res.status(403).json({
        error: 'এই টুলটি Pro ব্যবহারকারীদের জন্য। আপগ্রেড করুন।',
        upgradeRequired: true,
      });
    }

    const promptFn = TOOL_PROMPTS[toolId];
    if (!promptFn) return res.status(400).json({ error: 'Tool not configured' });

    const prompt = promptFn(input, options);
    const activeModel = model || DEFAULT_MODEL;
    if (!isModelAvailable(activeModel)) {
      return res.status(503).json({
        error: 'Selected model is not configured on this server',
        model: activeModel,
      });
    }
    const llmResult = await callLLMWithFallback(activeModel, [{ role: 'user', content: prompt }]);
    const result = llmResult.content;
    const usedModel = llmResult.modelUsed || activeModel;

    // Update daily usage
    if (user.subscription === 'free') {
      await supabase
        .from('users')
        .update({ daily_usage: user.daily_usage + 1, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Log usage
    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'tool',
      tool_id: toolId,
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    // Save to tool history
    await supabase.from('tool_history').insert([{
      user_id: user.id,
      tool_id: toolId,
      input: input.slice(0, 500),
      output: result.slice(0, 2000),
      model: usedModel,
      created_at: new Date().toISOString(),
    }]);

    res.json({
      result,
      tool,
      modelRequested: activeModel,
      modelUsed: usedModel,
      fallbackUsed: Boolean(llmResult.fallbackUsed),
    });
  } catch (err) {
    console.error('Tool error:', err);
    res.status(500).json({ error: err.message || 'Tool execution failed' });
  }
});

// Tool history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tool_history')
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
