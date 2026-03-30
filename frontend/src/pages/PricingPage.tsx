import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { subscriptionApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Plan {
  id: string; name: string; nameEn: string; price_bdt: number
  period: string | null; features: string[]; color: string; popular: boolean
}

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    subscriptionApi.getPlans().then(r => setPlans(r.data.plans)).catch(() => {})
  }, [])

  const planIcons: Record<string, React.ReactNode> = {
    free: <Star size={22} className="text-gray-400" />,
    pro: <Zap size={22} className="text-green-400" />,
    premium: <Crown size={22} className="text-purple-400" />,
  }

  const planColors: Record<string, string> = {
    free: 'border-gray-700/40',
    pro: 'border-green-500/40 bg-green-500/5',
    premium: 'border-purple-500/40 bg-purple-500/5',
  }

  const btnColors: Record<string, string> = {
    free: 'border border-gray-600 text-gray-300 hover:bg-white/5',
    pro: 'bg-green-500 text-black hover:bg-green-400',
    premium: 'bg-purple-600 text-white hover:bg-purple-500',
  }

  const handleSelect = (planId: string) => {
    if (planId === 'free') return
    if (!user) { navigate('/register'); return }
    navigate('/payment', { state: { planId } })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-900/20 glass px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-green-400 font-mono">AI শালা</span>
        </Link>
        {user ? (
          <Link to="/chat" className="text-sm text-green-400 hover:underline">ড্যাশবোর্ডে যান →</Link>
        ) : (
          <Link to="/login" className="text-sm text-gray-400 hover:text-green-400">লগইন</Link>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 mb-5">
            <Zap size={14} /> সহজ মূল্য, বাংলাদেশি পেমেন্ট
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            আপনার জন্য সঠিক <span className="gradient-text">প্ল্যান</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            bKash, Nagad, Rocket দিয়ে মিনিটেই পেমেন্ট করুন। কোনো ক্রেডিট কার্ড লাগবে না।
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm">
              <span className="text-gray-500">বর্তমান প্ল্যান:</span>
              <span className={cn('font-bold', user.subscription === 'pro' ? 'text-green-400' : user.subscription === 'premium' ? 'text-purple-400' : 'text-gray-300')}>
                {user.subscription === 'free' ? 'ফ্রি' : user.subscription === 'pro' ? 'প্রো ✓' : 'প্রিমিয়াম ✓'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn('rounded-2xl p-7 border relative flex flex-col', planColors[plan.id] || 'border-gray-700/40')}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  সবচেয়ে জনপ্রিয়
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {planIcons[plan.id]}
                <div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <p className="text-xs text-gray-500">{plan.nameEn}</p>
                </div>
                {user?.subscription === plan.id && (
                  <span className="ml-auto text-xs bg-green-900/50 text-green-300 border border-green-700/50 px-2 py-0.5 rounded-full">সক্রিয়</span>
                )}
              </div>

              <div className="mb-6">
                {plan.price_bdt === 0 ? (
                  <div className="text-4xl font-bold gradient-text">বিনামূল্যে</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">৳{plan.price_bdt}</span>
                    <span className="text-gray-500 text-sm">/{plan.period === 'month' ? 'মাস' : plan.period}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-7">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle size={15} className={cn('mt-0.5 shrink-0', plan.id === 'premium' ? 'text-purple-400' : 'text-green-400')} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan.id)}
                disabled={user?.subscription === plan.id}
                className={cn(
                  'w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                  btnColors[plan.id],
                  user?.subscription === plan.id && 'opacity-50 cursor-not-allowed'
                )}
              >
                {user?.subscription === plan.id ? 'বর্তমান প্ল্যান' :
                  plan.id === 'free' ? 'ফ্রিতে শুরু' : <>পেমেন্ট করুন <ArrowRight size={16} /></>
                }
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-14 glass-light rounded-2xl p-8 border border-green-900/20">
          <h3 className="text-center text-lg font-bold text-gray-300 mb-6">গ্রহণযোগ্য পেমেন্ট পদ্ধতি</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'bKash', color: 'bg-pink-900/20 border-pink-800/30', emoji: '💳', text: 'text-pink-300' },
              { name: 'Nagad', color: 'bg-orange-900/20 border-orange-800/30', emoji: '📲', text: 'text-orange-300' },
              { name: 'Rocket', color: 'bg-purple-900/20 border-purple-800/30', emoji: '🚀', text: 'text-purple-300' },
              { name: 'ব্যাংক', color: 'bg-blue-900/20 border-blue-800/30', emoji: '🏦', text: 'text-blue-300' },
            ].map(m => (
              <div key={m.name} className={cn('rounded-xl p-4 border text-center', m.color)}>
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className={cn('font-bold text-sm', m.text)}>{m.name}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-5">
            পেমেন্টের পর ট্রানজেকশন আইডি দিলে <span className="text-green-400">২-২৪ ঘণ্টার মধ্যে</span> অ্যাকাউন্ট আপগ্রেড হবে
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h3 className="text-2xl font-bold text-center mb-8 gradient-text">সাধারণ প্রশ্ন</h3>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              { q: 'পেমেন্ট করলে কতক্ষণে অ্যাকাউন্ট আপগ্রেড হবে?', a: 'সাধারণত ২-২৪ ঘণ্টার মধ্যে অ্যাকাউন্ট আপগ্রেড হয়। রাত ১২টার পর করলে পরের দিন সকালে হয়।' },
              { q: 'ফ্রি প্ল্যানে কী কী পাব?', a: 'দৈনিক ৫০টি AI মেসেজ, ৫টি ছবি তৈরি, সব বেসিক টুলস এবং ২৫+ AI মডেল।' },
              { q: 'bKash দিয়ে কীভাবে পেমেন্ট করব?', a: 'পেমেন্ট পেজে গিয়ে "bKash" সিলেক্ট করুন। দেওয়া নম্বরে টাকা পাঠান এবং ট্রানজেকশন আইডি সাবমিট করুন।' },
              { q: 'কোনো সমস্যা হলে কোথায় যোগাযোগ করব?', a: 'পেমেন্ট নম্বরে WhatsApp বা SMS করুন অথবা AI চ্যাটে লিখুন।' },
            ].map(({ q, a }) => (
              <div key={q} className="glass-light rounded-xl p-5 border border-green-900/20">
                <p className="font-medium text-green-300 mb-2">❓ {q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
