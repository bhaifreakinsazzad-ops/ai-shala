import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/chat')
    } catch (err: any) {
      setError(err.response?.data?.error || t.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo + Lang Toggle */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🤖</span>
            <span className="text-2xl font-bold text-green-400 font-mono">{t.brand}</span>
          </Link>
          <p className="text-gray-500 mt-2">{t.loginSubtitle}</p>
          <button
            onClick={toggle}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-900/40 text-xs text-gray-400 hover:text-green-400 hover:border-green-500/50 transition-all"
          >
            {lang === 'bn' ? '🇬🇧 Switch to English' : '🇧🇩 বাংলায় দেখুন'}
          </button>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 neon-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.emailLabel}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                placeholder={t.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.passwordLabel}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors pr-12"
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {t.loggingIn}</>
              ) : (
                <><LogIn size={18} /> {t.loginBtn}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t.noAccount}{' '}
              <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
                {t.registerFree}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
