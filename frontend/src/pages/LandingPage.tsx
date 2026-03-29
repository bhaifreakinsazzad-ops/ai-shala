import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Image, Wrench, Zap, Shield, Globe, Star, ArrowRight, CheckCircle } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

function cn(...args: (string | undefined | null | boolean)[]) {
  return args.filter(Boolean).join(' ')
}

export default function LandingPage() {
  const { t, lang, toggle } = useLang()

  const features = [
    { icon: MessageSquare, title: t.feat1Title, desc: t.feat1Desc, color: 'text-green-400' },
    { icon: Image, title: t.feat2Title, desc: t.feat2Desc, color: 'text-blue-400' },
    { icon: Wrench, title: t.feat3Title, desc: t.feat3Desc, color: 'text-purple-400' },
    { icon: Zap, title: t.feat4Title, desc: t.feat4Desc, color: 'text-yellow-400' },
    { icon: Shield, title: t.feat5Title, desc: t.feat5Desc, color: 'text-red-400' },
    { icon: Globe, title: t.feat6Title, desc: t.feat6Desc, color: 'text-orange-400' },
  ]

  const models = [
    { name: 'LLaMA 3.3 70B', provider: 'Groq', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
    { name: 'Gemini 2.0 Flash', provider: 'Google', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
    { name: 'DeepSeek R1', provider: 'OpenRouter', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
    { name: 'Mistral 7B', provider: 'OpenRouter', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
    { name: 'Qwen 2.5 72B', provider: 'OpenRouter', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
    { name: 'Gemini 1.5 Pro', provider: 'Google', badge: t.modelBadgeFree, badgeColor: 'bg-green-900/50 text-green-300' },
  ]

  const pricing = [
    {
      name: t.plan1Name, price: t.plan1Price, period: t.plan1Period,
      features: [t.plan1F1, t.plan1F2, t.plan1F3, t.plan1F4],
      cta: t.plan1Cta, highlight: false
    },
    {
      name: t.plan2Name, price: t.plan2Price, period: t.plan2Period,
      features: [t.plan2F1, t.plan2F2, t.plan2F3, t.plan2F4, t.plan2F5],
      cta: t.plan2Cta, highlight: true
    },
    {
      name: t.plan3Name, price: t.plan3Price, period: t.plan3Period,
      features: [t.plan3F1, t.plan3F2, t.plan3F3, t.plan3F4, t.plan3F5],
      cta: t.plan3Cta, highlight: false
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-green-400 text-xl font-mono">{t.brand}</span>
            <span className="text-xs text-gray-500 hidden sm:block ml-1">v3.0</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-green-400 transition-colors">{t.navFeatures}</a>
            <a href="#models" className="hover:text-green-400 transition-colors">{t.navModels}</a>
            <a href="#pricing" className="hover:text-green-400 transition-colors">{t.navPricing}</a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-900/40 text-xs font-medium text-gray-300 hover:border-green-500/50 hover:text-green-400 transition-all"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <span>{lang === 'bn' ? '🇬🇧' : '🇧🇩'}</span>
              <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>
            <Link to="/login" className="text-sm text-gray-300 hover:text-green-400 transition-colors px-3 py-1.5">
              {t.login}
            </Link>
            <Link to="/register" className="btn-green text-sm">
              {t.startFree}
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
            {t.tagline}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">{t.heroTitle1}</span>
            <br />
            <span className="text-white">{t.heroTitle2}</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t.heroSub}<br />
            <span className="text-green-400">{t.heroFree}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-green text-lg px-8 py-4 flex items-center gap-2">
              {t.startFree} <ArrowRight size={20} />
            </Link>
            <a href="#features" className="px-8 py-4 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/10 transition-all text-lg">
              {t.heroLearnMore}
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
            { value: '৪০+', label: t.stat1Label },
            { value: '২০+', label: t.stat2Label },
            { value: t.stat3Value, label: t.stat3Label },
            { value: t.stat4Value, label: t.stat4Label },
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
            <span className="gradient-text">{t.featuresTitle}</span>
          </h2>
          <p className="text-gray-400 text-center mb-12">{t.featuresSub}</p>
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
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">{t.modelsTitle}</h2>
          <p className="text-gray-400 text-center mb-10">{t.modelsSub}</p>
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
          <p className="text-center text-gray-500 text-sm mt-6">{t.modelsMore}</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">{t.pricingTitle}</h2>
          <p className="text-gray-400 text-center mb-10">{t.pricingSub}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, features, cta, highlight }) => (
              <div key={name} className={`rounded-2xl p-6 relative ${highlight ? 'bg-green-500/10 border-2 border-green-500/40' : 'glass-light border border-green-900/20'}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    {t.pricingPopular}
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
          <p className="text-center text-sm text-gray-500 mt-6">{t.paymentMethods}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-green-900/20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-bold mb-4">
            {t.ctaTitle} <span className="gradient-text">{t.ctaTitleHighlight}</span>
          </h2>
          <p className="text-gray-400 mb-8">{t.ctaSub}</p>
          <Link to="/register" className="btn-green text-lg px-10 py-4 inline-flex items-center gap-2">
            {t.ctaBtn} <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-green-900/20 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span>🤖</span>
          <span className="text-green-400 font-mono font-bold">{t.brand}</span>
        </div>
        <p>{t.footerMade}</p>
      </footer>
    </div>
  )
}
