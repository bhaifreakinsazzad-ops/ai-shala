import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { chatApi, modelsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Send, Plus, Trash2, MessageSquare, Copy, ChevronDown, Bot, User } from 'lucide-react'
import { cn, formatDate, copyToClipboard } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Message { id: string; role: 'user' | 'assistant'; content: string; model?: string; created_at: string }
interface Conversation { id: string; title: string; model: string; updated_at: string; pinned?: boolean }
interface Model { id: string; name: string; provider: string; free: boolean }

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState('groq/llama-3.3-70b-versatile')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
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
      setModels(res.data.models.filter((m: Model) => m.free))
    } catch {}
  }

  const loadMessages = async (id: string) => {
    try {
      const res = await chatApi.getMessages(id)
      setMessages(res.data.messages)
      setActiveConv(res.data.conversation)
      setSelectedModel(res.data.conversation.model)
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
    if (!conversationId) { await newConversation(); return }

    const content = input.trim()
    setInput('')
    setSending(true)
    setTyping(true)
    textareaRef.current?.focus()

    const tempUserMsg: Message = { id: 'temp-user', role: 'user', content, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const res = await chatApi.sendMessage(conversationId, { content, model: selectedModel })
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'temp-user'),
        res.data.userMessage,
        res.data.assistantMessage,
      ])
      loadConversations()
      refreshUser()
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'মেসেজ পাঠাতে সমস্যা হয়েছে'
      setMessages(prev => [...prev.filter(m => m.id !== 'temp-user'), { id: 'err', role: 'assistant', content: `❌ ${errMsg}`, created_at: new Date().toISOString() }])
    } finally {
      setSending(false)
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const selectedModelInfo = models.find(m => m.id === selectedModel)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations sidebar */}
      <div className="hidden lg:flex flex-col w-64 xl:w-72 border-r border-green-900/20 glass overflow-hidden">
        <div className="p-3 border-b border-green-900/20">
          <button onClick={newConversation} className="btn-green w-full flex items-center justify-center gap-2 py-2.5 text-sm">
            <Plus size={16} /> নতুন চ্যাট
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">কোনো চ্যাট নেই</p>
          )}
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.id}`)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between group transition-all',
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
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </button>
          ))}
        </div>
        {/* Usage bar */}
        {user?.subscription === 'free' && (
          <div className="p-3 border-t border-green-900/20">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>আজকের ব্যবহার</span>
              <span>{user.daily_usage}/{user.daily_limit}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, (user.daily_usage / user.daily_limit) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/20 glass-light shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-medium text-sm truncate max-w-[200px]">
              {activeConv?.title || 'নতুন চ্যাট'}
            </span>
          </div>
          {/* Model picker */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-2 text-xs bg-black/40 border border-green-900/30 rounded-lg px-3 py-2 text-gray-300 hover:border-green-500/30 transition-colors"
            >
              <Bot size={14} className="text-green-400" />
              {selectedModelInfo?.name || selectedModel.split('/').pop()}
              <ChevronDown size={12} />
            </button>
            {showModelPicker && (
              <div className="absolute right-0 top-10 w-72 glass border border-green-900/30 rounded-xl overflow-hidden z-50 shadow-2xl">
                <div className="p-2 border-b border-green-900/20">
                  <p className="text-xs text-gray-500 px-2">ফ্রি মডেলস — {models.length}টি</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {models.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m.id); setShowModelPicker(false) }}
                      className={cn(
                        'w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors',
                        selectedModel === m.id && 'bg-green-500/10 text-green-300'
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500">{m.provider}</div>
                      </div>
                      {selectedModel === m.id && <div className="w-2 h-2 bg-green-400 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-xl font-bold text-green-400 mb-2">AI শালায় স্বাগতম!</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                যেকোনো প্রশ্ন করুন, কোড লিখতে বলুন, গল্প লিখতে বলুন — সব বাংলায়।
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6 max-w-sm w-full">
                {['বাংলায় একটি গল্প লিখুন', 'Python কোড লিখে দিন', 'আমার CV তৈরি করুন', 'এই English টা অনুবাদ করুন'].map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-left text-xs bg-green-900/20 border border-green-900/30 rounded-lg px-3 py-2.5 text-gray-400 hover:text-green-300 hover:border-green-500/30 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={cn('flex gap-3 animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0 mt-1">
                  <Bot size={16} />
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
                  <span className="text-xs text-gray-600">{msg.model?.split('/').pop() || ''}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{formatDate(msg.created_at)}</span>
                    <button onClick={() => copyToClipboard(msg.content)} className="text-gray-600 hover:text-green-400 transition-colors">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Bot size={16} />
              </div>
              <div className="message-ai px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-green-900/20 glass-light shrink-0">
          {!conversationId && (
            <p className="text-xs text-gray-600 text-center mb-2">মেসেজ পাঠালে নতুন চ্যাট শুরু হবে</p>
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
                placeholder="বাংলায় বা English এ লিখুন... (Enter পাঠান)"
                style={{ maxHeight: '120px', height: 'auto' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-green p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {sending
                ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <Send size={20} />
              }
            </button>
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
