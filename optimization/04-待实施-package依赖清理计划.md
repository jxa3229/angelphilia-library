# Package 依赖清理计划（待实施）

## 背景

当前 `package.json` 的直接依赖并不多，`node_modules` 中看起来“很多”的包主要来自 `vite`、`vue`、`element-plus` 等正常传递依赖。依赖清理不建议直接删除 `node_modules` 里的传递包，而应从 `package.json` 的直接依赖入手，再通过 `npm install` 重新生成 `package-lock.json`。

本计划只记录待实施方案，本轮不直接修改 `package.json` / `package-lock.json`。

## 当前直接依赖

### dependencies

| 依赖 | 当前判断 | 依据 |
|---|---|---|
| `vue` | 保留 | `src/main.js`、`src/App.vue` 直接使用 Vue 3。 |
| `element-plus` | 保留 | 页面大量使用 `el-button`、`el-table`、`el-select`、`el-carousel`、`el-empty`、`el-tag` 等 Element Plus 组件。 |
| `@element-plus/icons-vue` | 保留 | `src/main.js` 全量注册图标，`src/App.vue` 直接 import `Back`、`Monitor`、`Moon`、`Refresh`、`Right`、`Search`、`Sunny`。虽然它也是 `element-plus` 的传递依赖，但项目直接 import，应继续显式声明。 |
| `mammoth` | 待清理候选 | 当前源码和脚本未发现任何 `mammoth` import / require；`scripts/extract-docx-details.mjs` 已改为读取 `record.md` 并转换 HTML，不再解析 `.docx`。 |

### devDependencies

| 依赖 | 当前判断 | 依据 |
|---|---|---|
| `vite` | 保留 | `dev`、`build`、`preview` 脚本直接使用。 |
| `@vitejs/plugin-vue` | 保留 | `vite.config.js` 使用 Vue 插件构建 `.vue` 单文件组件。 |

## 推荐清理项

### P1：移除未使用的 `mammoth`

判断：可以清理，但建议先作为独立小提交实施。

原因：

- `npm explain mammoth` 显示它只来自 root project 直接依赖。
- `rg` 扫描 `src/`、`scripts/`、`vite.config.js` 未发现使用。
- 当前详情生成链路是 `record.md -> public/details/*.html`，不是 `record.docx -> html`。

待执行命令：

```powershell
npm.cmd uninstall mammoth
npm.cmd run build
```

验收标准：

1. `package.json` 中不再包含 `mammoth`。
2. `package-lock.json` 中不再包含 `node_modules/mammoth` 及其仅由 mammoth 引入的依赖。
3. `npm.cmd run build` 成功。
4. `public/details/*.html` 仍能由 `scripts/extract-docx-details.mjs` 正常生成。

回滚方式：

```powershell
npm.cmd install mammoth
```

## 不建议清理项

### `@element-plus/icons-vue`

虽然 `element-plus` 也依赖 `@element-plus/icons-vue`，但项目代码直接 import 该包。删除直接依赖会变成依赖传递包，维护上不稳，不建议清理。

可做的不是删依赖，而是后续优化图标使用方式：

- 移除 `src/main.js` 中 `import * as ElementPlusIconsVue` 的全量注册。
- 只在组件内按需 import 当前需要的图标。
- 验证 bundle 是否下降。

这属于 bundle 优化，不是 package 依赖删除。

### `element-plus`

当前 UI 组件全面依赖 Element Plus，删除成本高且没有替代方案，不建议清理。

### `vue`

项目核心框架，不能清理。

### `vite` / `@vitejs/plugin-vue`

构建工具链必需，不能清理。

## 待实施步骤

1. 建立独立分支或独立提交，仅处理依赖清理。
2. 执行 `npm.cmd uninstall mammoth`。
3. 执行 `npm.cmd run build`。
4. 检查 `dist/` 构建输出、`public/details/` 详情文件和页面详情加载行为。
5. 如 build 通过，再决定是否进入第二阶段：图标按需注册优化。

## 风险

- 如果后续重新启用 `.docx` 直接解析，可能需要恢复 `mammoth` 或改为 devDependency。
- 当前 `record.docx` 文件仍存在，但构建脚本实际读取的是 `record.md`，因此删除 `mammoth` 不应影响现有构建。
- 图标全量注册会影响 bundle 体积，但清理方式是改代码，不是删除 package，需另开任务验证。
