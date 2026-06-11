# 项目架构约束

![技术栈概览](./images/06-tech-stack.png)

## 技术栈

- **语言:** JavaScript ESM、Vue SFC、CSS。
- **前端框架:** Vue 3.5。
- **UI 库:** Element Plus 2.8。
- **后端框架:** （未检测到）。
- **数据库:** （未检测到）。
- **缓存:** （未检测到）。
- **构建工具:** Vite 6。
- **包管理器:** npm，使用 `package-lock.json` 固定依赖。
- **文档转换:** `mammoth` 用于 docx 转 HTML。

## 架构决策

- **目录结构:** `src/` 放运行时应用，`scripts/` 放构建前数据准备脚本，`records/` 放原始档案，`public/` 放 Vite 会复制的静态资源。
- **分层架构:** 静态站点，无后端 API；数据准备在 Node 脚本阶段完成，浏览器运行时只读取打包 JSON 和 public JSON。
- **状态管理:** 当前无 Vuex/Pinia，`App.vue` 使用 Composition API `ref/computed/watch` 管理局部状态。
- **通信模式:** 浏览器运行时仅通过 `fetch(details.json)` 读取本地静态文件。

## API 风格

- **风格:** 无后端 API；运行时读取静态 JSON。
- **认证方式:** 无认证。
- **错误处理:** 图片加载失败记录到 `failedImages` 后过滤；详情 JSON 当前应保证在 dev/build 中生成，避免详情页空态误判。

## 编码规范

- **编码:** 所有文件读写显式使用 UTF-8，避免 Windows PowerShell 默认编码导致中文/日文乱码。
- **命名约定:** `records.json` 中条目使用 `safeFolder` 和 `detailKey` 关联 `public/media/` 与 `details.json`。
- **文件组织:** 新增数据生成能力优先放入 `scripts/`，不要把 docx 转换逻辑放到浏览器运行时。
- **资源路径:** 所有运行时图片路径应指向 `media/{safeFolder}/...`，并通过 `assetUrl()` 结合 `import.meta.env.BASE_URL` 生成部署路径。

## 部署方式

- **环境:** GitHub Pages 静态部署。
- **CI/CD:** `.github/workflows/pages.yml` 在 `main` / `master` 推送和手动触发时执行 `npm ci`、`npm run build`、上传 `dist/`。
- **构建前置:** `build` 必须同步馆藏数据、详情 JSON 和 public 静态资源，确保 `dist/details.json` 与 `dist/media/` 覆盖所有条目。

## 安全约束

- **内容来源:** 页面展示本地维护的档案内容和外部来源链接；外链使用 `target="_blank"` 时应保留 `rel="noreferrer"`。
- **HTML 渲染:** 详情页使用 `v-html` 渲染由本地 docx 生成的 HTML；不应直接渲染未审查的远程 HTML。
- **静态构建:** 不在仓库提交 `dist/`、`public/media/`、`public/records/` 等生成产物。

---
*最后更新: 2026-06-11 — 初始化生成*
