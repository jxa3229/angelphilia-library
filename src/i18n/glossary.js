import { brandGlossary, glossarySources } from '../data/brandGlossary.js'

const pages = {
  zh: {
    eyebrow: 'LIBRARY GUIDE · 品牌档案', title: '品牌与运营术语',
    intro: '从 VMF50 到 Angel Philia，读懂品牌、企划方与素体技术之间的关系。',
    navigation: '本页章节', references: '相关资料',
    headings: ['名称释义', '品牌关系速读', '历史沿革', '技术与销售术语', '运营方式', '参考来源'],
    caption: '按厂商、品牌、企划与技术层次阅读，合作关系不直接代表公司股权关系。'
  },
  en: {
    eyebrow: 'LIBRARY GUIDE · BRAND ARCHIVE', title: 'Brands & industry terms',
    intro: 'From VMF50 to Angel Philia: a guide to brands, planning partners and body technology.',
    navigation: 'On this page', references: 'Related references',
    headings: ['Names explained', 'Brand relationships', 'History', 'Technical & sales terms', 'Operations', 'References'],
    caption: 'Manufacturers, brands, planning partners and technology are distinct. A collaboration does not establish company ownership.'
  },
  ja: {
    eyebrow: 'LIBRARY GUIDE · ブランド資料', title: 'ブランドと運営用語',
    intro: 'VMF50 から Angel Philia へ。ブランド、企画元、素体技術の関係を紹介します。',
    navigation: 'ページ内の項目', references: '関連資料',
    headings: ['名称の解説', 'ブランドの関係', '歴史', '技術・販売用語', '運営について', '参考資料'],
    caption: 'メーカー、ブランド、企画、技術を分けてお読みください。協業関係は会社の資本関係を意味しません。'
  }
}

// 各行は原資料と同じ順番。ブランド固有名と出典 URL は原資料を共有する。
const translations = {
  en: {
    brands: [
      ['Early series', 'Vinyl Miniature Figure 50', 'VMF50 (Vinyl Miniature Figure 50) is an approximately 50 cm vinyl doll series introduced by Yamato, and the starting point of Angel Philia’s early history.', 'Its construction combines an Obitsu 50 cm / 48 cm articulated frame with PVC shells. Relationships between VMF50, Angel Philia and Pink Drops depend on the period and model.'],
      ['Doll brand', 'AP · エンジェルフィリア', 'Operated by Quarantotto, Angel Philia continues the VMF50 doll line. Its main range includes complete dolls, replacement shells and accessories.', 'Features include anime and illustration-inspired designs, detailed body paint and Soft Skin shells. Type names identify individual part designs; one letter does not specify an entire body configuration.'],
      ['Planning & collaboration', 'RAP · リアルアートプロジェクト', 'A planning partner associated with Yamato and Quarantotto dolls. It contributed to the early Dollcore series and later led character and product planning for Pink Drops.', 'The name can appear in planning, brand or sales-source fields. Its collaboration and technical links with Angel Philia do not make them the same brand.'],
      ['Collaborative product series', 'PD · ピンクドロップス', 'A sister series planned primarily by Real Art Project and released in collaboration with Angel Philia / Quarantotto. Names commonly use “#number + character name”.', 'It shares body technology and parts with AP. Check frame height, shell Type, skin tone and individual product specifications before combining parts.'],
      ['Manufacturers & operators', 'やまと / クアラントット', 'Yamato was the early VMF50 manufacturer; Quarantotto later operated Angel Philia. Distinguishing companies from brands helps explain records from different periods.', 'Yamato’s business changes and team reorganization in 2013 marked a turning point. Company history, team succession and brand collaborations should be considered separately.'],
      ['Frame & manufacturing system', 'オビツ製作所', 'A key manufacturer supplying articulated inner frames. Obitsu 48 cm / 50 cm frames combine with vinyl shells to form the doll body.', 'The frame, shell and complete-doll brand are different concepts. An Obitsu frame does not mean the complete doll was sold under the Obitsu brand.']
    ],
    relations: ['Originally introduced', 'Operates', 'Leads planning for', 'Related technical basis'],
    relationBody: 'Obitsu frame + PVC shells',
    timeline: [
      ['c. 2008–2012', 'Yamato / VMF50 period', 'Yamato introduced VMF50, establishing its highly articulated 50 cm vinyl body platform. The accompanying Girl*Holic line offered clothing and wigs, including patent miniskirts, sailor uniforms, gym outfits and tall lace-up boots. Yamato also collaborated with Real Art Project on Dollcore, known for science-fiction accessories such as mechanical cat and rabbit ears.'],
      ['2013', 'Business changes & brand succession', 'Yamato went into liquidation and ceased operations. Other businesses using the Yamato name should be distinguished from this toy manufacturer; its former toy business was succeeded by Arcadia. The core VMF50 team subsequently established Quarantotto and introduced Angel Philia, continuing the earlier technical approach.'],
      ['2013–early 2020s', 'Parallel development & a maturing system', 'Quarantotto expanded Angel Philia with new bodies, shells and replacement parts, while Real Art Project focused on character planning and development for Pink Drops. Examples include #10 Honoka, #15 Aiko and #30 Aimi, followed by #79 Komu, #80 Meari and #84 Miku. Although VMF50 is no longer used independently, it remains a key historical and technical reference.']
    ],
    terms: [
      ['Vinyl Doll / PVC shells', 'Vinyl dolls and their outer body parts. The shells define appearance and shape; the inner frame provides support and articulation.'],
      ['Inner Frame', 'The supporting and articulated structure inside the shells. Common sizes include Obitsu 48 cm / 50 cm.'],
      ['Soft Skin', 'A softer shell material. Treat this material specification separately from part Type and frame size.'],
      ['Type-C / Type-H / Type-I, etc.', 'Names distinguishing shell or part designs. Check the listed torso, waist and leg configuration; a single Type does not automatically describe the entire body.'],
      ['Pre-order', 'Orders are accepted before planned production and shipment. The order window, estimated shipping date and actual stock are separate information.'],
      ['ONE SELECTION DOLL / OSD', 'Officially defined as a unique One-off custom doll, emphasizing hand-painted makeup and a complete character design. A lottery is the sales method; being a unique custom doll is the product attribute.'],
      ['Full Coordinate Doll / FCD', 'A production character doll styled with sample or limited clothing, a wig and accessories, then sold by lottery. Its customization emphasis differs from OSD, though official pages also describe FCD as One-off. The EMMA page specifies a lottery for one doll.'],
      ['Character collaboration', 'Products collaborating with a specific work or character, such as Catwoman. Collaboration, limited production, lottery sales and One-off status are distinct attributes. See Limited Archives for related entries.']
    ],
    operations: [
      'The Angel Philia website lists complete dolls, ONE SELECTION DOLL lottery models and replacement parts, alongside Private Room photography gatherings and overseas events. Consult the official site for individual products and schedules.',
      'Real Art Project’s website and FC2 shop list Pink Drops characters including #82, #83 and #84, and publish pre-order, production and shipping notices. Product pages and current announcements provide specifications, delivery arrangements and parts availability.'
    ],
    sources: [
      'AZONE Akihabara · VMF50 / Girl*Holic', 'AZONE Osaka · VMF50', 'AZONE Akihabara · early products',
      'Mercari · historical VMF50 listings', 'Yamato business changes · hyde888', 'Yamato Closed Down · Quentin Lau',
      'Real Art Project · all products', 'Real Art Project · Pink Drops', 'OSD #86 · official One-off definition',
      'FCD EMMA · official definition & quantity', 'Quarantotto · company website', 'Angel Philia · official website',
      'Angel Philia / Pink Drops · product releases', 'ONE Selection Doll · category', 'Angel Philia · notices',
      'Real Art Project · official website', 'Real Art Project · FC2 shop', 'Real Art Project · X',
      'Quarantotto · company entry', 'VMF50 & Angel Philia · discussion', 'Dollcore / Real Art Project · discussion', 'Angel Philia / Pink Drops · Type-I discussion'
    ],
    types: { '店铺博客': 'Shop blog', '二手检索': 'Resale search', '个人博客': 'Personal blog', '官方商店': 'Official shop', '官方': 'Official', '官方账号': 'Official account', '百科': 'Encyclopedia', '玩家社区': 'Community' }
  },
  ja: {
    brands: [
      ['初期シリーズ', 'Vinyl Miniature Figure 50', 'VMF50（Vinyl Miniature Figure 50）は、やまとが発売した約 50cm のソフビドールシリーズで、Angel Philia の初期の歴史につながる出発点です。', 'オビツ 50cm / 48cm の可動フレームと PVC 外皮を組み合わせた構造が特徴です。VMF50、Angel Philia、Pink Drops の関係は時期とモデルごとに確認する必要があります。'],
      ['ドールブランド', 'AP · エンジェルフィリア', 'クアラントットが運営し、VMF50 の流れを受け継ぐブランドです。完成品ドール、交換用外皮、関連パーツを展開しています。', 'アニメ・イラスト調の造形、繊細なボディ塗装、Soft Skin 外皮が特徴です。Type は個々のパーツ設計を識別する名称で、文字だけで全身の構成を判断できません。'],
      ['企画・協業パートナー', 'RAP · リアルアートプロジェクト', 'やまとやクアラントットのドール製品と関わる企画元です。初期の Dollcore に参加し、その後は Pink Drops のキャラクター・商品企画を主導しました。', '企画元、ブランド、販売元の欄に名称が現れる場合があります。Angel Philia と協業・技術上のつながりはありますが、同一ブランドとして扱うべきではありません。'],
      ['協業商品シリーズ', 'PD · ピンクドロップス', 'Real Art Project が主に企画し、Angel Philia / クアラントットと協業して展開する姉妹シリーズです。「#番号＋キャラクター名」という表記がよく用いられます。', 'AP と素体技術やパーツの共通点があります。組み合わせる際はフレームの高さ、外皮 Type、肌色、個別の商品仕様を確認してください。'],
      ['メーカー・運営会社', 'やまと / クアラントット', 'やまとは初期 VMF50 のメーカーで、クアラントットは後の Angel Philia の運営会社です。会社とブランドを区別すると、異なる時代の商品記録を読み解きやすくなります。', '2013 年のやまとの事業変動とチーム再編は転換点となりました。会社の沿革、開発チームの継承、ブランド間の協業は分けて考える必要があります。'],
      ['フレーム・製造体系', 'オビツ製作所', '内部可動フレームを供給する主要メーカーです。オビツ 48cm / 50cm フレームとソフビ外皮を組み合わせてドールの体を構成します。', 'フレーム、外皮、完成品のブランドは異なる概念です。オビツ製フレームを使っていても、完成品がオビツブランドで販売されたとは限りません。']
    ],
    relations: ['初期に発売', '運営', '企画を主導', '関連する技術基盤'],
    relationBody: 'オビツフレーム＋PVC 外皮',
    timeline: [
      ['2008～2012 年頃', 'やまと / VMF50 時代', '玩具メーカーのやまとが VMF50 を発売し、50cm 高可動ソフビドールの素体基盤を築きました。衣装・ウィッグの Girl*Holic では、エナメルミニスカート、セーラー服、体操服、ロング編み上げブーツなどを展開しました。同時期に Real Art Project と Dollcore を共同企画し、メカ風の猫耳・うさ耳など SF テイストの小物も登場しました。'],
      ['2013', '事業変動とブランドの継承', 'やまとは破産清算により事業を終了しました。現在も存在する同名の他業種の会社とは区別が必要で、旧玩具事業はアルカディアに継承されました。VMF50 の中核開発チームはその後クアラントットを設立し、Angel Philia の名称で従来の技術路線を継続しました。'],
      ['2013～2020 年代初頭', '二つのシリーズの発展', 'クアラントットは Angel Philia の新素体、単体外皮、交換パーツを拡充し、Real Art Project は Pink Drops のキャラクター企画・開発に注力しました。#10 穂乃花、#15 愛紅、#30 愛実に続き、#79 小夢、#80 芽亜里、#84 美久などが登場しました。VMF50 の旧称は独立して使われなくなりましたが、技術と歴史をたどる重要な基点です。']
    ],
    terms: [
      ['Vinyl Doll / PVC 外皮', 'ソフビドールとその外側のボディパーツ。外皮が外観や曲線を作り、内部フレームが支持と可動を担います。'],
      ['Inner Frame / 内部フレーム', '外皮の内側にある支持・可動構造。代表的な規格にオビツ 48cm / 50cm があります。'],
      ['Soft Skin', '比較的柔らかい外皮素材。素材・商品仕様を示すため、パーツの Type やフレーム規格とは別に確認してください。'],
      ['Type-C / Type-H / Type-I など', '外皮やパーツ設計を区別する名称。胸、腰、脚など各部位の構成を確認し、一つの Type を自動的に全身へ当てはめないでください。'],
      ['Pre-order / 予約販売', '先に注文を受け付け、その後に生産・発送する販売方式。予約期間、発送予定、実際の在庫は異なる情報です。'],
      ['ONE SELECTION DOLL / OSD', '公式には世界に一体の One-off カスタムドールとされ、手作業のメイクと全体のキャラクター表現が中心です。抽選は販売方法であり、カスタム一点物であることが商品の属性です。'],
      ['Full Coordinate Doll / FCD', '量産版キャラクタードールをベースに、サンプル・限定衣装、ウィッグ、小物でコーディネートして抽選販売するものです。OSD とはカスタムの重点が異なりますが、公式では FCD にもワンオフの表現を使っています。EMMA のページでは一体のみの抽選と明記されています。'],
      ['コラボレーション / キャラクター商品', 'Catwoman など特定作品やキャラクターとの協業商品。コラボ、数量限定、抽選、One-off は別の属性です。関連する記録は「限定アーカイブ」で確認できます。']
    ],
    operations: [
      'Angel Philia 公式サイトには完成品、ONE SELECTION DOLL 抽選商品、交換パーツなどの項目があり、Private Room 撮影会や海外イベントも案内されています。個別の商品・開催予定は公式サイトをご確認ください。',
      'Real Art Project の公式サイトと FC2 ショップには #82、#83、#84 などの Pink Drops 製品が掲載され、予約、生産予定、発送のお知らせが公開されています。仕様、納期、単品パーツの販売状況は商品ページと最新のお知らせをご確認ください。'
    ],
    sources: [
      'AZONE 秋葉原 · VMF50 / Girl*Holic 資料', 'AZONE 大阪 · VMF50 資料', 'AZONE 秋葉原 · 初期製品資料',
      'Mercari · VMF50 過去商品検索', 'やまとの事業変動 · hyde888', 'Yamato Closed Down · Quentin Lau',
      'Real Art Project · 全商品', 'Real Art Project · Pink Drops', 'OSD #86 · 公式 One-off 定義',
      'FCD EMMA · 公式定義と抽選数', 'クアラントット · 公式サイト', 'Angel Philia · 公式サイト',
      'Angel Philia / Pink Drops · 新製品情報', 'ONE Selection Doll · 商品分類', 'Angel Philia · お知らせ',
      'Real Art Project · 公式サイト', 'Real Art Project · FC2 ショップ', 'Real Art Project · X',
      'クアラントット · 会社解説', 'VMF50 & Angel Philia · 掲示板', 'Dollcore / Real Art Project · 掲示板', 'Angel Philia / Pink Drops · Type-I 掲示板'
    ],
    types: { '店铺博客': '店舗ブログ', '二手检索': '中古検索', '个人博客': '個人ブログ', '官方商店': '公式ショップ', '官方': '公式', '官方账号': '公式アカウント', '百科': '百科事典', '玩家社区': 'ユーザー掲示板' }
  }
}

export function localizedGlossary(lang = 'zh') {
  const localized = translations[lang]
  const copy = pages[lang] || pages.zh
  if (!localized) return { copy, data: brandGlossary, sources: glossarySources }
  return {
    copy,
    data: {
      brands: brandGlossary.brands.map((brand, i) => {
        const [kind, subtitle, text, detail] = localized.brands[i]
        return { ...brand, kind, subtitle, text, detail }
      }),
      relations: brandGlossary.relations.map((relation, i) => ({ ...relation, link: localized.relations[i], to: i === 3 ? localized.relationBody : relation.to })),
      timeline: brandGlossary.timeline.map((event, i) => {
        const [period, title, text] = localized.timeline[i]
        return { ...event, period, title, text }
      }),
      terms: localized.terms.map(([name, text]) => ({ name, text })),
      operations: brandGlossary.operations.map((operation, i) => ({ ...operation, text: localized.operations[i] }))
    },
    sources: glossarySources.map((source, i) => ({ ...source, label: localized.sources[i], type: localized.types[source.type] }))
  }
}
