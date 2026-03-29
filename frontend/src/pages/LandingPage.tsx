import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Image, Wrench, Zap, Shield, Globe, Star, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: MessageSquare, title: 'AI চ্যাট', desc: '৪০+ ফ্রি AI মডেল দিয়ে চ্যাট করুন। LLaMA, Gemini, Mistral সব এক জায়গায়।', color: 'text-green-400' },
  { icon: Image, title: 'ছবি তৈরি', desc: 'বাংলায় প্রম্পট লিখুন, মুহূর্তে সুন্দর ছবি পান। সম্পূর্ণ বিনামূল্যে।', color: 'text-blue-400' },
  { icon: Wrench, title: '২০+ AI টুলস', desc: 'লেখা, অনুবাদ, কোড, CV, কভার লেটার — সব বাংলায় পাবেন।', color: 'text-purple-400' },
  { icon: Zap, title: 'অতি দ্রুত', desc: 'Groq এর শক্তিতে সেকেন্ডে রেসপন্স। কোনো অপেক্ষা নেই।', color: 'text-yellow-400' },
  { icon: Shield, title: 'নিরাপদ', desc: 'আপনার তথ্য সম্পূর্ণ সুরক্ষিত। কোনো তৃতীয় পক্ষে শেয়ার হয় না।', color: 'text-red-400' },
  { icon: Globe, title: 'বাংলায় সাপোর্ট', desc: 'সম্পূর্ণ বাংলায় ইন্টারফেস। বাংলাদেশের জন্য বানানো।', color: 'text-orange-400' },
]

const models = [
  { name: 'LLaMA 3.3 70B', provider: 'Groq', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
  { name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
  { name: 'DeepSeek R1', provider: 'OpenRouter', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
  { name: 'Mistral 7B', provider: 'OpenRouter', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
  { name: 'Qwen 2.5 72B', provider: 'OpenRouter', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
  { name: 'Gemini 1.5 Pro', provider: 'Google', badge: 'ফ্রি', badgeColor: 'bg-green-900/50 text-green-300' },
]

const pricing = [
  { name: 'ফ্রি', price: '৳০', period: '', features: ['দৈনিক ৫০ মেসেজ', '৭ দিনের ট্রায়াল', '২৫+ AI মডেল', '৫টি ছবি/দিন'], cta: 'শুরু করুন', highlight: false },
  { name: 'প্রো', price: '৳২৯৯', period: '/মাস', features: ['আনলিমিটেড মেসেজ', '৪০+ AI মডেল', 'আনলিমিটেড ছবি', 'সব প্রিমিয়াম টুলস', 'API অ্যাক্সেস'], cta: 'প্রো নিন', highlight: true },
  { name: 'প্রিমিয়াম', price: '৳৬৯৯', period: '/মাস', features: ['সব প্রো ফিচার', 'GPT-4o + Claude', 'ডেডিকেটেড সাপোর্ট', 'কাস্টম প্রম্পট', 'টিম শেয়ারিং'], cta: 'প্রিমিয়াম নিন', highlight: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-green-400 text-xl font-mono">AI শালা</span>
            <span className="text-xs text-gray-500 hidden sm:block ml-1">v3.0</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-green-400 transition-colors">ফিচার</a>
            <a href="#models" className="hover:text-green-400 transition-colors">মডেল</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">মূল্য</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-green-400 transition-colors px-3 py-1.5">
              লগইন
            </Link>
            <Link to="/register" className="btn-green text-sm">
              ফ্রিতে শুরু করুন
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative">
        <div className="absolute inset-0 bg-gradient-radial from-green-900/10 via-transparent to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 mb-6">
            <Star size={14} className="fill-green-400" />
            বাংলাদেশের প্রথম AI সুপার অ্যাপ
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">সব AI</span>
            <br />
            <span className="text-white">এক জায়গায়</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            ৪০+ ফ্রি AI মডেল, ছবি তৈরি, ২০+ টুলস — সম্পূর্ণ বাংলায়।<br />
            <span className="text-green-400">৭ দিন সম্পূর্ণ বিনামূল্যে।</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-green text-lg px-8 py-4 flex items-center gap-2">
              ফ্রিতে শুরু করুন <ArrowRight size={20} />
            </Link>
            <a href="#features" className="px-8 py-4 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/10 transition-all text-lg">
              আরো জানুন
            </a>
          </div>
        </motion.div>

        {/* Floating model badges */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {['LLaMA 3.3 70B', 'Gemini 2.0', 'DeepSeek R1', 'Mistral 7B', 'Qwen 72B', 'Gemma 2'].map(m => (
            <span key={m} className="glass-light px-3 py-1.5 rounded-full text-xs text-gray-300 border border-green-900/30">
              🤖 {m}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-green-900/20 glass-light">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '৪০+', label: 'AI মডেল' },
            { value: '২০+', label: 'টুলস' },
            { value: '৭ দিন', label: 'ফ্রি ট্রায়াল' },
            { value: '১০০%', label: 'বাংলা সাপোর্ট' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-bold gradient-text font-mono">{value}</div>
              <div className="text-gray-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            <span className="gradient-text">কেন AI শালা?</span>
          </h2>
          <p className="text-gray-400 text-center mb-12">বাংলাদেশের জন্য বানানো, বাংলায় কথা বলে</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-light rounded-xl p-6 neon-border hover:scale-[1.02] transition-transform"
              >
                <Icon size={28} className={cn(color, 'mb-3')} />
                <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-20 px-4 bg-green-900/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">ফ্রি AI মডেলসমূহ</h2>
          <p className="text-gray-400 text-center mb-10">সব মডেল সম্পূর্ণ বিনামূল্যে ব্যবহার করুন</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {models.map(({ name, provider, badge, badgeColor }) => (
              <div key={name} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <div className="font-medium text-white text-sm">{name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{provider}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${badgeColor}`}>{badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">এবং আরো ৩০+ মডেল...</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">সহজ মূল্য পরিকল্পনা</h2>
          <p className="text-gray-400 text-center mb-10">bKash, Nagad দিয়ে পেমেন্ট করুন</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, features, cta, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 relative ${highlight ? 'bg-green-500/10 border-2 border-green-500/40' : 'glass-light border border-green-900/20'}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    জনপ্রিয়
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold gradient-text">{price}</span>
                  <span className="text-gray-500 text-sm">{period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium transition-all ${highlight ? 'bg-green-500 text-black hover:bg-green-400' : 'border border-green-500/30 text-green-400 hover:bg-green-500/10'}`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            💳 bKash · Nagad · Rocket · ব্যাংক ট্রান্সফার গ্রহণযোগ্য
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-green-900/20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold mb-4">
            আজই শুরু করুন, <span className="gradient-text">সম্পূর্ণ ফ্রিতে</span>
          </h2>
          <p className="text-gray-400 mb-8">৭ দিনের ফ্রি ট্রায়াল। কোনো ক্রেডিট কার্ড লাগবে না।</p>
          <Link to="/register" className="btn-green text-lg px-10 py-4 inline-flex items-center gap-2">
            এখনই রেজিস্টার করুন <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-green-900/20 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🤖</span>
          <span className="text-green-400 font-mono font-bold">AI শালা</span>
        </div>
        <p>Made with 💚 in Bangladesh · © 2025 AI Shala</p>
      </footer>
    </div>
  )
}

// Missing import fix
function cn(...args: (string | undefined | null | boolean)[]) {
  return args.filter(Boolean).join(' ')
}
