// 用户提供的编号名录，仅用于导航；不覆盖馆藏中的年份、头型或规格。
const entries = (brand, rows) => rows.map(([number, ja, en, zh, ...aliases]) => ({
  id: `${brand}-${number}`, brand, number, names: { zh: zh || ja, en, ja },
  aliases: [...new Set([ja, en, zh, ...aliases].filter(Boolean))]
}))

export const dollRosterGroups = [
  {
    id: 'vmf', company: 'Yamato', brand: 'VMF50 · Image Girl',
    entries: entries('vmf', [
      [1, 'MIU', 'MIU', '美雨'], [2, 'RISA', 'RISA', '理沙'],
      [3, 'MIKI', 'MIKI', '美纪'], [4, 'YUMI', 'YUMI', '由美'],
      [5, 'AMI', 'AMI', '亚美'], [6, 'NAO', 'NAO', '奈绪'],
      [7, 'MIHO', 'MIHO', '美穗'], [8, 'ERI', 'ERI', '绘里'],
      [9, 'SHIHO', 'SHIHO', '志保'], [10, 'SAYO', 'SAYO', '纱夜'],
      [11, 'MAKO', 'MAKO', '真子'], [12, 'KANA', 'KANA', '佳奈'],
      [13, 'MIKO', 'MIKO', '美子']
    ])
  },
  {
    id: 'dollcore', company: 'Yamato × Real Art Project', brand: 'Dollcore',
    entries: entries('dollcore', [
      [1, '伽琉羅', 'KARURA', '伽琉罗'], [2, '羅魅阿', 'LAMIA', '萝米亚'],
      [3, '紗鵺香', 'SAYAKA', '纱夜香'], [4, '絽媚奈', 'ROMINA', '萝米娜']
    ])
  },
  {
    id: 'collab', company: 'Yamato', brand: 'VMF50', kind: 'collab',
    entries: entries('collab', [
      [null, 'リン・ミンメイ', 'Lynn Minmay', '林明美'],
      [null, '関羽雲長', 'Kanu Unchou', '关羽云长'],
      [null, 'すーぱーそに子', 'Sonico', '超级索尼子']
    ]).map((entry, index) => ({ ...entry, id: `collab-${index}` }))
  },
  {
    id: 'pinkdrops', company: 'Real Art Project', brand: 'Pink Drops',
    entries: entries('pinkdrops', [
      [1, '魅莉阿', 'Miria'], [2, '摩璃奈', 'Marina'],
      [3, '綺亞羅', 'Kiara', '绮亚罗'], [4, '紗友莉', 'Sayuri', '纱友莉'],
      [5, '罹亞奈', 'Liana', '罹亚奈', 'RIANA'], [6, '紫織麗', 'Shiori', '紫织丽'],
      [7, '摩雫媚', 'Manami'], [8, '伽栖魅', 'Kasumi'],
      [9, '紫珠紅', 'Shizuku', '紫珠红'], [10, '穂乃花', 'Honoka'],
      [11, '紗鵺香', 'Sayaka', '纱夜香'], [12, '夜狐', 'Yo-ko'],
      [13, '桃香', 'Momoka'], [14, '恋麦', 'Komugi'],
      [15, '愛紅', 'Megu', '爱红'], [16, '伽琉羅', 'Karura', '伽琉罗'],
      [17, '琴音', 'Kotone'], [18, '絽媚奈', 'Romina', '萝米娜'],
      [19, 'MONICA', 'Monica', '莫妮卡'], [20, 'ALICE', 'Alice', '爱丽丝'],
      [21, '羅魅阿', 'Lamia', '萝米亚'], [22, '絵里奈', 'Erina', '绘里奈'],
      [23, '胡桃', 'Kurumi'], [24, '美咲', 'Misaki'],
      [25, '心愛', 'Cocoa', '心爱'], [26, '毬香', 'Marika'],
      [27, '鈴音', 'Suzune', '铃音'], [28, '優菜', 'Yuna', '优菜'],
      [29, '綾乃', 'Ayano', '绫乃'], [30, '愛実', 'Manami', '爱实'],
      [31, '美香子', 'Mikako'], [32, '静香', 'Shizuka'],
      [33, '麻衣子', 'Maiko'], [34, '千香子', 'Chikako'],
      [35, '真由美', 'Mayumi'], [36, '純恋', 'Sumire', '纯恋'],
      [37, '優姫奈', 'Yukina', '优姬奈', '優姬奈'], [38, '萌奈美', 'Monami'],
      [39, '麻里絵', 'Marie', '麻里绘'], [40, '日向子', 'Hinako'],
      [41, '', ''], [42, '千絵美', 'Chiemi', '千绘美'],
      [43, '千秋', 'Chiaki'], [44, '百合野', 'Yurino'],
      [45, '千紗希', 'Chisaki', '千纱希'], [46, '彩葉', 'Ayaha', '彩叶'],
      [47, '華恋', 'Karen', '华恋'], [48, '美由紀', 'Miyuki', '美由纪'],
      [49, '柑奈', 'Kanna'], [50, '小桃', 'Komomo'],
      [51, '梨花', 'Rinka'], [52, '友梨奈', 'Yurina'],
      [53, '朱里', 'Akari'], [54, '楓', 'Kaede', '枫'],
      [55, '七瀬', 'Nanase', '七濑'], [56, '結花', 'Yuika', '结花'],
      [57, '涼香', 'Suzuka', '凉香'], [58, '翼', 'Tsubasa'],
      [59, '小夏', 'Konatsu'], [60, '悠里', 'Yuri'],
      [61, '水姫', 'Mizuki', '水姬'], [62, '梓', 'Azusa'],
      [63, '麗香', 'Reika', '丽香'], [64, '真登香', 'Madoka'],
      [65, '里美', 'Satomi'], [66, '里緒奈', 'Riona', '里绪奈'],
      [67, '愛花', 'Manami', '爱花'], [68, '夏香', 'Natsuka'],
      [69, '萌奈香', 'Monaka'], [70, '心美', 'Kokomi'],
      [71, '美花莉', 'Mikari'], [72, '孋々栖', 'Ririsu', '莉莉丝'],
      [73, '芹香', 'Serika'], [74, '京香', 'Kyouka'],
      [75, '愛純', 'Azumi', '爱纯'], [76, '美紅瑠', 'Mikuru', '美红瑠'],
      [77, '依子', 'Yoriko'], [78, '佳花', 'Keika'],
      [79, '小夢', 'Koyume', '小梦'], [80, '芽亜里', 'Meari', '芽亚里', 'メアリ'],
      // 本站 #82 来源 URL 同时包含「莉乃」和 RINA，保留与附件 Rino 的拼写差异。
      [81, '陽茉莉', 'Himari', '阳茉莉'], [82, '莉乃', 'Rino / RINA', '莉乃', 'Rino', 'RINA'],
      [83, '美月', 'Mitsuki'], [84, '美久', 'Miku']
    ])
  }
]
