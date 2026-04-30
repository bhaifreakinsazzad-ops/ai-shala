import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Users, CreditCard, MessageSquare, Image, TrendingUp, CheckCircle,
  XCircle, Clock, Search, ChevronLeft, RefreshCw, BarChart3, Shield
} from 'lucide-react'
import { cn, formatDate } from '../lib/utils'

type Tab = 'overview' | 'payments' | 'users' | 'analytics'

export default function AdminPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const [stats, setStats] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [paymentFilter, setPaymentFilter] = useState('pending')
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionNote, setActionNote] = useState<Record<string, string>>({})

  useEffect(() => { loadStats() }, [])
  useEffect(() => { if (tab === 'payments') loadPayments() }, [tab, paymentFilter])
  useEffect(() => { if (tab === 'users') loadUsers() }, [tab])
  useEffect(() => { if (tab === 'analytics') loadAnalytics() }, [tab])

  const loadStats = async () => {
    try { const r = await adminApi.getStats(); setStats(r.data.stats) } catch {}
  }
  const loadPayments = async () => {
    setLoading(true)
    try { const r = await adminApi.getPayments({ status: paymentFilter || undefined }); setPayments(r.data.payments || []) }
    catch {} finally { setLoading(false) }
  }
  const loadUsers = async () => {
    setLoading(true)
    try { const r = await adminApi.getUsers({ search: userSearch || undefined }); setUsers(r.data.users || []) }
    catch {} finally { setLoading(false) }
  }
  const loadAnalytics = async () => {
    setLoading(true)
    try { const r = await adminApi.getAnalytics(7); setAnalytics(r.data) }
    catch {} finally { setLoading(false) }
  }

  const approvePayment = async (id: string) => {
    if (!confirm('এই পেমেন্ট অ্যাপ্রুভ করবেন?')) return
    try {
      await adminApi.approvePayment(id, actionNote[id])
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))
      loadStats()
    } catch (err: any) { alert(err.response?.data?.error || 'সমস্যা হয়েছে') }
  }

  const rejectPayment = async (id: string) => {
    const reason = prompt('রিজেক্ট করার কারণ লিখুন (ঐচ্ছিক):') ?? ''
    try {
      await adminApi.rejectPayment(id, reason)
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
      loadStats()
    } catch (err: any) { alert(err.response?.data?.error || 'সমস্যা হয়েছে') }
  }

  const changeUserSub = async (userId: string, sub: string) => {
    try {
      await adminApi.updateUserSubscription(userId, { subscription: sub, days: 30 })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription: sub } : u))
    } catch (err: any) { alert(err.response?.data?.error || 'সমস্যা হয়েছে') }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700/40',
    approved: 'bg-green-900/30 text-green-300 border border-green-700/40',
    rejected: 'bg-red-900/30 text-red-300 border border-red-700/40',
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'ওভারভিউ', icon: <BarChart3 size={16} /> },
    { id: 'payments', label: `পেমেন্ট${stats?.pendingPayments ? ` (${stats.pendingPayments})` : ''}`, icon: <CreditCard size={16} /> },
    { id: 'users', label: 'ব্যবহারকারী', icon: <Users size={16} /> },
    { id: 'analytics', label: 'অ্যানালিটিক্স', icon: <TrendingUp size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="glass border-b border-green-900/20 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/chat" className="text-gray-500 hover:text-green-400 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-yellow-400" />
            <span className="font-bold text-white">Admin Dashboard</span>
          </div>
          <span className="text-xs text-gray-600">— AI শালা</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{user?.email}</span>
          <button onClick={loadStats} className="text-gray-500 hover:text-green-400 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-black/40 rounded-xl p-1 mb-6 w-fit border border-green-900/20 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-gray-500 hover:text-gray-300')}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'মোট ব্যবহারকারী', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-400', sub: `${stats?.newUsersThisWeek ?? 0} এই সপ্তাহে` },
                { label: 'পেইড ব্যবহারকারী', value: stats?.proUsers ?? '—', icon: Crown2, color: 'text-green-400', sub: 'Pro + Premium' },
                { label: 'পেন্ডিং পেমেন্ট', value: stats?.pendingPayments ?? '—', icon: Clock, color: 'text-yellow-400', sub: 'অ্যাপ্রুভাল দরকার', urgent: stats?.pendingPayments > 0 },
                { label: 'এই মাসের আয়', value: `৳${stats?.monthlyRevenue ?? 0}`, icon: CreditCard, color: 'text-purple-400', sub: 'অ্যাপ্রুভড পেমেন্ট' },
              ].map(({ label, value, icon: Icon, color, sub, urgent }) => (
                <div key={label} className={cn('glass-light rounded-xl p-5 border', urgent ? 'border-yellow-500/40 bg-yellow-900/10' : 'border-green-900/20')}>
                  <Icon size={22} className={cn(color, 'mb-3')} />
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{label}</div>
                  <div className="text-xs text-gray-600 mt-1">{sub}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-light rounded-xl p-5 border border-green-900/20">
                <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-green-400" /> প্ল্যাটফর্ম পরিসংখ্যান</h3>
                <div className="space-y-3">
                  {[
                    { label: 'মোট AI মেসেজ', value: stats?.totalMessages ?? 0, color: 'bg-green-500' },
                    { label: 'মোট ছবি তৈরি', value: stats?.totalImages ?? 0, color: 'bg-blue-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-white font-mono">{value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-light rounded-xl p-5 border border-green-900/20">
                <h3 className="font-bold text-gray-300 mb-4">দ্রুত অ্যাকশন</h3>
                <div className="space-y-2">
                  <button onClick={() => setTab('payments')} className="w-full text-left px-4 py-3 rounded-lg bg-yellow-900/20 border border-yellow-700/30 text-yellow-300 text-sm hover:bg-yellow-900/30 transition-colors flex items-center justify-between">
                    <span>⏳ পেন্ডিং পেমেন্ট দেখুন</span>
                    <span className="font-bold">{stats?.pendingPayments ?? 0}</span>
                  </button>
                  <button onClick={() => setTab('users')} className="w-full text-left px-4 py-3 rounded-lg glass border border-green-900/20 text-gray-300 text-sm hover:border-green-500/30 transition-colors flex items-center justify-between">
                    <span>👥 ব্যবহারকারী ম্যানেজ করুন</span>
                    <span className="text-gray-500">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {tab === 'payments' && (
          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setPaymentFilter(s === 'all' ? '' : s)}
                  className={cn('px-3 py-1.5 rounded-lg text-sm transition-all border',
                    (paymentFilter === s || (s === 'all' && !paymentFilter))
                      ? 'bg-green-500/20 text-green-300 border-green-500/30'
                      : 'text-gray-500 border-green-900/20 hover:text-gray-300')}>
                  {s === 'all' ? 'সব' : s === 'pending' ? '⏳ পেন্ডিং' : s === 'approved' ? '✅ অ্যাপ্রুভড' : '❌ রিজেক্টেড'}
                </button>
              ))}
              <button onClick={loadPayments} className="ml-auto text-gray-500 hover:text-green-400 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
            ) : payments.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
                <p>কোনো পেমেন্ট নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(p => (
                  <div key={p.id} className={cn('glass rounded-xl p-5 border', p.status === 'pending' ? 'border-yellow-700/30' : 'border-green-900/20')}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{p.user_name || p.user_email}</span>
                          <span className="text-xs text-gray-500">{p.user_email}</span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full', statusColors[p.status])}>
                            {p.status === 'pending' ? '⏳ পেন্ডিং' : p.status === 'approved' ? '✅ অ্যাপ্রুভড' : '❌ রিজেক্টেড'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>প্ল্যান: <span className="text-gray-200 font-medium">{p.plan_name || p.plan_id}</span></span>
                          <span>পদ্ধতি: <span className="text-gray-200">{p.payment_method?.toUpperCase()}</span></span>
                          <span>TrxID: <span className="font-mono text-green-300">{p.transaction_id}</span></span>
                          {p.sender_number && <span>নম্বর: <span className="text-gray-200">{p.sender_number}</span></span>}
                        </div>
                        <div className="text-xs text-gray-600">{formatDate(p.created_at)}</div>
                        {p.admin_note && <p className="text-xs text-gray-500 italic">নোট: {p.admin_note}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-2xl font-bold text-green-400">৳{p.amount}</span>
                        {p.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approvePayment(p.id)}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-black px-3 py-2 rounded-lg text-sm font-bold transition-colors">
                              <CheckCircle size={14} /> অ্যাপ্রুভ
                            </button>
                            <button onClick={() => rejectPayment(p.id)}
                              className="flex items-center gap-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-300 border border-red-700/50 px-3 py-2 rounded-lg text-sm transition-colors">
                              <XCircle size={14} /> রিজেক্ট
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()}
                  className="w-full bg-black/50 border border-green-900/30 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                />
              </div>
              <button onClick={loadUsers} className="btn-green px-4 py-2 text-sm">খুঁজুন</button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">লোড হচ্ছে...</div>
            ) : (
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="glass-light rounded-xl p-4 border border-green-900/20 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm shrink-0">
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200 text-sm">{u.name}</span>
                          {u.is_admin && <span className="text-xs bg-yellow-900/40 text-yellow-300 px-1.5 py-0.5 rounded">Admin</span>}
                          {u.is_banned && <span className="text-xs bg-red-900/40 text-red-300 px-1.5 py-0.5 rounded">Banned</span>}
                        </div>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-xs text-gray-500 text-right">
                        <p>ব্যবহার: {u.daily_usage}/{u.daily_limit}</p>
                        <p className="text-gray-600">{formatDate(u.created_at)}</p>
                      </div>
                      <select
                        value={u.subscription}
                        onChange={e => changeUserSub(u.id, e.target.value)}
                        className={cn('text-xs border rounded-lg px-2 py-1.5 focus:outline-none bg-black/50 cursor-pointer',
                          u.subscription === 'pro' ? 'text-green-400 border-green-700/50' :
                          u.subscription === 'premium' ? 'text-purple-400 border-purple-700/50' :
                          'text-gray-400 border-gray-700/50')}>
                        <option value="free">ফ্রি</option>
                        <option value="pro">প্রো</option>
                        <option value="premium">প্রিমিয়াম</option>
                      </select>
                    </div>
                  </div>
                ))}
                {users.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-600">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p>কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'মোট রিকোয়েস্ট (৭ দিন)', value: analytics.totalRequests, icon: '📊' },
                { label: 'AI চ্যাট', value: analytics.usage?.chat ?? 0, icon: '💬' },
                { label: 'ছবি তৈরি', value: analytics.usage?.image ?? 0, icon: '🎨' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="glass-light rounded-xl p-5 border border-green-900/20 text-center">
                  <div className="text-3xl mb-2">{icon}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="glass-light rounded-xl p-5 border border-green-900/20">
              <h3 className="font-bold text-gray-300 mb-4">সবচেয়ে বেশি ব্যবহৃত মডেল</h3>
              <div className="space-y-2">
                {(analytics.topModels || []).map(({ model, count }: { model: string; count: number }, i: number) => (
                  <div key={model} className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 truncate">{model.split('/').pop()}</span>
                        <span className="text-gray-500 shrink-0 ml-2">{count}x</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${(count / (analytics.topModels[0]?.count || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Crown icon placeholder since lucide doesn't export Crown2
function Crown2(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={props.className} width={props.size} height={props.size}>
      <path d="M2 20h20M5 20V10l7-6 7 6v10" />
    </svg>
  )
}
