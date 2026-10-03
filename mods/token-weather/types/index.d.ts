export type Percent = number | null

declare module 'claude-code' {
  interface PluginState {
    'token-weather': { percent: Percent; hasWarned: boolean }
  }
}
