import { useState, useEffect } from 'react'
import { toolsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Wrench, Play, Copy, Lock, ChevronRight } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Tool { id: string; name: string; nameEn: string; icon: string; category: string; description: string; free: boolean }

const CATEGORY_LABELS: Record<string, string> = {
  writing: '✍️ লেখালেখি', language: '🌐 ভাষা', coding: '💻 কোডিং',
  marketing: '📣 মার্কেটিং', career: '💼 ক্যারিয়ার', business: '📊 ব্যবসা',
  ecommerce: '🛍️ ই-কমার্স', creative: '🎨 সৃজনশীল', education: '📚 শিক্ষা',
  legal: '⚖️ আইন', finance: '💰 অর্থ',
}

const LANGUAGE_OPTIONS = ['Bengali (Bangla)', 'English', 'Arabic', 'Hindi', 'French', 'Spanish']
const CODE_LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'PHP', 'Go', 'SQL']
const PLATFORM_OPTIONS = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter/X', 'YouTube']

export default function ToolsPage() {
  const { user, refreshUser } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<Record<string, string>>({})
  const [result, setResult] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copied, setCopied] = useState(false)

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
      const msg = err.response?.data?.error || 'টুল চালাতে সমস্যা হয়েছে'
      if (err.response?.data?.upgradeRequired) {
        setError('⚠️ ' + msg)
      } else {
        setError(msg)
      }
    } finally {
      setRunning(false)
    }
  }

  const handleCopy = () => {
    copyToClipboard(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = ['all', ...new Set(tools.map(t => t.category))]
  const filteredTools = activeCategory === 'all' ? tools : tools.filter(t => t.category === activeCategory)

  const renderToolOptions = () => {
    if (!activeTool) return null
    switch (activeTool.id) {
      case 'translator':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">অনুবাদ করুন এই ভাষায়</label>
            <select value={options.targetLang || 'Bengali (Bangla)'} onChange={e => setOptions({ ...options, targetLang: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )
      case 'code_generator':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">প্রোগ্রামিং ভাষা</label>
            <select value={options.language || 'Python'} onChange={e => setOptions({ ...options, language: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )
      case 'social_media':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">প্ল্যাটফর্ম</label>
            <select value={options.platform || 'Facebook'} onChange={e => setOptions({ ...options, platform: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {PLATFORM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )
      case 'quiz_maker':
        return (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">প্রশ্নের সংখ্যা</label>
            <select value={options.count || '10'} onChange={e => setOptions({ ...options, count: e.target.value })}
              className="w-full bg-black/50 border border-green-900/30 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none">
              {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}টি প্রশ্ন</option>)}
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
            <Wrench size={16} /> AI টুলস
          </h2>
        </div>
        {/* Category filter */}
        <div className="px-3 py-2 flex gap-1.5 flex-wrap border-b border-green-900/20">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('text-xs px-2 py-1 rounded-lg transition-colors',
              activeCategory === 'all' ? 'bg-green-500/20 text-green-300' : 'text-gray-500 hover:text-gray-300')}
          >সব</button>
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
                    {tool.name}
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
              <h2 className="text-xl font-bold text-green-400 mb-2">AI টুলস</h2>
              <p className="text-gray-500 text-sm max-w-xs">বাম পাশ থেকে একটি টুল বেছে নিন</p>
              {/* Mobile tool grid */}
              <div className="grid grid-cols-3 gap-3 mt-6 md:hidden">
                {tools.slice(0, 9).map(tool => (
                  <button key={tool.id} onClick={() => selectTool(tool)}
                    className="glass-light rounded-xl p-3 flex flex-col items-center gap-1 border border-green-900/20">
                    <span className="text-2xl">{tool.icon}</span>
                    <span className="text-xs text-gray-400">{tool.name}</span>
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
                  <h2 className="text-xl font-bold text-white">{activeTool.name}</h2>
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
                <label className="block text-sm text-gray-400 mb-2">ইনপুট লিখুন</label>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  rows={5}
                  className="w-full bg-black/50 border border-green-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none"
                  placeholder="এখানে আপনার লেখা দিন..."
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  {error}
                  {error.includes('আপগ্রেড') && (
                    <Link to="/payment" className="text-green-400 hover:underline ml-2">প্রো নিন →</Link>
                  )}
                </div>
              )}

              <button
                onClick={runTool}
                disabled={!input.trim() || running}
                className="btn-green flex items-center gap-2 px-6 py-3 disabled:opacity-40"
              >
                {running ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> চলছে...</>
                ) : (
                  <><Play size={18} /> টুল চালান</>
                )}
              </button>

              {/* Result */}
              {result && (
                <div className="glass-light rounded-xl overflow-hidden border border-green-900/20">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/20">
                    <span className="text-sm font-medium text-green-400">ফলাফল</span>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors">
                      <Copy size={12} /> {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
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
