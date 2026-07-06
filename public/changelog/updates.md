# Angelphilia Library 更新日志

## 2026-07-06

- 新增头型 / 胸配 / 腰 / 大腿预览区，支持按部位、型号和肤色筛选。
- 将预览卡与本地完成品档案关联，显示相关本地档案，并用本地档案参考补齐缺少肤色的预览图。
- 补充 Type-N 褐色头型参考和预览图片数据；当前仍保留 `Head Type-P / Super Whitey`、`Thigh Type-B / Super Whitey` 两项待补资料缺口。

## 2026-07-03

- 新增 AP 外装记录并细化分类规则，补充 `src/data/outfits.json`、外装页展示和分类工具。
- 将外装商品图缓存到 `public/outfits`，新增图片缓存脚本，减少外部图片失效和加载不稳定。
- 同步更新外装数据结构，支持本地图片、来源链接和商品说明在外装详情中稳定展示。

## 2026-07-02

- 优化拼娃尺寸表格展示，移除冗余 tag / 备注列，并为举例素体补充型号与跳转链接。
- 新增 RealArt / JiWu / YAMATO 旧档案同步与审计脚本，补充整娃来源 URL、素体 bodyCode 和来源说明。
- 将整娃核心三段 bodyCode 覆盖率提升到 293 / 321，剩余 28 条保留人工复核清单。

## 2026-06-23

- 新增侧栏更新日志弹窗，支持查看最近 3 条和完整更新记录。
- 修正配件阁来源说明、更新日志文案和相关 spec 记录，清理已废弃的测量来源组件。
- 补充 body builder smoke 测试，优化窄屏布局和配件数据展示。

## 2026-06-22

- 完成优化收尾：样式层拆分为 `tokens/base/layout/pages/detail/body-builder/footer/drawer/responsive`。
- 增加 Playwright smoke、CI audit/build 和 GitHub Pages 部署安全检查。
- 更新优化文档和 package 依赖清理记录。

## 2026-06-18

- 新增配件阁 / 拼娃尺寸工具。
- 加入 MJD 头部、身体配件、尺寸计算、组合码复制、来源说明和资料缺口提示。
- 同步更新 Router、Pinia、i18n、静态资料与全局 spec。

## 2026-06-17

- 为 26 个早期 VMF50 / dollcore / 联动 / YAMATO 旧记录补入可追溯图片。
- 重新生成 `src/data/records.json`、`public/details` 与 `public/media`。
- 少图清单收敛到 2 条。
