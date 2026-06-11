# 架构全景

![系统架构](./images/03-system-architecture.png)

## 系统组件

- **Vue 3 单页应用:** `src/App.vue` 承担路由状态、筛选、馆藏卡片、完整索引、详情页和主题/语言切换。
- **Element Plus:** 提供按钮、输入框、选择器、表格、轮播、空态和 tooltip 等 UI 组件。
- **数据生成脚本:** `scripts/extract-library-data.mjs` 从 `index_local.html` 同步馆藏 JSON；`scripts/extract-docx-details.mjs` 使用 `mammoth` 把每条 `record.docx` 转为 HTML；`scripts/prepare-public.mjs` 复制 records 静态资源。
- **静态资源目录:** `public/media/` 保存可部署图片与档案副本，`public/details.json` 保存详情页 docx HTML。
- **部署流水线:** GitHub Actions 在 main/master 推送后构建并上传 `dist/` 到 Pages。

## 模块划分

- **应用入口:** `src/main.js` 初始化 Vue、Element Plus 与全局图标。
- **主页面:** `src/App.vue` 负责所有页面状态，当前采用 hash route：`overview`、`library`、`index`、`repository`。
- **样式系统:** `src/styles.css` 定义明暗主题、侧边栏、馆藏卡片、详情页、响应式布局。
- **数据源:** `src/data/records.json` 是运行时打包进 JS 的馆藏索引；`public/details.json` 是详情页按需 fetch 的静态 JSON。
- **原始档案:** `records/` 保存原始图片、`record.docx` 和部分 `record.md`。

## 数据流

![数据流](./images/04-data-flow.png)

1. `index_local.html` 内嵌 JSON 经 `extract-library-data.mjs` 生成 `src/data/records.json`。
2. `records/{folder}/record.docx` 经 `extract-docx-details.mjs` 生成 `public/details.json`。
3. `records/{folder}/images` 经 `prepare-public.mjs` 复制到 `public/media/{safeFolder}/`。
4. Vite 构建时把 `public/` 原样复制到 `dist/`，同时把 `src/data/records.json` 打包进应用 JS。
5. 用户点击条目后，`App.vue` 读取 `activeRecord.detailKey`，从 `details.json` 中取 HTML 并渲染。

## 外部集成

- **mammoth:** Node 侧 docx 转 HTML，运行于构建脚本阶段。
- **GitHub Actions:** Node 20 + npm cache + `npm run build`。
- **GitHub Pages:** 静态托管，`BASE_PATH=/angelphilia-library/` 用于资源前缀。

## 部署拓扑

本项目无后端服务、数据库或容器运行时。部署产物为 `dist/` 静态文件，包含 HTML、JS、CSS、`media/` 和 `details.json` 等公共资源。

---
*最后更新: 2026-06-11 — 初始化生成*
