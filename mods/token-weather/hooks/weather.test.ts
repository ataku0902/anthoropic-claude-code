import { describe, expect, test } from 'claude-code/testing'

import { bar, forecast, kilo } from './weather'

describe('forecast', () => {
  test('turns stormier as the window fills', async () => {
    expect(forecast(10).label).toBe('Clear')
    expect(forecast(50).label).toBe('Cloudy')
    expect(forecast(70).label).toBe('Rain')
    expect(forecast(90).label).toMatch(/Storm/)
  })

  test('draws a bar of fixed width', async () => {
    expect(bar(50)).toBe('██████████░░░░░░░░░░')
    expect(bar(150).length).toBe(20)
  })

  test('shortens token counts', async () => {
    expect(kilo(200000)).toBe('200k')
    expect(kilo(512)).toBe('512')
  })
})

test('the band stays out of the way before the first response', async ($, on) => {
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Box } = $.ui.resolve(e)
    return h(Box, { key: 'engine' }) as never
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'token-weather',
      surface,
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 10,
        bodyColumns: 80,
        scroll: { offset: 0, bodyRows: 10 },
        view: {},
      },
    })
    expect(await ui.find({ key: 'weather' })).toBeUndefined()
    await ui.unmount()
  }
})
