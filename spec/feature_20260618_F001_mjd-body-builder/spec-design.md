# Feature: 20260618_F001 - mjd-body-builder

## 需求背景

`angelphilia-library` 是娃娃资料库。MJD 娃娃的头、胸、腰臀、大腿、小腿、手臂、手、脚等部件可拆卸更换，同一成品也可能由不同身体配置组成。用户需要一个可在导航栏进入的工具，自选配件后汇总 cm 尺寸，并复制当前展览数据。

本功能命名为“配件阁 / Parts Atelier”，首版不做 3D 拼装、不新增后端、不新增运行时外部请求。

## 来源记录原则

- UI 和复制内容不写具体网站、平台、链接、作者或截图来源，也不提供来源说明面板。
- 配件数据来源单独维护在 `part-sources.md`，供维护者核对，不作为网页内容。
- 内部保留泛化 `sourceId`：`network-body-size-chart`、`network-head-girth-chart`、`network-eye-size-chart`、`network-obitsu-baseline`。
- `level` 可保留 A/B/C/D/E 用于内部排序，但 UI 不解释具体出处。
- 一键复制只包含当前配置和尺寸摘要，不包含来源。
- `Obitsu` 可作为配件或默认件名称出现，例如 `Obitsu default`，但不作为来源名称展示。

## 用户入口与主流程

1. 导航栏进入 `body-builder` 路由，显示“配件阁”。
2. 页面默认选中 G 胸、H 腰臀、H 大腿，组合码显示 `GHH`，三个槽位标注“当前”。
3. 小腿、上臂、下臂、手、脚、frame 默认使用 `Obitsu default`。
4. 用户可通过 preset 或部件选择器切换所有身体槽位。
5. 头型默认不选，`includeHeadMeasurements=false`；默认尺寸汇总和复制摘要不包含头围。
6. 用户选择头型并打开“插入头部数据”后，尺寸汇总显示头围，头型区显示 eye size。
7. 一键复制默认输出 `Body GHH / default Obitsu frame+arms+shins+hands+feet / no head data`。
8. 插入 M 头后复制摘要追加 `head M / head girth 17.4cm / eye 12/6,14/6,14/7`。

## 数据模型

新增静态资料：

- `src/data/bodyParts.json`：身体配件、默认 `GHH`、Obitsu default、尺寸字段。
- `src/data/headParts.json`：头型、头围和 eye size。
- `src/data/partSources.json`：泛化来源元数据，仅供校验脚本使用。

`partSources.json` 结构：

```json
{
  "sourceId": "network-body-size-chart",
  "label": "网络数据",
  "level": "C",
  "note": "网络测量资料整理",
  "toleranceCm": 1
}
```

`bodyParts.json` 默认选择：

```json
{
  "bodyCodes": {
    "defaultCode": "GHH"
  },
  "defaults": {
    "frame": "frame-obitsu-50-network",
    "initialSelection": {
      "upperTorso": "upper-g-network",
      "lowerTorso": "lower-h-network",
      "thigh": "thigh-h-network",
      "head": null,
      "includeHeadMeasurements": false
    },
    "shin": "shin-obitsu-50-network",
    "upperArm": "upper-arm-obitsu-50-network",
    "forearm": "forearm-obitsu-50-network",
    "hand": "hand-obitsu-50-network",
    "foot": "foot-obitsu-50-network"
  }
}
```

## 尺寸规则

- 单一部件决定的字段直接取该部件值。
- 胸围来自 `upperTorso`；腰围、臀围来自 `lowerTorso`；大腿围来自 `thigh`。
- 未选择的小腿、手臂、手、脚、frame 使用默认件。
- `null` 表示未知，UI 显示“待补充”。
- 不从同字母、同系列或默认件推导缺失数据。
- 头型数据独立于身体组合码。
- P 型头 eye size 保持 `pending`，不得自动补齐。

## 组件设计

- `BodyBuilderPage.vue`：页面容器，维护 selection、body code、汇总和复制摘要。
- `BodyPresetSelector.vue`：默认组合 / preset 选择。
- `BodyPartSelector.vue`：按槽位选择身体部件并标注当前项。
- `HeadPartSelector.vue`：选择头型、显示头围和 eye size，控制是否插入头部数据。
- `MeasurementSummary.vue`：当前配置尺寸汇总。
- `PartsAtelier.vue`：配件阁卡片，展示所有可选配件和已知尺寸。
- `BodyCodeCopy.vue`：组合码、一键复制和剪贴板 fallback。

## 实现约束

- 保持 Vue 3、Vue Router 4、Pinia、Element Plus、Vite 静态站点架构。
- 不新增后端、数据库或运行时外部请求。
- 不新增 `v-html`。
- 不在新增数据文件中保存 URL、平台名、作者名或截图说明。
- 校验脚本必须阻断具体来源文本、缺失 `sourceId`、无单位尺寸和 P 型 eye size 误补。

## 验收标准

- [ ] 导航栏出现“配件阁 / Parts Atelier / パーツアトリエ”入口，并能进入独立页面。
- [ ] 默认组合为 `GHH`，G 胸、H 腰臀、H 大腿标注“当前”。
- [ ] 未选择身体槽位显示 `Obitsu default` 并参与尺寸汇总。
- [ ] 头型默认不选，默认不显示头围。
- [ ] 选择 M 头并开启头部数据后显示 17.4cm 头围和 `12/6,14/6,14/7` eye size。
- [ ] P 型头 eye size 显示“待补充”。
- [ ] 网页不展示来源说明；来源只记录在 `part-sources.md`。
- [ ] 一键复制不包含来源 URL、平台名或作者名。
- [ ] `npm run validate:body-parts` 通过。
- [ ] `npm run build` 通过。
