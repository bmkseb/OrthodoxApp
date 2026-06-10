export type GuideBulletGroup = {
  label?: string;
  items: string[];
};

export type LiturgicalGuideSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: GuideBulletGroup[];
};

export const ETHIOPIAN_MONTHS = [
  { name: 'Meskerem', period: 'September – October' },
  { name: 'Teqemt', period: 'October – November' },
  { name: 'Hedar', period: 'November – December' },
  { name: 'Tahsas', period: 'December – January' },
  { name: 'Ter', period: 'January – February' },
  { name: 'Yekatit', period: 'February – March' },
  { name: 'Megabit', period: 'March – April' },
  { name: 'Miyazia', period: 'April – May' },
  { name: 'Ginbot', period: 'May – June' },
  { name: 'Sene', period: 'June – July' },
  { name: 'Hamle', period: 'July – August' },
  { name: 'Nehase', period: 'August – September' },
] as const;

export const DAYS_OF_WEEK = [
  { day: 'Sunday', names: 'Ehud, Senbete Krestian' },
  { day: 'Monday', names: 'Sagno' },
  { day: 'Tuesday', names: 'Maksagno' },
  { day: 'Wednesday', names: 'Rabue' },
  { day: 'Thursday', names: 'Hamus' },
  { day: 'Friday', names: 'Sadus, Arb' },
  { day: 'Saturday', names: 'Qadamit Sanbat' },
] as const;

export const EVANGELIST_CYCLE = ['Matthew', 'Mark', 'Luke', 'John'] as const;

/** Monthly commemorations on fixed days of each Ethiopian month (Senksar tradition). */
export const MONTHLY_FEAST_DAYS = [
  { day: 7, feast: 'Holy Trinity' },
  { day: 12, feast: 'St. Michael the Archangel' },
  { day: 16, feast: 'Kidane Mehret (Covenant of Mercy)' },
  { day: 21, feast: 'Holy Virgin Mary — death or birth in heaven' },
  { day: 27, feast: 'Death of Our Lord' },
  { day: 29, feast: 'Birth of Christ' },
] as const;

export const NATIONAL_RELIGIOUS_FEASTS = [
  { name: 'Christmas (Gena / Liddet)', ethiopian: 'Tahsas 29 E.C. (7 January)' },
  { name: 'Epiphany (Timket)', ethiopian: 'Ter 11 E.C. (19 January)' },
  { name: 'St. Michael the Archangel', ethiopian: 'Ter 12 E.C. (20 January)' },
  { name: 'Good Friday (Siqlet)', ethiopian: 'Movable' },
  { name: 'Easter (Fasika / Tinsae)', ethiopian: 'Movable' },
  { name: 'Feast of the Assumption (Filseta)', ethiopian: 'Nehase 16 E.C. (22 August)' },
  { name: 'Finding of the True Cross (Meskel)', ethiopian: 'Meskerem 17 E.C. (27 September)' },
] as const;

export const LITURGICAL_GUIDE_SECTIONS: LiturgicalGuideSection[] = [
  {
    id: 'calendar',
    title: '1. The Calendar',
    paragraphs: [
      'The calendar of the Ethiopian Church came from Egypt and, as to methods and dates, agrees with the calendar of the Coptic Church. The two calendars differ with regard to the saints\' days and the time of observing them.',
      'The year of the Ethiopian calendar contains 365 days, to which is added every fourth year an extra day. Each year in this four-year period is dedicated to one of the four Evangelists in the following order: Matthew, Mark, Luke, and John. The year of Luke is the Ethiopian leap year and is the year which precedes the Western leap year.',
      'Each year is divided into 12 months of 30 days. The extra 5 days are placed at the end of the year and known as Pagumen. In the leap year the extra day is added to these five days, making the Pagumen of that year a period of 6 days.',
      'As in Julian and Gregorian calendars, days are grouped into weeks and are named in order.',
      'The chronology of the Ethiopian Church follows the Era of Incarnation — it dates from our Lord\'s birth. There is a difference of 7 or 8 years between the Western and Ethiopian systems. Because the Ethiopian Church holds that our Lord was born 5,500 years after the creation of the world, this gives the 7 or 8 years difference between the Gregorian and Ethiopian chronologies.',
      'The Church also uses other systems of chronology: the Era of the World (dating from 5493 B.C., also differing from the Western chronology by 7 or 8 years), and a system called "the years of Mercy or Grace," which follows the great lunar cycle.',
      'The movable feasts are those of Easter and the days which depend upon it. The reckoning of Easter is based upon the system of Ammonius. The dates of Easter and the feasts which depend upon it are determined by the Fast of Nineveh, which precedes the Easter Lent; in turn, once the date of Nineveh is known, the dates of Easter and the movable feasts can be calculated.',
    ],
    bullets: [
      {
        label: 'Movable feast boundaries (Ethiopian calendar)',
        items: [
          'Easter Lent always begins on a Monday and cannot come before Yekatit 1 nor after Megabit 5.',
          'Festival of the Mount of Olives always begins on a Sunday and cannot come before Yekatit 28 nor after Miyazia 2.',
          'Palm Sunday cannot come before Megabit 19 nor after Miyazia 23.',
          'Easter is on a Sunday and cannot come before Megabit 26 nor after Miyazia 30.',
          'Congress of priests always begins on a Wednesday and cannot come before Miyazia 20 nor after Ginbot 24.',
          'Ascension always begins on a Thursday and cannot come before Ginbot 5 nor after Sene 9.',
          'Feast of Pentecost always begins on a Sunday and cannot come before Ginbot 15 nor after Sene 19.',
        ],
      },
    ],
  },
  {
    id: 'festival',
    title: '2. Festival',
    paragraphs: [
      'Saints\' days and other festivals have not been imposed by any law of God; they were established by the Church herself. Some go back to apostolic times and others are of later origin. There is a prodigious number of feasts in the Ethiopian Church.',
      'The principal feasts of the Church are nine feasts of the Lord, thirty-three feasts of our Lady, the feasts of the Apostles, Sunday, Saturday, the feasts of the Angels, the feasts of the righteous (saints), and the feasts of the martyrs.',
      'The feasts of our Lord are divided into 9 major and 9 minor feasts.',
      'The feast of Kidane Mehret (Covenant of Mercy) honours the merciful power of St. Mary. The annual feast is kept on Yekatit 16 in the Ethiopian calendar (24 February in the Gregorian calendar). The 16th of each month also commemorates the Covenant of Mercy.',
      'Every Christian has a patron saint and each family has its patron saint whose anniversary is commemorated from father to son. Patrons most in vogue include St. Michael, St. Gabriel, St. George, the Virgin Mary, St. John the Baptist, Tekle Haymanot, Gebre Menfese Kidus, and St. Petros.',
      'The book Senksar is the calendar which contains a list of saints to be commemorated daily and their brief history. Angels hold a high place in the Church — they protect homes, churches, palaces, and all places of importance. Chiefs among them are St. Michael and St. Gabriel.',
    ],
    bullets: [
      {
        label: 'Major feasts of our Lord (9)',
        items: [
          'His conception',
          'Christmas',
          'Epiphany',
          'Transfiguration',
          'Palm Sunday (Hosanna)',
          'Good Friday',
          'Easter',
          'Ascension',
          'Pentecost',
        ],
      },
      {
        label: 'Minor feasts of our Lord (9)',
        items: [
          'Sibket — the preaching of the prophets that Messiah will come',
          'Brahan — our Lord came into the world for its enlightenment',
          'Nolwae — our Lord as Good Shepherd',
          'Gena — our Lord was actually born, not a mythical phenomenon',
          'Gizret — circumcision',
          'Kana ze Galilee — water turned to wine',
          'Debra zeit — the Second Advent on the Mount of Olives',
          'Megabit Meskel',
          'Ledete Simon — the woman who washed the Lord\'s feet with her tears',
        ],
      },
      {
        label: 'The 33 feasts of the Blessed Virgin Mary',
        items: [
          'The day in which she was conceived',
          'Her Nativity',
          'The day when she was taken to the temple (her presentation)',
          'The feast on which she conceived Christ',
          'Flight to Egypt',
          'The day she was thirsty and her Son commanded the rock to give water',
          'The day of promise — her Son assured mercy for sinners for her sake',
          'The sleeping of Mary (Asterio Mariam)',
          'Assumption (Filseta), celebrated for 16 days, each counted as a separate feast',
          'The day after her death when she was revealed and appeared to all',
          'Her second appearance',
          'Her third appearance',
          'Her fourth appearance',
          'Her fifth appearance',
          'Twelve monthly feasts on the 21st — commemorating her death or birth in heaven',
          'The feast of the bleeding icon when blood flowed from her image',
          'The feast of her purification',
        ],
      },
      {
        label: 'Major feasts of our Lady (annual dates)',
        items: [
          'Conception',
          'Nativity — May 1 E.C. (26 April Western)',
          'Presentation — Tahsas 3 E.C. (29 November Western)',
          'Conceived of the Lord',
          'Flight into Egypt',
          'Death of our Lady — Ter 21 E.C. (16 January Western); the 21st of each month is dedicated to the Virgin',
          'Assumption — Nehase 16 E.C. (22 August Western)',
          'Appearance',
        ],
      },
      {
        label: 'Monthly feasts (each Ethiopian month)',
        items: [
          '7th — Holy Trinity',
          '12th — St. Michael the Archangel',
          '16th — Kidane Mehret (Covenant of Mercy)',
          '21st — Holy Virgin Mary (death or birth in heaven)',
          '27th — Death of Our Lord',
          '29th — Birth of Christ',
        ],
      },
      {
        label: 'National and religious feasts',
        items: [
          'Christmas — Tahsas 29 E.C. (7 January)',
          'Epiphany — Ter 11 E.C. (19 January)',
          'St. Michael — Ter 12 E.C. (20 January)',
          'Good Friday — movable',
          'Easter — movable',
          'Feast of the Assumption — Nehase 16 E.C. (22 August)',
          'Finding of the True Cross (Meskel) — Meskerem 17 E.C. (27 September)',
        ],
      },
    ],
  },
  {
    id: 'fasting',
    title: '3. Fasting and Abstinence',
    paragraphs: [
      'The Church, in her earliest days, recognized the necessity for her children to "chastise the body and bring it under subjection," as St. Paul advises. The body is ever striving for mastery over the spirit. Self-denial in lawful things enables us to turn with great earnestness to spiritual things. On these grounds the Ethiopian Church has strictly adhered to the injunctions of the Didascalia and enjoys the longest and most austere fasts in the world.',
      'Fasting implies abstention from food and drink. Every Wednesday and Friday are days of fasting because on Wednesday the Jews held a council in which they rejected and condemned our Lord, and on Friday they crucified Him.',
      'In addition to seasonal fasts, there is the fast of repentance after sin (seven days, forty days, or one year as imposed by the priest), a fast kept by bishops at consecration, and a fast of desire for those seeking greater holiness. Monks and nuns observe additional fast days. All persons above the age of 13 observe the Church fasts. The priest rarely grants dispensations. A man who neglects any injunction of the Church is not considered a good Christian.',
      'The total number of fasting days amounts to about 250 a year, of which about 180 are obligatory for all; the rest are for priests, monks, nuns, and other special groups. The longest periods are Lent, Advent, and Kweskwam (forty days preceding the Flight to Egypt).',
      'Fast generally implies one meal a day taken either in the evening or after 2:45 p.m., with total abstention from meat, fats, eggs, and dairy products. Cereals and vegetables are used instead. Smoking is a breach of the fast.',
      'There is no fasting while Christmas, Epiphany, and the feast of fifty days (Easter season) are being kept. From Easter to Pentecost a man may eat and drink what he likes on Wednesday and Friday. There is no fast if Christmas and Epiphany fall on a Wednesday or Friday. On Saturday and Sunday people may take breakfast at 9 or 9:30.',
      'Special prayers are conducted during the fasting seasons. Daily services are held in all churches from morning to 2:45 p.m. Priests regularly attend night services, perform the canon, remain in the churches praying incessantly, and throughout the day eat dry grain and drink water.',
    ],
    bullets: [
      {
        label: 'Fasts ordained in the Fetha Negest',
        items: [
          'Hudadi or Abiye Tsome (Great Lent) — 56 days',
          'Fast of the Apostles — 10–40 days, beginning after Pentecost',
          'Fast of the Assumption (Filseta) — 16 days',
          'Gahad of Christmas — on the eve of Christmas',
          'Fast preceding Christmas — 40 days, from Sibket on Hedar 15 to Christmas Eve; Gena on Tahsas 28–29',
          'Fast of Nineveh — Monday, Tuesday, and Wednesday of the third week before Lent',
          'Gahad of Epiphany — fast on the eve of Epiphany',
        ],
      },
    ],
  },
  {
    id: 'advent',
    title: '4. Advent',
    paragraphs: [
      'The aim of the Church is to cause her children to reflect. During the year she sets apart two seasons in which she imbues the faithful with a spirit of penitential fervour. One of these seasons, called Advent (from the Latin adventus, "arrival"), embraces about five Sundays.',
      'The law and practice of the Church is observed strictly, though not so much as in Lent. It is a time for devout and penitential preparation of the soul for the proper and worthy celebration of the great feast of Christmas.',
      'In Advent (Sibket, in Amharic) a fast is kept — the Christmas fast of 40 days beginning on Hedar 15 and ending on Christmas Eve with the Feast of Gena on Tahsas 28–29.',
    ],
  },
  {
    id: 'christmas',
    title: '5. Christmas',
    paragraphs: [
      'Year after year the Christmas season brings to the minds of all Christians the story of the Child in the manger, the shepherds on the Judean hills, the celestial songs "Glory to God in the highest," and the Angel\'s message that the long-expected One had come.',
      'Liddet or Gena is the Ethiopian name for Christmas, marked by special ceremonies. It is celebrated on Tahsas 29 (7 January), preceded by a fast of 40 days. The difference of date is due to a calendar discrepancy, as the Ethiopian calendar is based on the year of Grace 7 or 8 years after Anno Domini. Ethiopian Christmas coincides with the date of observance in the Eastern Orthodox tradition.',
      'Qiddus Bale Wold is another name for Christmas in addition to Liddet or Gena. Gena is also a name for a Christmas game played by boys and grown men (like hockey).',
    ],
  },
  {
    id: 'lent',
    title: '6. Lent and Holy Week — Hudadi and Himamat',
    paragraphs: [
      'The Church has always taught the necessity of penance for justification. She has instituted Lent as a remembrance of the forty days fast of our Blessed Lord in the desert and as a means of sanctification for her children.',
      'To the Ethiopian Orthodox Church, Lent means a period of fasting when the faithful undergo a rigorous schedule of prayers and penitence. This fast is observed with greater rigor than any other and is a test of one\'s Christianity. One who fails to keep it is not considered a good Christian. Properly observed, it nullifies the sins committed during the rest of the year.',
      'The faithful should abstain from all food except bread, water, and salt. All kinds of meat are forbidden, and also dairy products. On all fasting days only one meal is allowed, taken in the afternoon at 3 p.m. or in the evening. On Saturdays and Sundays people are allowed to eat in the morning.',
      'Daily services are conducted in all churches from morning to 2:45 p.m. Priests regularly attend night services starting at midnight up to 7 a.m.',
      'Qibela is the Sunday before the opening of Lent; Monday is when the people eat their fill. In Lent many grow tired and thin.',
    ],
  },
  {
    id: 'holy-week',
    title: '7. Holy Week',
    paragraphs: [
      'In accordance with the chronology of the Gospel account of the last days of our Lord\'s mortal life, a special Holy Week became established in which all the faithful re-lived and received graces from the fundamental mysteries of redemption.',
      'Palm Sunday or Hosanna is celebrated with palm processions and special services. Then follows Holy Week, the week of pains — Himamat. For some, from Thursday afternoon until Easter morning no morsel of food nor a drop of water enters the mouth; these three days are known as Qanona. The priests neither eat nor drink but remain in the churches singing and praying incessantly. No absolution is given.',
      'Maundy Thursday: unleavened bread is used in the Mass. For those who can, it is spent outdoors. When the fast is broken late in the afternoon no one eats ordinary bread — a mixture of special flour is compounded and boiled. The ceremony of washing the feet is conducted in imitation of our Lord at the Last Supper. All the faithful with clean souls should communicate on Holy Thursday.',
      'Good Friday: the solemn liturgical service is attended by thousands. There is a sense of sorrow and desolation. All symbols, images, and instruments used in the Passion are publicly exhibited. Men and women prostrate themselves in church from early morning till 3 p.m., the hour of Christ\'s death. Believers confess their offenses and sit reading their Psalter. Good Friday is a special day for confession.',
      'Holy Saturday (Qidame shur): on this day the good news went forth. Everyone who fasts passes the day and night in expectation. Many go to church and pass the night in prayer and prostration. Confession is heard on that day.',
      'Easter, the feast of feasts, is celebrated with special solemnity. The church is filled with fragrance of incense and myriads of lights. Greetings are exchanged, drums are beaten, hands are clapped, and singing is heard everywhere: "Our resurrection has come, Hosanna." Letters and messages are exchanged between friends. The whole day is one of spiritual and physical feasting — a commemoration of when Christ rose from the dead.',
    ],
  },
];

export const LITURGICAL_GUIDE_SOURCE =
  'Edited by Aymero W. and Joachim M., The Ethiopian Orthodox Church, published by the Ethiopian Orthodox Mission, Addis Ababa 1970.';

export const LITURGICAL_GUIDE_LINK =
  'http://www.senamirmir.com/theme/5-2001/gh/drgh.html';
