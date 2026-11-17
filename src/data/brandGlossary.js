// 根据用户提供的中文资料整理；保留品牌原名，运营动态不作为实时状态。
export const brandGlossary = {
  brands: [
    {
      name: 'VMF50', subtitle: 'Vinyl Miniature Figure 50', kind: '早期系列',
      text: 'VMF50（Vinyl Miniature Figure 50）是由 Yamato（やまと）推出的约 50cm 软胶人偶系列，也是 Angel Philia 早期历史的起点。',
      detail: '技术特征是 Obitsu 50cm / 48cm 内部可动骨架搭配 PVC 外皮；VMF50、Angel Philia 与 Pink Drops 的关联，应结合具体时期和款式理解。',
      sources: ['rap', 'discussion']
    },
    {
      name: 'Angel Philia', subtitle: 'AP · エンジェルフィリア', kind: '人偶品牌',
      text: '由 Quarantotto（クアラントット）运营、承接 VMF50 人偶路线的品牌。主线包含整娃、替换外皮及相关配件。',
      detail: '以日系动漫与插画风格、精致的身体涂装，以及 Soft Skin 软质外皮为特色。Type 名称用于识别不同设计的部件，不能仅凭字母判断整套配置。',
      sources: ['ap', 'typeI']
    },
    {
      name: 'Real Art Project', subtitle: 'RAP · リアルアートプロジェクト', kind: '企划与合作方',
      text: '与 Yamato、Quarantotto 人偶产品有合作关系的企划方，曾参与早期 Dollcore 系列，并主导后续 Pink Drops 的角色与产品企划。',
      detail: '名称可能出现在企划、品牌或销售来源字段中；它与 Angel Philia 存在合作及技术联系，不宜直接视为同一个品牌名称。',
      sources: ['rap', 'dollcore']
    },
    {
      name: 'Pink Drops', subtitle: 'PD · ピンクドロップス', kind: '合作产品系列',
      text: '由 Real Art Project 主导企划、与 Angel Philia / Quarantotto 合作发行的姐妹系列。常见命名为「#编号 + 角色名」。',
      detail: '与 AP 具有素体技术及部件方面的联系。实际搭配仍需核对骨架高度、外皮 Type、肤色与具体商品规格。',
      sources: ['rap', 'apRelease']
    },
    {
      name: 'Yamato / Quarantotto', subtitle: 'やまと / クアラントット', kind: '厂商与运营主体',
      text: 'Yamato 是 VMF50 早期厂商；Quarantotto 是后续 Angel Philia 的运营公司。区分公司与品牌，有助于阅读跨时期的商品记录。',
      detail: '2013 年 Yamato 的业务变动与团队重组是品牌发展的转折点。阅读相关资料时，应区分公司沿革、团队承接与品牌合作。',
      sources: ['quarantotto', 'companyHistory']
    },
    {
      name: 'Obitsu', subtitle: 'オビツ制作所', kind: '骨架与制造体系',
      text: '提供内部可动骨架的关键厂商。Obitsu 48cm / 50cm 骨架与外层软胶外皮共同构成人偶的身体结构。',
      detail: '骨架、外皮与整娃品牌是不同层次的概念；出现 Obitsu 名称，不表示整娃就以 Obitsu 作为销售品牌。',
      sources: ['discussion', 'dollcore']
    }
  ],
  relations: [
    { from: 'Yamato', link: '早期推出', to: 'VMF50' },
    { from: 'Quarantotto', link: '运营', to: 'Angel Philia' },
    { from: 'Real Art Project', link: '主导企划', to: 'Pink Drops' },
    { from: 'Angel Philia / Pink Drops', link: '相关技术基础', to: 'Obitsu 骨架 + PVC 外皮' }
  ],
  timeline: [
    {
      period: '约 2008—2012', title: 'Yamato / VMF50 时期',
      text: '日本老牌玩具商 Yamato 正式推出 VMF50 系列，奠定了 50cm 高可动软胶人偶的素体基石。同期推出了配套服饰支线 Girl*Holic（涵盖漆皮超短裙、水手服、体操服及高筒系带靴等经典热门服装与假发），并与合作工作室 Real Art Project 联合企划了 Dollcore 系列（以机械风猫耳、兔耳头饰等科幻机能风热门配饰闻名）。',
      sources: ['akiba332', 'osaka707', 'akiba305', 'mercariVmf50']
    },
    {
      period: '2013', title: '业务变动与品牌承接',
      text: '母公司 Yamato 宣布破产清算并正式退出历史舞台（目前市面上仍可见到的同名“Yamato”多为无直接关联的其他领域厂商，如日本老牌木制积木玩具商“大和玩具”或模型工具商，原玩具业务则由 Arcadia 承接）。原 VMF50 核心研发团队随后独立成立新公司 Quarantotto，正式启用全新品牌名 Angel Philia，延续原有的工艺路线。',
      sources: ['yamatoHyde', 'yamatoQuentin']
    },
    {
      period: '2013—2020 年代初', title: '双线并行与体系成熟',
      text: 'Quarantotto 持续拓展 Angel Philia 主线，推出多款新素体、独立外皮及替换散件；与此同时，Real Art Project 转型专注于姐妹系列 Pink Drops 的角色企划与开发（如经典编号款 #10 穂乃花、#15 爱红、#30 爱实 以及近年的人气新作 #79 小梦、#80 芽亚里、#84 美久 等）。尽管旧称 VMF50 已停止使用，但作为技术源头，至今仍是玩家考据与讨论的重要基石。',
      sources: ['rapShopAll', 'rapPinkDrops', 'rapSocial']
    }
  ],
  terms: [
    { name: 'Vinyl Doll / PVC 外皮', text: '软胶人偶及其外层身体部件。外皮塑造外观与曲线，内部骨架负责支撑和活动。' },
    { name: 'Inner Frame / 内部骨架', text: '藏于外皮内部的支撑与可动结构，常见规格包括 Obitsu 48cm / 50cm 骨架。' },
    { name: 'Soft Skin', text: '较柔软的外皮材质，属于材质或商品规格信息，应与部件 Type、骨架规格分别核对。' },
    { name: 'Type-C / Type-H / Type-I 等', text: '用于区分外皮或部件设计的名称。看具体商品列出的胸、腰、腿等部位配置，不能把单一 Type 自动套用于全身。' },
    { name: 'Pre-order / 预售', text: '先接受订购、再按计划生产与发货的销售方式。预售期、预计发货时间与实际库存是不同信息。' },
    { name: 'ONE SELECTION DOLL / OSD', text: '官方定义为世界仅此一体的 One-off 定制人偶，创作重点是手工定制妆面与整体角色造型。抽选是销售方式，定制孤品是产品属性。' },
    { name: 'Full Coordinate Doll / FCD', text: '以量产版角色本体为基础，搭配样衣、限定衣装、假发与饰品完成整体造型后抽选发售。与 OSD 的定制重点不同，但官方也使用ワンオフ称呼 FCD；EMMA 页面明确仅 1 体抽选。' },
    { name: '联动 / 角色合作款', text: '与特定作品或角色合作的产品，例如 Catwoman。角色联动、限量销售、抽选和 One-off 是不同维度，不能相互直接等同；相关条目可在「限定档案」查询。' }
  ],
  operations: [
    { name: 'Angel Philia / Quarantotto', text: 'Angel Philia 官网设有整娃、ONE SELECTION DOLL 抽选款及替换配件等产品栏目，并发布 Private Room 摄影聚会、海外展会等活动信息。具体产品与活动安排可查看官网。', sources: ['ap', 'apSelection', 'apNews'] },
    { name: 'Pink Drops / Real Art Project', text: 'Real Art Project 官网与 FC2 商店收录 Pink Drops 系列产品，包括 #82、#83、#84 等编号角色，并发布预售、生产排期与发货公告。具体规格、交付安排及散件销售情况可查看商品页与最新公告。', sources: ['rap', 'rapShop', 'rapSocial'] }
  ]
}

export const glossarySources = [
  { id: 'akiba332', label: 'AZONE 秋叶原 · VMF50 / Girl*Holic 资料', type: '店铺博客', url: 'https://azoneakiba.blog.fc2.com/blog-entry-332.html' },
  { id: 'osaka707', label: 'AZONE 大阪 · VMF50 相关资料', type: '店铺博客', url: 'https://azoneosaka.blog.fc2.com/blog-entry-707.html' },
  { id: 'akiba305', label: 'AZONE 秋叶原 · 早期产品资料', type: '店铺博客', url: 'https://azoneakiba.blog.fc2.com/blog-entry-305.html' },
  { id: 'mercariVmf50', label: 'Mercari · VMF50 历史商品检索', type: '二手检索', url: 'https://jp.mercari.com/search?keyword=vmf50' },
  { id: 'yamatoHyde', label: 'Yamato 业务变动记录 · hyde888', type: '个人博客', url: 'http://hyde888.blog128.fc2.com/blog-entry-615.html' },
  { id: 'yamatoQuentin', label: 'Yamato Closed Down · Quentin Lau', type: '个人博客', url: 'http://quentinlau.blogspot.com/2013/03/yamato-closed-down.html' },
  { id: 'rapShopAll', label: 'Real Art Project · 全部商品', type: '官方商店', url: 'https://realartproject.cart.fc2.com/?ca=all' },
  { id: 'rapPinkDrops', label: 'Real Art Project · Pink Drops 产品栏目', type: '官方', url: 'https://realartproject.com/?cat=6' },
  { id: 'osdDefinition', label: 'OSD #86 · 官方 One-off 定义', type: '官方', url: 'https://quarantotto.biz/angelphilia/one-selection-doll-86-6481.html' },
  { id: 'fcdDefinition', label: 'FCD EMMA · 官方定义与抽选数量', type: '官方', url: 'https://quarantotto.biz/angelphilia/full-coordonate-doll-emma-6318.html' },
  { id: 'quarantotto', label: 'Quarantotto 公司官网', type: '官方', url: 'https://quarantotto.biz/' },
  { id: 'ap', label: 'Angel Philia 官方网站', type: '官方', url: 'https://quarantotto.biz/angelphilia/' },
  { id: 'apRelease', label: 'Angel Philia / Pink Drops 新产品发布', type: '官方', url: 'https://quarantotto.biz/angelphilia/新製品リリース情報！angel-philia-pink-drops-7459.html' },
  { id: 'apSelection', label: 'ONE Selection Doll 产品分类', type: '官方', url: 'https://quarantotto.biz/angelphilia/category/item/itemgenre/itemselect' },
  { id: 'apNews', label: 'Angel Philia 官方通知', type: '官方', url: 'https://quarantotto.biz/angelphilia/category/お知らせ' },
  { id: 'rap', label: 'Real Art Project 官方网站', type: '官方', url: 'https://realartproject.com/' },
  { id: 'rapShop', label: 'Real Art Project FC2 商店', type: '官方商店', url: 'https://realartproject.cart.fc2.com/' },
  { id: 'rapSocial', label: 'Real Art Project · X', type: '官方账号', url: 'https://x.com/RealArtProject' },
  { id: 'companyHistory', label: 'Quarantotto 公司条目', type: '百科', url: 'https://ja.wikipedia.org/wiki/クアラントット_(人形メーカー)' },
  { id: 'discussion', label: 'VMF50 & Angel Philia 讨论串', type: '玩家社区', url: 'https://www.dolldreaming.com/topic/3536-vmf50-amp-angel-philia-discussion-thread-nsfw-doll-nudity/' },
  { id: 'dollcore', label: 'Dollcore / Real Art Project 讨论串', type: '玩家社区', url: 'https://www.dolldreaming.com/topic/11232-dollcore-real-art-project-new-doll-company-nsfw/' },
  { id: 'typeI', label: 'Angel Philia / Pink Drops Type-I 讨论', type: '玩家社区', url: 'https://www.dolldreaming.com/topic/21153-new-body-for-angel-philiapink-drops-type-i/' }
]
