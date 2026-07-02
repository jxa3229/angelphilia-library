# Angelphilia Library 更新日志

## 2026-07-02

- 优化拼娃尺寸表格展示，移除冗余 tag / 备注列，并为举例素体补充型号与跳转链接。
- 新增 RealArt / JiWu / YAMATO 旧档案同步与审计脚本，补充整娃来源 URL、素体 bodyCode 和来源说明。
- 将整娃核心三段 bodyCode 覆盖率提升到 293 / 321，剩余 28 条保留人工复核清单。

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
