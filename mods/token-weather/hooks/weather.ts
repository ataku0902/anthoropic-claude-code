export type Forecast = { icon: string; label: string; color: string }

export const STORM_AT = 85

export const forecast = (percent: number): Forecast => {
  if (percent < 30) return { icon: '☀', label: '快晴', color: 'green' }
  if (percent < 50) return { icon: '🌤', label: '晴れ', color: 'green' }
  if (percent < 70) return { icon: '⛅', label: 'くもり', color: 'yellow' }
  if (percent < STORM_AT) return { icon: '🌧', label: '雨', color: 'magenta' }
  return { icon: '⛈', label: '嵐：/compact を検討', color: 'red' }
}

export const bar = (percent: number, width = 20): string => {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export const kilo = (tokens: number): string =>
  tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : `${tokens}`
