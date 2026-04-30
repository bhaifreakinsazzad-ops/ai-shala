import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion'
import { MessageSquare, Image, Wrench, Zap, Shield, Globe, Star, ArrowRight, CheckCircle, Sparkles, Brain, Cpu } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import { useRef, useState, useEffect, MouseEvent } from 'react'

function cn(...args: (string | undefined | null | boolean)[]) {
  return args.filter(Boolean).join(' ')
}

/* ── Animated Counter ────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const dur = 1800
    const step = 16
    const inc = target / (dur / step)
    const timer = setInterval(() => {
      start += inc
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, step)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ── 3D Tilt Card ────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8])
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 })
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 })

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  function onMouseLeave() { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.03, z: 20 }}
      className={cn('cursor-default', className)}
    >
      {children}
    </motion.div>
  )
}

/* ── Floating Particle ───────────────────────── */
function Particle({ x, delay, size }: { x: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-green-400 pointer-events-none"
      style={{ left: `${x}%`, bottom: 0, width: size, height: size, opacity: 0.5 }}
      animate={{ y: [-0, -120], opacity: [0.5, 0] }}
      transition={{ duration: 4 + Math.random() * 2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

/* ── Aurora Background ───────────────────────── */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="aurora-orb-1" style={{ top: '10%', left: '15%' }} />
      <div className="aurora-orb-2" style={{ top: '50%', right: '10%' }} />
      <div className="aurora-orb-3" style={{ bottom: '20%', left: '40%' }} />
      <div className="grid-pattern absolute inset-0 opacity-40" />
    </div>
  )
}

/* ── Hero Orb ────────────────────────────────── */
function HeroOrb() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-10">
      {/* Outer orbit ring */}
      <div className="orbit-ring absolute inset-0 scale-150" />
      {/* Middle orbit ring */}
      <div className="orbit-ring-reverse absolute inset-0 scale-125" />
      {/* Orbiting dot */}
      <motion.div
        className="absolute w-3 h-3 rounded-full bg-green-400"
        style={{ top: '50%', left: '50%', marginTop: -6, marginLeft: -6 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        transformTemplate={({ rotate }) => `rotate(${rotate}) translateX(90px) rotate(-${rotate})`}
      />
      {/* Second orbiting dot */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-blue-400"
        style={{ top: '50%', left: '50%', marginTop: -4, marginLeft: -4 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        transformTemplate={({ rotate }) => `rotate(${rotate}) translateX(115px) rotate(-${rotate})`}
      />
      {/* Center glowing bot */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl scale-150 pulse-glow" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-green-900/80 to-black border border-green-500/30 flex items-center justify-center shadow-2xl"
               style={{ boxShadow: '0 0 40px #00ff4140, inset 0 0 20px #00ff4110' }}>
            <Brain size={44} className="text-green-400 icon-glow-green" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function LandingPage() {
  const { t, lang, toggle } = useLang()

  const features = [
    { icon: MessageSquare, title: t.feat1Title, desc: t.feat1Desc, color: 'text-green-400', bg: 'bg-green-500/10', glow: 'icon-glow-green' },
    { icon: Image,         title: t.feat2Title, desc: t.feat2Desc, color: 'text-blue-400',   bg: 'bg-blue-500/10',   glow: 'icon-glow-blue' },
    { icon: Wrench,        title: t.feat3Title, desc: t.feat3Desc, color: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'icon-glow-purple' },
    { icon: Zap,           title: t.feat4Title, desc: t.feat4Desc, color: 'text-yellow-400', bg: 'bg-yellow-500/10', glow: 'icon-glow-yellow' },
    { icon: Shield,        title: t.feat5Title, desc: t.feat5Desc, color: 'text-red-400',    bg: 'bg-red-500/10',    glow: 'icon-glow-red' },
    { icon: Globe,         title: t.feat6Title, desc: t.feat6Desc, color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'icon-glow-orange' },
  ]

  const models = [
    { name: 'LLaMA 3.3 70B',   provider: 'Groq',       icon: '⚡', color: 'from-green-900/40 to-black' },
    { name: 'Gemini 2.0 Flash', provider: 'Google',     icon: '🔮', color: 'from-blue-900/40 to-black' },
    { name: 'DeepSeek R1',      provider: 'OpenRouter',  icon: '🧠', color: 'from-purple-900/40 to-black' },
    { name: 'Mistral 7B',       provider: 'OpenRouter',  icon: '🌟', color: 'from-yellow-900/40 to-black' },
    { name: 'Qwen 2.5 72B',     provider: 'OpenRouter',  icon: '🚀', color: 'from-red-900/40 to-black' },
    { name: 'Gemini 1.5 Pro',   provider: 'Google',     icon: '💎', color: 'from-indigo-900/40 to-black' },
  ]

  const pricing = [
    {
      name: t.plan1Name, price: t.plan1Price, period: t.plan1Period,
      features: [t.plan1F1, t.plan1F2, t.plan1F3, t.plan1F4],
      cta: t.plan1Cta, highlight: false, icon: '🌱',
    },
    {
      name: t.plan2Name, price: t.plan2Price, period: t.plan2Period,
      features: [t.plan2F1, t.plan2F2, t.plan2F3, t.plan2F4, t.plan2F5],
      cta: t.plan2Cta, highlight: true, icon: '⚡',
    },
    {
      name: t.plan3Name, price: t.plan3Price, period: t.plan3Period,
      features: [t.plan3F1, t.plan3F2, t.plan3F3, t.plan3F4, t.plan3F5],
      cta: t.plan3Cta, highlight: false, icon: '👑',
    },
  ]

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100, delay: i * 0.4, size: 2 + Math.random() * 3
  }))

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ── Header ───────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md" />
              <Cpu size={24} className="text-green-400 relative icon-glow-green" />
            </div>
            <span className="font-bold text-green-400 text-xl font-mono">{t.brand}</span>
            <span className="text-xs text-gray-500 hidden sm:block bg-green-900/30 px-1.5 py-0.5 rounded font-mono">v3.0</span>
          </motion.div>

          <motion.nav
            className="hidden md:flex items-center gap-6 text-sm text-gray-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[['#features', t.navFeatures], ['#models', t.navModels], ['#pricing', t.navPricing]].map(([href, label]) => (
              <a key={href} href={href}
                className="hover:text-green-400 transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-green-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </motion.nav>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-900/40 text-xs font-medium text-gray-300 hover:border-green-500/50 hover:text-green-400 transition-all"
            >
              <span>{lang === 'bn' ? '🇬🇧' : '🇧🇩'}</span>
              <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>
            <Link to="/login" className="text-sm text-gray-300 hover:text-green-400 transition-colors px-3 py-1.5">
              {t.login}
            </Link>
            <Link to="/register" className="btn-green text-sm px-4 py-2">
              {t.startFree}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 text-center relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <AuroraBackground />

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        {/* Hero Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        >
          <HeroOrb />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 mb-6 cursor-default"
            whileHover={{ scale: 1.05 }}
          >
            <Star size={14} className="fill-green-400" />
            <span className="gradient-text font-medium">{t.tagline}</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.05] tracking-tight">
            <motion.span
              className="gradient-text block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {t.heroTitle1}
            </motion.span>
            <motion.span
              className="text-white block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              style={{ textShadow: '0 0 60px rgba(255,255,255,0.1)' }}
            >
              {t.heroTitle2}
            </motion.span>
          </h1>

          <motion.p
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            {t.heroSub}
          </motion.p>
          <motion.p
            className="text-lg text-green-400 font-medium mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            style={{ textShadow: '0 0 20px rgba(0,255,65,0.4)' }}
          >
            ✨ {t.heroFree}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            <Link to="/register">
              <motion.div
                className="btn-green text-lg px-8 py-4 flex items-center gap-2 rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles size={20} /> {t.startFree} <ArrowRight size={18} />
              </motion.div>
            </Link>
            <a href="#features">
              <motion.div
                className="px-8 py-4 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/10 transition-all text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.heroLearnMore}
              </motion.div>
            </a>
          </motion.div>
        </motion.div>

        {/* Floating model badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap justify-center gap-3 mt-14 relative z-10"
        >
          {['LLaMA 3.3 70B', 'Gemini 2.0', 'DeepSeek R1', 'Mistral 7B', 'Qwen 72B', 'Gemma 2'].map((m, i) => (
            <motion.span
              key={m}
              className="glass-light px-3 py-1.5 rounded-full text-xs text-gray-300 border border-green-900/30 shimmer-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.1 }}
              whileHover={{ scale: 1.1, borderColor: 'rgba(0,255,65,0.4)' }}
            >
              🤖 {m}
            </motion.span>
          ))}
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────── */}
      <section className="py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 border-y border-green-900/20 glass-light" />
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { value: 40, suffix: '+', label: t.stat1Label },
            { value: 20, suffix: '+', label: t.stat2Label },
            { value: 7,  suffix: lang === 'bn' ? ' দিন' : ' Days', label: t.stat3Label },
            { value: 100, suffix: '%', label: t.stat4Label },
          ].map(({ value, suffix, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className="text-4xl font-black font-mono gradient-text mb-1 group-hover:scale-110 transition-transform"
                style={{ textShadow: '0 0 30px rgba(0,255,65,0.3)' }}
              >
                <Counter target={value} suffix={suffix} />
              </div>
              <div className="text-gray-400 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section id="features" className="py-24 px-4 relative">
        <AuroraBackground />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="gradient-text">{t.featuresTitle}</span>
            </h2>
            <p className="text-gray-400 text-lg">{t.featuresSub}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: '1000px' }}>
            {features.map(({ icon: Icon, title, desc, color, bg, glow }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TiltCard>
                  <div className="glass-light rounded-2xl p-6 neon-border shimmer-card h-full group hover:border-green-500/30 transition-colors duration-300">
                    {/* Icon */}
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', bg)}>
                      <Icon size={24} className={cn(color, glow)} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    {/* Bottom glow line */}
                    <div className={cn('absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity', bg)} />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Models ───────────────────────────────── */}
      <section id="models" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-4 gradient-text">{t.modelsTitle}</h2>
            <p className="text-gray-400 text-lg">{t.modelsSub}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {models.map(({ name, provider, icon, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -4 }}
              >
                <div className={cn('glass rounded-xl p-4 flex items-center gap-3 bg-gradient-to-br shimmer-card border border-green-900/20 hover:border-green-500/30 transition-colors cursor-default', color)}>
                  <div className="text-3xl">{icon}</div>
                  <div>
                    <div className="font-semibold text-white text-sm">{name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{provider}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-gray-600 text-sm mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.modelsMore}
          </motion.p>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 relative">
        <AuroraBackground />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-black mb-4 gradient-text">{t.pricingTitle}</h2>
            <p className="text-gray-400 text-lg">{t.pricingSub}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map(({ name, price, period, features, cta, highlight, icon }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className={cn(
                  'rounded-2xl p-6 relative h-full flex flex-col transition-all duration-300',
                  highlight
                    ? 'bg-gradient-to-b from-green-900/30 to-black border-2 border-green-500/40'
                    : 'glass-light border border-green-900/20 hover:border-green-500/20'
                )}>
                  {highlight && (
                    <>
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-400 text-black text-xs font-black px-4 py-1.5 rounded-full shadow-lg"
                           style={{ boxShadow: '0 0 20px rgba(0,255,65,0.5)' }}>
                        {t.pricingPopular}
                      </div>
                      <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(0,255,65,0.05), transparent)', pointerEvents: 'none' }} />
                    </>
                  )}
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-4xl font-black gradient-text">{price}</span>
                    <span className="text-gray-500 text-sm">{period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className={cn(
                      'block text-center py-3 px-4 rounded-xl font-semibold transition-all duration-200',
                      highlight
                        ? 'bg-green-500 text-black hover:bg-green-400 shadow-lg'
                        : 'border border-green-500/30 text-green-400 hover:bg-green-500/10'
                    )}
                    style={highlight ? { boxShadow: '0 0 20px rgba(0,255,65,0.3)' } : {}}
                  >
                    {cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-sm text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.paymentMethods}
          </motion.p>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-28 px-4 text-center relative overflow-hidden">
        {/* Animated glow bg */}
        <div className="absolute inset-0 bg-gradient-radial from-green-900/20 via-transparent to-transparent" />
        <div className="aurora-orb-1" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.6 }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <motion.div
            className="text-5xl mb-6"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🚀
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            {t.ctaTitle}<br />
            <span className="gradient-text-multi">{t.ctaTitleHighlight}</span>
          </h2>
          <p className="text-gray-400 text-xl mb-10">{t.ctaSub}</p>
          <Link to="/register">
            <motion.div
              className="btn-green text-xl px-12 py-5 inline-flex items-center gap-3 rounded-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ boxShadow: '0 0 40px rgba(0,255,65,0.4), 0 20px 40px rgba(0,0,0,0.4)' }}
            >
              <Sparkles size={24} /> {t.ctaBtn} <ArrowRight size={22} />
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-green-900/20 glass-light text-center">
        <motion.div
          className="flex items-center justify-center gap-2 mb-3"
          whileHover={{ scale: 1.05 }}
        >
          <Cpu size={20} className="text-green-400 icon-glow-green" />
          <span className="text-green-400 font-mono font-bold text-lg">{t.brand}</span>
        </motion.div>
        <p className="text-gray-600 text-sm">{t.footerMade}</p>
      </footer>
    </div>
  )
}
