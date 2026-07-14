import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { chatApi, modelsApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LanguageContext'
import { Send, Plus, Trash2, MessageSquare, Copy, ChevronDown, Bot, User, Sparkles, ChevronRight } from 'lucide-react'
import { cn, formatDate, copyToClipboard } from '../lib/utils'
import ReactMarkdown from 'react-markdown'

interface RawModelResponse { modelId: string; content: string }
interface FailedModel { modelId: string; error: string }
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  mode?: 'single' | 'fuse'
  models_used?: string[]
  fusion_model?: string
  raw_responses?: RawModelResponse[] | null
  failed_models?: FailedModel[] | null
  created_at: string
}
interface Conversation { id: string; title: string; model: string; updated_at: string; pinned?: boolean }
interface Model { id: string; name: string; provider: string; free: boolean }
const AUTO_MODEL_ID = 'auto/free'
const MIN_FUSE_MODELS = 2
const MAX_FUSE_MODELS = 4

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { t, lang } = useLang()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState(AUTO_MODEL_ID)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [fuseMode, setFuseMode] = useState(false)
  const [fuseModels, setFuseModels] = useState<string[]>([])
  const [consultingText, setConsultingText] = useState<string | null>(null)
  const [fusionNudge, setFusionNudge] = useState<string | null>(null)
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({})
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadConversations(); loadModels() }, [])
  useEffect(() => { if (conversationId) loadMessages(conversationId) }, [conversationId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations()
      setConversations(res.data.conversations)
    } catch {}
  }

  const loadModels = async () => {
    try {
      const res = await modelsApi.getAll({ free: true })
      const freeModels = res.data.models.filter((m: Model) => m.free)
      freeModels.sort((a: Model, b: Model) => {
        if (a.id === AUTO_MODEL_ID) return -1
        if (b.id === AUTO_MODEL_ID) return 1
        return a.name.localeCompare(b.name)
      })
      setModels(freeModels)
    } catch {}
  }

  const loadMessages = async (id: string) => {
    try {
      const res = await chatApi.getMessages(id)
      setMessages(res.data.messages)
      setActiveConv(res.data.conversation)
      setSelectedModel(res.data.conversation.model || AUTO_MODEL_ID)
    } catch {}
  }

  const newConversation = async () => {
    try {
      const res = await chatApi.createConversation({ model: selectedModel })
      const conv = res.data.conversation
      setConversations(prev => [conv, ...prev])
      navigate(`/chat/${conv.id}`)
    } catch {}
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    await chatApi.deleteConversation(id)
    setConversations(prev => prev.filter(c => c.id !== id))
    if (conversationId === id) { setMessages([]); setActiveConv(null); navigate('/chat') }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const useFuse = fuseMode && fuseModels.length >= MIN_FUSE_MODELS

    const content = input.trim()
    setInput('')
    setSending(true)
    setTyping(true)
    setFusionNudge(null)
    setConsultingText(useFuse ? (lang === 'bn' ? `${fuseModels.length}টি মডেল থেকে মতামত নেওয়া হচ্ছে…` : `Consulting ${fuseModels.length} models…`) : null)
    textareaRef.current?.focus()

    const tempUserMsg: Message = { id: 'temp-user', role: 'user', content, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      let convId = conversationId
      if (!convId) {
        const convRes = await chatApi.createConversation({ model: selectedModel })
        const conv = convRes.data.conversation
        setConversations(prev => [conv, ...prev])
        convId = conv.id
        navigate(`/chat/${conv.id}`)
      }

      const payload = useFuse
        ? { content, mode: 'fuse' as const, models: fuseModels }
        : { content, model: selectedModel }
      const res = await chatApi.sendMessage(convId!, payload)
      if (res.data.fusionQuotaExceeded) {
        setFusionNudge(lang === 'bn'
          ? 'আজকের ফ্রি ফিউশন সীমা শেষ — এই মেসেজটি একটি মডেল দিয়ে পাঠানো হয়েছে। আনলিমিটেড ফিউশনের জন্য Pro/Premium নিন।'
          : "Today's free fusion limit is used up — this message was sent with a single model instead. Upgrade for more fusion messages.")
      }
      // Refetch from the server (rather than splicing local state) so this can't
      // race with the navigation-triggered loadMessages() and double-render.
      await loadMessages(convId!)
      loadConversations()
      refreshUser()
    } catch (err: any) {
      const errMsg = err.response?.data?.error || t.chatSendError
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), { id: 'err', role: 'assistant', content: `❌ ${errMsg}`, created_at: new Date().toISOString() }])
    } finally {
      setSending(false)
      setTyping(false)
      setConsultingText(null)
    }
  }

  const toggleFuseModel = (modelId: string) => {
    setFuseModels(prev => {
      if (prev.includes(modelId)) return prev.filter(m => m !== modelId)
      if (prev.length >= MAX_FUSE_MODELS) return prev
      return [...prev, modelId]
    })
  }

  const togglePanel = (msgId: string) => setExpandedPanels(prev => ({ ...prev, [msgId]: !prev[msgId] }))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const selectedModelInfo = models.find(m => m.id === selectedModel)
  const displayModelName = (modelId?: string) => {
    if (!modelId) return ''
    if (modelId === AUTO_MODEL_ID) return lang === 'bn' ? 'অটোপাইলট (স্মার্ট)' : 'Autopilot (Smart)'
    return models.find(m => m.id === modelId)?.name || modelId.split('/').pop() || modelId
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations sidebar */}
      <div className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-green-900/20 glass overflow-hidden">
        <div className="p-3 border-b border-green-900/20">
          <button onClick={newConversation} className="btn-green w-full flex items-center justify-center gap-2 py-2.5 text-sm">
            <Plus size={16} /> {t.chatNewChat}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">{t.chatNoConvs}</p>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/chat/${conv.id}`)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/chat/${conv.id}`) } }}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-all cursor-pointer',
                conversationId === conv.id
                  ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare size={14} className="shrink-0 opacity-60" />
                <span className="text-sm truncate">{conv.title}</span>
              </div>
              <button
                onClick={e => deleteConversation(conv.id, e)}
                aria-label={lang === 'bn' ? 'কথোপকথন মুছুন' : 'Delete conversation'}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 hover:text-red-400 transition-opacity shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        {/* Usage bar */}
        {user?.subscription === 'free' && (
          <div className="p-3 border-t border-green-900/20 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{t.chatToday}</span>
                <span>{user.daily_usage}/{user.daily_limit}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (user.daily_usage / user.daily_limit) * 100)}%` }}
                />
              </div>
            </div>
            {user.fusion_daily_limit !== undefined && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1"><Sparkles size={11} className="text-purple-400" /> {lang === 'bn' ? 'ফিউশন' : 'Fusion'}</span>
                  <span>{user.fusion_daily_usage ?? 0}/{user.fusion_daily_limit}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((user.fusion_daily_usage ?? 0) / Math.max(1, user.fusion_daily_limit)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/20 glass-light shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-medium text-sm truncate max-w-[200px]">
              {activeConv?.title || t.chatNewChat}
            </span>
          </div>
          {/* Fuse toggle + model picker */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setFuseMode(!fuseMode); setShowModelPicker(false) }}
              title={lang === 'bn' ? 'একাধিক মডেল থেকে সেরা উত্তর তৈরি করুন' : 'Combine several models into one best answer'}
              className={cn(
                'flex items-center gap-1.5 text-xs rounded-lg px-3 py-2 border transition-colors',
                fuseMode
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 pulse-glow'
                  : 'bg-black/40 border-green-900/30 text-gray-400 hover:border-purple-500/30'
              )}
            >
              <Sparkles size={14} />
              {lang === 'bn' ? 'অটো-ফিউজ' : 'Auto-Fuse'}
            </motion.button>

            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-2 text-xs bg-black/40 border border-green-900/30 rounded-lg px-3 py-2 text-gray-300 hover:border-green-500/30 transition-colors"
              >
                <Bot size={14} className="text-green-400" />
                {fuseMode
                  ? (fuseModels.length > 0
                    ? (lang === 'bn' ? `${fuseModels.length}টি মডেল নির্বাচিত` : `${fuseModels.length} models selected`)
                    : (lang === 'bn' ? 'মডেল বাছাই করুন' : 'Choose models'))
                  : (selectedModelInfo?.name || displayModelName(selectedModel))}
                <motion.span animate={{ rotate: showModelPicker ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={12} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
              {showModelPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-72 glass border border-green-900/30 rounded-xl overflow-hidden z-50 shadow-2xl origin-top-right"
                >
                  <div className="p-2 border-b border-green-900/20">
                    <p className="text-xs text-gray-500 px-2">
                      {fuseMode
                        ? (lang === 'bn' ? `${MIN_FUSE_MODELS}-${MAX_FUSE_MODELS}টি মডেল বাছাই করুন` : `Pick ${MIN_FUSE_MODELS}-${MAX_FUSE_MODELS} models to fuse`)
                        : `AI ${t.sidebarChat} — ${models.length}${lang === 'bn' ? 'টি' : ''}`}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {models.filter(m => !fuseMode || m.id !== AUTO_MODEL_ID).map(m => {
                      const isSelected = fuseMode ? fuseModels.includes(m.id) : selectedModel === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => fuseMode ? toggleFuseModel(m.id) : (setSelectedModel(m.id), setShowModelPicker(false))}
                          className={cn(
                            'w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors',
                            isSelected && (fuseMode ? 'bg-purple-500/10 text-purple-300' : 'bg-green-500/10 text-green-300')
                          )}
                        >
                          <div>
                            <div className="text-sm font-medium">{m.name}</div>
                            <div className="text-xs text-gray-500">
                              {m.provider}
                              {!fuseMode && m.id === AUTO_MODEL_ID && (lang === 'bn' ? ' · অটো fallback' : ' · Auto fallback')}
                            </div>
                          </div>
                          {isSelected && <div className={cn('w-2 h-2 rounded-full', fuseMode ? 'bg-purple-400' : 'bg-green-400')} />}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-full text-center py-20"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                🤖
              </motion.div>
              <h2 className="text-xl font-bold text-green-400 mb-2">{t.chatWelcome}</h2>
              <p className="text-gray-500 text-sm max-w-sm">{t.chatWelcomeSub}</p>
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm w-full">
                {[t.chatPrompt1, t.chatPrompt2, t.chatPrompt3, t.chatPrompt4].map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInput(s)}
                    className="text-left text-xs bg-green-900/20 border border-green-900/30 rounded-lg px-3 py-2.5 text-gray-400 hover:text-green-300 hover:border-green-500/30 transition-colors"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 16 : -16 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 border border-green-500/30">
                  <img src="/ai-avatar.jpg" alt="AI" className="w-full h-full object-cover" />
                </div>
              )}
              <div className={cn('max-w-[80%] xl:max-w-[70%]', msg.role === 'user' ? 'message-user px-4 py-3' : 'message-ai px-4 py-3')}>
                {msg.role === 'assistant' ? (
                  <div className="prose-dark">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-100 whitespace-pre-wrap">{msg.content}</p>
                )}
                <div className="flex items-center justify-between mt-2 gap-4">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    {msg.mode === 'fuse' ? (
                      <span className="flex items-center gap-1 text-purple-400">
                        <Sparkles size={11} />
                        {lang === 'bn' ? `${msg.models_used?.length || 0}টি মডেল থেকে ফিউজড` : `Fused from ${msg.models_used?.length || 0} models`}
                      </span>
                    ) : displayModelName(msg.model)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{formatDate(msg.created_at)}</span>
                    <button onClick={() => copyToClipboard(msg.content)} className="text-gray-600 hover:text-green-400 transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                {msg.mode === 'fuse' && msg.raw_responses && msg.raw_responses.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => togglePanel(msg.id)}
                      className="flex items-center gap-1 text-xs text-purple-400/80 hover:text-purple-300 transition-colors"
                    >
                      <ChevronRight size={12} className={cn('transition-transform', expandedPanels[msg.id] && 'rotate-90')} />
                      {lang === 'bn' ? 'প্রতিটি মডেল যা বলেছে দেখুন' : 'See what each model said'}
                    </button>
                    {expandedPanels[msg.id] && (
                      <div className="mt-2 space-y-2">
                        {msg.raw_responses.map(r => (
                          <div key={r.modelId} className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                            <div className="text-xs font-medium text-purple-300/90 mb-1">{displayModelName(r.modelId)}</div>
                            <div className="text-xs text-gray-400 whitespace-pre-wrap">{r.content}</div>
                          </div>
                        ))}
                        {msg.failed_models && msg.failed_models.length > 0 && msg.failed_models.map(f => (
                          <div key={f.modelId} className="text-xs text-gray-600 italic px-1">
                            {displayModelName(f.modelId)} — {lang === 'bn' ? 'সাড়া দেয়নি' : 'did not respond'}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>

          <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-green-500/30">
                <img src="/ai-avatar.jpg" alt="AI" className="w-full h-full object-cover" />
              </div>
              <div className={cn('message-ai px-4 py-3', consultingText && 'gradient-border')}>
                {consultingText && (
                  <div className="flex items-center gap-1.5 text-xs text-purple-300 mb-1.5">
                    <Sparkles size={11} className="animate-pulse" /> {consultingText}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-green-900/20 glass-light shrink-0">
          {!conversationId && (
            <p className="text-xs text-gray-600 text-center mb-2">মেসেজ পাঠালে নতুন চ্যাট শুরু হবে</p>
          )}
          {fusionNudge && (
            <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between gap-3 text-xs bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200">
              <span>{fusionNudge}</span>
              <Link to="/pricing" className="shrink-0 underline hover:text-white">{lang === 'bn' ? 'আপগ্রেড' : 'Upgrade'}</Link>
            </div>
          )}
          {fuseMode && fuseModels.length < MIN_FUSE_MODELS && (
            <p className="max-w-4xl mx-auto text-xs text-purple-300/80 text-center mb-2 flex items-center justify-center gap-1">
              <Sparkles size={11} />
              {lang === 'bn' ? `ফিউশনের জন্য কমপক্ষে ${MIN_FUSE_MODELS}টি মডেল বাছাই করুন` : `Pick at least ${MIN_FUSE_MODELS} models above to enable fusion`}
            </p>
          )}
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="w-full bg-black/60 border border-green-900/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/40 resize-none transition-colors text-sm"
                placeholder={t.chatPlaceholder}
                style={{ maxHeight: '120px', height: 'auto' }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: input.trim() && !sending ? 1.05 : 1 }}
              whileTap={{ scale: input.trim() && !sending ? 0.92 : 1 }}
              onClick={sendMessage}
              disabled={!input.trim() || sending || (fuseMode && fuseModels.length < MIN_FUSE_MODELS)}
              className="btn-green p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {sending
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <Send size={20} />
              }
            </motion.button>
          </div>
        </div>
      </div>

      {/* Close model picker on outside click */}
      {showModelPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
      )}
    </div>
  )
}
