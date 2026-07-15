import { Music2, Zap, Lock } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import FeatureHeader from '../components/FeatureHeader'

const ACCENT = '#EC4899'

const PROVIDERS = [
  { name: 'Suno AI v4', desc: 'Full songs with lyrics, $0.01/clip', eta: 'Q3 2025' },
  { name: 'Udio', desc: 'Stems & instrumentals', eta: 'Q4 2025' },
  { name: 'MusicGen (Meta)', desc: 'Open source, lower quality', eta: 'Q3 2025' },
]

export default function MusicPage() {
  const { t } = useLang()

  return (
    <div className="h-full flex flex-col">
      <FeatureHeader
        icon={Music2}
        title={t.musicTitle}
        subtitle="Provider selection pending"
        accent={ACCENT}
        right={
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${ACCENT}14`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
            {t.musicComingSoon}
          </span>
        }
      />
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}20` }}>
              <Music2 size={34} style={{ color: ACCENT }} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.musicTitle}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{t.musicComingSoonMsg}</p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 px-1">Planned Providers</p>
            {PROVIDERS.map(p => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl p-3.5"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}18` }}>
                  <Zap size={14} style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-200">{p.name}</p>
                  <p className="text-[10px] text-slate-600">{p.desc}</p>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {p.eta}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.12)' }}>
            <Lock size={14} style={{ color: '#EAB308' }} />
            <p className="text-[11px] text-slate-500">
              Music generation requires a paid provider. Contact admin to enable once a provider is selected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
