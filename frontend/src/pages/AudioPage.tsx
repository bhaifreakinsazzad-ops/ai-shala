import { useState, useEffect } from 'react'
import { audioApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Mic, Download, RefreshCw, Lock } from 'lucide-react'

export default function AudioPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLang()
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<any[]>([])
  const [voice, setVoice] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ fileUrl: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadVoices()
    loadHistory()
  }, [])

  const loadVoices = async () => {
    try {
      const res = await audioApi.getVoices()
      setVoices(res.data.voices || [])
      if (res.data.voices?.[0]) setVoice(res.data.voices[0].id)
    } catch {}
  }

  const loadHistory = async () => {
    try {
      const res = await audioApi.getHistory()
      setHistory(res.data.history || [])
    } catch {}
  }

  const generate = async () => {
    if (!text.trim() || generating) return
    setError('')
    setGenerating(true)
    try {
      const res = await audioApi.generate({ text, voice })
      setResult({ fileUrl: res.data.fileUrl })
      loadHistory()
      refreshUser()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Audio generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = user?.subscription !== 'free' || (user.daily_usage || 0) < (user.daily_limit || 50)

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mic className="text-green-400" size={24} />
            {t.audioTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.audioSubtitle}</p>
        </div>

        {user?.subscription === 'free' && (
          <div className="glass-light rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">
                {user.daily_usage}/{user.daily_limit}
              </p>
              <div className="h-1 bg-gray-800 rounded-full w-40 mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((user.daily_usage || 0) / (user.daily_limit || 50)) * 100}%` }} />
              </div>
            </div>
            <Link to="/payment" className="text-xs text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors">
              →
            </Link>
          </div>
        )}

        <div className="space-y-5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            maxLength={2000}
            className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none transition-colors"
            placeholder={t.audioPlaceholder}
          />
          <p className="text-xs text-gray-600 text-right">{text.length}/2000</p>

          <div>
            <label className="block text-sm text-gray-400 mb-2">{t.audioVoiceLabel}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {voices.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id)}
                  className={`py-2 px-3 rounded-lg border text-xs transition-all ${
                    voice === v.id
                      ? 'border-green-500/50 bg-green-500/10 text-green-300'
                      : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={generate}
            disabled={!text.trim() || generating || !canGenerate}
            className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {generating ? (
              <><RefreshCw size={18} className="animate-spin" /> {t.audioGenerating}</>
            ) : !canGenerate ? (
              <><Lock size={18} /> {t.audioLimitReached}</>
            ) : (
              <><Mic size={18} /> {t.audioGenerateBtn}</>
            )}
          </button>

          {result && (
            <div className="rounded-xl border border-green-900/20 bg-black/40 p-4 space-y-3">
              <audio controls src={result.fileUrl} className="w-full" />
              <a href={result.fileUrl} download className="btn-green w-full py-2.5 flex items-center justify-center gap-2">
                <Download size={18} /> {t.audioDownload}
              </a>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-300 mb-4">{t.audioHistory}</h2>
            <div className="space-y-2">
              {history.map(item => (
                <div key={item.id} className="rounded-xl border border-green-900/10 p-3">
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{item.text}</p>
                  <audio controls src={item.file_url} className="w-full h-8" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
