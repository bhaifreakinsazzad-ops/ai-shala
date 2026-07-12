import { useState, useRef, useEffect } from 'react'
import { chatApi, audioApi } from '../lib/api'
import { useLang } from '../contexts/LanguageContext'
import { Mic, Square, Loader2, Volume2 } from 'lucide-react'
import { cn } from '../lib/utils'

type Status = 'idle' | 'listening' | 'processing' | 'speaking'

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

export default function VoicePage() {
  const { t, lang } = useLang()
  const [status, setStatus] = useState<Status>('idle')
  const [turns, setTurns] = useState<Turn[]>([])
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState('')
  const conversationId = useRef<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US'
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      handleTranscript(transcript)
    }
    recognition.onerror = () => {
      setStatus('idle')
      setError('Voice recognition failed. Please try again.')
    }
    recognition.onend = () => {
      setStatus((s) => (s === 'listening' ? 'idle' : s))
    }
    recognitionRef.current = recognition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const ensureConversation = async () => {
    if (conversationId.current) return conversationId.current
    const res = await chatApi.createConversation({ title: 'Voice Chat' })
    conversationId.current = res.data.conversation.id
    return conversationId.current
  }

  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) {
      setStatus('idle')
      return
    }
    setTurns((prev) => [...prev, { role: 'user', text: transcript }])
    setStatus('processing')
    setError('')
    try {
      const convId = await ensureConversation()
      const res = await chatApi.sendMessage(convId!, { content: transcript })
      const replyText = res.data.assistantMessage?.content || res.data.message?.content || ''
      setTurns((prev) => [...prev, { role: 'assistant', text: replyText }])

      setStatus('speaking')
      const audioRes = await audioApi.generate({ text: replyText.slice(0, 2000) })
      if (audioRef.current) {
        audioRef.current.src = audioRes.data.fileUrl
        audioRef.current.play().catch(() => {})
        audioRef.current.onended = () => setStatus('idle')
      } else {
        setStatus('idle')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || status !== 'idle') return
    setStatus('listening')
    setError('')
    recognitionRef.current.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }

  if (!supported) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Mic className="text-gray-600 mx-auto mb-4" size={40} />
          <p className="text-gray-400">{t.voiceNotSupported}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Mic className="text-green-400" size={24} />
            {t.voiceTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{t.voiceSubtitle}</p>
        </div>

        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {turns.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-10">
              <p className="text-gray-600 text-sm">{t.voicePlaceholderMsg}</p>
            </div>
          ) : (
            turns.map((turn, i) => (
              <div key={i} className={cn('rounded-xl p-4 max-w-[85%]', turn.role === 'user' ? 'ml-auto bg-green-500/10 border border-green-500/20' : 'bg-black/40 border border-green-900/20')}>
                <p className="text-xs text-gray-500 mb-1">{turn.role === 'user' ? t.voiceTranscriptLabel : t.voiceResponseLabel}</p>
                <p className="text-gray-200 text-sm">{turn.text}</p>
              </div>
            ))
          )}
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>}

        <div className="flex flex-col items-center gap-3 pb-4">
          <button
            onClick={status === 'listening' ? stopListening : startListening}
            disabled={status === 'processing' || status === 'speaking'}
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-40',
              status === 'listening' ? 'bg-red-500/20 border-2 border-red-500 animate-pulse' : 'bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30'
            )}
          >
            {status === 'processing' || status === 'speaking' ? (
              <Loader2 size={28} className="text-green-400 animate-spin" />
            ) : status === 'listening' ? (
              <Square size={24} className="text-red-400" />
            ) : (
              <Mic size={28} className="text-green-400" />
            )}
          </button>
          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            {status === 'listening' && <>{t.voiceListening}</>}
            {status === 'processing' && <>{t.voiceProcessing}</>}
            {status === 'speaking' && <><Volume2 size={14} /> {t.voiceSpeaking}</>}
            {status === 'idle' && turns.length === 0 && t.voiceStart}
          </p>
        </div>

        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  )
}
