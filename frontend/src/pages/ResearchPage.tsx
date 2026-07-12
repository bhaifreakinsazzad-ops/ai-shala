import { useState, useEffect } from 'react'
import { researchApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { BrainCircuit, RefreshCw, Lock, ExternalLink } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ResearchPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLang()
  const [question, setQuestion] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ report: string; subQuestions: string[]; sources: any[]; searchUsed: boolean } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      const res = await researchApi.getHistory()
      setHistory(res.data.history || [])
    } catch {}
  }

  const generate = async () => {
    if (!question.trim() || generating) return
    setError('')
    setGenerating(true)
    try {
      const res = await researchApi.generate({ question })
      setResult(res.data)
      loadHistory()
      refreshUser()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Research failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = user?.subscription !== 'free' || (user.daily_usage || 0) < (user.daily_limit || 50)

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-green-400" size={24} />
            {t.researchTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.researchSubtitle}</p>
        </div>

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

        <div className="space-y-3 mb-6">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={3}
            className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none transition-colors"
            placeholder={t.researchPlaceholder}
          />
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <button
            onClick={generate}
            disabled={!question.trim() || generating || !canGenerate}
            className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {generating ? (
              <><RefreshCw size={18} className="animate-spin" /> {t.researchGenerating}</>
            ) : !canGenerate ? (
              <><Lock size={18} /> {t.researchLimitReached}</>
            ) : (
              <><BrainCircuit size={18} /> {t.researchBtn}</>
            )}
          </button>
        </div>

        {generating && (
          <div className="rounded-xl border border-green-900/20 bg-black/40 p-6 text-center">
            <div className="w-10 h-10 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-green-400 text-sm">{t.researchGeneratingMsg}</p>
          </div>
        )}

        {result && !generating && (
          <div className="space-y-5">
            {!result.searchUsed && (
              <p className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">{t.researchNoSearchNote}</p>
            )}

            <div>
              <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t.researchSubQuestions}</h3>
              <div className="flex flex-wrap gap-2">
                {result.subQuestions.map((q, i) => (
                  <span key={i} className="text-xs bg-green-900/20 border border-green-900/30 rounded-lg px-2.5 py-1.5 text-gray-400">{q}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-green-900/20 bg-black/40 p-5 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result.report}</ReactMarkdown>
            </div>

            {result.sources.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t.researchSources}</h3>
                <div className="space-y-2">
                  {result.sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-300 transition-colors">
                      <span className="text-xs text-gray-600 font-mono shrink-0">[{s.id}]</span>
                      <span className="truncate">{s.title}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !generating && (
          <div className="rounded-xl border border-green-900/20 bg-black/40 p-10 text-center">
            <div className="text-5xl mb-3">🔬</div>
            <p className="text-gray-600 text-sm">{t.researchPlaceholderMsg}</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-300 mb-4">{t.researchHistory}</h2>
            <div className="space-y-2">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => setResult({ report: item.report, subQuestions: [], sources: item.sources || [], searchUsed: (item.sources || []).length > 0 })}
                  className="w-full text-left rounded-xl border border-green-900/10 p-3 hover:border-green-500/30 transition-colors text-sm text-gray-300 truncate"
                >
                  {item.question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
