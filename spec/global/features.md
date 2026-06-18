# 已有功能清单

![功能模块概览](./images/05-feature-modules.png)

## 馆藏浏览

- **卡片列表:** 按记录展示封面、年份、馆别、名称、标题、系列、肤色、Head、Body。
- **筛选搜索:** 支持关键词、馆别、年份和来源筛选。
- **最近条目:** 侧边栏按年份倒序显示最近 8 条，点击后进入馆藏并聚焦搜索。

## 完整索引

- **表格索引:** 使用 Element Plus 表格展示年份、馆别、编号、名称、版本、Head、Body、肤色和目录。
- **共享筛选条件:** 索引页复用馆藏页的筛选结果，便于核对结构化字段。

## 详情页

- **图片轮播:** 从 `record.safeImages` 或 `safeImageUrl` 读取 `public/media/` 静态图片。
- **正文详情:** 从 `public/details/{detailKey}.html` 按 `detailKey` 读取由 `record.md` 转换出的 HTML。
- **返回状态:** 进入详情前保存列表滚动位置，返回后恢复。

## 主题与多语言

- **语言切换:** 内置中文、English、日本語三套界面文案。
- **主题切换:** 支持亮色、暗色和跟随系统，设置保存到 `localStorage`。

## 配件阁 / 拼娃尺寸

- **身体组合:** 导航栏提供“配件阁”入口，默认进入 `GHH`，即 G 胸、H 腰臀、H 大腿。
- **默认补全:** 未显式选择的小腿、手臂、手、脚和 frame 按 `Obitsu default` 展示并参与尺寸汇总。
- **头型数据:** 头默认不选，用户选择头型并开启插入后才显示头围和 eye size；P 型 eye size 保持待补充。
- **尺寸汇总:** 按 cm 展示身长、肩宽、胸围、腰围、臀围、大腿围、小腿围、手臂围和脚长等字段。
- **来源脱敏:** 用户界面和复制内容统一显示“网络数据”或误差信息，不展示具体来源链接、平台、作者或截图说明。
- **一键复制:** 输出当前组合和尺寸摘要，例如 `Body GHH / default Obitsu frame+arms+shins+hands+feet / no head data`。

## 数据与部署

- **馆藏数据同步:** `npm run sync:data` 从 `index_local.html` 生成 `src/data/records.json`。
- **详情数据同步:** `npm run sync:details` 从每个 `record.md` 生成 `public/details/{detailKey}.html`。
- **静态资源准备:** `npm run prepare:public` 复制 records 图片到 `public/media/`。
- **GitHub Pages:** `.github/workflows/pages.yml` 自动构建并发布静态站点。
- **配件资料校验:** `npm run validate:body-parts` 校验 `bodyParts.json`、`headParts.json` 和 `part网络数据s.json` 的引用、单位、默认值和来源脱敏。

---
*最后更新: 2026-06-18 — 增加配件阁 / 拼娃尺寸*
