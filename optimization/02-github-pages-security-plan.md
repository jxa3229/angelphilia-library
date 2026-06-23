# GitHub Pages 静态站点安全加固计划

## 安全背景

本项目部署在 GitHub Pages，没有后端、数据库、登录态和服务端鉴权。安全重点不是传统服务端入侵，而是：

- 静态公开数据是否包含不应公开的信息。
- 构建产物中的 HTML 是否可能触发 XSS。
- 外链和图片资源是否带来跳转、跟踪或内容注入风险。
- GitHub Actions 是否具备最小权限。
- 依赖链是否有已知漏洞。

当前 `npm audit --audit-level=moderate` 检查结果为 0 vulnerabilities，但这只能说明已知依赖漏洞未命中，不能覆盖内容安全和配置安全。

## 当前风险点

### 1. `v-html` 渲染详情内容

`src/App.vue` 中详情页通过 `v-html` 渲染由 `record.docx` 转换出的 HTML。虽然来源是本地维护的 docx，不是远程用户输入，但 GitHub Pages 上任何构建产物都是公开可执行内容，一旦 docx 或转换脚本引入危险标签，就可能产生 XSS。

风险等级：高。

建议：
- 构建期在 `scripts/extract-docx-details.mjs` 对 `record.md` 生成的 HTML 做白名单 sanitize。
- 浏览器端 `RecordDetail.vue` 渲染前再调用 `sanitizeHtml()` 做防御性处理。
- 白名单只允许内容展示所需标签，例如 `p`、`h1-h4`、`ul`、`ol`、`li`、`strong`、`em`、`a`、`img`、`table`、`thead`、`tbody`、`tr`、`th`、`td`。
- 禁止 `script`、`style`、`iframe`、`object`、`embed`、内联事件属性和 `javascript:` URL。

### 2. 仓库说明页使用 HTML 字符串

当前 `repoText` 是带 `<a>` 的字符串，并通过 `v-html` 渲染。这个位置不需要动态 HTML。

风险等级：中。

建议：
- 改为结构化文案，例如 `{ prefix, href, label, suffix }`。
- 模板中使用普通 `<a>` 和 mustache 文本渲染，移除该处 `v-html`。

### 3. 外链打开新窗口

当前外链已有 `rel="noreferrer"`，建议统一为 `rel="noopener noreferrer"`，并集中封装 `SafeExternalLink.vue`。

风险等级：中。

建议：
- 所有 `target="_blank"` 必须带 `rel="noopener noreferrer"`。
- 对外链协议做 allowlist：仅允许 `https:`，必要时允许 `mailto:`。

### 4. Content Security Policy

GitHub Pages 不能像自托管服务一样灵活配置响应头。可在 `index.html` 增加 meta CSP，作为前端层面的约束。

风险等级：中。

建议初始策略：

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests"
/>
```

说明：
- Element Plus 和现有 CSS 可能需要保留 `style-src 'unsafe-inline'`。
- GitHub Pages meta CSP 无法覆盖所有响应头能力，例如 `frame-ancestors`。
- CSP 实施前必须本地 build + preview 验证页面、图片、详情 HTML 是否正常。

### 5. 静态数据公开边界

GitHub Pages 上的 `dist/`、`public/`、图片、详情 HTML、JSON 都是公开资源。不能把任何私密联系方式、未授权图片、未公开资料、账号密钥或 token 放入这些文件。

风险等级：高。

建议：
- 增加发布前 checklist：检查 `records/`、`public/`、`src/data/records.json`、`dist/` 不含 secret、个人隐私、未授权内容。
- `.gitignore` 保持忽略 `dist/` 和生成产物。
- 文案中的联系方式如需公开，应确认这是项目维护者主动公开的信息。

### 6. GitHub Actions 权限与供应链

当前 workflow 权限包含：

- `contents: read`
- `pages: write`
- `id-token: write`

这符合 GitHub Pages deploy 的常见最小权限模式。后续不应扩大为 `contents: write`，除非有明确自动提交需求。

建议：
- 保持 `npm ci`，不使用 `npm install`。
- 保持 `package-lock.json` 入库。
- 增加 CI 检查：`npm audit --audit-level=moderate`、`npm run build`。
- Actions 使用官方 action 时定期升级版本；如安全要求更高，可 pin 到 commit SHA。

## 推荐安全任务清单

1. 新增 HTML sanitize 方案，优先构建期 sanitize，运行时防御性 sanitize。
2. 移除非必要 `v-html`，只保留详情内容一个受控入口。
3. 新增 `SafeExternalLink.vue` 或 `safeExternalUrl()`。
4. 在 `index.html` 增加 meta CSP，并验证 GitHub Pages 兼容性。
5. 增加 `npm audit --audit-level=moderate` 到 CI。
6. 增加发布前公开数据 checklist。
7. 增加 `SECURITY.md` 或 `docs/security-checklist.md`，说明静态站点安全边界。

## 安全验收标准

- [ ] 全仓库只剩一个受控的 `v-html` 渲染入口。
- [ ] 详情 HTML 经过白名单 sanitize。
- [ ] 所有外链均带 `rel="noopener noreferrer"`。
- [ ] `javascript:`、`data:text/html` 等危险 URL 不会进入可点击链接。
- [ ] `npm audit --audit-level=moderate` 通过。
- [ ] `npm run build` 通过。
- [ ] GitHub Actions 权限未扩大。
- [ ] 发布前确认 `dist/` 可公开内容不含 secret 或隐私数据。
