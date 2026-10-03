import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Fill } from '../types'
import { bar, forecast, kilo } from './weather'

const fill = atom({ plugin: 'token-weather', key: 'fill' } as const, null)

const refresh = async ($: EngineInterface) => {
  const { context } = await $.session.usage()
  const next: Fill | null =
    context.percent === undefined || context.tokens === undefined
      ? null
      : { percent: context.percent, tokens: context.tokens, window: context.window }
  await update($, fill, () => next)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const now = await read($, fill)

    if (e.props.hasSurvey || now === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const sky = forecast(now.percent)

    return (
      <Box>
        <Text key="weather" color={sky.color}>
          {sky.icon} {sky.label} {bar(now.percent)} {now.percent}%
        </Text>
        <Text dimColor> ({kilo(now.tokens)} / {kilo(now.window)} tokens)</Text>
      </Box>
    )
  })
}
