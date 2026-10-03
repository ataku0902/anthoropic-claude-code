import { describe, expect, test } from 'claude-code/testing'

import { bar, forecast, kilo } from './weather'

describe('forecast', () => {
  test('5段階で天気が崩れていく', async () => {
    expect(forecast(10).label).toBe('快晴')
    expect(forecast(40).label).toBe('晴れ')
    expect(forecast(60).label).toBe('くもり')
    expect(forecast(80).label).toBe('雨')
    expect(forecast(90).label).toMatch(/嵐/)
  })

  test('バーの幅は一定', async () => {
    expect(bar(50)).toBe('██████████░░░░░░░░░░')
    expect(bar(150).length).toBe(20)
  })

  test('トークン数を k で短く書く', async () => {
    expect(kilo(40000)).toBe('40k')
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
