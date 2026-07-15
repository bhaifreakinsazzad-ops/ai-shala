import { useState, useRef, useEffect } from 'react'
import { chatApi, audioApi } from '../lib/api'
import { useLang } from '../contexts/LanguageContext'
import { Mic, Square, Loader2, Volume2 } from 'lucide-react'
import { cn } from '../lib/utils'
import FeatureHeader from '../components/FeatureHeader'

const ACCENT = '#3B82F6'

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
    <div className="h-full flex flex-col">
      <FeatureHeader icon={Mic} title={t.voiceTitle} subtitle={t.voiceSubtitle} accent={ACCENT} />
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">

        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {turns.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center p-10">
              <p className="text-gray-600 text-sm">{t.voicePlaceholderMsg}</p>
            </div>
          ) : (
            turns.map((turn, i) => (
              <div key={i} className={cn('rounded-xl p-4 max-w-[85%]', turn.role === 'user' ? 'ml-auto' : '')}>
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
              status === 'listening' ? 'animate-pulse' : ''
            )}
          style={{
            width: 80, height: 80, borderRadius: '50%', border: `2px solid`,
            borderColor: status === 'listening' ? '#EF4444' : status === 'idle' ? ACCENT : '#64748B',
            background: status === 'listening' ? 'rgba(239,68,68,0.12)' : `${ACCENT}12`,
            boxShadow: status === 'listening' ? '0 0 20px rgba(239,68,68,0.3)' : status === 'idle' ? `0 0 20px ${ACCENT}30` : 'none',
          }}>
            {status === 'processing' || status === 'speaking' ? (
              <Loader2 size={28} style={{ color: ACCENT }} className="animate-spin" />
            ) : status === 'listening' ? (
              <Square size={24} style={{ color: '#EF4444' }} />
            ) : (
              <Mic size={28} style={{ color: ACCENT }} />
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
    </div>
  )
}
