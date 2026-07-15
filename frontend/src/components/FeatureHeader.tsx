import { type LucideIcon } from 'lucide-react'

interface FeatureHeaderProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  accent: string
  right?: React.ReactNode
}

export default function FeatureHeader({ icon: Icon, title, subtitle, accent, right }: FeatureHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 md:px-5 h-14 border-b shrink-0 backdrop-blur-md sticky top-0 z-10"
      style={{
        borderColor: 'rgba(255,255,255,0.05)',
        background: 'rgba(2,2,10,0.85)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${accent}16`,
            border: `1px solid ${accent}28`,
          }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-[14px] font-bold text-slate-200 leading-none truncate">{title}</h1>
          {subtitle && (
            <p className="text-[10px] text-slate-600 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {right && <div className="flex items-center gap-2 shrink-0 ml-3">{right}</div>}
    </div>
  )
}
