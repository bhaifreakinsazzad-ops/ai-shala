import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { subscriptionApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, Copy, AlertCircle, Clock, Phone } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Plan { id: string; name: string; price_bdt: number; features: string[] }
interface PaymentMethod { id: string; name: string; steps: string[]; number?: string }

const PAYMENT_NUMBER = '01778307704'

const METHODS = [
  { id: 'bkash', name: 'bKash', emoji: '💳', color: 'border-pink-500/40 bg-pink-900/10', activeColor: 'border-pink-400 bg-pink-900/20', textColor: 'text-pink-300', steps: ['bKash অ্যাপ খুলুন', 'Send Money সিলেক্ট করুন', `নম্বরে পাঠান: ${PAYMENT_NUMBER}`, 'পরিমাণ দিন এবং Confirm করুন', 'Transaction ID কপি করুন'] },
  { id: 'nagad', name: 'Nagad', emoji: '📲', color: 'border-orange-500/40 bg-orange-900/10', activeColor: 'border-orange-400 bg-orange-900/20', textColor: 'text-orange-300', steps: ['Nagad অ্যাপ খুলুন বা *167# ডায়াল করুন', 'Send Money বেছে নিন', `নম্বরে পাঠান: ${PAYMENT_NUMBER}`, 'পরিমাণ দিন এবং কনফার্ম করুন', 'Transaction ID লিখে রাখুন'] },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', color: 'border-purple-500/40 bg-purple-900/10', activeColor: 'border-purple-400 bg-purple-900/20', textColor: 'text-purple-300', steps: ['Rocket অ্যাপ খুলুন বা *322# ডায়াল করুন', 'Send Money অপশন সিলেক্ট করুন', `নম্বরে পাঠান: ${PAYMENT_NUMBER}`, 'পরিমাণ দিয়ে কনফার্ম করুন', 'TrxID নোট করুন'] },
  { id: 'bank', name: 'ব্যাংক', emoji: '🏦', color: 'border-blue-500/40 bg-blue-900/10', activeColor: 'border-blue-400 bg-blue-900/20', textColor: 'text-blue-300', steps: ['আপনার ব্যাংক অ্যাপ বা ব্রাঞ্চে যান', 'অ্যাডমিনের সাথে যোগাযোগ করুন ব্যাংক ডিটেইলসের জন্য', 'ট্রান্সফার করুন এবং রেফারেন্স নম্বর রাখুন', 'নিচের ফর্মে সাবমিট করুন'] },
]

export default function PaymentPage() {
  const { user, refreshUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>(location.state?.planId || 'pro')
  const [selectedMethod, setSelectedMethod] = useState('bkash')
  const [form, setForm] = useState({ transaction_id: '', sender_number: '', amount: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [myPayments, setMyPayments] = useState<any[]>([])
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [activeTab, setActiveTab] = useState<'pay' | 'history'>('pay')

  useEffect(() => {
    subscriptionApi.getPlans().then(r => setPlans(r.data.plans.filter((p: Plan) => p.id !== 'free'))).catch(() => {})
    loadMyPayments()
  }, [])

  const loadMyPayments = async () => {
    try {
      const r = await subscriptionApi.getMyPayments()
      setMyPayments(r.data.payments)
    } catch {}
  }

  const plan = plans.find(p => p.id === selectedPlan)
  const method = METHODS.find(m => m.id === selectedMethod)!

  const handleCopyNumber = () => {
    copyToClipboard(PAYMENT_NUMBER)
    setCopiedNumber(true)
    setTimeout(() => setCopiedNumber(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.transaction_id.trim()) { setError('ট্রানজেকশন আইডি দিন'); return }
    if (!plan) { setError('প্ল্যান সিলেক্ট করুন'); return }
    setSubmitting(true)
    try {
      await subscriptionApi.submitPayment({
        plan_id: selectedPlan,
        payment_method: selectedMethod,
        transaction_id: form.transaction_id.trim(),
        amount: plan.price_bdt,
        sender_number: form.sender_number || undefined,
      })
      setSubmitted(true)
      loadMyPayments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'সাবমিট করতে সমস্যা হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
    approved: 'bg-green-900/30 text-green-300 border-green-700/40',
    rejected: 'bg-red-900/30 text-red-300 border-red-700/40',
  }
  const statusLabels: Record<string, string> = {
    pending: '⏳ পেন্ডিং', approved: '✅ অ্যাপ্রুভড', rejected: '❌ রিজেক্টেড',
  }

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md glass rounded-2xl p-8 neon-border">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-400 mb-3">পেমেন্ট রিকোয়েস্ট পাওয়া গেছে!</h2>
          <p className="text-gray-400 mb-2">আপনার রিকোয়েস্ট পর্যালোচনা করা হচ্ছে।</p>
          <p className="text-green-300 font-medium mb-6">২-২৪ ঘণ্টার মধ্যে অ্যাকাউন্ট আপগ্রেড হবে।</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setSubmitted(false); setActiveTab('history'); loadMyPayments() }}
              className="btn-green w-full py-3">পেমেন্ট ইতিহাস দেখুন</button>
            <Link to="/chat" className="text-green-400 text-sm hover:underline">চ্যাটে ফিরে যান</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">সাবস্ক্রিপশন আপগ্রেড</h1>
            <p className="text-gray-500 text-sm mt-1">bKash / Nagad / Rocket দিয়ে পেমেন্ট করুন</p>
          </div>
          <Link to="/pricing" className="text-sm text-green-400 hover:underline">সব প্ল্যান দেখুন →</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/40 rounded-xl p-1 mb-6 w-fit border border-green-900/20">
          {(['pay', 'history'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === t ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-gray-500 hover:text-gray-300')}>
              {t === 'pay' ? '💳 পেমেন্ট করুন' : '📋 ইতিহাস'}
            </button>
          ))}
        </div>

        {activeTab === 'pay' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Plan + Method */}
            <div className="space-y-5">
              {/* Select plan */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">প্ল্যান বেছে নিন</label>
                <div className="space-y-3">
                  {plans.map(p => (
                    <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                      className={cn('w-full text-left p-4 rounded-xl border transition-all',
                        selectedPlan === p.id ? 'border-green-500/50 bg-green-500/10' : 'border-green-900/20 glass-light hover:border-green-900/40')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center',
                            selectedPlan === p.id ? 'border-green-400 bg-green-400' : 'border-gray-600')}>
                            {selectedPlan === p.id && <div className="w-2 h-2 bg-black rounded-full" />}
                          </div>
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                        <span className="font-bold text-green-400 text-lg">৳{p.price_bdt}<span className="text-xs text-gray-500">/মাস</span></span>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-6">
                        {p.features.slice(0, 3).map(f => (
                          <span key={f} className="text-xs text-gray-500">✓ {f}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select payment method */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">পেমেন্ট পদ্ধতি</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                      className={cn('p-3 rounded-xl border flex items-center gap-2 transition-all text-sm',
                        selectedMethod === m.id ? m.activeColor : m.color)}>
                      <span className="text-xl">{m.emoji}</span>
                      <span className={cn('font-medium', selectedMethod === m.id ? m.textColor : 'text-gray-400')}>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Instructions + Form */}
            <div className="space-y-5">
              {/* Payment instructions */}
              <div className="glass rounded-xl p-5 border border-green-900/20">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">{method.emoji}</span> {method.name} দিয়ে পেমেন্ট
                </h3>

                {/* Payment number */}
                <div className="bg-black/50 rounded-xl p-4 mb-4 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">পেমেন্ট নম্বর ({method.name})</p>
                      <p className="text-2xl font-bold text-green-400 font-mono tracking-wider">{PAYMENT_NUMBER}</p>
                    </div>
                    <button onClick={handleCopyNumber} className="flex items-center gap-1.5 text-xs bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors">
                      <Copy size={12} /> {copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}
                    </button>
                  </div>
                  {plan && (
                    <div className="mt-3 pt-3 border-t border-green-900/20 flex justify-between">
                      <span className="text-sm text-gray-500">পাঠাতে হবে:</span>
                      <span className="text-green-400 font-bold">৳{plan.price_bdt}</span>
                    </div>
                  )}
                </div>

                {/* Steps */}
                <ol className="space-y-2">
                  {method.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                      <span className="w-5 h-5 rounded-full bg-green-900/40 border border-green-700/40 text-green-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>

                <div className="mt-4 flex items-start gap-2 bg-yellow-900/10 border border-yellow-700/20 rounded-lg p-3">
                  <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300/80">ট্রানজেকশন আইডি সঠিকভাবে দিন। ভুল আইডি দিলে রিকোয়েস্ট বাতিল হতে পারে।</p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="glass rounded-xl p-5 border border-green-900/20 space-y-4">
                <h3 className="font-bold text-white">পেমেন্ট কনফার্মেশন</h3>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">ট্রানজেকশন আইডি / TrxID *</label>
                  <input
                    type="text"
                    required
                    value={form.transaction_id}
                    onChange={e => setForm({ ...form, transaction_id: e.target.value })}
                    className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 font-mono"
                    placeholder="যেমন: 8FMXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">আপনার মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="tel"
                    value={form.sender_number}
                    onChange={e => setForm({ ...form, sender_number: e.target.value })}
                    className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                    placeholder="যে নম্বর থেকে পাঠিয়েছেন"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !form.transaction_id.trim()}
                  className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> সাবমিট হচ্ছে...</>
                  ) : (
                    <><CheckCircle size={18} /> পেমেন্ট সাবমিট করুন</>
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center flex items-center justify-center gap-1">
                  <Clock size={11} /> সাধারণত ২-২৪ ঘণ্টার মধ্যে আপগ্রেড হবে
                </p>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-bold text-gray-300 mb-4">আমার পেমেন্ট ইতিহাস</h2>
            {myPayments.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <p className="text-4xl mb-3">💳</p>
                <p>কোনো পেমেন্ট হিস্ট্রি নেই</p>
                <button onClick={() => setActiveTab('pay')} className="text-green-400 text-sm mt-3 hover:underline">
                  এখনই পেমেন্ট করুন →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myPayments.map(p => (
                  <div key={p.id} className="glass-light rounded-xl p-5 border border-green-900/20">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white capitalize">{p.plan_name || p.plan_id}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColors[p.status])}>
                            {statusLabels[p.status]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{p.payment_method.toUpperCase()} · TrxID: <span className="font-mono text-gray-300">{p.transaction_id}</span></p>
                        {p.admin_note && <p className="text-xs text-gray-500 mt-1">নোট: {p.admin_note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-green-400 font-bold">৳{p.amount}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(p.created_at).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
