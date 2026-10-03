export type Fill = { percent: number; tokens: number; window: number }

declare module 'claude-code' {
  interface PluginState {
    'token-weather': { fill: Fill | null; hasWarned: boolean }
  }
}
