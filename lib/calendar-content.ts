import type { LiturgicalFeast } from '@/lib/eotc-liturgical-calendar';

export type SeasonKey =
  | 'advent'
  | 'christmas'
  | 'epiphany'
  | 'ordinary'
  | 'nineveh'
  | 'lent'
  | 'holyWeek'
  | 'easter'
  | 'ascension'
  | 'pentecost'
  | 'apostlesFast'
  | 'marysFast';

export type SeasonInfo = {
  name: string;
  nameEn: string;
  color: string;
  description: string;
  fastingRule: string;
};

export const SEASONS: Record<SeasonKey, SeasonInfo> = {
  advent: {
    name: 'Advent — ጾመ ነቢያት',
    nameEn: 'Season of Advent',
    color: '#4A0080',
    description:
      'A 40-day fast of preparation for Christmas. Begins Hedar 15 (Nov 24) and ends Christmas Eve. A time of devout and penitential preparation of the soul.',
    fastingRule: 'Fasting required. One meal after 3pm. No meat, dairy, eggs, or fats.',
  },
  christmas: {
    name: 'Christmas Season — ልደት',
    nameEn: 'Season of Christmas',
    color: '#B8860B',
    description:
      'The celebration of the birth of our Lord Jesus Christ. Ethiopian Christmas (Gena/Liddet) falls on January 7th. No fasting during this season.',
    fastingRule: 'No fasting. The feast of feasts is being celebrated.',
  },
  epiphany: {
    name: 'Epiphany — ጥምቀት',
    nameEn: 'Season of Epiphany',
    color: '#1565C0',
    description:
      'Celebrates the baptism of our Lord Jesus Christ in the Jordan River. One of the most important feasts of the Ethiopian Orthodox Church, celebrated with grand processions and the blessing of water.',
    fastingRule: 'No fasting on Epiphany day (Jan 19). Regular Wed/Fri fasting resumes after.',
  },
  ordinary: {
    name: 'Ordinary Season',
    nameEn: 'Ordinary Time',
    color: '#2E7D32',
    description:
      'The regular season of the liturgical year. The faithful are called to prayer, fasting, and observance of the monthly feasts.',
    fastingRule: 'Fast every Wednesday and Friday. One meal after 3pm. No meat or dairy.',
  },
  nineveh: {
    name: 'Fast of Nineveh — ጾመ ነነዌ',
    nameEn: 'Fast of Nineveh',
    color: '#4A148C',
    description:
      'A 3-day fast (Monday-Wednesday) commemorating the preaching of the Prophet Jonah to Nineveh. Falls 3 weeks before the start of Great Lent.',
    fastingRule: 'Complete fast for 3 days (Mon-Wed). No food or water until evening.',
  },
  lent: {
    name: 'Great Lent — ዐቢይ ጾም',
    nameEn: 'Great Lent (Hudadi)',
    color: '#4E342E',
    description:
      'The 56-day Great Lent (Hudadi) is the most rigorous fast in the world. It is a test of one\'s Christianity. The faithful abstain from all animal products. Daily church services are held from morning to 2:45pm. Properly observed, it nullifies sins committed during the rest of the year.',
    fastingRule: 'Strictest fast. One meal per day after 3pm. No meat, dairy, eggs, or fats. No exceptions.',
  },
  holyWeek: {
    name: 'Holy Week — ሰሙነ ሕማማት',
    nameEn: 'Holy Week (Himamat)',
    color: '#1A237E',
    description:
      'The most solemn week of the year, commemorating the Passion of our Lord. From Holy Thursday afternoon until Easter morning, the most devout faithful take no food or water. Priests remain in churches singing and praying without ceasing.',
    fastingRule: 'Complete fast Thu-Sat for the devout. No absolution given during Holy Week.',
  },
  easter: {
    name: 'Easter Season — ትንሣኤ',
    nameEn: 'Season of Easter (Fifty Days)',
    color: '#F9A825',
    description:
      'The Feast of Feasts! For 50 days from Easter to Pentecost, the faithful celebrate the Resurrection of our Lord. This is a season of great joy. No fasting is observed, even on Wednesdays and Fridays.',
    fastingRule: 'No fasting at all — not even on Wed or Fri. A season of pure celebration and joy.',
  },
  ascension: {
    name: 'Ascension — ዕርገት',
    nameEn: 'Season of Ascension',
    color: '#1B5E20',
    description:
      'Commemorates the Ascension of our Lord into heaven 40 days after His Resurrection. The faithful celebrate that Christ sits at the right hand of the Father and intercedes for all humanity.',
    fastingRule: 'No fasting on Ascension day itself.',
  },
  pentecost: {
    name: 'Pentecost — ጰራቅሊጦስ',
    nameEn: 'Season of Pentecost',
    color: '#BF360C',
    description:
      'Celebrates the descent of the Holy Spirit upon the Apostles 50 days after Easter. This marks the beginning of the Fast of the Apostles.',
    fastingRule: 'Fast of the Apostles begins the Monday after Pentecost Sunday. Lasts 10-40 days.',
  },
  apostlesFast: {
    name: 'Fast of the Apostles — ጾመ ሐዋርያት',
    nameEn: 'Fast of the Apostles',
    color: '#37474F',
    description:
      'This is the fast the Apostles kept after they received the Holy Spirit at Pentecost. It begins the Monday after Pentecost and ends on Sene 27 (July 5). Length varies from 10 to 40 days depending on the year.',
    fastingRule: 'Fast daily. One meal after 3pm. No meat, dairy, eggs, or fats.',
  },
  marysFast: {
    name: 'Fast of Mary — ጾመ ፍልሰታ',
    nameEn: 'Fast of the Assumption of Mary',
    color: '#880E4F',
    description:
      'A 16-day fast from Nehase 1-16 (Aug 7-22) honoring the Blessed Virgin Mary. It commemorates her Assumption into heaven. The Feast of Assumption (Filseta) falls on Nehase 16 (Aug 22).',
    fastingRule: 'Fast for 16 days. One meal after 3pm. No meat, dairy, eggs, or fats.',
  },
};

export type FeastInfoKey =
  | 'conception'
  | 'christmas'
  | 'epiphany'
  | 'transfiguration'
  | 'palmSunday'
  | 'goodFriday'
  | 'easter'
  | 'ascension'
  | 'pentecost'
  | 'kidaneMihret'
  | 'assumption'
  | 'maryMonthly'
  | 'michaelMonthly'
  | 'gabrielAnnual'
  | 'meskel'
  | 'newYear'
  | 'trinityMonthly'
  | 'tekleHaymanot'
  | 'deathOfLord'
  | 'birthOfChrist';

export type FeastInfo = {
  name: string;
  nameAm: string;
  description: string;
};

export const FEASTS_INFO: Record<FeastInfoKey, FeastInfo> = {
  conception: {
    name: 'Conception of Our Lord',
    nameAm: 'ፀነሰ ወልድ',
    description:
      'Commemorates the moment the Angel Gabriel announced to the Virgin Mary that she would conceive the Son of God by the Holy Spirit.',
  },
  christmas: {
    name: 'Christmas — Gena/Liddet',
    nameAm: 'ልደተ ክርስቶስ — ገና',
    description:
      'The birth of our Lord Jesus Christ from the Holy Virgin Mary. Celebrated on January 7 (Tahsas 29). Preceded by a 40-day fast. The name Gena also refers to the traditional hockey-like game played on this day.',
  },
  epiphany: {
    name: 'Epiphany — Timket',
    nameAm: 'ጥምቀት',
    description:
      'Celebrates the baptism of Jesus Christ in the Jordan River by St. John the Baptist. One of the greatest feasts of the Ethiopian Church, celebrated on January 19 (Ter 11) with grand processions, the blessing of water, and all-night vigils.',
  },
  transfiguration: {
    name: 'Transfiguration — Debre Tabor',
    nameAm: 'ደብረ ታቦር',
    description:
      'Commemorates the Transfiguration of Jesus on Mount Tabor, where He appeared in blinding light before Peter, James and John, alongside Moses and Elijah.',
  },
  palmSunday: {
    name: 'Palm Sunday — Hosanna',
    nameAm: 'ሆሳዕና',
    description:
      'Commemorates the triumphant entry of Jesus into Jerusalem. The faithful carry palm branches and olive leaves. It marks the beginning of Holy Week.',
  },
  goodFriday: {
    name: 'Good Friday — Seklet',
    nameAm: 'ስቅለት',
    description:
      'The crucifixion of our Lord Jesus Christ. The most solemn day of the year. The faithful fast completely and attend church from morning until 3pm, the hour of Christ\'s death. All the instruments of the Passion are exhibited in the church.',
  },
  easter: {
    name: 'Easter — Tinsae',
    nameAm: 'ትንሣኤ',
    description:
      'The Feast of Feasts — the Resurrection of our Lord Jesus Christ. Celebrated with enormous joy: the church is filled with incense, thousands of candles, and the faithful greet each other saying \'Our Resurrection has come, Hosanna!\' No fasting for 50 days after Easter.',
  },
  ascension: {
    name: 'Ascension — Erget',
    nameAm: 'ዕርገት',
    description:
      'The Ascension of our Lord Jesus Christ into heaven, 40 days after His Resurrection. Christ now sits at the right hand of the Father, ever interceding for humanity.',
  },
  pentecost: {
    name: 'Pentecost — Peraklitos',
    nameAm: 'ጰራቅሊጦስ',
    description:
      'The descent of the Holy Spirit upon the Apostles in the Upper Room in Jerusalem, 50 days after Easter. Marks the birth of the Church and the beginning of the Fast of the Apostles.',
  },
  kidaneMihret: {
    name: 'Covenant of Mercy — Kidane Mihret',
    nameAm: 'ኪዳነ ምሕረት',
    description:
      'Honors the merciful covenant God made with the Virgin Mary — that for her sake He would have mercy on sinners who call upon her intercession. Celebrated monthly on the 16th of each Ethiopian month, with the grand annual feast on Yekatit 16 (Feb 24).',
  },
  assumption: {
    name: 'Assumption of Mary — Filseta',
    nameAm: 'ፍልሰታ ማርያም',
    description:
      'Commemorates the falling asleep, resurrection, and ascension of the Blessed Virgin Mary into heaven. Preceded by a 16-day fast (Nehase 1-15). The feast is celebrated on Nehase 16 (August 22) with great solemnity.',
  },
  maryMonthly: {
    name: 'Monthly Feast of the Virgin Mary',
    nameAm: 'በዓለ እመቤታችን',
    description:
      'The 21st of every Ethiopian month is dedicated to the Blessed Virgin Mary, commemorating her death and birth in heaven. The faithful venerate icons of the Virgin and offer special prayers and praise.',
  },
  michaelMonthly: {
    name: 'Feast of St. Michael the Archangel',
    nameAm: 'በዓለ ቅዱስ ሚካኤል',
    description:
      'St. Michael the Archangel is commemorated on the 12th of every Ethiopian month. He is the chief of the angels, protector of the Church, and the guardian of the faithful. The Ethiopian Orthodox Church has a special devotion to St. Michael.',
  },
  gabrielAnnual: {
    name: 'Feast of St. Gabriel the Archangel',
    nameAm: 'በዓለ ቅዱስ ገብርኤል',
    description:
      'St. Gabriel is the messenger angel who announced the Incarnation to the Virgin Mary. He is commemorated on Hamle 19 (July 26) annually and holds a place of great honor in the Church.',
  },
  meskel: {
    name: 'Finding of the True Cross — Meskel',
    nameAm: 'መስቀል',
    description:
      'Commemorates the finding of the True Cross by Queen Helena in the 4th century. Ethiopia claims to possess a portion of the True Cross. Celebrated on Meskerem 17 (September 27) with massive bonfires (Demera) lit in every town and city.',
  },
  newYear: {
    name: 'Ethiopian New Year — Enkutatash',
    nameAm: 'ዕንቁጣጣሽ',
    description:
      'The Ethiopian New Year (Enkutatash — meaning \'gift of jewels\') falls on Meskerem 1 (September 11). It marks the end of the rainy season and the beginning of spring. Children give bunches of wildflowers and sing songs from house to house.',
  },
  trinityMonthly: {
    name: 'Monthly Feast of the Holy Trinity',
    nameAm: 'በዓለ ቅድስት ሥላሴ',
    description:
      'The 7th of every Ethiopian month is dedicated to the Holy Trinity — Father, Son, and Holy Spirit. The Ethiopian Church has a particularly strong Trinitarian theology and devotion.',
  },
  tekleHaymanot: {
    name: 'Feast of St. Tekle Haymanot',
    nameAm: 'በዓለ አቡነ ተክለ ሃይማኖት',
    description:
      'St. Tekle Haymanot (1215-1313) is the greatest Ethiopian saint. He is said to have stood in prayer on one leg for 7 years until the other leg fell off. He founded the monastery of Debre Libanos, the most important monastery in Ethiopia. Commemorated on Nehase 24 (August 30).',
  },
  deathOfLord: {
    name: 'Commemoration of the Death of Our Lord',
    nameAm: 'ዕለተ ሕማሙ',
    description:
      'The 27th of every Ethiopian month commemorates the death of our Lord Jesus Christ on the Cross. A day of solemn reflection and prayer.',
  },
  birthOfChrist: {
    name: 'Monthly Feast of the Birth of Christ',
    nameAm: 'ልደተ ክርስቶስ ወርሃዊ',
    description:
      'The 29th of every Ethiopian month commemorates the Nativity of our Lord Jesus Christ. A day of celebration and thanksgiving.',
  },
};

const FEAST_NAME_TO_KEY: Array<{ match: RegExp; key: FeastInfoKey }> = [
  { match: /christmas|genna/i, key: 'christmas' },
  { match: /epiphany|timket/i, key: 'epiphany' },
  { match: /meskel/i, key: 'meskel' },
  { match: /enkutatash|new year/i, key: 'newYear' },
  { match: /kidane mihret/i, key: 'kidaneMihret' },
  { match: /filseta|assumption/i, key: 'assumption' },
  { match: /transfiguration|debre tabor/i, key: 'transfiguration' },
  { match: /hosanna|palm sunday/i, key: 'palmSunday' },
  { match: /siqlet|good friday/i, key: 'goodFriday' },
  { match: /fasika|easter|tinsae/i, key: 'easter' },
  { match: /erget|ascension/i, key: 'ascension' },
  { match: /pentecost|paraklitos|peraqlitos/i, key: 'pentecost' },
  { match: /gabriel/i, key: 'gabrielAnnual' },
  { match: /tekle haymanot/i, key: 'tekleHaymanot' },
  { match: /holy trinity/i, key: 'trinityMonthly' },
  { match: /michael/i, key: 'michaelMonthly' },
  { match: /holy virgin mary|virgin mary/i, key: 'maryMonthly' },
  { match: /medhane alem|savior of the world/i, key: 'deathOfLord' },
  { match: /bale wold|feast of god the son/i, key: 'birthOfChrist' },
];

export function resolveFeastInfoKey(feast: LiturgicalFeast): FeastInfoKey | null {
  for (const { match, key } of FEAST_NAME_TO_KEY) {
    if (match.test(feast.name)) return key;
  }
  return null;
}

export function getFeastDescription(feast: LiturgicalFeast): string | null {
  const key = resolveFeastInfoKey(feast);
  return key ? FEASTS_INFO[key].description : null;
}

export function getFeastIcon(feast: LiturgicalFeast): string {
  if (feast.type === 'lord' || feast.type === 'new_year') return '☩';
  if (feast.type === 'mary') return '✦';
  if (feast.type === 'angel') return '✧';
  return '◆';
}
