# Feature: router-pinia-architecture

## 需求背景

当前 `angelphilia-library` 是 Vue 3 + Element Plus + Vite 6 的 GitHub Pages 静态站点。改造前 `src/App.vue` 同时承担手写 hash route、页面模板、筛选状态、详情加载、图片失败状态、主题/语言持久化、i18n 文案和安全渲染入口。随着馆藏、详情、安全和文档要求增加，单文件集中结构会提高回归风险，也不利于后续按页面或状态域维护。

## 目标

- 引入 `vue-router@4` 和 `pinia`，把四个主页面、跨页面状态和导航行为拆成明确边界。
- 保持 GitHub Pages 静态部署方式不变，继续使用 hash history 避免刷新 404。
- 保持 `records.json`、`public/media/`、`public/details/{detailKey}.html` 的构建数据链路不变。
- 将非必要 `v-html` 移除，只保留详情页一个受控 HTML 渲染入口并接入白名单 sanitize。
- 更新 `spec/global` 和优化文档，使架构说明与实际代码一致。

## 方案设计

### 路由架构

使用 `createWebHashHistory(import.meta.env.BASE_URL)` 建立静态站点兼容路由，固定暴露 `overview`、`library`、`index`、`repository` 四个页面。默认 `/` 和未知路径重定向到 `overview`。`App.vue` 只保留顶层 shell、`SideNav`、`RouterView` 和 footer，不再监听 `hashchange` 或直接读写 `location.hash`。

### 状态架构

`usePreferencesStore` 管理语言、主题、localStorage 持久化、主题应用和导航文案。`useLibraryStore` 管理馆藏 records 派生数据、筛选条件、active record、图片失败集合、详情 HTML 缓存、loading 和 error。store 内仅保存浏览器运行态，不改变构建期数据生成方式。

### 页面与组件边界

页面拆成 `OverviewPage.vue`、`LibraryPage.vue`、`IndexPage.vue`、`RepositoryPage.vue`。公共组件拆成 `SideNav`、`ThemeSwitcher`、`LanguageSwitcher`、`LibraryFilters`、`RecordCard`、`RecordDetail`、`RecordGallery`、`NoticePanel`。页面负责组合流程，组件负责展示和局部事件，工具函数集中处理资源 URL、年份排序、图片失败 key 和 HTML sanitize。

### 安全策略

仓库说明页不再使用 HTML 字符串渲染链接，改为结构化文本 + 普通 `<a>`。详情页保留唯一受控 `v-html`，渲染前调用 `sanitizeHtml()`，允许常见排版标签并移除 `script`、危险标签、内联事件和 `javascript:` / `data:text/html` URL。所有外链统一使用 `target="_blank"` 和 `rel="noopener noreferrer"`。

### 文档与目录

中文优化目录迁移为 `optimization/`，新增方案 B 实施计划文档。`spec/global/architecture.md` 和 `spec/global/constraints.md` 记录 Vue Router + Pinia 后的真实架构，避免继续描述 `App.vue` 单文件状态和 `details.json` 旧数据形态。

## 实现要点

- 先安装依赖并注册 `pinia`、`router`，再迁移页面和状态，避免一次性混合改动无法定位。
- 保留现有 DOM class 名和 `src/styles.css`，新增 `src/styles/index.css` 仅做聚合入口，降低视觉回归风险。
- `IndexPage` 点击记录后跳转到 `library` 并复用 `activeRecord` 打开详情。
- `LibraryPage` 使用 `main-panel` 引用保存和恢复详情返回时的滚动位置。
- `vite.config.js` 的 `base: process.env.BASE_PATH || '/'` 和 GitHub Actions Pages 权限不变。

## 验收标准

- [ ] `npm run build` 通过。
- [ ] `npm audit --audit-level=moderate` 通过。
- [ ] `#/overview`、`#/library`、`#/index`、`#/repository` 可直接访问，刷新不触发 GitHub Pages 404。
- [ ] 搜索、馆别、年份、来源筛选与改造前一致。
- [ ] 最近条目点击后进入馆藏页并筛选到对应记录。
- [ ] 详情图片轮播、`details/{detailKey}.html` 加载和返回列表滚动恢复正常。
- [ ] 中文、English、日本語和 light/dark/system 主题切换刷新后保持。
- [ ] `rg -n "v-html" src` 仅显示详情页受控入口。
- [ ] repository 链接不通过 HTML 字符串渲染，外链包含 `noopener noreferrer`。
