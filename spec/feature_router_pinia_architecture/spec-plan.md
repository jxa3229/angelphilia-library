# Vue Router + Pinia 架构升级执行计划

**目标:** 将 `App.vue` 单文件集中结构升级为 Vue Router + Pinia + 页面组件分层结构。

**技术栈:** Vue 3.5、Vue Router 4、Pinia、Element Plus、Vite 6。

**设计文档:** `spec/feature_router_pinia_architecture/spec-design.md`

---

### Task 1: SDD 与优化文档

**涉及文件:**
- 新建: `spec/feature_router_pinia_architecture/spec-design.md`
- 新建: `spec/feature_router_pinia_architecture/spec-plan.md`
- 新建: `optimization/04-scheme-b-implementation-plan.md`
- 修改: `spec/global/architecture.md`
- 修改: `spec/global/constraints.md`
- 修改: `optimization/README.md`

**执行步骤:**
- [x] 新增 feature 级 SDD design 和 plan，记录方案 B 的目标、边界、架构和验收。
- [x] 将中文优化目录迁移为 `optimization/`，新增方案 B 实施计划。
- [x] 更新全局 spec，记录 Vue Router + Pinia 与 `public/details/{detailKey}.html` 的真实架构。

**检查步骤:**
- [x] 验证 feature SDD 文件存在
  - `Test-Path spec/feature_router_pinia_architecture/spec-design.md; Test-Path spec/feature_router_pinia_architecture/spec-plan.md`
  - 预期: 两项均返回 `True`
- [x] 验证优化目录已英文化
  - `Test-Path optimization; Test-Path 优化`
  - 预期: `optimization` 为 `True`，`优化` 为 `False`

---

### Task 2: Router 与 Pinia 基础

**涉及文件:**
- 修改: `package.json`
- 修改: `package-lock.json`
- 修改: `src/main.js`
- 新建: `src/router/index.js`
- 新建: `src/stores/preferences.js`
- 新建: `src/stores/library.js`

**执行步骤:**
- [x] 安装 `vue-router@4` 和 `pinia`。
- [x] 在 `main.js` 注册 Pinia、Vue Router 和 Element Plus。
- [x] 建立 hash router 和 preferences/library 两个 Pinia store。

**检查步骤:**
- [x] 验证依赖声明
  - `node -e "const p=require('./package.json'); console.log(Boolean(p.dependencies['vue-router']&&p.dependencies.pinia))"`
  - 预期: 输出 `true`
- [x] 验证不再手写 hashchange
  - `rg -n "hashchange|location.hash|window.location" src`
  - 预期: 无匹配

---

### Task 3: 页面与组件拆分

**涉及文件:**
- 修改: `src/App.vue`
- 新建: `src/pages/OverviewPage.vue`
- 新建: `src/pages/LibraryPage.vue`
- 新建: `src/pages/IndexPage.vue`
- 新建: `src/pages/RepositoryPage.vue`
- 新建: `src/components/layout/SideNav.vue`
- 新建: `src/components/layout/ThemeSwitcher.vue`
- 新建: `src/components/layout/LanguageSwitcher.vue`
- 新建: `src/components/library/LibraryFilters.vue`
- 新建: `src/components/library/RecordCard.vue`
- 新建: `src/components/library/RecordDetail.vue`
- 新建: `src/components/library/RecordGallery.vue`

**执行步骤:**
- [x] 将 `App.vue` 缩减为 shell + `RouterView`。
- [x] 将 overview/library/index/repository 拆为页面组件。
- [x] 将侧边栏、语言、主题、筛选、卡片、详情和轮播拆为组件。

**检查步骤:**
- [x] 验证 `App.vue` 不再包含页面级大段模板
  - `rg -n "route ===|hashchange|repoText|dictionary|const lang|selectedGroup" src/App.vue`
  - 预期: 无匹配
- [x] 验证页面和组件文件存在
  - `Test-Path src/pages/OverviewPage.vue; Test-Path src/components/library/RecordDetail.vue; Test-Path src/components/layout/SideNav.vue`
  - 预期: 三项均返回 `True`

---

### Task 4: i18n、utils、安全渲染与样式入口

**涉及文件:**
- 新建: `src/i18n/dictionary.js`
- 新建: `src/i18n/languages.js`
- 新建: `src/utils/assetUrl.js`
- 新建: `src/utils/records.js`
- 新建: `src/utils/sanitizeHtml.js`
- 新建: `src/styles/index.css`

**执行步骤:**
- [x] 将三语文案和语言列表迁移出 `App.vue`。
- [x] 将资源 URL、年份排序、图片失败 key 和 sanitize 逻辑集中到 utils。
- [x] 将主样式入口切换为 `src/styles/index.css`。
- [x] 移除 repository 非必要 `v-html`，详情页保留唯一受控入口。

**检查步骤:**
- [x] 验证 `v-html` 仅保留详情入口
  - `rg -n "v-html" src`
  - 预期: 仅匹配 `src/components/library/RecordDetail.vue`
- [x] 验证外链安全属性
  - `rg -n "target=\"_blank\"" src`
  - 预期: 匹配项同时包含 `rel="noopener noreferrer"`

---

### Task 5: Build Acceptance

**Prerequisites:**
- Start command: 无需启动服务，使用 Vite build 验证。
- Test data setup: `npm run build` 会自动执行 `sync:data`、`sync:details`、`prepare:public`。

**End-to-end verification:**

1. 构建通过
   - `npm run build`
   - Expected: 输出包含 Vite build 完成，无 error
   - On failure: check Task 2-4

2. 依赖安全检查通过
   - `npm audit --audit-level=moderate`
   - Expected: 输出 `found 0 vulnerabilities`
   - On failure: check Task 2

3. GitHub Pages base path 构建通过
   - `$env:BASE_PATH='/angelphilia-library/'; npm run build; Remove-Item Env:BASE_PATH`
   - Expected: 构建通过且资源使用 `/angelphilia-library/` base
   - On failure: check Task 2 router/base 配置
