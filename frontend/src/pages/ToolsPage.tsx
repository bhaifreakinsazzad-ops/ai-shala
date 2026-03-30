import { useState, useEffect } from 'react'
import { toolsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { Wrench, Play, Copy, Lock } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Tool { id: string; name: string; nameEn: string; icon: string; category: string; description: string; free: boolean }

const LANGUAGE_OPTIONS = ['Bengali (Bangla)', 'English', 'Arabic', 'Hindi', 'French', 'Spanish']
const CODE_LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'PHP', 'Go', 'SQL']
const PLATFORM_OPTIONS = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'YouTube']

export default function ToolsPage() {
  const { user, refreshUser } = useAuth()
  const { t, lang } = useLang()
  const [tools, setTools] = useState<Tool[]>([])
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copied, setCopied] = useState(false)

  const CATEGORY_LABELS: Record<string, string> = lang === 'en' ? {
    writing: '✍️ Writing', language: '🌐 Language', coding: '💻 Coding',
    marketing: '📣 Marketing', career: '💼 Career', business: '📊 Business',
    ecommerce: '🛍️ E-Commerce', creative: '🎨 Creative', education: '📚 Education',
    legal: '⚖️ Legal', finance: '💰 Finance',
  } : {
    writing: '✍️ লেখালেখি', language: '🌐 ভাষা', coding: '💻 কোডিং',
    marketing: '📣 মার্কেটিং', career: '💼 ক্যারিয়ার', business: '📊 ব্যবসা',
    ecommerce: '🛍️ ই-কমার্স', creative: '🎨 সৃজনশীল', education: '📚 শিক্ষা',
    legal: '⚖️ আইন', finance: '💰 অর্থ',
  }

  useEffect(() => { loadTools() }, [])

  const loadTools = async () => {
    try {
      const res = await toolsApi.getTools()
      setTools(res.data.tools)
    } catch {}
  }

  const selectTool = (tool: Tool) => {
    setActiveTool(tool)
    setInput('')
    setResult('')
    setError('')
    setOptions({})
  }

  const runTool = async () => {
    if (!input.trim() || running || !activeTool) return
    setError('')
    setRunning(true)
    setResult('')
    try {
      const res = await toolsApi.runTool(activeTool.id, { input, options })
      setResult(res.data.result)
      refreshUser()
    } catch (err: any) {
      const msg = err.response?.data?.error || t.toolError
      setError(err.response?.data?.upgradeRequired ? '⚠️ ' + msg : msg)
    } finally {
      setRunning(false)
    }
  }

  const handleCopy = () => {
    copyToClipboard(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = ['all', ...new Set(tools.map(tool => tool.category))]
  const filteredTools = activeCategory === 'all' ? tools : tools.filter(tool => tool.category === activeCategory)
  const toolName = (tool: Tool) => lang === 'en' && tool.nameEn ? tool.nameEn : tool.name

  const renderToolOptions = () => {
    if (!activeTool) return null
    switch (activeTool.id) {
      case 'translator':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t.toolTranslateTo}</label>
            <select value={options.targetLang || 'Bengali (Bangla)'} onChange={e => setOptions({ ...options, targetLang: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )
      case 'code_generator':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t.toolCodeLang}</label>
            <select value={options.language || 'Python'} onChange={e => setOptions({ ...options, language: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )
      case 'social_media':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t.toolPlatform}</label>
            <select value={options.platform || 'Facebook'} onChange={e => setOptions({ ...options, platform: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )
      case 'quiz_maker':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">{t.toolQuestionCount}</label>
            <select value={options.count || '10'} onChange={e => setOptions({ ...options, count: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} {t.toolQuestions}</option>)}
            </select>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Tools list */}
      <div className="hidden md:flex flex-col w-64 xl:w-72 border-r border-green-900/20 glass overflow-hidden">
        <div className="p-3 border-b border-green-900/20">
          <h2 className="text-sm font-bold text-green-400 flex items-center gap-2">
            <Wrench size={16} /> {t.toolsTitle}
          </h2>
        </div>
        {/* Category filter */}
        <div className="px-3 py-2 flex gap-1.5 flex-wrap border-b border-green-900/20">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('text-xs px-2 py-1 rounded-lg transition-colors',
              activeCategory === 'all' ? 'bg-green-500/20 text-green-300' : 'text-gray-500 hover:text-gray-300')}
          >
            {t.toolsAllCats}
          </button>
          {categories.filter(c => c !== 'all').map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn('text-xs px-2 py-1 rounded-lg transition-colors',
                activeCategory === cat ? 'bg-green-500/20 text-green-300' : 'text-gray-500 hover:text-gray-300')}>
              {CATEGORY_LABELS[cat]?.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredTools.map(tool => (
            <button key={tool.id} onClick={() => selectTool(tool)}
              className={cn('w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all group',
                activeTool?.id === tool.id ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-white/5')}>
              <span className="text-xl shrink-0">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn('text-sm font-medium truncate', activeTool?.id === tool.id ? 'text-green-300' : 'text-gray-300')}>
                    {toolName(tool)}
                  </span>
                  {!tool.free && <Lock size={10} className="text-yellow-500 shrink-0" />}
                </div>
                <p className="text-xs text-gray-600 truncate">{tool.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tool UI */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeTool ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">🛠️</div>
              <h2 className="text-xl font-bold text-green-400 mb-2">{t.toolsTitle}</h2>
              <p className="text-gray-500 text-sm max-w-xs">{t.toolSelectPrompt}</p>
              {/* Mobile tool grid */}
              <div className="grid grid-cols-3 gap-3 mt-6 md:hidden">
                {tools.slice(0, 9).map(tool => (
                  <button key={tool.id} onClick={() => selectTool(tool)}
                    className="glass-light rounded-xl p-3 flex flex-col items-center gap-1 border border-green-900/20">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs text-gray-400">{toolName(tool)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Tool header */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{activeTool.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{toolName(activeTool)}</h2>
                  <p className="text-gray-500 text-sm">{activeTool.description}</p>
                </div>
                {!activeTool.free && (
                  <span className="ml-auto text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Lock size={10} /> Pro
                  </span>
                )}
              </div>

              {/* Options */}
              {renderToolOptions() && (
                <div className="glass-light rounded-xl p-4">
                  {renderToolOptions()}
                </div>
              )}

              {/* Input */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">{t.toolInputLabel}</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  rows={5}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none"
                  placeholder={t.toolInputPlaceholder}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                  {(error.includes('upgrade') || error.includes('আপগ্রেড') || error.includes('⚠️')) && (
                    <Link to="/payment" className="text-green-400 hover:underline ml-2">{t.toolGetPro} →</Link>
                  )}
                </div>
              )}

              <button
                onClick={runTool}
                disabled={!input.trim() || running}
                className="btn-green flex items-center gap-2 px-6 py-3 disabled:opacity-40"
              >
                {running ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {t.toolRunning}</>
                ) : (
                  <><Play size={18} /> {t.toolRun}</>
                )}
              </button>

              {/* Result */}
              {result && (
                <div className="glass-light rounded-xl overflow-hidden border border-green-900/20">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/20">
                    <span className="text-sm font-medium text-green-400">{t.toolResult}</span>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors">
                      <Copy size={12} /> {copied ? t.toolCopied : t.toolCopy}
                    </button>
                  </div>
                  <div className="p-4 prose-dark max-h-96 overflow-y-auto">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
