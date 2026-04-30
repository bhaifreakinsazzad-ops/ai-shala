import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'এইমাত্র'
  if (mins < 60) return `${mins} মিনিট আগে`
  if (hours < 24) return `${hours} ঘণ্টা আগে`
  if (days < 7) return `${days} দিন আগে`
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })
}

export function formatBDT(amount: number) {
  return `৳${amount.toLocaleString('bn-BD')}`
}

export function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function getProviderColor(provider: string) {
  const colors: Record<string, string> = {
    Groq: 'text-orange-400',
    Google: 'text-blue-400',
    OpenRouter: 'text-purple-400',
    Together: 'text-pink-400',
    Cohere: 'text-cyan-400',
    OpenAI: 'text-green-400',
    Anthropic: 'text-yellow-400',
  }
  return colors[provider] || 'text-gray-400'
}

export function getSubscriptionColor(sub: string) {
  const colors: Record<string, string> = {
    free: 'text-gray-400',
    pro: 'text-green-400',
    premium: 'text-purple-400',
  }
  return colors[sub] || 'text-gray-400'
}

export function getSubscriptionBadge(sub: string) {
  const badges: Record<string, string> = {
    free: 'bg-gray-800 text-gray-300',
    pro: 'bg-green-900/50 text-green-300 border border-green-700/50',
    premium: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
  }
  return badges[sub] || badges.free
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}
