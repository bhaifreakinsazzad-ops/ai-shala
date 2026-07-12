import { useState, useEffect } from 'react'
import { slidesApi, documentsApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Presentation, FileText, Download, RefreshCw, Lock } from 'lucide-react'

const SLIDE_COUNT_OPTIONS = [5, 8, 10, 12]

type Format = 'slides' | 'document'

export default function SlidesPage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLang()
  const [format, setFormat] = useState<Format>('slides')
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState(8)
  const [generating, setGenerating] = useState(false)
  const [slideResult, setSlideResult] = useState<{ fileUrl: string; outline: any } | null>(null)
  const [docResult, setDocResult] = useState<{ fileUrl: string; title: string } | null>(null)
  const [slideHistory, setSlideHistory] = useState<any[]>([])
  const [docHistory, setDocHistory] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      const [slidesRes, docsRes] = await Promise.all([slidesApi.getHistory(), documentsApi.getHistory()])
      setSlideHistory(slidesRes.data.history || [])
      setDocHistory(docsRes.data.history || [])
    } catch {}
  }

  const generate = async () => {
    if (!topic.trim() || generating) return
    setError('')
    setGenerating(true)
    try {
      if (format === 'slides') {
        const res = await slidesApi.generate({ topic, slideCount })
        setSlideResult({ fileUrl: res.data.fileUrl, outline: res.data.outline })
        setDocResult(null)
      } else {
        const res = await documentsApi.generate({ topic })
        setDocResult({ fileUrl: res.data.fileUrl, title: res.data.title })
        setSlideResult(null)
      }
      loadHistory()
      refreshUser()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = user?.subscription !== 'free' || (user.daily_usage || 0) < (user.daily_limit || 50)

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Presentation className="text-green-400" size={24} />
            {t.slidesTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.slidesSubtitle}</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('slides')}
                className={`flex-1 py-2.5 px-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${
                  format === 'slides' ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                }`}
              >
                <Presentation size={16} /> .pptx
              </button>
              <button
                onClick={() => setFormat('document')}
                className={`flex-1 py-2.5 px-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${
                  format === 'document' ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                }`}
              >
                <FileText size={16} /> .docx
              </button>
            </div>

            <div>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none transition-colors"
                placeholder={t.slidesPlaceholder}
              />
            </div>

            {format === 'slides' && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.slidesCountLabel}</label>
                <div className="flex gap-2">
                  {SLIDE_COUNT_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => setSlideCount(n)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-all ${
                        slideCount === n
                          ? 'border-green-500/50 bg-green-500/10 text-green-300'
                          : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={generate}
              disabled={!topic.trim() || generating || !canGenerate}
              className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {generating ? (
                <><RefreshCw size={18} className="animate-spin" /> {t.slidesGenerating}</>
              ) : !canGenerate ? (
                <><Lock size={18} /> {t.slidesLimitReached}</>
              ) : format === 'slides' ? (
                <><Presentation size={18} /> {t.slidesGenerateBtn}</>
              ) : (
                <><FileText size={18} /> {t.docGenerateBtn}</>
              )}
            </button>
          </div>

          <div>
            <div className="min-h-[300px] rounded-xl border border-green-900/20 bg-black/40 p-4 relative">
              {generating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 rounded-xl">
                  <div className="w-12 h-12 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-3" />
                  <p className="text-green-400 text-sm">{t.slidesGeneratingMsg}</p>
                </div>
              )}
              {slideResult ? (
                <div className="space-y-4">
                  <a href={slideResult.fileUrl} download className="btn-green w-full py-2.5 flex items-center justify-center gap-2">
                    <Download size={18} /> {t.slidesDownload}
                  </a>
                  <div className="space-y-2">
                    <h3 className="text-white font-bold">{slideResult.outline.title}</h3>
                    {slideResult.outline.slides.map((s: any, i: number) => (
                      <div key={i} className="text-sm text-gray-400 border-l-2 border-green-900/30 pl-3">
                        <p className="text-gray-300 font-medium">{i + 1}. {s.heading}</p>
                        <ul className="list-disc list-inside">
                          {s.bullets.map((b: string, j: number) => <li key={j}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : docResult ? (
                <div className="space-y-4">
                  <a href={docResult.fileUrl} download className="btn-green w-full py-2.5 flex items-center justify-center gap-2">
                    <Download size={18} /> {t.docDownload}
                  </a>
                  <h3 className="text-white font-bold">{docResult.title}</h3>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div>
                    <div className="text-5xl mb-3">{format === 'slides' ? '📊' : '📄'}</div>
                    <p className="text-gray-600 text-sm">{t.slidesPlaceholderMsg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(slideHistory.length > 0 || docHistory.length > 0) && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-300 mb-4">{t.slidesHistory}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {slideHistory.map(item => (
                <a
                  key={item.id}
                  href={item.file_url}
                  download
                  className="rounded-xl border border-green-900/10 p-3 hover:border-green-500/30 transition-colors flex items-center gap-3"
                >
                  <Presentation size={20} className="text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{item.topic}</p>
                    <p className="text-gray-600 text-xs">{item.slide_count} slides</p>
                  </div>
                </a>
              ))}
              {docHistory.map(item => (
                <a
                  key={item.id}
                  href={item.file_url}
                  download
                  className="rounded-xl border border-green-900/10 p-3 hover:border-green-500/30 transition-colors flex items-center gap-3"
                >
                  <FileText size={20} className="text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{item.topic}</p>
                    <p className="text-gray-600 text-xs">.docx</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
