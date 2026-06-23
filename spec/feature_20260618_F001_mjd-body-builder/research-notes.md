# MJD Body Builder 基础资料整理

## 来源策略

本功能所有 UI 和复制内容均不写具体网站、平台、链接、作者或截图来源，也不展示来源说明面板。具体来源统一单独记录在 `part-sources.md`，内部仅保留泛化 `sourceId` 供校验引用：

| sourceId | label | level | note |
|----------|-------|-------|------|
| network-body-size-chart | 网络数据 | C | 网络测量资料整理 |
| network-head-girth-chart | 网络数据 | C | 网络测量资料整理 |
| network-eye-size-chart | 网络数据 | C | 网络测量资料整理 |
| network-obitsu-baseline | 网络数据 | A | 网络公开资料整理 |

`level` 仅用于内部可信度排序，不在 UI 中解释具体出处。复制摘要不包含来源信息。

## 名词与范围

| 名称 | 本项目口径 |
|------|------------|
| MJD | Multi Joint Doll / 多关节可动娃娃；本项目重点是 48-50cm 尺寸段。 |
| Head | 头雕/头部，影响头围、眼珠和假发参考，不并入身体组合码。 |
| Upper torso / bust | 胸部外皮或上身部件，决定胸围。 |
| Lower torso / waist-hip | 腰臀外皮或下身部件，决定腰围、臀围。 |
| Thigh / shin | 大腿、小腿外皮，决定大腿围、小腿围。 |
| Arm / hand / foot | 手臂、手、脚部件，影响臂围、手型、脚长和鞋服适配。 |

## 身体尺寸字段

首版以 cm 为单位，保留 0.1cm 精度；未知值显示“待补充”，不能用 0 或空字符串冒充。

| 字段 | 说明 | 主要来源部件 |
|------|------|--------------|
| height | 身长 | frame |
| shoulderWidth | 肩宽 | frame |
| bustCircumference | 胸围 | upperTorso |
| waistCircumference | 腰围 | lowerTorso |
| hipCircumference | 臀围 | lowerTorso |
| thighCircumference | 大腿围 | thigh |
| calfCircumference | 小腿围 | shin |
| upperArmCircumference | 上臂围 | upperArm |
| forearmCircumference | 下臂围 | forearm |
| footLength | 脚长 | foot |

## 部件录入规则

- 页面默认组合为 `GHH`：G 胸、H 腰臀、H 大腿。
- 未选择的小腿、手臂、手、脚、frame 默认使用 `Obitsu default`。
- 表格中某型号出现几个数字，就表示当前确认几个配件维度。
- 胸围对应 `upperTorso`；腰围和臀围共同对应 `lowerTorso`；大腿围对应 `thigh`。
- C1/G/H/I 可建立胸、腰臀维度；大腿维度中 C1 与 C 合并为 `Type-C 大腿`。
- C2/C3/C4/C5/C6/F/H2/H3/H4/H5 仅建立胸部维度，不能推导腰臀或大腿。
- `Type-P` 当前按 head type 处理；没有明确数据前不得作为胸、腰臀或大腿部件。

## 身体部件首批尺寸

| 型号/type | 胸围 | 腰围 | 臀围 | 大腿围 | 录入口径 |
|-----------|------|------|------|--------|----------|
| C1 | 16.8cm | 13.1cm | 21.5cm | 同 Type-C | 胸、腰臀独立记录；大腿并入 C |
| C2 | 23cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| C3 | 23cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| C4 | 30.5cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| C5 | 21cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| C6 | 21.1cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| F | 19.5cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| G | 25cm | 13cm | 22.5cm | 14.5cm | 完整围度 |
| H | 19.5cm | 15cm | 24cm | 16.5cm | 完整围度 |
| H2 | 17.5cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| H3 | 29cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| H4 | 26.5cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| H5 | 29cm | 待补充 | 待补充 | 待补充 | 仅胸围 |
| I | 20cm | 20cm | 25cm | 16.5cm | 完整围度 |

身体围度统一使用 `sourceId: network-body-size-chart`，误差约 1cm。

## 待补充尺寸的特殊身体件

2026-06-23 复扫 `records/**/record.md` 的身体规格行后，确认以下型号已经在商品规格中作为身体部件出现，但当前没有可录入的 cm 尺寸。已先进入 `bodyParts.json`，统一使用空 `measurements` 表示“待补充”，禁止用 Obitsu default 或相近型号推导。

| 槽位 | 已登记待补型号 | 说明 |
|------|----------------|------|
| upperTorso / 胸 | B | `Type-B` 全身体件规格中出现，胸围待补。 |
| lowerTorso / 腰臀 | B、C2 | `Type-B`、`Type-C2` 下身规格中出现，腰围/臀围待补。 |
| thigh / 大腿 | B | `Type-B` 大腿规格中出现，大腿围待补。 |
| shin / 小腿 | B、C、I | `Type-C` 小腿出现频率最高；`Type-B`、`Type-I` 也有明确规格记录，小腿围待补。 |
| upperArm / 上臂 | B、I、L | `Type-B`、`Type-I` 有上臂/下臂规格；`Type-L` 商品规格写作 `腕/Type-L`，先按上臂和下臂两个槽位登记。 |
| forearm / 下臂 | B、I、L | 同上，尺寸待补。 |

重点线索：用户确认 `関羽雲長 / Kanu Unchou` 系身体件实际为 `Type-B`，覆盖上臂、下臂、胸、腰臀、大腿、小腿。当前关羽两条 `record.md` 仅保留旧商品页标题和来源链接，没有身体构成原文；后续找到尺寸或可引用来源后，再回填为正式商品规格证据。

本次未发现 `Type-A`、`Type-E` 在身体规格行中作为胸、腰臀、大腿、小腿、上臂或下臂出现。`Type-H2` 下身目前只见到“仓库释出品不附属下身 Type-H2 外皮零件”的弱证据，暂不进入 `bodyParts.json`，待有正向规格或尺寸来源后再登记。

## 基准默认件

`frame`、小腿、上臂、下臂、手、脚等默认件使用 `Obitsu default` 作为部件体系语义。它不是来源展示名；来源只在 `part-sources.md` 中维护。

| 槽位 | 首批数据 |
|------|----------|
| frame | 身长 50cm、肩宽 7cm |
| shin | 小腿围 9cm |
| upperArm | 上臂围 6.3cm |
| forearm | 下臂围 5.9cm |
| hand | 暂无尺寸 |
| foot | 脚长 5.7cm |

## 头型与头围

头型数据进入 `headParts.json`，不进入身体组合码。头围统一使用 `sourceId: network-head-girth-chart`，误差约 0.5cm。

| 头型号/type | 头围 head girth |
|-------------|-----------------|
| G | 17.4cm |
| H | 17.8cm |
| J | 17.3cm |
| K | 17.5cm |
| L | 17.6cm |
| M | 17.4cm |
| N | 17.1cm |
| O | 16.8cm |
| P | 17.2cm |
| Q | 17.3cm |
| R | 16.7cm |
| S | 17.4cm |

M/N/O 保留 `revision: new-mold-2022-2023`，避免新旧模具混用。

## 眼珠适配

眼珠适配数据进入 `headParts.eyeSizeOptions`，统一使用 `sourceId: network-eye-size-chart`。P 型头当前保持 `pending`，不得从相近头型推导。

| 头型号/type | eye size |
|-------------|----------|
| G | 14/7, 14/8, 16/8 |
| H | 14/7, 14/8, 16/8 |
| J | 14/8, 16/8 |
| K | 14/7 |
| L | 14/6, 14/7 |
| M | 12/6, 14/6, 14/7 |
| N | 14/6, 14/7 |
| O | 12/5, 12/6 |
| Q | 12/5, 12/6 |
| R | 12/5, 12/6 |
| S | 14/7 |
| P | 待补充 |

## 组合码规则

- 主组合码按 `upperTorso + lowerTorso + thigh` 三段展示。
- 默认 `GHH` 表示 `G 胸 + H 腰臀 + H 大腿`。
- `HHC` 表示 `H 胸 + H 腰臀 + C 大腿`。
- 组合码没有提到的槽位从默认件或用户显式选择中取得。
- 头型不进入组合码；复制时可追加 `head M / head girth 17.4cm / eye 12/6,14/6,14/7`。

## 产品设计影响

- 导航栏新增“配件阁”入口。
- 页面核心是“部件选择 + 尺寸汇总 + 一键复制”；来源不进入网页展示。
- 数据模型必须支持未知值、误差、来源等级和 `sourceId` 校验。
- 首版不做 3D 拼装或图片合成。
