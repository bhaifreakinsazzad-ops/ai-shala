import { Music2 } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

export default function MusicPage() {
  const { t } = useLang()

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
          <Music2 className="text-green-400" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{t.musicTitle}</h1>
        <span className="inline-block text-xs font-mono text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 rounded-full px-3 py-1 mb-4">
          {t.musicComingSoon}
        </span>
        <p className="text-gray-500 text-sm">{t.musicComingSoonMsg}</p>
      </div>
    </div>
  )
}
