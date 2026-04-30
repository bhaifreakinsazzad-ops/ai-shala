import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t, lang, toggle } = useLang()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(t.pwMismatch)
      return
    }
    if (form.password.length < 6) {
      setError(t.pwTooShort)
      return
    }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      navigate('/chat')
    } catch (err: any) {
      setError(err.response?.data?.error || t.registerError)
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input
        type={type}
        required={key !== 'phone'}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
        placeholder={placeholder}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl">🤖</span>
            <span className="text-2xl font-bold text-green-400 font-mono">{t.brand}</span>
          </Link>
          <p className="text-gray-500 mt-2">{t.registerSubtitle}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">{t.registerFreeTag}</span>
          </div>
          <button
            onClick={toggle}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-900/40 text-xs text-gray-400 hover:text-green-400 hover:border-green-500/50 transition-all"
          >
            {lang === 'bn' ? '🇬🇧 Switch to English' : '🇧🇩 বাংলায় দেখুন'}
          </button>
        </div>

        <div className="glass rounded-2xl p-8 neon-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {field('name', t.nameLabel, 'text', t.namePlaceholder)}
            {field('email', t.emailReq, 'email', 'example@gmail.com')}
            {field('phone', t.phoneLabel, 'tel', t.phonePlaceholder)}

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.passwordReq}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors pr-12"
                  placeholder={t.passwordMin}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.confirmPassword}</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                className="w-full bg-black/50 border border-green-900/30 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors"
                placeholder={t.confirmPlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {t.registering}</>
              ) : (
                <><UserPlus size={18} /> {t.registerBtn}</>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {t.haveAccount}{' '}
            <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">{t.loginLink}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
