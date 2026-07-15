import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Image, Wrench, CreditCard, LayoutDashboard,
  LogOut, ChevronLeft, ChevronRight, Shield, Menu, X,
  Presentation, Mic, Clapperboard, Globe, BrainCircuit,
  Music2, Download, Check, Volume2, Code2, Search
} from 'lucide-react'
import { cn, getSubscriptionBadge } from '../lib/utils'
import { usePwaInstall } from '../lib/usePwaInstall'

/* ── Feature definitions with per-feature accent colors ──────── */
type NavItemDef = {
  to: string
  icon: React.ElementType
  labelKey: string
  accent: string
  badge?: string
}

const NAV_FEATURES: NavItemDef[] = [
  { to: '/chat',     icon: MessageSquare, labelKey: 'sidebarChat',     accent: '#00D4AA' },
  { to: '/voice',    icon: Mic,           labelKey: 'sidebarVoice',    accent: '#3B82F6' },
  { to: '/image',    icon: Image,         labelKey: 'sidebarImage',    accent: '#A855F7' },
  { to: '/video',    icon: Clapperboard,  labelKey: 'sidebarVideo',    accent: '#EF4444', badge: 'Soon' },
  { to: '/tools',    icon: Code2,         labelKey: 'sidebarTools',    accent: '#22C55E' },
  { to: '/slides',   icon: Presentation,  labelKey: 'sidebarSlides',   accent: '#F97316' },
  { to: '/research', icon: BrainCircuit,  labelKey: 'sidebarResearch', accent: '#06B6D4' },
  { to: '/search',   icon: Search,        labelKey: 'sidebarSearch',   accent: '#EAB308' },
]
const NAV_MEDIA: NavItemDef[] = [
  { to: '/audio', icon: Volume2, labelKey: 'sidebarAudio', accent: '#8B5CF6' },
  { to: '/music', icon: Music2,  labelKey: 'sidebarMusic', accent: '#EC4899', badge: 'Soon' },
]
const NAV_ACCOUNT: NavItemDef[] = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'sidebarDashboard', accent: '#94A3B8' },
  { to: '/payment',   icon: CreditCard,      labelKey: 'sidebarPayment',   accent: '#10B981' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { canInstall, isInstalled, promptInstall } = usePwaInstall()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const subLabel = user?.subscription === 'free' ? t.subFree
    : user?.subscription === 'pro' ? t.subPro
    : t.subPremium

  const subColor = user?.subscription === 'free' ? '#64748B'
    : user?.subscription === 'pro' ? '#3B82F6'
    : '#EAB308'

  function NavSection({ title, items }: { title: string; items: NavItemDef[] }) {
    return (
      <>
        {!collapsed && (
          <div className="px-3 pt-4 pb-1.5">
            <span className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {title}
            </span>
          </div>
        )}
        {collapsed && <div className="my-2 mx-3 h-px bg-white/5" />}
        {items.map(({ to, icon: Icon, labelKey, accent, badge }) => {
          const label = (t as Record<string, string>)[labelKey] ?? labelKey
          const isActive = location.pathname === to || (to === '/chat' && location.pathname.startsWith('/chat/'))
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group mx-1.5 mb-0.5',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}28` }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {/* Hover background */}
              {!isActive && (
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ background: 'rgba(255,255,255,0.04)' }} />
              )}
              {/* Active left accent bar */}
              {isActive && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r"
                  style={{
                    height: '55%', background: accent,
                    boxShadow: `0 0 8px ${accent}, 0 0 14px ${accent}80`
                  }}
                />
              )}
              {/* Icon container */}
              <span
                className="relative shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                style={isActive
                  ? { background: `${accent}20`, border: `1px solid ${accent}30`, color: accent }
                  : { color: 'currentColor' }
                }
              >
                <Icon size={15} />
              </span>
              {!collapsed && (
                <span className="text-[12.5px] font-medium relative flex-1 truncate">{label}</span>
              )}
              {!collapsed && badge && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('h-14 border-b flex items-center gap-2.5 px-3.5 shrink-0', collapsed && 'justify-center px-2')}
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-base"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,170,0.15), rgba(59,130,246,0.12))',
            border: '1px solid rgba(0,212,170,0.2)',
          }}
          animate={{
            boxShadow: [
              '0 0 12px rgba(0,212,170,0.15)',
              '0 0 24px rgba(0,212,170,0.35)',
              '0 0 12px rgba(0,212,170,0.15)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🧠
        </motion.div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-none truncate" style={{ color: 'var(--accent-chat)' }}>
              Yusra SI
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>v4.0 · Neural Prism</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
        <NavSection title="AI Features" items={NAV_FEATURES} />
        <NavSection title="Media" items={NAV_MEDIA} />
        <NavSection title="Account" items={NAV_ACCOUNT} />
        {user?.is_admin && (
          <>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1.5">
                <span className="text-[9px] font-bold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Admin</span>
              </div>
            )}
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group mx-1.5 mb-0.5',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'text-yellow-300'
                  : 'text-slate-500 hover:text-yellow-300'
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  {!isActive && <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-white/[0.04] transition-opacity" />}
                  <span className={cn('relative shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                    isActive ? 'bg-yellow-400/15 border border-yellow-400/25' : '')}>
                    <Shield size={15} />
                  </span>
                  {!collapsed && <span className="text-[12.5px] font-medium relative">{t.sidebarAdmin}</span>}
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 pt-2 shrink-0 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {/* PWA install */}
        {!collapsed && canInstall && (
          <button onClick={promptInstall}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] font-medium transition-all"
            style={{ background: 'rgba(0,212,170,0.08)', color: 'var(--accent-chat)', border: '1px solid rgba(0,212,170,0.15)' }}>
            <Download size={14} />{t.installApp}
          </button>
        )}
        {!collapsed && isInstalled && (
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-500">
            <Check size={12} style={{ color: 'var(--accent-chat)' }} />{t.installedApp}
          </div>
        )}
        {/* Language toggle */}
        {!collapsed && (
          <button onClick={toggle}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-slate-500 hover:text-slate-200 transition-all text-[12px] hover:bg-white/5">
            <span>{lang === 'bn' ? '🇬🇧' : '🇧🇩'}</span>
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        )}
        {/* User card */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0"
              style={{ background: 'rgba(0,212,170,0.12)', color: 'var(--accent-chat)', border: '1px solid rgba(0,212,170,0.18)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate">{user?.name}</p>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-md font-semibold', getSubscriptionBadge(user?.subscription || 'free'))}>
                {subLabel}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-all text-[12px]',
            collapsed ? 'justify-center' : ''
          )}>
          <LogOut size={14} />
          {!collapsed && t.sidebarLogout}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col glass border-r transition-all duration-300 relative z-10 shrink-0',
        collapsed ? 'w-[72px]' : 'w-[232px]'
      )} style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[60px] w-6 h-6 rounded-full flex items-center justify-center transition-all z-20 hover:scale-110"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
          }}
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -232 }}
              animate={{ x: 0 }}
              exit={{ x: -232 }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="absolute left-0 top-0 bottom-0 w-[232px] glass border-r z-50"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50" aria-hidden>
          <div className="aurora-orb-1" style={{ top: '-20%', left: '-10%' }} />
          <div className="aurora-orb-2" style={{ bottom: '-20%', right: '-5%' }} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b shrink-0 glass relative z-10"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-[13px] font-bold" style={{ color: 'var(--accent-chat)' }}>🧠 Yusra SI</span>
          <div className="flex items-center gap-3">
            {canInstall && (
              <button onClick={promptInstall} style={{ color: 'var(--accent-chat)' }} aria-label={t.installApp}>
                <Download size={17} />
              </button>
            )}
            <button onClick={toggle} className="text-[11px] text-slate-500 hover:text-slate-200 transition-colors">
              {lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাং'}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
