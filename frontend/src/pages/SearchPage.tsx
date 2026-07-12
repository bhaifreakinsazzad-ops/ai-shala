import { useState, useEffect } from 'react'
import { searchApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Globe, RefreshCw, Lock, ExternalLink } from 'lucide-react'

export default function SearchPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<{ answer: string | null; results: any[] } | null>(null)
  const [configured, setConfigured] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    searchApi.getStatus().then(res => setConfigured(res.data.configured)).catch(() => {})
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const res = await searchApi.getHistory()
      setHistory(res.data.history || [])
    } catch {}
  }

  const search = async () => {
    if (!query.trim() || searching) return
    setError('')
    setSearching(true)
    try {
      const res = await searchApi.search({ query })
      setResult(res.data)
      loadHistory()
      refreshUser()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const canSearch = user?.subscription !== 'free' || (user.daily_usage || 0) < (user.daily_limit || 50)

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-green-400" size={24} />
            {t.searchTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.searchSubtitle}</p>
        </div>

        {!configured && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 mb-6 text-sm text-yellow-300">
            {t.searchNotConfigured}
          </div>
        )}

        {user?.subscription === 'free' && (
          <div className="glass-light rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">{user.daily_usage}/{user.daily_limit}</p>
              <div className="h-1 bg-gray-800 rounded-full w-40 mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((user.daily_usage || 0) / (user.daily_limit || 50)) * 100}%` }} />
              </div>
            </div>
            <Link to="/payment" className="text-xs text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors">→</Link>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="flex-1 bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 transition-colors"
            placeholder={t.searchPlaceholder}
          />
          <button
            onClick={search}
            disabled={!query.trim() || searching || !canSearch || !configured}
            className="btn-green px-5 flex items-center gap-2 disabled:opacity-40"
          >
            {searching ? <RefreshCw size={18} className="animate-spin" /> : !canSearch ? <Lock size={18} /> : <Globe size={18} />}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-6">{error}</p>}

        {result && (
          <div className="space-y-5">
            {result.answer && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <h3 className="text-xs uppercase tracking-wide text-green-400 mb-2">{t.searchAnswer}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{result.answer}</p>
              </div>
            )}
            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t.searchResults}</h3>
              {result.results.length === 0 ? (
                <p className="text-gray-600 text-sm">{t.searchNoResults}</p>
              ) : (
                <div className="space-y-3">
                  {result.results.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-green-900/10 p-3 hover:border-green-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        {r.title} <ExternalLink size={12} />
                      </div>
                      <p className="text-gray-600 text-xs mt-1 truncate">{r.url}</p>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{r.content}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-300 mb-4">{t.searchHistory}</h2>
            <div className="space-y-2">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setQuery(item.query); setResult(item.results) }}
                  className="w-full text-left rounded-xl border border-green-900/10 p-3 hover:border-green-500/30 transition-colors text-sm text-gray-300 truncate"
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
