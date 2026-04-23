import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

const socialProof = {
  en: [
    '40+ AI models in one place',
    'Bangla-first interface + prompts',
    'bKash / Nagad payments supported',
  ],
  bn: [
    'এক প্ল্যাটফর্মে ৪০+ AI মডেল',
    'বাংলা-ফার্স্ট ইন্টারফেস ও প্রম্পট',
    'bKash / Nagad পেমেন্ট সাপোর্টেড',
  ],
}

const valueBullets = {
  en: [
    'No setup needed — create account and start in under 60 seconds',
    'Chat, image generation, and productivity tools in one dashboard',
    'Start free, upgrade only when you need higher limits',
  ],
  bn: [
    'কোনো সেটআপ লাগবে না — ৬০ সেকেন্ডে অ্যাকাউন্ট খুলে শুরু করুন',
    'একই ড্যাশবোর্ডে চ্যাট, ছবি জেনারেশন ও প্রোডাক্টিভিটি টুলস',
    'ফ্রি থেকে শুরু করুন, বেশি দরকার হলে আপগ্রেড করুন',
  ],
}

const faqs = {
  en: [
    {
      q: 'Can I use AI Shala for free first?',
      a: 'Yes. You can start on the free plan with daily limits and trial access to core features.',
    },
    {
      q: 'Is this built for Bangla users?',
      a: 'Yes. The product is optimized for Bangla prompts, Bangla UI, and Bangladesh-based payment flow.',
    },
    {
      q: 'What can I do inside one account?',
      a: 'Use AI chat, generate images, and run 20+ tools for writing, translation, coding, CV, and more.',
    },
  ],
  bn: [
    {
      q: 'আমি কি আগে ফ্রিতে ব্যবহার করতে পারব?',
      a: 'হ্যাঁ। ফ্রি প্ল্যানে দৈনিক লিমিটসহ কোর ফিচারগুলো ব্যবহার করতে পারবেন।',
    },
    {
      q: 'এটা কি বাংলা ইউজারদের জন্য তৈরি?',
      a: 'হ্যাঁ। বাংলা প্রম্পট, বাংলা UI এবং বাংলাদেশের পেমেন্ট ফ্লো অনুযায়ী অপ্টিমাইজড।',
    },
    {
      q: 'একটি অ্যাকাউন্টে কী কী করা যাবে?',
      a: 'AI চ্যাট, ছবি তৈরি এবং লেখা/অনুবাদ/কোড/CV সহ ২০+ টুলস ব্যবহার করতে পারবেন।',
    },
  ],
}

export default function LandingPage() {
  const { t, lang, toggle } = useLang()

  const steps = lang === 'bn'
    ? [
        { title: 'অ্যাকাউন্ট খুলুন', desc: 'ইমেইল দিয়ে দ্রুত রেজিস্টার করে ঢুকে পড়ুন।' },
        { title: 'আপনার কাজ বেছে নিন', desc: 'চ্যাট, ছবি, বা টুলস—যেটা দরকার সেটাই ব্যবহার করুন।' },
        { title: 'রেজাল্ট কপি ও শেয়ার', desc: 'তৈরি হওয়া কনটেন্ট সাথে সাথে কাজে লাগান।' },
      ]
    : [
        { title: 'Create your account', desc: 'Sign up with email and get inside quickly.' },
        { title: 'Pick your workflow', desc: 'Use chat, image generation, or AI tools instantly.' },
        { title: 'Copy and ship output', desc: 'Use your generated results directly in real work.' },
      ]

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-green-900/40 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-green-400" size={20} />
            <span className="font-mono text-lg font-bold text-green-400">{t.brand}</span>
          </div>
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
            <Link
              to="/register"
              className="rounded-md bg-green-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-green-400"
            >
              {t.startFree}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-14 md:grid-cols-2 md:pt-20">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-700/30 bg-green-900/20 px-3 py-1 text-xs text-green-300">
              <BadgeCheck size={14} /> {t.tagline}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              {t.heroTitle1}{' '}<span className="text-green-400">{t.heroTitle2}</span>
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
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400"
              >
                {t.ctaBtn} <ArrowRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="rounded-md border border-green-700/50 px-5 py-3 text-sm font-medium text-gray-200 transition hover:border-green-500 hover:text-green-300"
              >
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
            <h2 className="text-lg font-bold text-green-300">{lang === 'bn' ? 'কেন এটা কনভার্ট করে' : 'Why this converts'}</h2>
            <div className="mt-4 space-y-4 text-sm text-gray-300">
              <div className="rounded-lg border border-green-900/30 bg-black/40 p-4">
                <p className="font-semibold text-white">{lang === 'bn' ? 'এক ক্লিকে শুরু' : 'One-click onboarding'}</p>
                <p className="mt-1">{lang === 'bn' ? 'ল্যান্ডিং থেকে সরাসরি রেজিস্টার—অতিরিক্ত ধাপ নেই।' : 'Direct path from hero to signup without extra friction.'}</p>
              </div>
              <div className="rounded-lg border border-green-900/30 bg-black/40 p-4">
                <p className="font-semibold text-white">{lang === 'bn' ? 'স্পষ্ট অফার' : 'Clear offer'}</p>
                <p className="mt-1">{lang === 'bn' ? 'ফ্রি স্টার্ট + বাংলাদেশি পেমেন্ট = দ্রুত সিদ্ধান্ত।' : 'Free start + local payment rails help users decide faster.'}</p>
              </div>
              <div className="rounded-lg border border-green-900/30 bg-black/40 p-4">
                <p className="font-semibold text-white">{lang === 'bn' ? 'বিশ্বাসযোগ্য ভ্যালু' : 'Trust with value proof'}</p>
                <p className="mt-1">{lang === 'bn' ? 'মডেল সংখ্যা, টুলস, বাংলা সাপোর্ট—সবচেয়ে গুরুত্বপূর্ণ তথ্য প্রথমেই।' : 'Models, tools, and language support are visible above the fold.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14">
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
            <h2 className="text-2xl font-bold md:text-3xl">{lang === 'bn' ? '৩ ধাপে শুরু করুন' : 'Get started in 3 simple steps'}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-green-900/30 bg-black/40 p-4">
                  <p className="text-xs font-semibold text-green-400">0{index + 1}</p>
                  <h3 className="mt-1 font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16">
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
              <h2 className="text-2xl font-bold md:text-3xl">{t.ctaTitle} <span className="text-green-400">{t.ctaTitleHighlight}</span></h2>
              <p className="mt-2 text-gray-300">{t.ctaSub}</p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400"
            >
              {t.startFree} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="px-4 py-8 text-center text-xs text-gray-500">
        {t.footerMade}
      </footer>
    </div>
  )
}
