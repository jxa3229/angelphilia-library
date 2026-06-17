# Feature: 20260617_F001 - archive-image-enrichment

## 需求背景

当前馆藏数据中有 27 条档案的本地图片数少于或等于 1 张，集中在早期 YAMATO / VMF50 / Pink Drops / 联动款资料。详情页图片轮播依赖 `records/` 中的本地图片，缺图会降低档案可读性，也不利于后续校对条目身份。

## 目标

- 先用 5 条样本跑通补图流程，验证来源筛选、图片命名、来源记录、数据同步和前端展示。
- 只下载可公开访问、可追溯、与条目明确匹配的官方或商店商品图。
- 保持现有静态站点架构不变，不新增运行时接口或前端组件。

## 方案设计

本次样本范围固定为：

- `YAMATO_Pink Drops #5 罹亞奈 RIANA VMF50 old entry`
- `2012_Angel Philia Sonico Babydoll ver`
- `2009_VMF50 #2 RISA`
- `2013_Dollcore Image Girl #4 絽媚奈 ROMINA`
- `2009_Ikkitousen Kanu Unchou Nurse Ver`

图片来源优先级为官方商品页、Azone / HLJ / AmiAmi / Suruga-ya / Mandarake / WorthPoint 等商品资料页。粉丝图、Pinterest、论坛实拍、MFC 用户上传图只作为候选线索记录，不下载入库。

下载图片写入 `records/{folder}/NN.jpg|png|webp`，按现有编号续排；0 图条目从 `01` 开始，已有 `01` 的条目从 `02` 开始。每条样本最多补到 5 张本地图片。对应 `record.md` 的中日双语图片段落需要同步更新，写清本地文件名、页面来源、图片 URL 和未采纳候选。

构建链路保持现状：`npm run sync:data` 从 `records/` 重新生成 `src/data/records.json`，`npm run sync:details` 从 `record.md` 生成详情 HTML，`npm run prepare:public` 复制图片到 `public/media/`。

## 实现要点

- 执行前先在 `develop` 上完成 `git fetch origin` 与 `git pull --ff-only origin develop`。
- 所有文件读写使用 UTF-8，避免中文和日文档案内容乱码。
- 图片下载前检查 HTTP 状态、`Content-Type` 与实际文件大小；下载后抽查文件能被识别为图片。
- 若样本条目只找到粉丝图或无法稳定访问的付费/拍卖缩略图，则只更新候选来源说明，不强行下载。

## 困难补充清单

以下条目在本轮按“官方/商店优先、明确匹配才下载”的规则未继续强补，后续需要人工补充或等待可访问来源：

- `2009_VMF50 #3 MIKI`：困难清单复查后通过 Google / Azone 站内结果找到 Azone Akihabara 单品页与 Azone Osaka 再入荷页，已补入 2 张明确匹配图；页面内标注 RISA 的服装参考图未采纳。
- `2009_VMF50 #4 YUMI`：通过 Azone Akihabara / Azone Osaka 页面补入 1 张明确匹配图；同页 MIKI、MIU、RISA 或 girl*holic 服装参考图未采纳。
- `2011_VMF50 #9 SHIHO`：通过 Azone Osaka / Azone Akihabara 入荷页补入 1 张明确匹配图；Akihabara 页面复用 Osaka 缩略路径，未重复下载。
- `2012_VMF50 #13 MIKO`：通过 Azone Akihabara MIKO 入荷页补入 1 张图面标注 MIKO 的图片；同页 `model: MAKO` 与 `model: KANA` 图片已分别转入对应档案，配件特写未采纳。
- `2011_Sonico_VMF50 Tiger Parka set`：已通过 Azone 官方商品页补入 3 张明确匹配图；Suruga-ya 低清缩略图未采纳。
- `2012_Dollcore Image Girl #1 伽琉羅 KARURA`：通过 Azone Osaka `dollcore image girl #1 伽琉羅` 页面补入 1 张明确匹配图；Suruga-ya 低清二手缩略图仅保留为线索。
- `2012_Dollcore Image Girl #2 羅魅阿 LAMIA`：Azone Osaka `ramia.jpg` 与既有 `01.jpg` 完全一致，已补充来源说明，不重复入库。
- `YAMATO_VMF50 #1 MIU Reissue`：Azone Osaka 再入荷页规格与 JohnnyJoy / Mandarake 的再販版线索一致，已补入 1 张明确标注 MIU 的商品图；普通 MIU 图未混用。
- `YAMATO_VMF50 #1 MIU Tan Skin`：仅找到 Suruga-ya 可追溯低清缩略图，已补入并在档案中标明低清限制；仍需后续寻找高清图。
- `YAMATO_VMF50 #2 RISA Tan Skin`：Azone Osaka 页面 `img alt` 和正文均明确为 `RISA 褐色ver.`，已补入 1 张图；普通 RISA 的 Azone Akihabara 再入荷页未采纳。
- `2009_Macross Lynn Minmay 50cm figure`：通过 Akiba Keizai 新闻/图集页补入 3 张明确匹配 `vmf50 リン・ミンメイ 50cmフィギュア` 的图；Azone 服装配件页只保留为本体名称线索。
- `2010_Queens Blade Reina action figure`：通过 TamTam 商品页补入 2 张明确匹配 `やまと vmf クイーンズブレイド 流浪の戦士 レイナ` 的图；Suruga-ya 低清缩略图未采纳。
- `YAMATO_Pink Drops #4 紗友莉 SAYURI VMF50 old entry`：仍未入库新图。Azone 直图未能定位可追溯原页面，且本地已有 2015 Pink Drops #4 紗友莉 图库，存在旧 VMF50 入口与 2015 条目误合并风险；Suruga-ya 低清缩略图仅保留为线索。

当前仍属于一般困难 / 待进一步确认的 `<=1` 图片条目：

- `2012_Dollcore Image Girl #2 羅魅阿 LAMIA`：Azone 可追溯图与既有 `01.jpg` 重复，图片数不增加但来源已补齐。
- `YAMATO_Pink Drops #4 紗友莉 SAYURI VMF50 old entry`：需要继续确认旧 VMF50 条目与 2015 紗友莉条目的边界，未采纳未溯源 Azone 直图。

## 超困难补充清单

- `YAMATO_Pink Drops #5 罹亞奈 RIANA VMF50 old entry`：已进行两轮困难检索，WorthPoint / Mandarake 仅提供线索或访问受限；Google 结果多为拍卖缓存、无关 Pink Drops 商品或噪声页面。当前未找到稳定公开、可下载、且能明确匹配本条目的官方/商店图片，后续需要人工补充私有资料或等待新的可访问来源。

## 约束一致性

本方案符合 `spec/global/constraints.md`：仍以 `records/` 作为原始档案源，运行时继续读取 `src/data/records.json` 与 `public/details/{detailKey}.html`，不引入后端、数据库或新的浏览器运行时数据逻辑。

## 验收标准

- [ ] `develop` 已完成 fast-forward 更新检查。
- [ ] 5 条样本的 `record.md` 均记录图片来源和候选处理结果。
- [ ] 可下载样本图片已写入对应 `records/{folder}/`，且 `src/data/records.json` 中样本图片数增加。
- [ ] `npm run build` 通过。
- [ ] 本地详情页抽查样本轮播无 broken image。
