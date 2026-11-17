# 整体前端优化执行计划

设计：[spec-design.md](./spec-design.md)。本轮按用户“继续处理”及此前直接执行授权推进，本地保留。

### Task 1: 安全与资料正确性

涉及 `src/utils/sanitizeHtml.js`、`records.js`、`outfitText.js`、`src/stores/library.js`、`tests/content-utils.test.mjs`、`tests/optimization.spec.js`。

**执行步骤:**
- [x] 修复嵌套 HTML 清理、危险元素和 URL 白名单；修复发行年份排序及跨度；移除详情正文硬截断。
**检查步骤:**
- [x] `npm.cmd run test:unit`：21 项通过，包含年份、全文边界与既有测试；HTML 的真实 DOM 边界在 Task 7 浏览器验收。

### Task 2: 首页按需加载

涉及 `scripts/summarize-library.mjs`、`src/data/librarySummary.json`、`src/utils/catalogData.js`、`src/stores/library.js`、`src/router/index.js`、`src/App.vue`、`package.json`。

**执行步骤:**
- [x] 生成小摘要，完整馆藏按路由异步读取，合并并发读取；导航加载和失败提示可重试。
**检查步骤:**
- [x] `node scripts/summarize-library.mjs --check`：328 条、2008–2026，与三个源索引一致；Task 7 验证首页请求和生产 chunk。

### Task 3: 外装分页与多语言

涉及 `src/pages/OutfitsPage.vue`、`src/utils/outfitText.js`、`outfitCategory.js`、`src/i18n/dictionary.js`、`src/stores/preferences.js`。

**执行步骤:**
- [x] 外装 24 条追加、预生成搜索文本；分类用稳定 ID；中英日标题/分类随语言切换，原文明确日文，document lang 同步。
**检查步骤:**
- [x] `npm.cmd run test:unit`：分类稳定性、标题语言、长正文通过；Task 7 验证分批及全量搜索。

### Task 4: 术语页三语

涉及 `src/pages/GlossaryPage.vue`、`src/i18n/glossary.js`。

**执行步骤:**
- [x] 补齐三语页面、品牌、历史、术语、运营及来源标签，保留原资料链接。
**检查步骤:**
- [x] `npm.cmd run test:unit`：23 项通过，含三语结构、引用和内容完整性；Task 7 验证切换与窄屏。

### Task 5: 稳定详情地址

涉及 `src/pages/LibraryPage.vue`、`LimitedPage.vue`、`IndexPage.vue`、`src/composables/useRecordRoute.js`；侧栏沿用原来的全量筛选入口。

**执行步骤:**
- [x] 馆藏、限定采用 query.record；处理直达、刷新、返回、前进、无效标识，并保留列表状态。
**检查步骤:**
- [x] `npm.cmd run test:e2e -- tests/optimization.spec.js --workers=1`：生产 Pages 子路径 8 项通过，含直达、刷新、前进后退、无效标识。

### Task 6: 配件阁拆分与构建验收流程

涉及 `src/pages/BodyBuilderPage.vue`、`src/composables/useBodySelection.js`、`usePartPreview.js`、`scripts/test-unit.mjs`、`.github/workflows/pages.yml`、`playwright.config.js`、`spec/global/constraints.md`、`architecture.md`、`docs/前端优化维护约定.md`。

**执行步骤:**
- [x] 提取选择计算与预览逻辑；增加跨平台单元测试入口；CI 验证生产产物；同步静态资源、失败恢复、路由与状态文档。
**检查步骤:**
- [x] `npm.cmd run test:unit`（23 项）、`npm.cmd run validate:body-parts`：全部通过；配件阁浏览器行为在 Task 7 回归。

### Task 7: 整体前端优化 Acceptance

前置：独立 Playwright 串行，输出写入系统临时目录；保留用户现有 5107 服务。

**End-to-end verification:**
- [x] `node scripts/cache-catalog-covers.mjs --check`、`node scripts/summarize-library.mjs --check`：156/156 封面有效，328 条摘要一致。
- [x] `npm.cmd run test:unit`（23 项）、`npm.cmd run validate:body-parts`、`git diff --check`：通过。
- [x] `node --input-type=module -e 'import {build} from "vite"; await build({build:{write:false}})'`：编译通过。最终生产入口 415.39 KB / gzip 144.19 KB（此前 gzip 约 274 KB）；三个完整馆藏模块独立异步打包，浏览器确认首页未请求。
- [x] 临时目录构建 Pages 子路径生产产物，通过 `PLAYWRIGHT_BASE_URL` / `PLAYWRIGHT_PREVIEW=1` 与外部预览运行完整 Playwright CLI：24/24 通过（43.5 秒），覆盖安全 DOM、三语 320/390px 明暗主题、383 条外装、直达刷新与历史导航、失败恢复、配件阁及已有图片测试。
- [x] `git status --short`、`git worktree list`、临时路径与进程检查：只保留正式改动；本轮临时构建、3 组测试输出和预览均已清理；仍在原 develop、无新增 worktree；用户 5107 服务 HTTP 200。

## 验收记录

- 7 / 7 Tasks 完成，23 项单元测试、24 项完整生产浏览器回归、资料/封面/摘要校验通过。328 个馆藏详情标识均非空且唯一。
- QA 对照设计检查：仅前端静态资料与页面改动；唯一 fetch 用于本站详情 HTML；原始馆藏数据未修改，上一轮正式封面完整保留；无 commit、push、部署或分支切换。
- 首轮两项测试定位失败：限定档案的 HTML 位于关闭的原文折叠区；正文也包含 h2，标题定位需限定 `.detail-head h2`。完善真实入口与定位后，专项 8/8 和最终完整 24/24 通过，未弱化安全断言。
- 构建仍有既有 Rollup PURE 注释和较大异步资料 chunk 提示；首页不再提前请求这些数据。商品原始日文描述与未有可靠译法的专名保留，常用外装标题及界面随语言切换。
- 三语更新日志已并入 2026-11-17 今日优化记录。旧历史计划的未验收项保持原状态，不擅自勾选。
- 本轮实际读取并应用：`agent`、`sdd-brainstorming`、`sdd-writing-plans`、`sdd-executing-plans`、`karpathy-guidelines`、`ux`、`frontend`、`tester`、`qa`；全局 `dev-mcp-orchestrator` 不存在，由 agent 补位；按本次继续执行授权推进，无重复确认。
