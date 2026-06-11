# src 拆分与前端架构优化方案

## 状态

- 状态：已完成
- 完成日期：2026-06-11
- 实施方案：方案 B，Vue Router + Pinia 架构升级。
- 验收摘要：`src/App.vue` 已缩减为应用 shell；路由、状态、页面、组件、i18n、utils 与受控详情 HTML 渲染已拆分；`npm run build`、`BASE_PATH=/angelphilia-library/ npm run build`、`npm audit --audit-level=moderate` 均已通过。

## 当前问题

`src/App.vue` 同时承担了页面模板、侧边栏、筛选器、馆藏卡片、详情页、索引表格、仓库说明、三语文案、hash route、主题、语言、图片失败状态和详情 HTML fetch。问题不是“行数多”本身，而是职责集中：

- 页面修改容易误伤全局状态。
- i18n 文案与业务逻辑混在一起，不利于校对和新增语言。
- `v-html` 安全点隐藏在页面组件内部，不便统一治理。
- CSS 全局选择器较多，后续新增组件容易产生样式串扰。

## 方案选项

### 方案 A：渐进式拆分现有结构

保留 Vue 3、Element Plus、hash route、现有数据生成链路，只把职责拆到清晰文件中。

优点：
- 改动可分阶段验证，回归风险最低。
- 不影响 GitHub Pages 发布。
- 不需要迁移 Vue Router / Pinia。

缺点：
- 仍然是轻量自管路由和状态，不适合未来非常复杂的页面。

### 方案 B：引入 Vue Router + Pinia（已采用）

把 `overview/library/index/repository` 转为正式路由，状态放入 store。

优点：
- 更接近中大型 Vue 项目结构。
- 路由守卫、页面懒加载、状态调试更标准。

缺点：
- 当前需求下收益有限。
- 增加依赖和迁移成本。

### 方案 C：保持现状，只做局部提取

只提取 i18n 和工具函数，页面模板继续留在 `App.vue`。

优点：
- 改动最小。

缺点：
- 页面组件继续膨胀，后续维护问题仍在。

## 方案 B 目录结构

```text
src/
  router/
    index.js
  stores/
    preferences.js
    library.js
  components/
    layout/
      SideNav.vue
      ThemeSwitcher.vue
      LanguageSwitcher.vue
    library/
      LibraryFilters.vue
      RecordCard.vue
      RecordDetail.vue
      RecordGallery.vue
    shared/
      NoticePanel.vue
      EmptyImage.vue
  pages/
    OverviewPage.vue
    LibraryPage.vue
    IndexPage.vue
    RepositoryPage.vue
  i18n/
    dictionary.js
    languages.js
  utils/
    assetUrl.js
    records.js
    sanitizeHtml.js
  data/
    records.json
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    pages.css
    responsive.css
  main.js
```

## 拆分边界

### 页面层

- `OverviewPage.vue`：速览页、统计条、说明与非官方声明。
- `LibraryPage.vue`：馆藏列表与详情页切换。
- `IndexPage.vue`：完整索引表格。
- `RepositoryPage.vue`：仓库说明、关系说明、非商用声明。

页面层负责组合组件和用户流程，不直接操作 `localStorage`；详情 HTML 加载由 `useLibraryStore` 管理。

### 组件层

- `SideNav.vue`：品牌、语言切换、主题切换、导航、最近条目。
- `LibraryFilters.vue`：搜索框、馆别、年份、来源筛选。
- `RecordCard.vue`：馆藏卡片。
- `RecordDetail.vue`：详情页容器，组合 gallery 和 sanitized HTML。
- `RecordGallery.vue`：详情轮播图片。

组件层应保持展示职责，复杂状态放到 Pinia store。

### Stores

- `usePreferencesStore`：语言、主题、导航文案、localStorage 持久化。
- `useLibraryStore`：筛选条件、筛选结果、active record、图片失败、详情 HTML 加载、缓存、loading、error。

### i18n

把 `dictionary` 从 `App.vue` 移入 `src/i18n/dictionary.js`，把语言列表移入 `src/i18n/languages.js`。文案仍保持简单对象，不引入 vue-i18n。

### Utils

- `assetUrl(path)`：集中处理 `BASE_URL` 和 URL encode。
- `recordImages(record, failedImages)`：集中处理图片候选与失败过滤。
- `sanitizeHtml(html)`：集中处理详情 HTML 白名单。

## CSS 拆分策略

不建议立即 CSS Modules 化。先按职责拆分全局 CSS：

- `tokens.css`：颜色、间距、阴影、字体变量。
- `base.css`：body、按钮基础、链接、通用 reset。
- `layout.css`：app shell、side nav、main panel。
- `components.css`：筛选器、卡片、表格、notice panel、gallery。
- `pages.css`：overview/library/index/repository/detail 页面特定样式。
- `responsive.css`：媒体查询与窄屏适配。

所有 CSS 文件由 `src/main.js` 或 `src/styles/index.css` 汇总引入。

## 保持不变的约束

- 继续使用 Vue 3 + Element Plus + Vite。
- 继续使用 GitHub Pages 静态部署。
- 继续使用 Vue Router hash history，避免 GitHub Pages 刷新 404。
- `records.json` 仍由构建脚本生成，不在浏览器运行时解析 docx。
- 资源路径继续通过 `import.meta.env.BASE_URL` 兼容 `/angelphilia-library/`。
