import { expect, test } from '@playwright/test'

test('official face-up links open the matching records and return to the gallery', async ({ page }) => {
  await page.goto('./#/official-faceups')

  for (const [name, recordName, recordId] of [
    [/MONICA/, /MONICA/i],
    ['凛 RIN', /凛/],
    [/摩璃奈 Marina/, /摩璃奈/],
    ['小夜 SAYO', '小夜', 'r-ece6c67b1e80fca3'],
    ['伽琉羅 KARURA', '伽琉羅 KARURA', 'r-859d28fe6ac45e0d'],
    ['关羽 Kanu Unchou', '关羽云长', 'r-b64087b07055ec57'],
    ['索尼子 Sonico', 'Sonico', 'r-faf3bba14ed15114'],
    ['MERU', 'MERU', 'r-14b09550d074d657'],
    ['美雨 MIU', 'MIU', 'r-09e1bf4f77a345a4'],
    ['羅魅阿 LAMIA', '羅魅阿 LAMIA', 'r-56a4da14310cb4af'],
    ['絽媚奈 ROMINA', '絽媚奈 ROMINA', 'r-178d782f4b0055c4']
  ]) {
    const card = page.locator('.faceups-grid li').filter({ hasText: name })
    await card.getByRole('link', { name: '查看馆藏档案' }).click()
    if (recordId) await expect(page).toHaveURL(new RegExp(`[?&]record=${recordId}(?:&|$)`))
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
