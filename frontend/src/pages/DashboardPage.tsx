import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { authApi, subscriptionApi } from '@/lib/api'
import { MessageSquare, Image, Wrench, CreditCard, Crown, TrendingUp, Calendar, Zap } from 'lucide-react'
import { cn, getSubscriptionBadge, formatDate } from '@/lib/utils'

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
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.dashTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{t.dashWelcome} {user.name}!</p>
          </div>
          <span className={cn('px-3 py-1.5 rounded-full text-sm font-bold', getSubscriptionBadge(user.subscription))}>
            {subLabel}
          </span>
        </div>

        {/* Trial banner */}
        {user.subscription === 'free' && trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-300">{t.dashFreeTrial}</p>
                <p className="text-xs text-blue-400/70">{trialDaysLeft} {t.dashDaysLeft}</p>
              </div>
            </div>
            <Link to="/payment" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 transition-colors">
              {t.dashUpgrade}
            </Link>
          </div>
        )}

        {/* Subscription expiry */}
        {user.subscription !== 'free' && subEndsIn !== null && (
          <div className={cn('rounded-xl p-4 flex items-center justify-between border',
            subEndsIn <= 5 ? 'bg-red-900/20 border-red-700/40' : 'bg-green-900/10 border-green-700/20')}>
            <div className="flex items-center gap-3">
              <Calendar size={20} className={subEndsIn <= 5 ? 'text-red-400' : 'text-green-400'} />
              <div>
                <p className="text-sm font-medium text-gray-300">{t.dashSubscriptionLabel}</p>
                <p className="text-xs text-gray-500">{subEndsIn} {t.dashDaysLeft} · {new Date(user.subscription_ends_at!).toLocaleDateString()}</p>
              </div>
            </div>
            {subEndsIn <= 7 && (
              <Link to="/payment" className="text-xs bg-green-500 text-black px-3 py-1.5 rounded-lg">
                {t.dashRenew}
              </Link>
            )}
          </div>
        )}

        {/* Quick access */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.sidebarChat, icon: MessageSquare, color: 'text-green-400', action: '/chat', actionLabel: t.dashChatNow },
            { label: t.sidebarImage, icon: Image, color: 'text-blue-400', action: '/image', actionLabel: t.dashGenerate },
            { label: t.sidebarTools, icon: Wrench, color: 'text-purple-400', action: '/tools', actionLabel: t.dashUseNow },
            { label: t.dashUpgradeLabel, icon: Crown, color: 'text-yellow-400', action: '/payment', actionLabel: t.dashViewPlans },
          ].map(({ label, icon: Icon, color, action, actionLabel }) => (
            <Link key={label} to={action} className="glass-light rounded-xl p-4 border border-green-900/20 hover:border-green-500/30 transition-all group">
              <Icon size={22} className={cn(color, 'mb-3')} />
              <p className="font-medium text-gray-300 text-sm">{label}</p>
              <p className="text-xs text-gray-600 group-hover:text-green-400 transition-colors mt-1">{actionLabel} →</p>
            </Link>
          ))}
        </div>

        {/* Usage */}
        <div className="glass rounded-xl p-6 border border-green-900/20">
          <h2 className="font-bold text-gray-300 mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" /> {t.dashTodayUsage}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{t.dashAIMessages}</span>
                <span className="text-gray-300">
                  {user.subscription === 'free'
                    ? `${user.daily_usage} / ${user.daily_limit}`
                    : <span className="text-green-400">{t.dashUnlimited}</span>}
                </span>
              </div>
              {user.subscription === 'free' && (
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-green-500')}
                    style={{ width: `${usagePct}%` }} />
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{t.dashImagesLabel}</span>
                <span className="text-gray-300">
                  {user.subscription === 'free'
                    ? `${user.image_daily_usage || 0} / ${user.image_daily_limit || 5}`
                    : <span className="text-green-400">{t.dashUnlimited}</span>}
                </span>
              </div>
              {user.subscription === 'free' && (
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', imgPct >= 90 ? 'bg-red-500' : imgPct >= 70 ? 'bg-yellow-500' : 'bg-blue-500')}
                    style={{ width: `${imgPct}%` }} />
                </div>
              )}
            </div>
          </div>
          {user.subscription === 'free' && usagePct >= 80 && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg flex items-center justify-between">
              <p className="text-yellow-300 text-xs">{t.dashNearLimit}</p>
              <Link to="/payment" className="text-xs text-green-400 hover:underline">{t.dashGetPro} →</Link>
            </div>
          )}
        </div>

        {/* Profile + Payments */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-xl p-6 border border-green-900/20">
            <h2 className="font-bold text-gray-300 mb-4">{t.dashProfile}</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl font-bold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                {editName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="bg-black/50 border border-green-900/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-green-500/50 w-36"
                    />
                    <button onClick={saveName} disabled={savingName} className="text-xs text-green-400 hover:underline">{t.dashSave}</button>
                    <button onClick={() => setEditName(false)} className="text-xs text-gray-500 hover:underline">{t.dashCancel}</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">{user.name}</p>
                    <button onClick={() => setEditName(true)} className="text-xs text-gray-600 hover:text-green-400">✏️</button>
                  </div>
                )}
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.dashMobile}</span>
                  <span className="text-gray-300">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">{t.dashPlan}</span>
                <span className={cn('font-medium', user.subscription === 'pro' ? 'text-green-400' : user.subscription === 'premium' ? 'text-purple-400' : 'text-gray-300')}>
                  {subNameLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t.dashJoined}</span>
                <span className="text-gray-300">{formatDate(user.id)}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-green-900/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-300">{t.dashPayments}</h2>
              <Link to="/payment" className="text-xs text-green-400 hover:underline">View all →</Link>
            </div>
            {payments.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">{t.dashNoPayments}</p>
                <Link to="/payment" className="text-xs text-green-400 mt-2 block hover:underline">{t.dashUpgrade} →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-gray-300 capitalize">{p.plan_name}</p>
                      <p className="text-xs text-gray-600">{p.payment_method.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">৳{p.amount}</p>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded',
                        p.status === 'approved' ? 'text-green-400' : p.status === 'pending' ? 'text-yellow-400' : 'text-red-400')}>
                        {p.status === 'approved' ? '✅' : p.status === 'pending' ? '⏳' : '❌'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
