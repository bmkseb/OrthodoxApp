import type { IconName } from '@/components/Icon';

export type TopicLevel = 'foundational' | 'advanced' | 'liturgical';

export type LearnTopic = {
  id: string;
  titleEn: string;
  titleAm: string;
  readMin?: number;
  level?: TopicLevel;
  /** Kebab-case doctrine subtopic slug (present when sourced from Supabase). */
  slug?: string;
  /** When zero, the row is a section header (children hold the lessons). */
  passageCount?: number;
  children?: LearnTopic[];
};

export type LearnCollection = {
  id: string;
  titleEn: string;
  titleAm: string;
  subtitleEn: string;
  subtitleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  icon: IconName;
  topics: LearnTopic[];
};

export type LearnFeatured = {
  id: string;
  titleEn: string;
  titleAm: string;
  categoryEn: string;
  categoryAm: string;
  readMin: number;
  imageUri: string;
  collectionId: string;
};

const t = (
  id: string,
  titleEn: string,
  titleAm: string,
  readMin = 5,
  level: TopicLevel = 'foundational'
): LearnTopic => ({ id, titleEn, titleAm, readMin, level });

export const LEARN_COLLECTIONS: LearnCollection[] = [
  {
    id: 'faith-foundation',
    titleEn: 'Faith & Foundation',
    titleAm: 'እምነት እና መሠረት',
    subtitleEn: 'The roots of Orthodox belief',
    subtitleAm: 'የኦርቶዶክስ እምነት ሥር',
    descriptionEn: 'The roots of Orthodox belief and creation',
    descriptionAm: 'የኦርቶዶክስ እምነት፣ ፍጥረት እና ሥር መሠረቶች',
    icon: 'pillar',
    topics: [
      t('faith', 'Faith', 'እምነት'),
      t('faith-action', 'Faith and Works', 'እምነት እና ተግባር'),
      t('christianity', 'Christianity', 'ክርስትና'),
      t('orthodox', 'Orthodox', 'ኦርቶዶክስ'),
      t('tewahedo', 'Tewahedo', 'ተዋሕዶ'),
      t('acts-creation', 'Acts of Creation', 'የፍጥረት ተግባራት'),
      t('22-acts', '22 Acts of Creation', '፳፪ የፍጥረት ተግባራት', 8, 'advanced'),
      t('7-heavens', '7 Heavens', '፯ ሰማያት', 6),
      t('three-laws', 'Three Laws', 'ሦስት ሕጎች', 6, 'liturgical'),
    ],
  },
  {
    id: 'mysteries-sacraments',
    titleEn: 'Mysteries & Sacraments',
    titleAm: 'ምስጢራት እና ተንሣኤ',
    subtitleEn: 'Sacred mysteries of the Church',
    subtitleAm: 'ቅድስት ቤተ ክርስቲያን ምስጢራት',
    descriptionEn: 'The holy mysteries entrusted to the Church',
    descriptionAm: 'ለቤተ ክርስቲያን የተሰጡ ቅዱስ ምስጢራት',
    icon: 'sparkle',
    topics: [
      t('five-pillars', 'Five Pillars of Mystery', 'አምስት ምሰሶዎች', 7),
      t('trinity', 'Trinity', 'ሥላሴ', 8),
      t('incarnation', 'Incarnation', 'ሥጋዌ', 7),
      t('baptism', 'Baptism', 'ጥምቀት', 6),
      t('holy-myron', 'Holy Myron', 'ቅዱስ ምሮን', 6, 'liturgical'),
      t('eucharist', 'Eucharist', 'ቁርባን', 8, 'liturgical'),
      t('resurrection', 'Resurrection', 'ትንሣኤ', 7),
      t('seven-sacraments', 'Seven Sacraments', 'ሰባት ተንሣኤ', 8),
      t('priesthood', 'Priesthood', 'ክህነት', 6, 'liturgical'),
      t('matrimony', 'Matrimony', 'የጋብቻ ተንሣኤ', 5),
      t('confession', 'Confession', 'ንስሐ', 5, 'liturgical'),
    ],
  },
  {
    id: 'scripture-tradition',
    titleEn: 'Scripture & Tradition',
    titleAm: 'መጽሐፍ ቅድስት እና ትውፊት',
    subtitleEn: 'Word and holy tradition',
    subtitleAm: 'ቃል እና ቅድስት ትውፊት',
    descriptionEn: 'Holy Scripture and the living tradition of the Church',
    descriptionAm: 'መጽሐፍ ቅድስት እና ሕያው ትውፊት',
    icon: 'book',
    topics: [
      t('holy-bible', 'Holy Bible', 'መጽሐፍ ቅድስት', 10),
      t('old-testament', 'Old Testament', 'ብሉይ ኪዳን', 8),
      t('new-testament', 'New Testament', 'አዲስ ኪዳን', 8),
      t('gospel', 'Gospel', 'ወንጌል', 6),
      t('evangelists', 'Evangelists', 'ወንጋዌዎች', 5),
      t('apostles', 'Apostles', 'ሐዋርያት', 6),
      t('pauline', 'Pauline Epistles', 'የጳውሎስ መልዕክታት', 7, 'advanced'),
      t('tewfit', 'Tradition (Tewfit)', 'ትውፊት (ተውፊት)', 7),
      t('commandments', '10 Commandments', '፲ ትእዛዛት', 5),
      t('sabbath', 'Sabbath', 'ሰንበት', 4, 'liturgical'),
    ],
  },
  {
    id: 'saints-prophets',
    titleEn: 'Saints, Prophets & Apostles',
    titleAm: 'ቅዱሳን፣ ነቢያት እና ሐዋርያት',
    subtitleEn: 'Witnesses of the faith',
    subtitleAm: 'የእምነት ምስክሮች',
    descriptionEn: 'The cloud of witnesses in sacred history',
    descriptionAm: 'በቅድስት ታሪክ ውስጥ የሚገኙ ምስክሮች',
    icon: 'cross',
    topics: [
      t('virgin-mary', 'Virgin Mary', 'ድንግል ማርያም', 6),
      t('prophets', 'Prophets', 'ነቢያት', 7),
      t('apostles-saints', 'Apostles', 'ሐዋርያት', 6),
      t('archangels', 'Archangels', 'ሊቀ መልአክት', 5),
      t('living-creatures', 'Living Creatures', 'አራቱ ሕያዋን ፍጥረታት', 6, 'advanced'),
      t('saints', 'Saints', 'ቅዱሳን', 6),
      t('monasticism', 'Monasticism', 'መነኰሳዊ ሕይወት', 7),
    ],
  },
  {
    id: 'cross-worship',
    titleEn: 'The Holy Cross & Worship',
    titleAm: 'ቅዱስ ስብራት እና አምልኮ',
    subtitleEn: 'Signs of reverence',
    subtitleAm: 'የአክብሮት ምልክቶች',
    descriptionEn: 'The Cross, icons, and gestures of worship',
    descriptionAm: 'ስብራት፣ አይኮኖች እና የአምልኮ ምልክቶች',
    icon: 'cross',
    topics: [
      t('holy-cross', 'Holy Cross', 'ቅዱስ ስብራት', 6),
      t('sign-cross', 'Sign of the Cross', 'የስብራት ምልክት', 4, 'liturgical'),
      t('holy-icons', 'Holy Icons', 'ቅዱስ አይኮኖች', 6),
      t('prayer-beads', 'Prayer Beads', 'የጸሎት ድርድሮች', 4, 'liturgical'),
      t('tabot', 'Tabot', 'ታቦት', 5, 'liturgical'),
      t('prostration', 'Prostration', 'ስጋድ', 4, 'liturgical'),
    ],
  },
  {
    id: 'liturgy-order',
    titleEn: 'Liturgy & Church Order',
    titleAm: 'ቅዳሴ እና የቤተ ክርስቲያን ሥርዓት',
    subtitleEn: 'The order of worship',
    subtitleAm: 'የአምልኮ ሥርዓት',
    descriptionEn: 'Liturgy, vestments, and ecclesiastical order',
    descriptionAm: 'ቅዳሴ፣ አልባሳት እና የቤተ ክርስቲያን ሥርዓት',
    icon: 'church',
    topics: [
      t('holy-liturgy', 'Holy Liturgy', 'ቅዱስ ቅዳሴ', 8, 'liturgical'),
      t('14-liturgies', '14 Liturgies', '፲፬ ቅዳሴዎች', 7, 'advanced'),
      t('vestments', 'Vestments', 'አልባሳት', 5, 'liturgical'),
      t('sanctuary', 'Sanctuary', 'ቅድስት', 5, 'liturgical'),
      t('ecclesiastical', 'Ecclesiastical Order', 'የቤተ ክርስቲያን ሥርዓት', 6),
      t('church-entry', 'Church Entry Order', 'የቤተ ክርስቲያን መግቢያ ሥርዓት', 5, 'liturgical'),
    ],
  },
  {
    id: 'fasting-prayer',
    titleEn: 'Fasting, Prayer & Spiritual Life',
    titleAm: 'ጾም፣ ጸሎት እና መንፈሳዊ ሕይወት',
    subtitleEn: 'Rhythm of devotion',
    subtitleAm: 'የመዝሙር ሕይወት',
    descriptionEn: 'Fasts, hours of prayer, and memorial rites',
    descriptionAm: 'ጾሞች፣ የጸሎት ሰዓታት እና ትዝክር',
    icon: 'sun',
    topics: [
      t('7-fasts', '7 Fasts', '፯ ጾሞች', 6, 'liturgical'),
      t('great-lent', 'Great Lent', 'የትላቁ ጾም', 7, 'liturgical'),
      t('nineveh', 'Nineveh Fast', 'የነነዌ ጾም', 5, 'liturgical'),
      t('seven-hours', 'Prayer at Seven Hours', 'በሰባት ሰዓታት ጸሎት', 6, 'liturgical'),
      t('order-prayer', 'Order of Prayer', 'የጸሎት ሥርዓት', 6, 'liturgical'),
      t('burial', 'Burial & Memorials', 'ቅብር እና ትዝክር', 6, 'liturgical'),
    ],
  },
  {
    id: 'sacred-music',
    titleEn: 'Sacred Music & Instruments',
    titleAm: 'ቅዱስ ዜማ እና መሳሪያዎች',
    subtitleEn: 'Zema and sacred sound',
    subtitleAm: 'ዜማ እና ቅዱስ ድምፅ',
    descriptionEn: 'Holy music and traditional sacred instruments',
    descriptionAm: 'ቅዱስ ዜማ እና ባህላዊ መሳሪያዎች',
    icon: 'music',
    topics: [
      t('zema', 'Holy Music (Zema)', 'ቅዱስ ዜማ', 7, 'liturgical'),
      t('begena', 'Begena', 'በገና', 5),
      t('kebero', 'Kebero', 'ከበሮ', 4),
      t('mesinqo', 'Mesinqo', 'መሲንቆ', 4),
      t('tsenatsel', 'Tsenatsel', 'ጸናትል', 4),
    ],
  },
  {
    id: 'feasts',
    titleEn: 'Feasts & Holy Days',
    titleAm: 'በዓላት እና ቅዱስ ቀናት',
    subtitleEn: 'The liturgical year',
    subtitleAm: 'የቅዳሴ ዓመት',
    descriptionEn: 'Major and minor feasts of the Lord and the Church',
    descriptionAm: 'የጌታ እና የቤተ ክርስቲያን በዓላት',
    icon: 'calendar',
    topics: [
      t('9-major', '9 Major Feasts', '፱ ዋና በዓላት', 7, 'liturgical'),
      t('9-minor', '9 Minor Feasts', '፱ ትንሽ በዓላት', 6, 'liturgical'),
      t('circumcision', 'Circumcision', 'መገረጽ', 5, 'liturgical'),
      t('feasts-lord', 'Feasts of the Lord', 'የጌታ በዓላት', 6, 'liturgical'),
    ],
  },
  {
    id: 'heaven-judgment',
    titleEn: 'Heaven, Resurrection & Judgment',
    titleAm: 'ሰማይ፣ ትንሣኤ እና ፍርድ',
    subtitleEn: 'The last things',
    subtitleAm: 'የመጨረሻው ነገሮች',
    descriptionEn: 'Resurrection, judgment, and eternal life',
    descriptionAm: 'ትንሣኤ፣ ፍርድ እና ዘላለማዊ ሕይወት',
    icon: 'moon',
    topics: [
      t('resurrection-last', 'Resurrection', 'ትንሣኤ', 7),
      t('trumpet', 'Trumpet', 'በለጥ', 5, 'advanced'),
      t('last-judgment', 'Last Judgment', 'የመጨረሻ ፍርድ', 7, 'advanced'),
      t('hour-judgment', 'Hour of Judgment', 'የፍርድ ሰዓት', 6, 'advanced'),
    ],
  },
];

export const LEARN_FEATURED: LearnFeatured[] = [
  {
    id: 'trinity',
    titleEn: 'Mystery of the Trinity',
    titleAm: 'ሥራዊት ሥላሴ',
    categoryEn: 'Mysteries & Sacraments',
    categoryAm: 'ምስጢራት',
    readMin: 12,
    imageUri: 'https://picsum.photos/900/540?random=learn1',
    collectionId: 'mysteries-sacraments',
  },
  {
    id: 'eucharist',
    titleEn: 'The Holy Eucharist',
    titleAm: 'ቅዱስ ቁርባን',
    categoryEn: 'Mysteries & Sacraments',
    categoryAm: 'ምስጢራት',
    readMin: 10,
    imageUri: 'https://picsum.photos/900/540?random=learn2',
    collectionId: 'mysteries-sacraments',
  },
  {
    id: '7-heavens',
    titleEn: 'The 7 Heavens',
    titleAm: '፯ ሰማያት',
    categoryEn: 'Faith & Foundation',
    categoryAm: 'እምነት',
    readMin: 8,
    imageUri: 'https://picsum.photos/900/540?random=learn3',
    collectionId: 'faith-foundation',
  },
  {
    id: 'holy-cross',
    titleEn: 'The Holy Cross',
    titleAm: 'ቅዱስ ስብራት',
    categoryEn: 'Cross & Worship',
    categoryAm: 'ስብራት',
    readMin: 9,
    imageUri: 'https://picsum.photos/900/540?random=learn4',
    collectionId: 'cross-worship',
  },
];

export const LEARN_RECENT_IDS = ['trinity', 'eucharist', 'holy-cross', '7-fasts'];
export const LEARN_CONTINUE_ID = 'eucharist';
export const LEARN_DAILY_ID = 'incarnation';
export const LEARN_SAVED_IDS = ['trinity', 'holy-liturgy', 'zema'];

export function findTopicById(topicId: string): { topic: LearnTopic; collection: LearnCollection } | null {
  for (const collection of LEARN_COLLECTIONS) {
    const topic = collection.topics.find((x) => x.id === topicId);
    if (topic) return { topic, collection };
  }
  return null;
}

export function searchLearnLibrary(query: string): { collection: LearnCollection; topics: LearnTopic[] }[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LEARN_COLLECTIONS.map((collection) => ({
    collection,
    topics: collection.topics.filter(
      (topic) =>
        topic.titleEn.toLowerCase().includes(q) ||
        topic.titleAm.includes(query.trim()) ||
        collection.titleEn.toLowerCase().includes(q)
    ),
  })).filter((g) => g.topics.length > 0);
}

export function getFeatured(index = 0): LearnFeatured {
  return LEARN_FEATURED[index % LEARN_FEATURED.length];
}
