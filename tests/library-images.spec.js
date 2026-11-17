import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const archive = JSON.parse(readFileSync(new URL('../src/data/realartArchive.json', import.meta.url), 'utf8'))
const localCover = '**/media/r-32471885e1c28236/01.jpg'
const firstImage = (page) => page.locator('.record-card').first().locator('img')
const imageLoaded = async (image) => expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true)

test('loads a small first batch and keeps every cover on this site even when external image hosts are blocked', async ({ page }) => {
  const external = []
  await page.route(/https?:\/\/(cart\.fc2img\.com|quarantotto\.biz)\//, (route) => { external.push(route.request().url()); return route.abort() })
  await page.goto('./#/library')
  await expect(page.locator('.record-card')).toHaveCount(24)
  await imageLoaded(firstImage(page))
  await expect(firstImage(page)).toHaveAttribute('loading', 'eager')
  await expect(page.locator('.record-card img').nth(4)).toHaveAttribute('loading', 'lazy')
  await expect(page.locator('.library-load-more')).toContainText('24 / 328')
  const more = page.getByRole('button', { name: '加载更多条目', exact: true })
  for (let count = 48; count <= 336; count += 24) {
    await more.click()
    await expect(page.locator('.record-card')).toHaveCount(Math.min(count, 328))
  }
  await expect(more).toHaveCount(0)
  const urls = await page.locator('.record-card img').evaluateAll((images) => images.map((image) => new URL(image.src).origin))
  expect(new Set(urls).size).toBe(1)
  expect(new Set(await page.locator('.record-card h3').allTextContents()).size).toBeGreaterThan(200)
  const cachedCard = page.locator('.record-card').filter({ has: page.locator('img[src*="/catalog-covers/"]') }).first()
  await cachedCard.scrollIntoViewIfNeeded()
  await imageLoaded(cachedCard.locator('img'))
  expect(external).toEqual([])
})

test('recovers automatically from one failed request and lets the user retry a persistent failure', async ({ page }) => {
  let attempts = 0
  let failAll = false
  await page.route(localCover, (route) => {
    attempts++
    return attempts === 1 || failAll ? route.abort() : route.continue()
  })
  await page.goto('./#/library')
  await imageLoaded(firstImage(page))
  expect(attempts).toBe(2)
  failAll = true
  attempts = 0
  await page.reload()
  const retry = page.locator('.record-card').first().getByRole('button', { name: /重试图片/ })
  await expect(retry).toBeVisible()
  expect(attempts).toBe(2)
  await expect(page.locator('.detail-page')).toHaveCount(0)
  failAll = false
  await retry.click()
  await imageLoaded(firstImage(page))
  await expect(retry).toHaveCount(0)
  await expect(page.locator('.detail-page')).toHaveCount(0)
  expect(attempts).toBe(3)
})

test('falls back to the source cover if a cached cover is unavailable', async ({ page }) => {
  let fallbacks = 0
  await page.route('**/catalog-covers/*', (route) => route.abort())
  await page.route(archive[0].safeImages[0], (route) => {
    fallbacks++
    return route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=', 'base64') })
  })
  await page.goto('./#/library')
  await page.getByPlaceholder(/搜索名字/).fill(archive[0].name)
  await expect(page.locator('.record-card').first()).toBeVisible()
  await imageLoaded(firstImage(page))
  await expect(firstImage(page)).toHaveAttribute('src', archive[0].safeImages[0])
  expect(fallbacks).toBe(1)
})

for (const width of [1440, 390]) {
  test(`preserves expanded results and scroll on return, resets batches on filter change at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./#/library')
    await page.getByRole('button', { name: '加载更多条目', exact: true }).click()
    await expect(page.locator('.record-card')).toHaveCount(48)
    const card = page.locator('.record-card').nth(30)
    await card.locator('h3 button').scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => ({ panel: document.querySelector('.main-panel').scrollTop, window: window.scrollY }))
    await card.locator('h3 button').click()
    await expect(page.locator('.detail-page')).toBeVisible()
    await page.getByRole('button', { name: '返回馆藏条目', exact: true }).click()
    await expect(page.locator('.record-card')).toHaveCount(48)
    await expect.poll(() => page.evaluate(() => ({ panel: document.querySelector('.main-panel').scrollTop, window: window.scrollY }))).toEqual(before)
    await page.getByPlaceholder(/搜索名字/).fill(archive[0].name)
    await expect(page.locator('.record-card').first()).toContainText(archive[0].name)
    await page.getByRole('button', { name: '重置', exact: true }).click()
    await expect(page.locator('.record-card')).toHaveCount(24)
    await expect(page.locator('.library-load-more')).toContainText('24 / 328')
    await page.getByRole('button', { name: 'English', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Load more records', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '日本語', exact: true }).click()
    await expect(page.getByRole('button', { name: 'さらに表示', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  })
}
