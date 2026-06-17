# Plan: 20260617_F001 Archive Image Enrichment

## Task 1: Git 与基线确认

**执行步骤:**
- [x] 确认工作区干净并位于 `develop`。
- [x] 执行 `git fetch origin`。
- [x] 执行 `git pull --ff-only origin develop`。

**检查步骤:**
- [x] 确认 `HEAD` 与 `origin/develop` 一致。

## Task 2: 样本补图

**执行步骤:**
- [x] 为 5 条样本检索官方/商店优先图片来源。
- [x] 下载符合条件的图片到对应 `records/{folder}/NN.*`。
- [x] 更新 5 条样本的 `record.md`，记录本地图片、来源 URL、图片 URL 和未采纳候选。

**检查步骤:**
- [x] 确认新增图片文件可识别且非空。
- [x] 确认 5 条样本 `record.md` 为 UTF-8 且中文/日文无乱码。

## Task 3: 数据同步与构建验证

**执行步骤:**
- [x] 执行 `npm run sync:data && npm run sync:details && npm run prepare:public`。

**检查步骤:**
- [x] 统计 5 条样本在 `src/data/records.json` 中的图片数量。
- [x] 执行 `npm run build`。

## Task 4: 前端抽查

**执行步骤:**
- [x] 启动本地预览或开发服务。
- [x] 打开馆藏详情页抽查样本图片轮播。

**检查步骤:**
- [x] 确认样本详情页无 broken image。
- [ ] 确认浏览器控制台无新增资源加载错误。
