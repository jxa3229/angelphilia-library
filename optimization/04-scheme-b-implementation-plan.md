# 方案 B 实施计划：Vue Router + Pinia 架构升级

## Summary

本计划用于执行 Vue Router + Pinia 架构升级。目标是把集中在 `src/App.vue` 的 route、state、页面模板、i18n、工具函数和安全渲染拆成可维护结构，同时保持 GitHub Pages 静态部署可用。

默认决策：目录英文名使用 `optimization`；Vue Router 使用 `createWebHashHistory(import.meta.env.BASE_URL)`，避免 GitHub Pages 刷新 404；Pinia 只承接跨页面状态，不引入过度复杂 store。

## Key Changes

- 文档与目录：
  - 将 `优化/` 重命名为 `optimization/`。
  - 新增 `spec/feature_router_pinia_architecture/spec-design.md` 与 `spec-plan.md`。
  - 更新 `spec/global/architecture.md` 与 `spec/global/constraints.md`。

- 依赖与入口：
  - 安装 `vue-router@4` 与 `pinia`。
  - 在 `src/main.js` 中注册 `router`、`pinia`、Element Plus，并改为引入 `src/styles/index.css`。
  - 保留 Vite `base: process.env.BASE_PATH || '/'`，不改 GitHub Pages 发布链路。

- 路由结构：
  - 新建 router，路由固定为 `overview`、`library`、`index`、`repository`，默认重定向到 `overview`。
  - 使用 hash history，最终 URL 形态保持 `#/overview`、`#/library` 等。
  - `App.vue` 缩减为 shell + `<RouterView />`，不再手写 `hashchange`。

- Pinia 状态：
  - `usePreferencesStore`：管理 `lang`、`theme`、localStorage 持久化与主题应用。
  - `useLibraryStore`：管理 records 派生数据、筛选条件、active record、图片失败集合、详情缓存/loading/error。
  - store 内只保存前端运行态，不改 `records.json` 数据生成方式。

- 组件与页面拆分：
  - 页面拆为 `OverviewPage.vue`、`LibraryPage.vue`、`IndexPage.vue`、`RepositoryPage.vue`。
  - 公共组件拆为 `SideNav`、`ThemeSwitcher`、`LanguageSwitcher`、`LibraryFilters`、`RecordCard`、`RecordDetail`、`RecordGallery`、`NoticePanel`。
  - i18n 文案迁移到 `src/i18n/dictionary.js` 与 `src/i18n/languages.js`，暂不引入 vue-i18n。

- 安全同步处理：
  - 移除 repository 文案的非必要 `v-html`，改为结构化链接渲染。
  - 详情 HTML 保留唯一受控 `v-html` 入口，并通过 `sanitizeHtml()` 白名单过滤。
  - 所有外链统一 `target="_blank"` + `rel="noopener noreferrer"`。

## Test Plan

- `npm run build`
- `npm audit --audit-level=moderate`
- `rg -n "v-html" src`
- `rg -n "target=\"_blank\"" src`
- `rg -n "hashchange|location.hash|window.location" src`

## Assumptions

- 方案 B 固定采用 Vue Router hash history，不使用 history mode。
- Pinia 只管理跨页面运行态；不把静态 `records.json` 迁成远程 API。
- 不引入 TypeScript、不引入 vue-i18n、不改变 GitHub Pages 部署方式。
