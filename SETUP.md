# 🤖 Yusra Synthetic Intelligence — সেটআপ গাইড

> Bangladesh's First AI Super App — সম্পূর্ণ বাংলায়

---

## ⚡ দ্রুত শুরু (৩ ধাপে)

### ধাপ ১ — Supabase ডেটাবেস তৈরি করুন

1. **https://supabase.com** এ যান ও ফ্রি অ্যাকাউন্ট করুন
2. **"New Project"** ক্লিক করুন
   - Name: `yusra-synthetic-intelligence`
   - Password: একটি শক্তিশালী পাসওয়ার্ড দিন
   - Region: `Southeast Asia (Singapore)` বেছে নিন
3. প্রজেক্ট তৈরি হলে **SQL Editor** এ যান
4. `database/schema.sql` ফাইলের সব কোড পেস্ট করে **Run** করুন
5. **Settings → API** থেকে কপি করুন:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

### ধাপ ২ — ফ্রি API কী সংগ্রহ করুন

| সার্ভিস | লিংক | কী পাবেন |
|---------|------|---------|
| **Groq** (সবচেয়ে দ্রুত) | https://console.groq.com | `GROQ_API_KEY` |
| **Google Gemini** | https://aistudio.google.com/app/apikey | `GEMINI_API_KEY` |
| **OpenRouter** | https://openrouter.ai/keys | `OPENROUTER_API_KEY` |
| **Together AI** | https://api.together.xyz/settings/api-keys | `TOGETHER_API_KEY` |
| **Cohere** | https://dashboard.cohere.com/api-keys | `COHERE_API_KEY` |
| **Tavily** (সার্চ ও রিসার্চ) | https://tavily.com | `TAVILY_API_KEY` |

> 🎨 **ছবি তৈরি (Pollinations.ai)** ও 🔊 **অডিও (Edge TTS)** — কোনো API কী লাগবে না! সম্পূর্ণ বিনামূল্যে।

---

### ধাপ ৩ — অ্যাপ চালু করুন

#### Backend:
```bash
cd backend

# .env ফাইল তৈরি করুন
copy .env.example .env
# তারপর .env ফাইলটি খুলে আপনার API কী গুলো দিন

# Dependencies install করুন
npm install

# Server চালু করুন
npm run dev
```

#### Frontend:
```bash
cd frontend

# .env ফাইল তৈরি
copy .env.example .env

# Dependencies install করুন
npm install

# Dev server চালু করুন
npm run dev
```

Browser এ যান: **http://localhost:5173**

---

## 🔑 Backend .env ফাইল পূরণ করুন

`backend/.env` ফাইলটি খুলুন এবং নিচের মতো পূরণ করুন:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=আপনার-লম্বা-গোপন-কী-এখানে-দিন-কমপক্ষে-৩২-অক্ষর

FRONTEND_URL=http://localhost:5173

# Supabase (ধাপ ১ থেকে)
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI API Keys (ধাপ ২ থেকে)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
TOGETHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
COHERE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# পেমেন্ট নম্বর
PAYMENT_PHONE=01778307704
ADMIN_EMAILS=আপনার-ইমেইল@gmail.com

FREE_TRIAL_DAYS=7
FREE_DAILY_LIMIT=50
FREE_IMAGE_DAILY_LIMIT=5
```

---

## 👑 Admin অ্যাকাউন্ট তৈরি করুন

রেজিস্টার করার পর Supabase ড্যাশবোর্ডে যান:

1. **Table Editor → users** খুলুন
2. আপনার ইমেইলের row খুঁজুন
3. `is_admin` কলামটি `true` করুন
4. `.env` এ `ADMIN_EMAILS=আপনার-ইমেইল@gmail.com` দিন

এরপর অ্যাপে লগইন করলে "অ্যাডমিন" মেনু দেখাবে।

---

## 💳 পেমেন্ট সিস্টেম কীভাবে কাজ করে

```
ব্যবহারকারী → bKash/Nagad তে টাকা পাঠায় (01778307704)
           → অ্যাপে Transaction ID সাবমিট করে
           → Admin Dashboard এ নোটিফিকেশন আসে
           → আপনি ম্যানুয়ালি "Approve" করেন
           → ব্যবহারকারীর অ্যাকাউন্ট তৎক্ষণাৎ আপগ্রেড হয়
```

**Admin Dashboard:** http://localhost:5173/admin

---

## 🌐 Production Deploy

### Option A — Render.com (সহজ, বিনামূল্যে)

Single service builds and serves both backend + frontend, via `render.yaml`:
1. https://render.com এ যান
2. "New Web Service" → GitHub repo connect করুন
3. Render will read `render.yaml` automatically (root of the repo)
4. Environment variables গুলো (সব `sync: false` চিহ্নিত) add করুন dashboard-এ

### Option B — Vercel (Frontend) + Railway (Backend)

Frontend → https://vercel.com
Backend → https://railway.app

---

## 📱 ফিচার সারসংক্ষেপ

| ফিচার | বিবরণ |
|-------|-------|
| 🤖 চ্যাট / কথোপকথন | ৭+ ফ্রি প্রোভাইডার: Groq, Gemini, OpenRouter, Together, Cohere + auto-fallback optimizer |
| 🎙️ ভয়েস চ্যাট | কথা বলুন (browser STT), AI কণ্ঠে উত্তর দেয় (free TTS) |
| 🎨 ছবি তৈরি | Pollinations.ai — বিনামূল্যে, কোনো API কী নেই |
| 🎬 ভিডিও তৈরি | শীঘ্রই আসছে — প্রোভাইডার নির্বাচন ও ফান্ডিং সাপেক্ষে |
| 💻 কোড লেখা | Code Generator / Explainer টুলস + সাধারণ চ্যাট |
| 📊 স্লাইড ও ফাইল | টপিক দিন, .pptx বা .docx ডাউনলোড করুন |
| 🔬 রিসার্চ ও থিংকিং | প্রশ্ন ভেঙে ধাপে ধাপে ওয়েব সার্চসহ সোর্স-সাইটেড রিপোর্ট |
| 🌐 ইন্টারনেট সার্চ | Tavily API (ফ্রি ১,০০০/মাস) — লাইভ ওয়েব রেজাল্ট |
| 🔊 অডিও (TTS) | টেক্সট থেকে ভয়েস — সম্পূর্ণ বিনামূল্যে |
| 🎵 মিউজিক তৈরি | শীঘ্রই আসছে — প্রোভাইডার নির্বাচন ও ফান্ডিং সাপেক্ষে |
| 🛠️ ১৮+ টুলস | লেখক, অনুবাদক, কোড, CV, SEO, সোশ্যাল মিডিয়া, কবিতা |
| 💳 পেমেন্ট | bKash, Nagad, Rocket, ব্যাংক — ম্যানুয়াল কনফার্মেশন |
| 👑 Admin Panel | পেমেন্ট অ্যাপ্রুভ, ব্যবহারকারী ম্যানেজ, অ্যানালিটিক্স |
| 🇧🇩 বাংলা | সম্পূর্ণ বাংলা ইন্টারফেস |

---

## 🔧 সমস্যা সমাধান

**"Cannot connect to database"**
→ Supabase URL এবং Service Key সঠিক কিনা চেক করুন

**"API key invalid" (Groq)**
→ https://console.groq.com এ গিয়ে নতুন key তৈরি করুন

**Frontend CORS error**
→ backend `.env` এ `FRONTEND_URL` সঠিক URL দিন

**পেমেন্ট সাবমিট হচ্ছে না**
→ backend চালু আছে কিনা চেক করুন: http://localhost:3001/api/health

---

## 📞 সাপোর্ট

পেমেন্ট সংক্রান্ত: **01778307704** (WhatsApp/SMS)

---

*Made with 💚 in Bangladesh — Yusra Synthetic Intelligence v4.0*
