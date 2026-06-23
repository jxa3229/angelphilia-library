# 优化更新日志

## 2026-06-11：方案 B 架构升级完成

本次更新完成 `01-src-refactor-plan.md` 的主体目标，并按方案 B 将项目升级为 Vue Router + Pinia + 页面组件分层结构。

### 主要变化

- 引入 `vue-router@4` 与 `pinia`，使用 hash history 保持 GitHub Pages 刷新可用。
- `src/App.vue` 缩减为应用 shell，页面拆为 `OverviewPage`、`LibraryPage`、`IndexPage`、`RepositoryPage`。
- 抽离侧边栏、语言切换、主题切换、筛选器、卡片、详情、图片轮播等组件。
- 抽离 `preferences` / `library` store，集中管理语言主题、筛选、详情 HTML 缓存与加载状态。
- 将三语文案迁移到 `src/i18n/`，将资源路径、记录工具、安全 HTML 清洗迁移到 `src/utils/`。
- repository 链接改为结构化渲染；详情页保留唯一受控 `v-html` 并通过 `sanitizeHtml()` 过滤。
- 修复 `public/media` 在 Windows 下清理/复制不稳定导致的图片缺失问题。
- 修复馆藏卡片图片被误判为失败后显示 `No image` 的问题。
- 修复 overview 标题、metadata 和统计卡片在桌面视口下遮挡/溢出的问题。

### 验证记录

- `npm run build`：通过。
- `BASE_PATH=/angelphilia-library/ npm run build`：通过。
- `npm audit --audit-level=moderate`：通过，0 vulnerabilities。
- `rg -n "v-html|hashchange|location\.hash|window\.location|target=\"_blank\"" src`：仅保留详情页受控 `v-html` 和 repository 安全外链。
- Headless Chrome 回归：`#/overview` 无遮挡；`#/library` 首屏图片正常显示。

### 后续事项

- CSS 已拆分到 `src/styles/` 分层文件，并由 `src/styles/index.css` 汇总。
- 已增加 Playwright smoke、CI audit/build 检查和配件资料校验。
- Element Plus icons 改为组件按需 import，页面路由改为 lazy imports，主 JS chunk 由约 1072KB 降至约 502KB。
