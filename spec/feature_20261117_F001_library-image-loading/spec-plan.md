# 馆藏首屏图片加载优化执行计划

**目标：** 降低首次进入馆藏的图片加载压力，消除外站封面依赖并提供失败恢复。

**技术栈：** Vue 3 / Vite / Pinia / Node / Playwright。

**设计文档：** [spec-design.md](./spec-design.md)。用户已明确授权写计划后直接执行，无须重复确认。

### Task 1: 本站封面缓存

**涉及文件：** `scripts/cache-catalog-covers.mjs`、`src/data/catalogCovers.json`、`public/catalog-covers/`、`package.json`。

**执行步骤:**
- [x] 新增可重复执行的封面缓存脚本，限制并发与超时，校验图片内容，复用已下载文件，失败时保留已有映射；显式运行，不加入 dev/build 外网依赖。
- [x] 缓存 156 张外站封面，保留原资料与图片来源，输出正式映射。

**检查步骤:**
- [x] `node scripts/cache-catalog-covers.mjs --check`：156/156 当前远程封面均有有效本地映射，文件真实存在。

### Task 2: 渐进展示与图片恢复

**涉及文件：** `src/pages/LibraryPage.vue`、`src/components/library/RecordCard.vue`、`src/components/shared/CatalogCard.vue`、`src/i18n/dictionary.js`。

**执行步骤:**
- [x] 接入缓存封面及原图回退；公共卡片增加加载状态、最多一次自动重试及手动重试、异步解码和可配置加载优先级。
- [x] 馆藏按 24 条追加，前 4 张优先加载；保留全量筛选，筛选变化重置批次，详情返回保留数量及桌面/手机位置；补齐三语文案。

**检查步骤:**
- [x] `node --input-type=module -e 'import { build } from "vite"; await build({ build: { write: false } })'`：页面与三语文案生产编译通过；行为在 Task 3 的专门浏览器用例验证。

### Task 3: 回归约定与现有测试适配

**涉及文件：** `tests/library-images.spec.js`、`tests/smoke.spec.js`、`docs/馆藏图片加载约定.md`。

**执行步骤:**
- [x] 新增真实浏览器的临时失败、持续失败、重新联网、离线外站、批次追加/筛选、三语及移动端断言；适配原全量 DOM 数量断言。
- [x] 文档记录缓存更新、首屏请求策略、重试上限及回归命令。

**检查步骤:**
- [x] `node node_modules/@playwright/test/cli.js test tests/library-images.spec.js --workers=1`：5 项首批/追加、失败恢复、筛选和详情返回检查通过。
- [x] `git diff --check`：无新增空白错误。

### Task 4: 馆藏图片加载 Acceptance

**Prerequisites:** 复用本项目 `http://127.0.0.1:5107` 服务；浏览器单进程串行；临时结果放系统 Temp 并在结束后清理。

**End-to-end verification:**
- [x] `Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName }` 枚举为参数数组后执行 `node --test`：18 项既有单元测试通过。
- [x] `npm.cmd run validate:body-parts`：部件资料校验通过。
- [x] `node node_modules/@playwright/test/cli.js test --workers=1 --reporter=line --output=<本轮Temp目录>`：16 项全量页面回归通过；失败定位 Task 2/3。
- [x] 使用 `BASE_PATH=/angelphilia-library/` 的 Vite `build({ build: { write: false } })`：生产编译通过，不重新同步资料；另以 Vite build 临时产物在 5108 端口执行 5 项 Pages 子路径回归，156 张封面全部解码成功，320px 三语/明暗主题 6 组检查通过，0 runtime errors。
- [x] `git status --short` 与临时路径检查：仅保留正式功能、156 张封面资源和计划文档；本轮 4 个临时目录及临时配置均已清理，5108 预览已停止；用户 5107 服务保留且 HTTP 200，仍在 develop，无新 worktree。

## 验收结果

- 4 / 4 Tasks 完成。18 项 Node 单元测试、16 项完整浏览器回归、5 项生产 Pages 子路径回归通过。
- 156 / 156 张外站封面已缓存并通过浏览器图片解码；320px 下中英日与亮暗主题共 6 组检查通过，0 runtime errors。
- 部件资料校验、生产编译与 `git diff --check` 通过。编译仅有既有 Rollup 注释及大 chunk 提示。
- 本轮保持本地修改，不 commit、push 或部署；原始详情画廊继续使用原有图片来源。
