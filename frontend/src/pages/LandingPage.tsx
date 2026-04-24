import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  CreditCard,
  Globe,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

const socialProof = {
  en: ['40+ AI models', '20+ AI tools', 'Bangla-first experience', 'Local payments'],
  bn: ['৪০+ AI মডেল', '২০+ AI টুলস', 'বাংলা-ফার্স্ট এক্সপেরিয়েন্স', 'লোকাল পেমেন্ট'],
}

const valueBullets = {
  en: [
    'Start in under 60 seconds with simple signup',
    'Run AI chat, image generation, and tools from one account',
    'Go free first, then scale when your usage grows',
  ],
  bn: [
    'সহজ রেজিস্ট্রেশনে ৬০ সেকেন্ডেই শুরু করুন',
    'একই অ্যাকাউন্টে AI চ্যাট, ছবি জেনারেশন ও টুলস চালান',
    'আগে ফ্রি শুরু করুন, প্রয়োজন বাড়লে আপগ্রেড করুন',
  ],
}

const faqs = {
  en: [
    {
      q: 'Do I need a credit card to start?',
      a: 'No. You can register and start with the free plan immediately.',
    },
    {
      q: 'Can I pay from Bangladesh?',
      a: 'Yes. bKash, Nagad, Rocket and bank transfer are supported.',
    },
    {
      q: 'What is included in one account?',
      a: 'AI chat, AI image generation, and 20+ productivity tools in one place.',
    },
  ],
  bn: [
    {
      q: 'শুরু করতে কি ক্রেডিট কার্ড দরকার?',
      a: 'না। রেজিস্টার করলেই ফ্রি প্ল্যানে সাথে সাথে শুরু করতে পারবেন।',
    },
    {
      q: 'বাংলাদেশ থেকে পেমেন্ট করা যাবে?',
      a: 'হ্যাঁ। bKash, Nagad, Rocket এবং ব্যাংক ট্রান্সফার সাপোর্টেড।',
    },
    {
      q: 'একটি অ্যাকাউন্টে কী কী থাকবে?',
      a: 'AI চ্যাট, AI ছবি জেনারেশন এবং ২০+ প্রোডাক্টিভিটি টুলস একসাথে।',
    },
  ],
}

export default function LandingPage() {
  const { t, lang, toggle } = useLang()

  const steps = lang === 'bn'
    ? [
        { title: 'অ্যাকাউন্ট খুলুন', desc: 'ইমেইল দিয়ে দ্রুত রেজিস্টার করুন।' },
        { title: 'কাজ বেছে নিন', desc: 'চ্যাট, ছবি, বা টুলস যেটা দরকার সেটি চালু করুন।' },
        { title: 'রেজাল্ট ব্যবহার করুন', desc: 'কপি করে সাথে সাথে আপনার কাজে ব্যবহার করুন।' },
      ]
    : [
        { title: 'Create account', desc: 'Sign up quickly with your email.' },
        { title: 'Pick workflow', desc: 'Launch chat, images, or tools instantly.' },
        { title: 'Use output', desc: 'Copy and use results in your real work fast.' },
      ]

  const pricingCards = [
    {
      name: t.plan1Name,
      price: `${t.plan1Price}${t.plan1Period}`,
      features: [t.plan1F1, t.plan1F2],
      cta: t.pricingStartFree,
      to: '/register',
    },
    {
      name: t.plan2Name,
      price: `${t.plan2Price}${t.plan2Period}`,
      features: [t.plan2F1, t.plan2F2],
      cta: t.pricingPayNow,
      to: '/pricing',
    },
    {
      name: t.plan3Name,
      price: `${t.plan3Price}${t.plan3Period}`,
      features: [t.plan3F1, t.plan3F2],
      cta: t.pricingPayNow,
      to: '/pricing',
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-green-500 focus:px-3 focus:py-2 focus:text-black">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-green-900/40 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green-400" size={20} />
            <span className="font-mono text-lg font-bold text-green-400">{t.brand}</span>
          </div>
          <nav className="hidden items-center gap-5 text-sm text-gray-300 md:flex">
            <a href="#features" className="hover:text-green-300">{t.navFeatures}</a>
            <a href="#pricing" className="hover:text-green-300">{t.navPricing}</a>
            <a href="#faq" className="hover:text-green-300">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="rounded-md border border-green-700/40 px-3 py-1.5 text-xs text-gray-200 transition hover:border-green-500 hover:text-green-300"
            >
              {lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাংলা'}
            </button>
            <Link to="/login" className="hidden text-sm text-gray-300 hover:text-green-300 sm:inline">
              {t.login}
            </Link>
            <Link to="/register" className="rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-green-400">
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-14 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-700/30 bg-green-900/20 px-3 py-1 text-xs text-green-300">
              <BadgeCheck size={14} /> {t.tagline}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {t.heroTitle1} <span className="text-green-400">{t.heroTitle2}</span>
            </h1>
            <p className="mt-4 max-w-xl text-gray-300">{t.heroSub}</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-300">
              {valueBullets[lang].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-green-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400">
                {t.ctaBtn} <ArrowRight size={16} />
              </Link>
              <Link to="/pricing" className="rounded-md border border-green-700/50 px-5 py-3 text-sm font-medium text-gray-200 transition hover:border-green-500 hover:text-green-300">
                {t.navPricing}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {socialProof[lang].map((proof) => (
                <span key={proof} className="rounded-full border border-green-800/40 bg-zinc-900 px-3 py-1 text-xs text-gray-300">
                  {proof}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-green-900/40 bg-gradient-to-b from-green-950/50 to-zinc-950 p-6">
            <h2 className="text-xl font-bold text-green-300">{lang === 'bn' ? 'কেন AI শালা' : 'Why AI Shala'}</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                {
                  icon: Clock3,
                  title: lang === 'bn' ? 'দ্রুত অনবোর্ডিং' : 'Fast onboarding',
                  text: lang === 'bn' ? 'সরাসরি সাইনআপ থেকে আপনার কাজে।' : 'Move from signup to output in minutes.',
                },
                {
                  icon: CreditCard,
                  title: lang === 'bn' ? 'লোকাল পেমেন্ট' : 'Local payment fit',
                  text: lang === 'bn' ? 'বাংলাদেশি পেমেন্ট মেথডে সহজ আপগ্রেড।' : 'Upgrade with Bangladesh-friendly payment methods.',
                },
                {
                  icon: Globe,
                  title: lang === 'bn' ? 'বাংলা ফোকাস' : 'Bangla-first UX',
                  text: lang === 'bn' ? 'বাংলায় লিখুন, বাংলায় ফলাফল পান।' : 'Write prompts in Bangla and get usable outputs.',
                },
              ].map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-lg border border-green-900/30 bg-black/40 p-4">
                  <Icon size={18} className="text-green-400" />
                  <p className="mt-2 font-semibold text-white">{title}</p>
                  <p className="mt-1 text-gray-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-green-900/30 bg-zinc-950 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">40+</p>
              <p className="text-sm text-gray-400">{t.stat1Label}</p>
            </div>
            <div className="rounded-xl border border-green-900/30 bg-zinc-950 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">20+</p>
              <p className="text-sm text-gray-400">{t.stat2Label}</p>
            </div>
            <div className="rounded-xl border border-green-900/30 bg-zinc-950 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{t.stat3Value}</p>
              <p className="text-sm text-gray-400">{t.stat3Label}</p>
            </div>
            <div className="rounded-xl border border-green-900/30 bg-zinc-950 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{t.stat4Value}</p>
              <p className="text-sm text-gray-400">{t.stat4Label}</p>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 pb-14">
          <h2 className="text-2xl font-bold md:text-3xl">{t.featuresTitle}</h2>
          <p className="mt-2 text-gray-400">{t.featuresSub}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: MessageSquare, title: t.feat1Title, desc: t.feat1Desc },
              { icon: ImageIcon, title: t.feat2Title, desc: t.feat2Desc },
              { icon: Wand2, title: t.feat3Title, desc: t.feat3Desc },
              { icon: Zap, title: t.feat4Title, desc: t.feat4Desc },
              { icon: Shield, title: t.feat5Title, desc: t.feat5Desc },
              { icon: Sparkles, title: t.feat6Title, desc: t.feat6Desc },
            ].map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-xl border border-green-900/30 bg-zinc-950 p-5">
                <Icon className="text-green-400" size={20} />
                <h3 className="mt-3 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-400">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="rounded-2xl border border-green-900/40 bg-zinc-950 p-6">
            <h2 className="text-2xl font-bold md:text-3xl">{lang === 'bn' ? '৩ ধাপে শুরু করুন' : 'Get started in 3 steps'}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step.title} className="rounded-xl border border-green-900/30 bg-black/40 p-4">
                  <p className="text-xs font-semibold text-green-400">0{index + 1}</p>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 pb-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{t.pricingTitle}</h2>
              <p className="mt-1 text-sm text-gray-400">{t.pricingSub}</p>
            </div>
            <Link to="/pricing" className="text-sm text-green-400 hover:text-green-300">{lang === 'bn' ? 'সব প্ল্যান দেখুন' : 'See all plans'}</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pricingCards.map((plan) => (
              <article key={plan.name} className="rounded-xl border border-green-900/30 bg-zinc-950 p-5">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-2 text-2xl font-extrabold text-green-400">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={15} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={plan.to} className="mt-5 inline-flex items-center gap-2 rounded-md border border-green-700/40 px-4 py-2 text-sm hover:border-green-500 hover:text-green-300">
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-4 pb-16">
          <h2 className="mb-5 text-2xl font-bold md:text-3xl">FAQ</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {faqs[lang].map((faq) => (
              <article key={faq.q} className="rounded-xl border border-green-900/30 bg-zinc-950 p-5">
                <h3 className="font-semibold text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-400">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-green-900/40 bg-gradient-to-r from-green-950/30 via-black to-green-950/30">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                {t.ctaTitle} <span className="text-green-400">{t.ctaTitleHighlight}</span>
              </h2>
              <p className="mt-2 text-gray-300">{t.ctaSub}</p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-md bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400">
              {t.startFree} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-4 py-8 text-center text-xs text-gray-500">{t.footerMade}</footer>
    </div>
  )
}
