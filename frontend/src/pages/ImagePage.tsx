import { useState, useEffect } from 'react'
import { imageApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Sparkles, Download, RefreshCw, ZoomIn, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPTS = [
  'পদ্মা নদীর তীরে সূর্যাস্তের দৃশ্য',
  'ঢাকার পুরানো শহরের ঐতিহাসিক রিকশা',
  'বাংলাদেশের গ্রামের সবুজ মাঠে কৃষক',
  'মসজিদের সামনে চাঁদের আলো',
  'সুন্দরবনের বাঘ জঙ্গলে হাঁটছে',
  'ঢাকার স্কাইলাইন রাতের আলোয়',
]

export default function ImagePage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLang()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [sizeIndex, setSizeIndex] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ url: string; prompt: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [fullscreen, setFullscreen] = useState<string | null>(null)
  const [error, setError] = useState('')

  const STYLES = [
    { id: 'realistic',    label: t.imageStyleRealistic,   emoji: '📸' },
    { id: 'anime',        label: t.imageStyleAnime,        emoji: '🎌' },
    { id: 'cartoon',      label: t.imageStyleCartoon,      emoji: '🎨' },
    { id: 'oil_painting', label: t.imageStyleOilPainting,  emoji: '🖼️' },
    { id: 'watercolor',   label: t.imageStyleWatercolor,   emoji: '💧' },
    { id: 'digital_art',  label: t.imageStyleDigitalArt,   emoji: '💻' },
    { id: 'sketch',       label: t.imageStyleSketch,       emoji: '✏️' },
    { id: 'bangladeshi',  label: t.imageStyleBangladeshi,  emoji: '🇧🇩' },
  ]

  const SIZES = [
    { label: t.imageSizeSquare,    value: { width: 1024, height: 1024 }, icon: '⬛' },
    { label: t.imageSizeLandscape, value: { width: 1280, height: 720 },  icon: '🖥️' },
    { label: t.imageSizePortrait,  value: { width: 720,  height: 1280 }, icon: '📱' },
  ]

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    try {
      const res = await imageApi.getHistory()
      setHistory(res.data.images || [])
    } catch {}
  }

  const generate = async () => {
    if (!prompt.trim() || generating) return
    setError('')
    setGenerating(true)
    const size = SIZES[sizeIndex]
    try {
      const res = await imageApi.generate({ prompt, style, ...size.value })
      setResult({ url: res.data.url, prompt })
      loadHistory()
      refreshUser()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Image generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const downloadImage = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-shala-${Date.now()}.jpg`
    a.target = '_blank'
    a.click()
  }

  const canGenerate = user?.subscription !== 'free' || (user.image_daily_usage || 0) < (user.image_daily_limit || 5)
  const size = SIZES[sizeIndex]

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-green-400" size={24} />
            {t.imageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.imageSubtitle}</p>
        </div>

        {/* Usage warning */}
        {user?.subscription === 'free' && (
          <div className="glass-light rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">
                {t.imageTodayCount}: <span className="text-green-400 font-bold">{user.image_daily_usage}/{user.image_daily_limit}</span>
              </p>
              <div className="h-1 bg-gray-800 rounded-full w-40 mt-2">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((user.image_daily_usage || 0) / (user.image_daily_limit || 5)) * 100}%` }} />
              </div>
            </div>
            <Link to="/payment" className="text-xs text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors">
              {t.imageGetUnlimited} →
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-5">
            {/* Prompt */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.imageTitle}</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none transition-colors"
                placeholder={t.imagePlaceholder}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {EXAMPLE_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-green-900/20 border border-green-900/30 rounded-lg px-2.5 py-1.5 text-gray-400 hover:text-green-300 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.imageStyleLabel}</label>
              <div className="grid grid-cols-4 gap-2">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all',
                      style === s.id
                        ? 'border-green-500/50 bg-green-500/10 text-green-300'
                        : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                    )}
                  >
                    <span className="text-xl">{s.emoji}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">{t.imageSizeLabel}</label>
              <div className="flex gap-2">
                {SIZES.map((s, idx) => (
                  <button
                    key={s.label}
                    onClick={() => setSizeIndex(idx)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs transition-all',
                      sizeIndex === idx
                        ? 'border-green-500/50 bg-green-500/10 text-green-300'
                        : 'border-green-900/20 text-gray-500 hover:border-green-900/40'
                    )}
                  >
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              onClick={generate}
              disabled={!prompt.trim() || generating || !canGenerate}
              className="btn-green w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {generating ? (
                <><RefreshCw size={18} className="animate-spin" /> {t.imageGenerating}</>
              ) : !canGenerate ? (
                <><Lock size={18} /> {t.imageLimitReached}</>
              ) : (
                <><Sparkles size={18} /> {t.imageGenerateBtn}</>
              )}
            </button>
          </div>

          {/* Preview */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden border border-green-900/20 bg-black/40 relative group">
              {generating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                  <div className="w-12 h-12 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-3" />
                  <p className="text-green-400 text-sm">{t.imageGeneratingMsg}</p>
                  <p className="text-gray-600 text-xs mt-1">{t.imageTimeSec}</p>
                </div>
              )}
              {result ? (
                <>
                  <img src={result.url} alt={result.prompt} className="w-full h-full object-cover"
                    onError={() => setError('Image failed to load, please try again')} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => setFullscreen(result.url)} className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors">
                      <ZoomIn size={20} />
                    </button>
                    <button onClick={() => downloadImage(result.url)} className="p-3 bg-green-500/80 rounded-full text-black hover:bg-green-400 transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div>
                    <div className="text-5xl mb-3">🎨</div>
                    <p className="text-gray-600 text-sm">{t.imagePlaceholderMsg}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-300 mb-4">{t.imageHistory}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {history.map(img => (
                <div key={img.id} className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer border border-green-900/10"
                  onClick={() => setFullscreen(img.image_url)}>
                  <img src={img.image_url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs line-clamp-2">{img.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setFullscreen(null)}>
          <img src={fullscreen} alt="fullscreen" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}
