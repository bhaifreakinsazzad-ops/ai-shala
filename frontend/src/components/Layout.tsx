import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Image, Wrench, CreditCard, LayoutDashboard,
  LogOut, ChevronLeft, ChevronRight, Shield, Menu,
  Presentation, Mic, Clapperboard, Globe, BrainCircuit, Music2, Download, Check
} from 'lucide-react'
import { cn, getSubscriptionBadge } from '../lib/utils'
import { usePwaInstall } from '../lib/usePwaInstall'

export default function Layout() {
  const { user, logout } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { canInstall, isInstalled, promptInstall } = usePwaInstall()
  const location = useLocation()

  const navItems = [
    { to: '/chat', icon: MessageSquare, label: t.sidebarChat },
    { to: '/voice', icon: Mic, label: t.sidebarVoice },
    { to: '/image', icon: Image, label: t.sidebarImage },
    { to: '/video', icon: Clapperboard, label: t.sidebarVideo },
    { to: '/tools', icon: Wrench, label: t.sidebarTools },
    { to: '/slides', icon: Presentation, label: t.sidebarSlides },
    { to: '/research', icon: BrainCircuit, label: t.sidebarResearch },
    { to: '/search', icon: Globe, label: t.sidebarSearch },
    { to: '/audio', icon: Mic, label: t.sidebarAudio },
    { to: '/music', icon: Music2, label: t.sidebarMusic },
    { to: '/dashboard', icon: LayoutDashboard, label: t.sidebarDashboard },
    { to: '/payment', icon: CreditCard, label: t.sidebarPayment },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const subLabel = user?.subscription === 'free' ? t.subFree
    : user?.subscription === 'pro' ? t.subPro
    : t.subPremium

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('p-4 border-b border-green-900/30 flex items-center gap-3', collapsed && 'justify-center')}>
        <motion.span
          className="text-2xl inline-block"
          animate={{ filter: ['drop-shadow(0 0 4px #00ff4160)', 'drop-shadow(0 0 12px #00ff41a0)', 'drop-shadow(0 0 4px #00ff4160)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🤖
        </motion.span>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-green-400 text-lg leading-none font-mono">{t.brand}</h1>
            <p className="text-xs text-gray-500 mt-0.5">v4.0</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to === '/chat' && location.pathname.startsWith('/chat/'))
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group',
                collapsed ? 'justify-center' : '',
                isActive ? 'text-green-400' : 'text-gray-400 hover:text-green-300'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-green-500/10 border border-green-500/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {!isActive && <span className="absolute inset-0 rounded-lg group-hover:bg-white/5 transition-colors duration-200" />}
              <Icon size={18} className="shrink-0 relative" />
              {!collapsed && <span className="text-sm font-medium relative">{label}</span>}
            </NavLink>
          )
        })}

        {user?.is_admin && (
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                : 'text-gray-400 hover:text-yellow-300 hover:bg-white/5'
            )}
          >
            <Shield size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{t.sidebarAdmin}</span>}
          </NavLink>
        )}
      </nav>

      {/* User info + Language Toggle */}
      <div className="p-3 border-t border-green-900/30 space-y-1">
        {/* PWA install */}
        {!collapsed && canInstall && (
          <button
            onClick={promptInstall}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 transition-all text-sm font-medium"
          >
            <Download size={15} />
            {t.installApp}
          </button>
        )}
        {!collapsed && isInstalled && (
          <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-500 text-xs">
            <Check size={13} className="text-green-500" />
            {t.installedApp}
          </div>
        )}

        {/* Language toggle */}
        {!collapsed && (
          <button
            onClick={toggle}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-white/5 transition-all text-sm"
          >
            <span>{lang === 'bn' ? '🇬🇧' : '🇧🇩'}</span>
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        )}

        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <span className={cn('text-xs px-1.5 py-0.5 rounded font-mono', getSubscriptionBadge(user?.subscription || 'free'))}>
                {subLabel}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut size={16} />
          {!collapsed && t.sidebarLogout}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col glass border-r border-green-900/20 transition-all duration-300 relative z-10',
        collapsed ? 'w-16' : 'w-60'
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-green-400 hover:bg-green-500/30 transition-colors z-20"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 glass border-r border-green-900/20 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient background — subtle, matches the marketing pages' aurora language */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40" aria-hidden="true">
          <div className="aurora-orb-1 -top-40 -left-40" style={{ width: 400, height: 400 }} />
          <div className="aurora-orb-2 -bottom-40 -right-20" style={{ width: 350, height: 350 }} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-green-900/20 glass">
          <button onClick={() => setMobileOpen(true)} className="text-green-400">
            <Menu size={22} />
          </button>
          <span className="text-green-400 font-bold font-mono">🤖 {t.brand}</span>
          <div className="flex items-center gap-3">
            {canInstall && (
              <button onClick={promptInstall} className="text-green-400" aria-label={t.installApp}>
                <Download size={18} />
              </button>
            )}
            <button
              onClick={toggle}
              className="text-xs text-gray-400 hover:text-green-400 transition-colors"
            >
              {lang === 'bn' ? '🇬🇧 EN' : '🇧🇩 বাং'}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
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
