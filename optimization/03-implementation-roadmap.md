# 分阶段实施路线

## 原则

- 每一阶段都只做一类改动，完成后立即执行 `npm run build`。
- 优先移动代码，不改变行为；行为变化必须单独列出。
- 每阶段保留可回滚边界，避免一次性重构导致难以定位问题。
- 所有文件读写保持 UTF-8。

## Phase 0：基线确认

目标：在改动前固定当前行为与风险基线。

任务：
- 运行 `npm run build`，确认当前可构建。
- 记录当前主要页面：overview、library、detail、index、repository。
- 记录当前安全点：`v-html`、外链、`npm audit`、workflow 权限。

验收：
- [ ] `npm run build` 通过。
- [ ] 当前页面可在 `npm run preview` 中访问。
- [ ] 已记录现有 `v-html` 位置和外链位置。

## Phase 1：抽离无 UI 风险的纯逻辑（已完成）

目标：先拆分最不容易影响页面的代码。

任务：
- 把 `dictionary` 与 `languages` 移到 `src/i18n/`。
- 把 `assetUrl()`、`compareYear()`、`unique()`、图片失败 key 逻辑移到 `src/utils/`。
- 把主题逻辑移到 `usePreferencesStore`。
- 保持现有 class 名，降低视觉回归风险。

验收：
- [ ] 页面文案三语切换一致。
- [ ] 图片路径仍兼容 `/angelphilia-library/`。
- [ ] 明暗主题和 system 主题一致。
- [ ] `npm run build` 通过。

## Phase 2：抽离业务状态 store（已完成）

目标：把筛选、路由、详情加载从 `App.vue` 移出。

任务：
- 新增 Vue Router hash history 管理四个页面路由。
- 新增 `useLibraryStore` 管理筛选条件、过滤结果、详情 fetch、cache、loading、error。
- 移除手写 `hashchange` 监听器，避免组件重挂载后重复监听。

验收：
- [ ] 搜索、馆别、年份、来源筛选一致。
- [ ] 最近条目点击后进入馆藏页并筛选对应名称。
- [ ] 详情页打开、返回后滚动位置恢复。
- [ ] 详情加载失败时仍显示错误文案。
- [ ] `npm run build` 通过。

## Phase 3：拆分页面与组件（已完成）

目标：把 `App.vue` 缩小为 shell 和路由分发。

任务：
- `App.vue` 保留顶层布局。
- 拆分 `SideNav.vue`、`OverviewPage.vue`、`LibraryPage.vue`、`IndexPage.vue`、`RepositoryPage.vue`。
- 拆分 `LibraryFilters.vue`、`RecordCard.vue`、`RecordDetail.vue`、`RecordGallery.vue`。
- `App.vue` 只负责组装 shell、`RouterView` 和 footer。

验收：
- [ ] `App.vue` 不再包含大段页面模板和三语字典。
- [ ] 四个主页面视觉与交互保持一致。
- [ ] Element Plus 表格、轮播、空态正常。
- [ ] `npm run build` 通过。

## Phase 4：安全加固（部分完成）

目标：降低 GitHub Pages 静态站点的 XSS、外链和供应链风险。

任务：
- 移除 repository 文案的 `v-html`。
- 新增详情 HTML sanitize 流程。
- 增加外链安全封装或工具函数。
- CSP、CI audit 和安全 checklist 可作为后续独立提交，避免与架构重构混合。

验收：
- [ ] 全仓库只剩详情页一个受控 `v-html`。
- [ ] 危险标签和危险 URL 被过滤。
- [ ] 外链全部具备 `noopener noreferrer`。
- [ ] CSP 不影响页面、图片、详情 HTML。
- [ ] `npm audit --audit-level=moderate` 通过。
- [ ] `npm run build` 通过。

## Phase 5：样式拆分（部分完成）

目标：降低 `src/styles.css` 的维护成本。

任务：
- [x] 新建 `src/styles/index.css` 汇总引入。
- [x] 将旧 `src/styles.css` 拆分为 `tokens.css`、`base.css`、`layout.css`、`pages.css`、`detail.css`、`body-builder.css`、`footer.css`、`drawer.css`、`responsive.css`。
- 保持 class 名与 DOM 结构不变。

验收：
- [ ] 桌面端布局无明显位移。
- [ ] 窄屏侧栏、筛选器、表格、详情页无遮挡。
- [ ] 明暗主题一致。
- [ ] `npm run build` 通过。

## Phase 6：测试与文档补齐（进行中）

目标：让后续优化有稳定回归手段。

任务：
- [x] 增加最小 Playwright 检查：页面加载、筛选、详情打开、语言切换、主题切换。
- [x] 更新 `spec/global/architecture.md` 与 `spec/global/constraints.md`，记录拆分后的架构。
- [x] GitHub Pages CI 增加 `npm audit --audit-level=moderate`、`validate:body-parts` 和 Playwright smoke。
- [x] 移除 Element Plus icons 全量注册，页面路由改为 lazy imports，主 JS chunk 由约 1072KB 降至约 502KB；当前静态数据站点阈值设为 550KB。
- 视实际情况把本方案沉淀为正式 feature spec。

验收：
- [ ] 自动化检查覆盖核心路径。
- [ ] 架构文档与实际目录一致。
- [ ] CI 至少覆盖 audit + build。

## 建议执行顺序

```text
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6
```

其中 Phase 4 安全加固也可以提前到 Phase 2 后执行；但不建议在 Phase 3 大量组件拆分时同步修改 sanitize、CSP 和 workflow，避免回归定位复杂。

## 回滚策略

- Phase 1/2：如果行为异常，优先回滚对应 composable 或 util 文件与 `App.vue` 调用点。
- Phase 3：组件拆分应按页面逐个提交，单页异常只回滚对应 page/component。
- Phase 4：CSP 最容易影响资源加载，应单独提交；如线上异常，先回滚 CSP，再排查具体资源策略。
- Phase 5：样式拆分只移动 CSS，不改选择器；若视觉异常，先恢复原 `styles.css` 引入。
