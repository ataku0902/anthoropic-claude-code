import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { STORM_AT, bar, forecast } from './weather'

const fill = atom({ plugin: 'token-weather', key: 'percent' } as const, null)
const hasWarned = atom({ plugin: 'token-weather', key: 'hasWarned' } as const, false)

const refresh = async ($: EngineInterface) => {
  const { context } = await $.session.usage()
  const percent = context.percent ?? null
  await update($, fill, () => percent)

  if (percent === null || percent < STORM_AT) {
    await update($, hasWarned, () => false)
    return
  }

  if (!(await read($, hasWarned))) {
    await update($, hasWarned, () => true)
    $.ui.toast(`⛈ 会話の容量が ${percent}% です。/compact を検討してください`)
  }
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
    const percent = await read($, fill)

    if (e.props.hasSurvey || percent === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const sky = forecast(percent)

    return (
      <Box>
        <Text key="weather" color={sky.color}>
          {sky.icon} {sky.label} {bar(percent)}
        </Text>
      </Box>
    )
  })
}
