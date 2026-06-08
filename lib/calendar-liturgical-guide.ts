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

export const MONTHLY_FEAST_DAYS = [
  { day: 7, feast: 'Holy Trinity' },
  { day: 12, feast: 'St. Michael the Archangel' },
  { day: 16, feast: 'Covenant of Mercy (Kidane Mehret)' },
  { day: 21, feast: 'Holy Virgin Mary (Assumption)' },
  { day: 27, feast: 'Death of Our Lord' },
  { day: 29, feast: 'Birth of Christ' },
] as const;

export const NATIONAL_RELIGIOUS_FEASTS = [
  { name: 'Christmas', ethiopian: 'Tahsas 29 (January 7)' },
  { name: 'Epiphany', ethiopian: 'Ter 11 (January 19)' },
  { name: 'St. Michael', ethiopian: 'Ter 12 (January 20)' },
  { name: 'Good Friday', ethiopian: 'Movable' },
  { name: 'Easter', ethiopian: 'Movable' },
  { name: 'Feast of Assumption', ethiopian: 'Nehase 16 (August 22)' },
  { name: 'Finding of the True Cross (Meskel)', ethiopian: 'Meskerem 17 (September 27)' },
] as const;

export const LITURGICAL_GUIDE_SECTIONS: LiturgicalGuideSection[] = [
  {
    id: 'calendar',
    title: '1. The Calendar',
    paragraphs: [
      'The calendar of the Ethiopian Church came from Egypt and, as to methods and dates, agrees with the calendar of the Coptic Church. The two calendars differ with regard to the saints\' days and the time of observing them.',
      'The year of the Ethiopian calendar contains 365 days, to which is added every fourth year an extra day. Each year in this four-year period is dedicated to one of the four Evangelists in order: Matthew, Mark, Luke, and John. The year of Luke is the Ethiopian leap year and is the year which precedes the Western leap year.',
      'Each year is divided into 12 months of 30 days. The extra 5 days are placed at the end of the year and known as Pagumen. In the leap year the extra day is added to these five days, making the Pagumen of that year a period of 6 days.',
      'As in Julian and Gregorian calendars, days are grouped into weeks and are named in order.',
      'The chronology of the Ethiopian Church follows the Era of Incarnation — it dates from our Lord\'s birth. There is a difference of 7 or 8 years between the Western and Ethiopian systems. Because the Ethiopian Church holds that our Lord was born 5,500 years after the creation of the world, this gives the 7 or 8 years difference between the Gregorian and Ethiopian chronologies.',
      'The Church also uses other systems of chronology: the Era of the World (dating from 5493 B.C., also differing from the Western chronology by 7 or 8 years), and a system called "the years of Mercy or Grace," which follows the great lunar cycle.',
      'The movable feasts are those of Easter and the days which depend upon it. The reckoning of Easter is based upon the system of Ammonius. The dates of Easter and the feasts which depend upon it are determined by the Fast of Nineveh, which precedes the Easter Lent.',
    ],
    bullets: [
      {
        label: 'Movable feast boundaries (Ethiopian calendar)',
        items: [
          'Easter Lent always begins on a Monday, not before Yekatit 1 nor after Megabit 5.',
          'Festival of the Mount of Olives: Sunday, not before Yekatit 28 nor after Miyazia 2.',
          'Palm Sunday: not before Megabit 19 nor after Miyazia 23.',
          'Easter: Sunday, not before Megabit 26 nor after Miyazia 30.',
          'Congress of priests: Wednesday, not before Miyazia 20 nor after Ginbot 24.',
          'Ascension: Thursday, not before Ginbot 5 nor after Sene 9.',
          'Pentecost: Sunday, not before Ginbot 15 nor after Sene 19.',
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
      'The 33 feasts of the Blessed Virgin Mary include her conception, nativity, presentation, conception of Christ, flight to Egypt, her thirst at the rock, the promise of mercy, her dormition (Asterio Mariam), assumption (Filseta — celebrated 16 days), her appearances after death, monthly commemorations on the 21st, the bleeding icon, and her purification.',
      'The feast of Kidane Mehret (Covenant of Mercy) honours the merciful power of St. Mary. It is kept on Yekatit 16 (February 24 Gregorian).',
      'Every Christian has a patron saint and each family has its patron saint whose anniversary is commemorated from father to son. Common patrons include St. Michael, St. Gabriel, St. George, the Virgin Mary, St. John the Baptist, Tekle Haymanot, Gebre Menfese Kidus, and St. Petros.',
      'The book Senksar is the calendar which contains a list of saints to be commemorated daily and their brief history. Angels hold a high place in the Church — they protect homes, churches, palaces, and all places of importance. Chiefs among them are St. Michael and St. Gabriel.',
    ],
    bullets: [
      {
        label: 'Major feasts of our Lord',
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
        label: 'Minor feasts of our Lord',
        items: [
          'Sibket — preaching of the prophets that Messiah will come',
          'Brahan — our Lord came into the world for its enlightenment',
          'Nolwae — our Lord as Good Shepherd',
          'Gena — our Lord was actually born',
          'Gizret — circumcision',
          'Kana ze Galilee — water turned to wine',
          'Debra zeit — Second Advent on the Mount of Olives',
          'Megabit Meskel',
          'Ledete Simon — the woman who anointed the Lord\'s feet',
        ],
      },
      {
        label: 'Major feasts of our Lady',
        items: [
          'Conception',
          'Nativity (May 1 Ethiopian / April 26 Western)',
          'Presentation (December 3 / November 29)',
          'Conceived of the Lord',
          'Flight into Egypt',
          'Death of our Lady (January 21 Ethiopian / January 16 Western)',
          'Assumption (August 16 / August 9)',
          'Appearance',
        ],
      },
    ],
  },
  {
    id: 'fasting',
    title: '3. Fasting and Abstinence',
    paragraphs: [
      'The Church, in her earliest days, recognized the necessity for her children to "chastise the body and bring it under subjection," as St. Paul advises. Self-denial in lawful things enables us to turn with great earnestness to spiritual things. On these grounds the Ethiopian Church has strictly adhered to the injunctions of the Didascalia and enjoys the longest and most austere fasts in the world.',
      'Fasting implies abstention from food and drink. Every Wednesday and Friday are days of fasting because on Wednesday the Jews held a council in which they rejected and condemned our Lord, and on Friday they crucified Him.',
      'In addition to seasonal fasts, there is the fast of repentance after sin (seven, forty, or three hundred and sixty-five days as imposed by the priest), a fast kept by bishops at consecration, and a fast of desire kept by those seeking greater holiness. Monks and nuns observe additional fast days. All persons above the age of 13 observe the Church fasts. The priest rarely grants dispensations.',
      'The total number of fasting days amounts to about 250 a year, of which about 180 are obligatory for all. Fast generally implies one meal a day taken either in the evening or after 2:45 p.m., with total abstention from meat, fats, eggs, and dairy products. Smoking is a breach of the fast.',
      'There is no fasting while Christmas, Epiphany, and the feast of fifty days (Easter season) are being kept. From Easter to Pentecost a man may eat and drink what he likes on Wednesday and Friday. There is no fast if Christmas and Epiphany fall on a Wednesday or Friday. On Saturday and Sunday people may take breakfast at 9 or 9:30.',
      'Special prayers are conducted during the fasting seasons. In all the churches daily services are held from morning to 2:45 p.m. Priests regularly attend night services, perform the canon, remain in the churches praying incessantly, and throughout the day eat dry grain and drink water.',
    ],
    bullets: [
      {
        label: 'Fasts ordained in the Fetha Negest',
        items: [
          'Hudadi or Abiye Tsome (Great Lent) — 56 days',
          'Fast of the Apostles — 10–40 days, beginning after Pentecost',
          'Fast of Assumption — 16 days',
          'Gahad of Christmas — on the eve of Christmas',
          'Fast preceding Christmas — 40 days, from Sibket on Hedar 15 to Gena on Tahsas 28',
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
      'The aim of the Church is to cause her children to reflect. During the year she sets apart two seasons in which she imbues the faithful with a spirit of penitential fervor. One of these seasons, called Advent (from the Latin adventus, "arrival"), embraces about five Sundays.',
      'The law and practice of the Church is observed strictly, though not so much as in Lent. It is a time for devout and penitential preparation of the soul for the proper and worthy celebration of the great feast of Christmas.',
      'In Advent (Sibket, in Amharic) a fast is kept — the Christmas fast of 40 days beginning on Hedar 15 and ending on Christmas eve with the Feast of Gena on Tahsas 28.',
    ],
  },
  {
    id: 'christmas',
    title: '5. Christmas',
    paragraphs: [
      'Year after year the Christmas season brings to the minds of all Christians the story of the Child in the manger, the shepherds on the Judean hills, the celestial songs "Glory to God in the highest," and the Angel\'s message that the long-expected One had come.',
      'Liddet or Gena is the Ethiopian name for Christmas, marked by special ceremonies. It is celebrated on Tahsas 29 (January 7), preceded by a fast of 40 days. The difference of date is due to a calendar discrepancy, as the Ethiopian calendar is based on the year of Grace 7 or 8 years after Anno Domini.',
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
      'Daily services are conducted in all the churches from morning to 2:45 p.m. Priests regularly attend night services starting at midnight up to 7 a.m.',
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
      'Good Friday: the solemn liturgical service is attended by thousands. There is a sense of sorrow and desolation. All symbols, images, and instruments used in the Passion are publicly exhibited. Men and women prostrate themselves in church from early morning till 3 p.m., the hour of Christ\'s death. Good Friday is a special day for confession.',
      'Holy Saturday (Qidame shur): the good news went forth. Everyone who fasts passes the day and night in expectation. Many go to church and pass the night in prayer and prostration. Confession is heard on that day.',
      'Easter, the feast of feasts, is celebrated with special solemnity. The church is filled with fragrance of incense and myriads of lights. Greetings are exchanged, drums are beaten, hands are clapped, and singing is heard everywhere: "Our resurrection has come, Hosanna." The whole day is one of spiritual and physical feasting — a commemoration of the holiest occasion of all history.',
    ],
  },
];

export const LITURGICAL_GUIDE_SOURCE =
  'Edited by Aymero W. and Joachim M., The Ethiopian Orthodox Church, published by the Ethiopian Orthodox Mission, Addis Ababa 1970.';
