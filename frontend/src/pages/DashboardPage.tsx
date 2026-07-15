import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { authApi, subscriptionApi } from '../lib/api'
import {
  MessageSquare, Image, Wrench, CreditCard, Crown, TrendingUp,
  Calendar, Zap, Mic, Clapperboard, BrainCircuit, Globe,
  Presentation, Volume2, Music2, Code2, Search, LayoutDashboard
} from 'lucide-react'
import { cn, getSubscriptionBadge, formatDate } from '../lib/utils'

const FEATURES = [
  { to: '/chat',     icon: MessageSquare, label: 'AI Chat',       desc: '৪০+ Models · Groq/Gemini',    accent: '#00D4AA', live: true },
  { to: '/voice',    icon: Mic,           label: 'Voice Chat',    desc: 'Talk & Listen · Browser STT', accent: '#3B82F6', live: true },
  { to: '/image',    icon: Image,         label: 'Image Gen',     desc: 'Pollinations · Free',          accent: '#A855F7', live: true },
  { to: '/video',    icon: Clapperboard,  label: 'Video Gen',     desc: 'Coming soon',                  accent: '#EF4444', live: false },
  { to: '/tools',    icon: Code2,         label: 'Code & Tools',  desc: 'Write · Debug · Explain',      accent: '#22C55E', live: true },
  { to: '/slides',   icon: Presentation,  label: 'Slides & Docs', desc: '.pptx · .docx · AI outline',  accent: '#F97316', live: true },
  { to: '/research', icon: BrainCircuit,  label: 'Research AI',   desc: 'Web · Citations · Reports',   accent: '#06B6D4', live: true },
  { to: '/search',   icon: Search,        label: 'Web Search',    desc: 'Tavily · Live results',        accent: '#EAB308', live: true },
  { to: '/audio',    icon: Volume2,       label: 'Audio / TTS',   desc: 'Edge TTS · 4 voices',          accent: '#8B5CF6', live: true },
  { to: '/music',    icon: Music2,        label: 'Music Gen',     desc: 'Coming soon',                  accent: '#EC4899', live: false },
]

export default function DashboardPage() {
  const { user, refreshUser, updateUser } = useAuth()
  const { t } = useLang()
  const [payments, setPayments] = useState<any[]>([])
  const [editName, setEditName] = useState(false)
  const [newName, setNewName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    refreshUser()
    subscriptionApi.getMyPayments().then(r => setPayments(r.data.payments.slice(0, 3))).catch(() => {})
  }, [])

  const saveName = async () => {
    if (!newName.trim()) return
    setSavingName(true)
    try {
      const res = await authApi.updateProfile({ name: newName })
      updateUser(res.data.user)
      setEditName(false)
    } catch {}
    setSavingName(false)
  }

  if (!user) return null

  const usagePct = Math.min(100, (user.daily_usage / user.daily_limit) * 100)
  const imgPct = Math.min(100, ((user.image_daily_usage || 0) / (user.image_daily_limit || 5)) * 100)

  const trialDaysLeft = user.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const subEndsIn = user.subscription_ends_at
    ? Math.max(0, Math.ceil((new Date(user.subscription_ends_at).getTime() - Date.now()) / 86400000))
    : null

  const subLabel = user.subscription === 'free' ? `🆓 ${t.subFree}`
    : user.subscription === 'pro' ? `⚡ ${t.subPro}`
    : `👑 ${t.subPremium}`

  const subNameLabel = user.subscription === 'free' ? t.subFree
    : user.subscription === 'pro' ? t.subPro
    : t.subPremium

  return (
    <div className="h-full overflow-y-auto">
      {/* Page header */}
      <div className="px-5 py-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(2,2,10,0.8)' }}>
        <div className="flex items-center gap-2.5">
          <LayoutDashboard size={18} style={{ color: '#94A3B8' }} />
          <span className="font-bold text-[14px] text-slate-200">{t.dashTitle}</span>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-bold', getSubscriptionBadge(user.subscription))}>
          {subLabel}
        </span>
      </div>

      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Trial / subscription banners */}
        {user.subscription === 'free' && trialDaysLeft !== null && trialDaysLeft > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl p-4 border"
            style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Zap size={16} style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: '#3B82F6' }}>{t.dashFreeTrial}</p>
                <p className="text-[11px] text-slate-500">{trialDaysLeft} {t.dashDaysLeft}</p>
              </div>
            </div>
            <Link to="/payment"
              className="text-[12px] font-semibold px-4 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
              {t.dashUpgrade}
            </Link>
          </motion.div>
        )}

        {user.subscription !== 'free' && subEndsIn !== null && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-center justify-between rounded-2xl p-4 border',
              subEndsIn <= 5 ? '' : '')}
            style={{
              background: subEndsIn <= 5 ? 'rgba(239,68,68,0.06)' : 'rgba(0,212,170,0.04)',
              borderColor: subEndsIn <= 5 ? 'rgba(239,68,68,0.2)' : 'rgba(0,212,170,0.12)'
            }}>
            <div className="flex items-center gap-3">
              <Calendar size={16} style={{ color: subEndsIn <= 5 ? '#EF4444' : '#00D4AA' }} />
              <div>
                <p className="text-[13px] font-medium text-slate-300">{t.dashSubscriptionLabel}</p>
                <p className="text-[11px] text-slate-500">{subEndsIn} {t.dashDaysLeft}</p>
              </div>
            </div>
            {subEndsIn <= 7 && (
              <Link to="/payment" className="text-[12px] font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(0,212,170,0.12)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.2)' }}>
                {t.dashRenew}
              </Link>
            )}
          </motion.div>
        )}

        {/* Usage meters */}
        <div className="rounded-2xl p-5 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} style={{ color: '#94A3B8' }} />
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">{t.dashTodayUsage}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-slate-500">{t.dashAIMessages}</span>
                <span className="font-medium text-slate-300">
                  {user.subscription === 'free'
                    ? `${user.daily_usage} / ${user.daily_limit}`
                    : <span style={{ color: '#00D4AA' }}>{t.dashUnlimited}</span>}
                </span>
              </div>
              {user.subscription === 'free' && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                      background: usagePct >= 90 ? 'linear-gradient(90deg, #EF4444, #DC2626)'
                        : usagePct >= 70 ? 'linear-gradient(90deg, #EAB308, #CA8A04)'
                        : 'linear-gradient(90deg, #00D4AA, #00A882)',
                      boxShadow: `0 0 8px ${usagePct >= 90 ? 'rgba(239,68,68,0.5)' : 'rgba(0,212,170,0.4)'}`
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-[12px] mb-2">
                <span className="text-slate-500">{t.dashImagesLabel}</span>
                <span className="font-medium text-slate-300">
                  {user.subscription === 'free'
                    ? `${user.image_daily_usage || 0} / ${user.image_daily_limit || 5}`
                    : <span style={{ color: '#A855F7' }}>{t.dashUnlimited}</span>}
                </span>
              </div>
              {user.subscription === 'free' && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${imgPct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                    style={{
                      background: 'linear-gradient(90deg, #A855F7, #7C3AED)',
                      boxShadow: '0 0 8px rgba(168,85,247,0.4)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {user.subscription === 'free' && usagePct >= 80 && (
            <div className="mt-3 flex items-center justify-between rounded-xl p-3"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
              <p className="text-[11px]" style={{ color: '#EAB308' }}>{t.dashNearLimit}</p>
              <Link to="/payment" className="text-[11px] font-semibold" style={{ color: '#00D4AA' }}>{t.dashGetPro} →</Link>
            </div>
          )}
        </div>

        {/* Feature card grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">All Features</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FEATURES.map(({ to, icon: Icon, label, desc, accent, live }, i) => (
              <motion.div key={to}
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={to} className="group flex flex-col rounded-2xl p-4 relative overflow-hidden transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid rgba(255,255,255,0.06)`,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${accent}28`
                    ;(e.currentTarget as HTMLElement).style.background = `${accent}08`
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                    ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-50"
                    style={{ background: accent }} />
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all"
                    style={{ background: `${accent}14`, border: `1px solid ${accent}20` }}>
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <p className="text-[12px] font-bold text-slate-200 leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{desc}</p>
                  {!live && (
                    <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
                      Soon
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Profile + Payments */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Profile */}
          <div className="rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4">{t.dashProfile}</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[17px] font-bold"
                style={{ background: 'rgba(0,212,170,0.1)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.18)' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {editName ? (
                  <div className="flex items-center gap-2">
                    <input value={newName} onChange={e => setNewName(e.target.value)}
                      className="flex-1 rounded-xl px-3 py-1.5 text-[13px] text-white focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,212,170,0.25)' }} />
                    <button onClick={saveName} disabled={savingName}
                      className="text-[11px] font-semibold" style={{ color: '#00D4AA' }}>{t.dashSave}</button>
                    <button onClick={() => setEditName(false)}
                      className="text-[11px] text-slate-600">{t.dashCancel}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[14px] text-white truncate">{user.name}</p>
                    <button onClick={() => setEditName(true)} className="text-slate-600 hover:text-slate-300 transition-colors text-[11px]">✏️</button>
                  </div>
                )}
                <p className="text-[11px] text-slate-600 truncate mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 text-[12px]">
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.dashMobile}</span>
                  <span className="text-slate-300">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">{t.dashPlan}</span>
                <span className={cn('font-semibold', user.subscription === 'pro' ? '' : user.subscription === 'premium' ? '' : 'text-slate-400')}
                  style={{ color: user.subscription === 'pro' ? '#3B82F6' : user.subscription === 'premium' ? '#EAB308' : undefined }}>
                  {subNameLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{t.dashJoined}</span>
                <span className="text-slate-400">{formatDate(user.id)}</span>
              </div>
            </div>
          </div>

          {/* Recent payments */}
          <div className="rounded-2xl p-5 border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">{t.dashPayments}</h2>
              <Link to="/payment" className="text-[11px] font-semibold transition-colors hover:opacity-70"
                style={{ color: '#10B981' }}>View all →</Link>
            </div>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <CreditCard size={24} className="text-slate-700" />
                <p className="text-[12px] text-slate-600">{t.dashNoPayments}</p>
                <Link to="/payment" className="text-[11px] font-semibold" style={{ color: '#10B981' }}>
                  {t.dashUpgrade} →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-[12px] py-2 border-b last:border-none"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div>
                      <p className="font-medium text-slate-300 capitalize">{p.plan_name}</p>
                      <p className="text-[10px] text-slate-600">{p.payment_method?.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: '#10B981' }}>৳{p.amount}</p>
                      <span className="text-[10px]"
                        style={{ color: p.status === 'approved' ? '#22C55E' : p.status === 'pending' ? '#EAB308' : '#EF4444' }}>
                        {p.status === 'approved' ? '✅ Approved' : p.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upgrade CTA for free users */}
        {user.subscription === 'free' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/payment" className="flex items-center justify-between rounded-2xl p-5 transition-all group"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,212,170,0.04))',
                border: '1px solid rgba(16,185,129,0.15)'
              }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Crown size={18} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <p className="font-bold text-[14px] text-white">{t.dashUpgradeLabel}</p>
                  <p className="text-[11px] text-slate-500">৳২৯৯/মাস · Unlimited messages · All features</p>
                </div>
              </div>
              <span className="text-[12px] font-bold px-4 py-2 rounded-xl transition-all group-hover:opacity-80"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                Upgrade →
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
