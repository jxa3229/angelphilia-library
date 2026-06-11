# Angelphilia Library 优化方案总览

## 背景

当前项目是部署在 GitHub Pages 的 Vue 3 + Vite 静态站点。方案 B 已把运行时核心拆为 Router、Pinia store、页面组件和公共组件：

- `src/App.vue`：应用 shell，组合侧边栏、`RouterView` 和 footer。
- `src/router/`：管理 `overview`、`library`、`index`、`repository` hash 路由。
- `src/stores/`：管理语言/主题偏好、馆藏筛选、详情缓存、图片失败状态。
- `src/pages/` 与 `src/components/`：承载页面模板和复用组件。
- `src/styles.css`：约 859 行，包含全局主题、布局、卡片、详情页、表格与响应式样式。
- `src/data/records.json`：约 242 KB，是构建期生成的馆藏索引数据。

这种结构适合早期快速交付，但随着页面、语言、数据处理和安全要求增加，会降低可维护性、测试颗粒度和安全审查效率。

## 优化目标

1. 拆分 `src/App.vue` 的页面、组件、状态逻辑、工具函数和 i18n 文案。
2. 拆分样式文件，让 layout、theme、components、pages 的职责清晰。
3. 保持现有 GitHub Pages 静态部署方式，不引入后端服务。
4. 把 `v-html`、外链、静态公开数据、依赖链和 GitHub Actions 权限纳入安全基线。
5. 所有改动分阶段实施，每阶段都能独立 build 并回归。

## 推荐方案

当前采用“方案 B：Vue Router + Pinia 架构升级”：

- 使用 Vue Router 4 hash history，继续兼容 GitHub Pages。
- 使用 Pinia 管理跨页面运行态，不改变静态数据生成链路。
- 保留现有视觉 class 和 CSS，降低重构后的视觉回归风险。
- repository 文案改为结构化链接；详情 HTML 保留唯一受控 `v-html` 并通过 sanitize 过滤。

## 文档索引

- [01-src-refactor-plan.md](./01-src-refactor-plan.md)：`src/` 拆分与前端架构优化方案。
- [02-github-pages-security-plan.md](./02-github-pages-security-plan.md)：GitHub Pages 静态站点安全加固计划。
- [03-implementation-roadmap.md](./03-implementation-roadmap.md)：分阶段实施路线、验收标准和回滚策略。
- [04-scheme-b-implementation-plan.md](./04-scheme-b-implementation-plan.md)：Vue Router + Pinia 方案 B 实施计划。
- [CHANGELOG.md](./CHANGELOG.md)：优化更新日志。

## 本轮不做的事

- 不改变 GitHub Pages 部署方式。
- 不调整线上 GitHub Pages 配置。
- 不改变主站视觉方向；后续优化继续按独立任务拆分和验证。
