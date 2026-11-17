import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { translateOutfitDescription } from '../src/utils/outfitText.js'
import { buildInitialSelection, generateBodyCode } from '../src/utils/bodyCode.js'

const records = JSON.parse(readFileSync(new URL('../src/data/records.json', import.meta.url), 'utf8'))
const outfits = JSON.parse(readFileSync(new URL('../src/data/outfits.json', import.meta.url), 'utf8'))
const record = records[0]
const bodyData = JSON.parse(readFileSync(new URL('../src/data/bodyParts.json', import.meta.url), 'utf8'))

test('overview uses a small summary; full data loads only on collection navigation', async ({ page }) => {
  const fullData = []
  page.on('request', (request) => {
    if (/\/(?:assets\/(?:records|realartArchive|limitedOfficial)-|src\/data\/(?:records|realartArchive|limitedOfficial)\.json)/.test(request.url())) fullData.push(request.url())
  })
  await page.goto('./#/overview')
  await expect(page.locator('.stat-strip')).toContainText('328')
  await expect(page.locator('.stat-strip')).toContainText('2008-2026')
  expect(fullData).toHaveLength(0)
  const years = await page.locator('.recent-list button > span').allTextContents()
  expect(years.every((year) => /^\d{4}$/.test(year))).toBe(true)
  expect(years.map(Number)).toEqual(years.map(Number).sort((a, b) => b - a))
  await page.getByRole('link', { name: '馆藏条目', exact: true }).click()
  await expect(page.locator('.record-card')).toHaveCount(24)
  expect(fullData.length).toBeGreaterThan(0)
})

test('failed lazy page navigation has a visible reload recovery', async ({ page }) => {
  await page.goto('./#/overview')
  const pattern = /\/(?:assets\/records-|src\/data\/records\.json)/
  await page.route(pattern, (route) => route.abort())
  await page.getByRole('link', { name: '馆藏条目', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('页面资料加载失败')
  await page.unroute(pattern)
  await page.getByRole('button', { name: '重新加载', exact: true }).click()
  await expect(page.locator('.record-card')).toHaveCount(24)
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('sanitizes nested unsupported tags and unsafe URLs before rendering real details', async ({ page }) => {
  await page.route(`**/details/${record.detailKey}.html`, (route) => route.fulfill({
    contentType: 'text/html',
    body: '<unknown><unknown><img src="x" onerror="window.__unsafe=1"><a href="java&#10;script:alert(1)" onclick="alert(2)">unsafe</a></unknown></unknown><script>window.__unsafe=2</script><svg><a href="javascript:alert(1)">svg</a></svg><a href="data:text/html,test">data</a><a href="vbscript:msgbox(1)">vb</a><p class="kept" style="color:red">Normal <strong>format</strong><!-- comment --></p><a href="https://example.org/ref">safe</a><img src="media/safe.jpg" alt="safe">'
  }))
  await page.goto(`./#/library?record=${encodeURIComponent(record.folder)}`)
  const sourceDetails = page.locator('.limited-source-detail')
  if (await sourceDetails.count()) await sourceDetails.locator('summary').click()
  const content = page.locator('.docx-content')
  await expect(content.locator('p.kept')).toHaveText('Normal format')
  await expect(content.locator('[onerror], [onclick], [style], script, svg, unknown')).toHaveCount(0)
  await expect(content.locator('a').filter({ hasText: /^unsafe$|^data$|^vb$/ })).toHaveCount(3)
  for (const text of ['unsafe', 'data', 'vb']) await expect(content.getByRole('link', { name: text, exact: true })).toHaveCount(0)
  await expect(content.getByRole('link', { name: 'safe', exact: true })).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(content.locator('img[alt="safe"]')).toHaveAttribute('src', 'media/safe.jpg')
  expect(await page.evaluate(() => window.__unsafe)).toBeUndefined()
})

for (const route of ['library', 'limited']) {
  test(`${route} detail links support refresh, back, forward and invalid identifiers`, async ({ page }) => {
    await page.goto(`./#/${route}`)
    const first = page.locator('.record-card h3 button').first()
    const title = await first.textContent()
    await first.click()
    await expect(page).toHaveURL(/\?record=/)
    await expect(page.locator('.detail-head h2')).toHaveText(title)
    const link = page.url()
    await page.goBack()
    await expect(page.locator('.record-card').first()).toBeVisible()
    await page.goForward()
    await expect(page.locator('.detail-head h2')).toHaveText(title)
    await page.reload()
    await expect(page.locator('.detail-head h2')).toHaveText(title)
    await page.locator('.detail-head button').click()
    await expect(page).not.toHaveURL(/\?record=/)
    await expect(page.locator('.record-card').first()).toBeVisible()
    await page.goto(link)
    await expect(page.locator('.detail-head h2')).toHaveText(title)
    await page.goto(`./#/${route}?record=missing`)
    await expect(page.getByRole('alert')).toContainText('找不到此条目')
    await page.getByRole('alert').getByRole('button').click()
    await expect(page.locator('.record-card').first()).toBeVisible()
  })
}

test('outfits batches reach all items, full-data searching and original long notes remain accessible', async ({ page }) => {
  await page.goto('./#/outfits')
  await expect(page.locator('.outfit-card')).toHaveCount(24)
  for (let count = 48; count < outfits.length + 24; count += 24) {
    await page.getByRole('button', { name: '加载更多条目', exact: true }).click()
    await expect(page.locator('.outfit-card')).toHaveCount(Math.min(count, outfits.length))
  }
  await expect(page.getByRole('button', { name: '加载更多条目', exact: true })).toHaveCount(0)
  const longItem = outfits.find((item) => translateOutfitDescription(item.description).length > 500)
  await page.locator('.outfits-filters input').first().fill(longItem.title)
  const card = page.locator('.outfit-card').filter({ hasText: longItem.year }).first()
  await card.locator('h3 button').click()
  const description = page.locator('.el-drawer:visible .product-description p[lang="ja"]')
  await expect(description).toHaveText(translateOutfitDescription(longItem.description))
  await page.locator('.el-drawer:visible .el-drawer__close-btn').click()
  await page.getByRole('button', { name: '重置', exact: true }).click()
  await expect(page.locator('.outfit-card')).toHaveCount(24)
  await page.locator('.outfits-filters input').first().fill(String(outfits.at(-1).title))
  await expect(page.locator('.outfit-card').first()).toBeVisible()
})

test('outfit category selections survive language switches, glossary and document language update on narrow screens', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./#/outfits')
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await expect(page.locator('.outfit-card h3 button').first()).toHaveText('Waitress set(C-4W)')
  await page.getByRole('button', { name: '日本語', exact: true }).click()
  await expect(page.locator('.outfit-card h3 button').first()).toHaveText(outfits[0].title)
  await page.getByRole('button', { name: '中文', exact: true }).click()
  await page.locator('.outfits-filters .el-select').first().click()
  await page.getByRole('option', { name: '假发', exact: true }).click()
  const count = await page.locator('.outfits-load-more p').textContent()
  for (const [language, lang, category, title] of [
    ['English', 'en', 'Wigs', 'Brands & industry terms'],
    ['日本語', 'ja', 'ウィッグ', 'ブランドと運営用語'],
    ['中文', 'zh-Hans', '假发', '品牌与运营术语']
  ]) {
    await page.getByRole('button', { name: language, exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', lang)
    await expect(page.locator('.outfits-filters .el-select').first()).toContainText(category)
    const after = await page.locator('.outfits-load-more p').textContent()
    expect(after.match(/\d+/g).map(Number).sort((a, b) => a - b)).toEqual(count.match(/\d+/g).map(Number).sort((a, b) => a - b))
    await page.goto('./#/glossary')
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 })
      for (const theme of [0, 1]) {
        await page.locator('.theme-row button').nth(theme).click()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
      }
    }
    await page.goto('./#/outfits')
    await page.locator('.outfits-filters .el-select').first().click()
    await page.getByRole('option', { name: category, exact: true }).click()
  }
  expect(errors).toEqual([])
})

test('body presets, manual selection, head measurements and preview filters survive composable extraction', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('./#/body-builder')
  const code = page.locator('.body-code-value')
  const initial = buildInitialSelection(bodyData)
  await expect(code).toHaveText(generateBodyCode(initial, bodyData.parts))
  const preset = bodyData.presets.find((item) => generateBodyCode({ ...initial, ...item.parts }, bodyData.parts) !== generateBodyCode(initial, bodyData.parts))
  await page.locator('.preset-panel .el-select').click()
  await page.getByRole('option').filter({ hasText: preset.label }).first().click()
  await expect(code).toHaveText(generateBodyCode({ ...initial, ...preset.parts }, bodyData.parts))
  const upper = bodyData.parts.find((item) => item.category === 'upperTorso' && item.id !== preset.parts.upperTorso)
  await page.locator('.selector-panel .el-select').first().click()
  await page.getByRole('option').filter({ hasText: upper.label }).first().click()
  await expect(code).toHaveText(generateBodyCode({ ...initial, ...preset.parts, upperTorso: upper.id }, bodyData.parts))
  await page.locator('.head-panel .el-select').click()
  await page.getByRole('option').first().click()
  await page.locator('.head-panel .el-switch').click()
  await expect(page.locator('.measurement-panel')).toContainText('头围')
  await page.locator('.part-preview-toolbar button').nth(1).click()
  const model = page.locator('.part-preview-filter').first().locator('button').nth(1)
  const modelName = await model.textContent()
  await model.click()
  await expect(page.locator('.part-preview-card').first()).toContainText(modelName.trim())
  await page.locator('.part-preview-card h3 button').first().click()
  await expect(page.locator('.el-drawer:visible .metadata-list')).toContainText(modelName.trim())
  await page.locator('.el-drawer:visible .el-drawer__close-btn').click()
  expect(errors).toEqual([])
})
