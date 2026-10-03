export type Forecast = { icon: string; label: string; color: string }

export const forecast = (percent: number): Forecast => {
  if (percent < 40) return { icon: '☀', label: 'Clear', color: 'green' }
  if (percent < 65) return { icon: '⛅', label: 'Cloudy', color: 'yellow' }
  if (percent < 85) return { icon: '🌧', label: 'Rain', color: 'magenta' }
  return { icon: '⛈', label: 'Storm: consider /compact', color: 'red' }
}

export const bar = (percent: number, width = 20): string => {
  const filled = Math.round((Math.min(100, Math.max(0, percent)) / 100) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

export const kilo = (tokens: number): string =>
  tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : `${tokens}`
