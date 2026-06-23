# 配件阁 / MJD Body Builder 执行计划

**目标:** 在导航栏新增“配件阁”工具，支持自选 MJD 身体配件，按 cm 汇总尺寸；配件数据来源单独记录在 Markdown，网页不展示来源说明。

**技术栈:** Vue 3.5、Vue Router 4、Pinia、Element Plus、Vite 6、静态 JSON。

**设计文档:** `spec/feature_20260618_F001_mjd-body-builder/spec-design.md`

---

### Task 1: 数据来源脱敏与静态资料

**涉及文件:**
- 新建: `src/data/bodyParts.json`
- 新建: `src/data/headParts.json`
- 新建: `src/data/partSources.json`
- 新建: `scripts/validate-body-parts.mjs`
- 修改: `package.json`
- 修改: `spec/feature_20260618_F001_mjd-body-builder/research-notes.md`

**执行步骤:**
- [x] 建立 `partSources.json`，仅保留泛化 `sourceId`、`label: "网络数据"`、`level`、`note` 和误差。
- [x] 建立 `bodyParts.json`，包含身体配件、默认 `GHH`、Obitsu default、尺寸字段和身体 preset。
- [x] 固定默认选择：G 胸、H 腰臀、H 大腿，`head=null`，`includeHeadMeasurements=false`。
- [x] 录入 Obitsu default frame、小腿、上臂、下臂、手、脚等默认槽位。
- [x] 录入 C1/G/H/I 的胸、腰臀、大腿数据；C2/C3/C4/C5/C6/F/H2/H3/H4/H5 仅录胸部数据。
- [x] 建立 `headParts.json`，录入 G/H/J/K/L/M/N/O/P/Q/R/S 头围。
- [x] 录入 G/H/J/K/L/M/N/O/Q/R/S eye size，P 型保持 `pending`。
- [x] 新增 `validate-body-parts.mjs`，校验 ID、sourceId、单位、默认值、P 型 eye size 和来源脱敏。
- [x] 在 `package.json` 增加 `validate:body-parts` 脚本。

**检查步骤:**
- [x] `npm run validate:body-parts` 输出校验通过。
- [x] `partSources.json` 中所有 `label` 都是“网络数据”。
- [x] `bodyCodes.defaultCode === "GHH"`。
- [x] P 型 eye size 为 pending / empty。

---

### Task 2: 尺寸与组合码工具

**涉及文件:**
- 新建: `src/utils/measurements.js`
- 新建: `src/utils/bodyCode.js`

**执行步骤:**
- [x] 实现 `buildMeasurementSummary`，合并当前身体选择、默认槽位和头部开关。
- [x] 实现 `buildMissingRows`，网页仅处理缺失项和误差备注，不展示来源说明。
- [x] 实现 `generateBodyCode`、`parseBodyCode` 和 `buildInitialSelection`。
- [x] 实现一键复制摘要：默认 no head data；插入头型后追加 head girth / eye。

**检查步骤:**
- [x] 计算工具无浏览器依赖。
- [x] 默认复制摘要包含 `Body GHH`、`default Obitsu` 和 `no head data`。
- [x] M 头插入后摘要包含 `head M / head girth 17.4cm / eye 12/6,14/6,14/7`。

---

### Task 3: Router、导航与多语言

**涉及文件:**
- 修改: `src/router/index.js`
- 修改: `src/stores/preferences.js`
- 修改: `src/i18n/dictionary.js`
- 新建: `src/pages/BodyBuilderPage.vue`

**执行步骤:**
- [x] 新增 `BodyBuilderPage.vue`。
- [x] 在 `src/router/index.js` 新增 `body-builder` 路由。
- [x] 在 `usePreferencesStore.navItems` 加入 `body-builder` 导航项。
- [x] 在 `dictionary.js` 补充中文、English、日本語导航和页面文案。

**检查步骤:**
- [x] 静态搜索可找到 `body-builder`、`BodyBuilderPage` 和 `navBodyBuilder`。

---

### Task 4: 页面组件与 UI 行为

**涉及文件:**
- 新建: `src/components/body-builder/BodyPresetSelector.vue`
- 新建: `src/components/body-builder/BodyPartSelector.vue`
- 新建: `src/components/body-builder/PartsAtelier.vue`
- 新建: `src/components/body-builder/HeadPartSelector.vue`
- 新建: `src/components/body-builder/MeasurementSummary.vue`
- 新建: `src/components/body-builder/BodyCodeCopy.vue`
- 修改: `src/pages/BodyBuilderPage.vue`
- 修改: `src/styles/`

**执行步骤:**
- [x] 实现默认 `GHH` 首屏和“当前”标注。
- [x] 实现所有身体槽位手动切换。
- [x] 实现未选槽位 `Obitsu default` 展示。
- [x] 实现头型选择和“插入头部数据”开关。
- [x] 实现尺寸汇总和缺失项状态；来源面板已按后续约束移除。
- [x] 实现配件阁卡片列表。
- [x] 实现一键复制和剪贴板 fallback。
- [x] 补充响应式样式。

**检查步骤:**
- [x] `rg -n "v-html" src` 不新增不受控 HTML 渲染。
- [x] `rg -n "target=\"_blank\"" src/components/body-builder src/pages/BodyBuilderPage.vue` 无新增外链。

---

### Task 5: Spec 与全局资料

**涉及文件:**
- 修改: `spec/feature_20260618_F001_mjd-body-builder/research-notes.md`
- 修改: `spec/feature_20260618_F001_mjd-body-builder/spec-design.md`
- 修改: `spec/feature_20260618_F001_mjd-body-builder/spec-plan.md`
- 修改: `spec/global/features.md`
- 修改: `spec/global/architecture.md`
- 修改: `spec/global/constraints.md`
- 新建: `spec/feature_20260618_F001_mjd-body-builder/part-sources.md`

**执行步骤:**
- [x] 清理本功能 spec 中具体来源名、URL、平台、作者和截图来源说明。
- [x] 新增 `part-sources.md`，来源只供维护者核对，不进入网页。
- [x] 更新 `spec/global/features.md` 登记“配件阁 / 拼娃尺寸”。
- [x] 更新 `spec/global/architecture.md` 记录新增静态资料文件和尺寸计算工具。
- [x] 更新 `spec/global/constraints.md` 记录来源脱敏和静态校验约束。

**检查步骤:**
- [x] `rg -n "拼娃尺寸|bodyParts|measurements|配件阁" spec/global` 有匹配。
- [x] 本功能 spec、数据、组件和工具文件中无具体来源 URL、平台名、作者名或截图来源说明。

---

### Task 6: 构建与浏览器验收

**End-to-end verification:**

- [x] `npm run validate:body-parts`
- [x] `npm run build`
- [x] 导航进入配件阁。
- [x] 默认 `GHH`。
- [x] 头围默认不出现。
- [x] 选择 M 头并开启头部数据后显示 head girth / eye size。
- [x] 网页不展示来源说明。
- [x] 一键复制不包含来源 URL、平台名或作者名。
