# 配件阁数据来源记录

> 本文件仅供维护者核对配件数据来源，不在网页中展示。

## 来源索引

| sourceId | 用途 | 等级 | 误差 | 记录方式 |
|----------|------|------|------|----------|
| network-body-size-chart | 身体围度：胸围、腰围、臀围、大腿围 | C | 约 1cm | 来自网络测量资料整理，仅在数据中保留泛化 sourceId |
| network-head-girth-chart | 头围 | C | 约 0.5cm | 来自网络测量资料整理，仅在数据中保留泛化 sourceId |
| network-eye-size-chart | 眼珠适配规格 | C | 未标注 | 来自网络测量资料整理，仅在数据中保留泛化 sourceId |
| network-obitsu-baseline | Obitsu 默认骨架、小腿、手臂、脚等基准件 | A | 未统一标注 | 来自公开基准资料整理，仅在数据中保留泛化 sourceId |

## 当前数据口径

- 网页不展示来源说明，只展示尺寸、配件和误差备注。
- `bodyParts.json`、`headParts.json` 保留 `sourceId` 用于维护和校验。
- `partSources.json` 仅作为校验脚本引用，不作为运行时网页展示来源。
- `Type-C1 大腿` 不作为独立部件记录；当前按 `Type-C 大腿` 处理。
- 具体网站、平台、作者、截图或原链接不写入网页文案、复制内容和运行时可见信息。
