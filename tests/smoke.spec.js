import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/overview')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('loads core routes and filters the collection', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Angelphilia/ })).toBeVisible()

  await page.getByRole('link', { name: /馆藏条目/ }).click()
  await expect(page).toHaveURL(/#\/library/)
  await page.getByPlaceholder(/搜索名字/).fill('MIU')
  await expect(page.locator('.record-card').first()).toBeVisible()
  await expect(page.locator('.library-section')).toContainText(/MIU/i)
})

test('opens a record detail and returns to the collection', async ({ page }) => {
  await page.getByRole('link', { name: /馆藏条目/ }).click()
  await page.locator('.record-body h3 button').first().click()

  await expect(page.locator('.detail-page')).toBeVisible()
  await expect(page.getByRole('button', { name: /返回馆藏条目/ })).toBeVisible()

  await page.getByRole('button', { name: /返回馆藏条目/ }).click()
  await expect(page.locator('.card-grid')).toBeVisible()
})

test('switches language and theme preferences', async ({ page }) => {
  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('link', { name: /Collection/ })).toBeVisible()

  await page.locator('.theme-row button').nth(1).click()
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'dark')
})

test('keeps the body builder compact on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/body-builder')

  await expect(page.locator('.code-panel')).toBeVisible()
  await expect(page.locator('.selector-panel')).toBeVisible()
  await expect(page.locator('.measurement-panel')).toBeVisible()
  await expect(page.locator('.atelier-panel')).toBeHidden()

  const layout = await page.evaluate(() => {
    const top = (selector) => document.querySelector(selector).getBoundingClientRect().top
    return {
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      codeTop: top('.code-panel'),
      selectorTop: top('.selector-panel'),
      measurementTop: top('.measurement-panel')
    }
  })

  expect(layout.hasHorizontalOverflow).toBe(false)
  expect(layout.codeTop).toBeLessThan(layout.selectorTop)
  expect(layout.selectorTop).toBeLessThan(layout.measurementTop)
})
