# 当前缺图/少图档案清单

生成时间：2026-06-17

统计口径：扫描 `records/` 下真实档案目录，统计本地 `NN.jpg|jpeg|png|webp` 图片数；排除 `_external_sources`、`抽選` 等资料目录。

## 汇总

- 当前 `<=1` 图片真实档案：2 条
- 一般困难 / 待进一步确认：1 条
- 超困难：1 条

## 明细

| 图片数 | 档案 | 当前状态 | 后续建议 |
|---:|---|---|---|
| 1 | `2012_Dollcore Image Girl #2 羅魅阿 LAMIA` | 一般困难。已有 `01.jpg`，来源为 Azone Osaka `ramia.jpg`；Azone 缩略图与现有图重复。已用人工浏览器核对 FaithZ，站内命中的两个商品页分别是 `RAP Pink Drops #21 羅魅阿（ラミア）＜RAMIA＞` 与 `Unpainted Version`，型号 `AP000027` / `AP000028`，与本条 `2012 Real Art Project dollcore image girl #2` 不是同一商品，故未入库。 | 继续保留现状；若后续找到明确对应本条的公开商品图，再按现有编号从 `02` 续排。 |
| 0 | `YAMATO_Pink Drops #5 罹亞奈 RIANA VMF50 old entry` | 超困难。已做 WorthPoint / Mandarake / Google / FaithZ 检索。FaithZ 可命中 `Type-C4 Bust Tan` 与 `Type-C4 Bust Tan Soft Skin` 两个部件页，正文写有 `罹亞奈（リアナ）chanで使用していた巨乳パーツ`，但图片为替换胸部件，非 `Pink Drops #5 罹亞奈` 本体商品图；`RIANA` / `Liana` / `Pink Drops #5` 站内搜索未找到本体候选。 | 等待人工提供参考图或私有资料；有参考图后再做 Google Lens / 图片反查。 |

## 已从少图清单移出的条目

- `YAMATO_Pink Drops #4 紗友莉 SAYURI VMF50 old entry`：已通过 Azone Osaka `blog-entry-1644.html` 确认 `Pink Drops #4 紗友莉(サユリ)`，并补入 `02.jpg`。
- `2011_Sonico_VMF50 Tiger Parka set`：已通过 Azone 官方商品页补入 3 张。
- `YAMATO_VMF50 #1 MIU Reissue`：已通过 Azone Osaka 再入荷页补入 1 张。
- `YAMATO_VMF50 #1 MIU Tan Skin`：已通过 Suruga-ya 可追溯缩略图补入 1 张。
- `YAMATO_VMF50 #2 RISA Tan Skin`：已通过 Azone Osaka `RISA 褐色ver.` 页面补入 1 张。
- `2009_Macross Lynn Minmay 50cm figure`：已通过 Akiba Keizai 新闻/图集补入 3 张。
- `2010_Queens Blade Reina action figure`：已通过 TamTam 商品页补入 2 张。

## 本轮工具限制记录

- `npx @langgraph-js/web-fetch` 多次失败：`crypto is not defined`。
- Google Lens 上传接口可返回结果 URL，但结果页在当前自动化环境不可稳定读取：出现 403、JS 中转页或 Edge headless 空输出。
- `agent-browser` 当前依赖 Node `>=24`，本机项目 Node 为 `18.20.3`，执行网页命令无可读输出。
- FaithZ 页面通过 Node/PowerShell 直接抓取仍返回 403 / Cloudflare `Just a moment...`；本轮已通过 in-app browser 核验可见结果，命中为 `RAP Pink Drops #21 羅魅阿` 两个商品页，不匹配 `2012_Dollcore Image Girl #2 羅魅阿 LAMIA`。
