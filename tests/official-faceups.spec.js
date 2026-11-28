import { expect, test } from '@playwright/test'

test('official face-up links open the matching records and return to the gallery', async ({ page }) => {
  await page.goto('./#/official-faceups')

  for (const [name, recordName] of [
    [/MONICA/, /MONICA/i],
    ['RIN（凛）', /凛/],
    [/摩璃奈 Marina/, /摩璃奈/]
  ]) {
    const card = page.locator('.faceups-grid li').filter({ hasText: name })
    await card.getByRole('link', { name: '查看馆藏档案' }).click()
    await expect(page.locator('.detail-head').getByRole('heading')).toHaveText(recordName)
    await page.getByRole('button', { name: '返回官妆实拍', exact: true }).click()
    await expect(page).toHaveURL(/#\/official-faceups$/)
  }
})

test('a direct record link returns to its declared source', async ({ page }) => {
  const record = 'r-823912a987b6869c'
  await page.goto(`./#/library?record=${record}&from=official-faceups`)
  await page.getByRole('button', { name: '返回官妆实拍', exact: true }).click()
  await expect(page).toHaveURL(/#\/official-faceups$/)

  await page.goto(`./#/library?record=${record}`)
  await page.getByRole('button', { name: '返回馆藏条目', exact: true }).click()
  await expect(page).toHaveURL(/#\/library$/)
})
