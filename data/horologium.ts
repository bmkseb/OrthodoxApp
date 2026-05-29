// data/horologium.ts
// EOTC Matshafa Se'atat (Book of Hours) — 7 Canonical Prayer Hours
// Composed by Abba Giyorgis of Gascha (15th century)

export interface HorologiumHour {
  id: string;
  hourNumber: number;        // Ethiopian hour number (0 = Lelit)
  nameEnglish: string;
  nameAmharic: string;
  nameGeez: string;
  timeLabel: string;
  startHour: number;         // 24h Gregorian start
  endHour: number;           // 24h Gregorian end
  description: string;
  intention: string;         // Theological intention of this hour
  openingPrayers: string[];
  psalms: Array<{ number: number; note: string }>;
  scriptureReading: { reference: string; bookId: string; chapter: number; note: string };
  intercessions: string[];
  closingPrayer: string;
}

const OPENING_COMMON = [
  'In the name of the Father, and of the Son, and of the Holy Spirit, one God. Amen.',
  'Holy God, Holy Mighty, Holy Immortal — who was born of the Virgin — have mercy on us.',
  'Holy God, Holy Mighty, Holy Immortal — who was crucified for us — have mercy on us.',
  'Holy God, Holy Mighty, Holy Immortal — who rose from the dead and ascended into heaven — have mercy on us.',
  'Glory to the Father, and to the Son, and to the Holy Spirit, now and ever and unto ages of ages. Amen.',
  'Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from the evil one. For Thine is the kingdom, and the power, and the glory, forever and ever. Amen.',
];

export const HOROLOGIUM_HOURS: HorologiumHour[] = [
  {
    id: 'lelit',
    hourNumber: 0,
    nameEnglish: 'Midnight Prayer',
    nameAmharic: 'የሌሊት ጸሎት',
    nameGeez: 'ሰዓተ ሌሊት',
    timeLabel: 'Midnight · 12 AM',
    startHour: 0,
    endHour: 5,
    description: 'The night office, offered in darkness before the dawn. The faithful rise to praise God and hear the Gospel, following the tradition of the monks who pray without ceasing.',
    intention: 'Vigilance, repentance, and awaiting the resurrection',
    openingPrayers: [
      ...OPENING_COMMON,
      'We give thanks to Thee, O Lord our God, that Thou hast kept us through the hours of this night and hast brought us to the beginning of this day. Direct our steps in Thy ways, that we may walk in Thy truth.',
    ],
    psalms: [
      { number: 119, note: 'Sections of the great psalm of the Law — aleph through nun' },
      { number: 51,  note: 'The psalm of repentance — Have mercy on me, O God' },
      { number: 130, note: 'Out of the depths I cry to You, O Lord' },
      { number: 134, note: 'Behold, bless the Lord, all servants of the Lord' },
    ],
    scriptureReading: {
      reference: 'John 1:1–18',
      bookId: 'john',
      chapter: 1,
      note: 'The Gospel of the Word made flesh is always read at the midnight office',
    },
    intercessions: [
      'For the peace of the whole world and the unity of all holy churches.',
      'For our father the Patriarch, our bishops, our priests, and all the clergy.',
      'For our rulers, that God may grant them wisdom and long life.',
      'For the sick, the suffering, and all who are in tribulation.',
      'For travelers by land, by sea, and by air.',
      'For the souls of the departed — grant them rest in the bosom of Abraham.',
      'For ourselves, that God may forgive our sins and have mercy on us.',
    ],
    closingPrayer: 'May the Lord bless us and keep us through this night and the coming day. Amen.',
  },
  {
    id: 'hour_1',
    hourNumber: 1,
    nameEnglish: 'First Hour',
    nameAmharic: 'ሰዓተ ፩',
    nameGeez: 'ሰዓተ ፩',
    timeLabel: 'Dawn · 6 AM',
    startHour: 6,
    endHour: 8,
    description: 'The hour of sunrise, when light overcomes darkness. We praise God for the new day and remember the resurrection of Christ, who rose as the light of the world.',
    intention: 'Thanksgiving for the new day and the light of Christ',
    openingPrayers: [
      ...OPENING_COMMON,
      'As the sun rises and lights the face of the earth, so may the true Sun of Righteousness, our Lord Jesus Christ, enlighten our hearts and minds this day.',
    ],
    psalms: [
      { number: 5,   note: 'Give ear to my words, O Lord — a morning prayer' },
      { number: 8,   note: 'O Lord our Lord, how excellent is Thy name in all the earth' },
      { number: 24,  note: 'The earth is the Lord\'s and the fullness thereof' },
      { number: 100, note: 'Make a joyful noise unto the Lord — a psalm of praise at dawn' },
    ],
    scriptureReading: {
      reference: 'Matthew 5:1–12',
      bookId: 'matthew',
      chapter: 5,
      note: 'The Beatitudes — the way of life for the people of God',
    },
    intercessions: [
      'Grant us, O Lord, to pass this day in peace and without sin.',
      'Bless all who labor and toil this day, that their work may be unto Thy glory.',
      'Keep from us all evil, temptation, and the snares of the enemy.',
      'Let Thy mercy and truth be with us all the days of our lives.',
    ],
    closingPrayer: 'Guide our steps this day, O God, and let the light of Thy countenance shine upon us. Amen.',
  },
  {
    id: 'hour_3',
    hourNumber: 3,
    nameEnglish: 'Third Hour',
    nameAmharic: 'ሰዓተ ፫',
    nameGeez: 'ሰዓተ ፫',
    timeLabel: 'Morning · 9 AM',
    startHour: 9,
    endHour: 11,
    description: 'The hour of the descent of the Holy Spirit upon the apostles at Pentecost. We pray for the presence of the Spirit to fill and guide us through the day.',
    intention: 'Remembrance of the Holy Spirit and the Pentecost',
    openingPrayers: [
      ...OPENING_COMMON,
      'O Heavenly King, Comforter, Spirit of Truth — who art everywhere present and fillest all things, Treasury of blessings and Giver of life — come and abide in us, cleanse us from every impurity, and save our souls, O Good One.',
    ],
    psalms: [
      { number: 51,  note: 'Create in me a clean heart, O God' },
      { number: 23,  note: 'The Lord is my shepherd — psalm of trust and provision' },
      { number: 63,  note: 'O God, Thou art my God; early will I seek Thee' },
      { number: 121, note: 'I will lift up mine eyes unto the hills' },
    ],
    scriptureReading: {
      reference: 'Acts 2:1–13',
      bookId: 'acts',
      chapter: 2,
      note: 'The outpouring of the Holy Spirit at the Third Hour',
    },
    intercessions: [
      'Send down Thy Holy Spirit upon us and upon all the faithful.',
      'Guide the Church in truth and protect her from all heresy.',
      'Remember all who are persecuted for the faith.',
      'Grant wisdom to those who teach and preach Thy word.',
    ],
    closingPrayer: 'Fill us, O Holy Spirit, with Thy gifts, that we may serve God and neighbor in love. Amen.',
  },
  {
    id: 'hour_6',
    hourNumber: 6,
    nameEnglish: 'Sixth Hour',
    nameAmharic: 'ሰዓተ ፮',
    nameGeez: 'ሰዓተ ፮',
    timeLabel: 'Noon · 12 PM',
    startHour: 12,
    endHour: 14,
    description: 'The hour of the crucifixion of our Lord. Darkness covered the earth at this hour. We stand in solemn remembrance of His sacrifice and the salvation of the world.',
    intention: 'Commemoration of the crucifixion of Christ',
    openingPrayers: [
      ...OPENING_COMMON,
      'At the sixth hour, O Christ our God, Thou didst nail to the cross the sin which the presumptuous Adam committed in Paradise. Tear up also the bond of our transgressions, O Merciful One, and save us.',
    ],
    psalms: [
      { number: 54,  note: 'Save me, O God, by Thy name' },
      { number: 55,  note: 'Give ear to my prayer, O God — in the hour of distress' },
      { number: 91,  note: 'He that dwelleth in the secret place of the Most High — psalm of protection' },
      { number: 116, note: 'I love the Lord because He heard my voice' },
    ],
    scriptureReading: {
      reference: 'John 19:17–30',
      bookId: 'john',
      chapter: 19,
      note: 'The crucifixion of our Lord at the sixth hour',
    },
    intercessions: [
      'Lord, by Thy cross and resurrection, save us and all the world.',
      'Remember all who suffer unjustly and all martyrs for the faith.',
      'Grant comfort to the grieving and healing to the wounded in soul.',
      'By the precious blood shed for us, forgive us all our sins.',
    ],
    closingPrayer: 'We venerate Thy cross, O Lord, and praise and glorify Thy holy resurrection. Amen.',
  },
  {
    id: 'hour_9',
    hourNumber: 9,
    nameEnglish: 'Ninth Hour',
    nameAmharic: 'ሰዓተ ፱',
    nameGeez: 'ሰዓተ ፱',
    timeLabel: 'Afternoon · 3 PM',
    startHour: 15,
    endHour: 16,
    description: 'The hour of the death of our Lord upon the cross. He bowed His head and gave up His spirit. We pray in thanksgiving for His sacrifice and our redemption.',
    intention: 'Thanksgiving for the death and redemption of Christ',
    openingPrayers: [
      ...OPENING_COMMON,
      'At the ninth hour, O Lord Jesus Christ our God, Thou didst taste death in the flesh for our salvation. Put to death our fleshly mind, O Merciful One, and save us.',
    ],
    psalms: [
      { number: 113, note: 'Praise the Lord — from the rising of the sun to its setting' },
      { number: 116, note: 'What shall I render unto the Lord for all His benefits' },
      { number: 123, note: 'Unto Thee lift I up mine eyes — prayer of the humble' },
      { number: 130, note: 'Out of the depths — a cry from the hour of His death' },
    ],
    scriptureReading: {
      reference: 'Luke 23:44–49',
      bookId: 'luke',
      chapter: 23,
      note: 'The death of our Lord at the ninth hour',
    },
    intercessions: [
      'Remember, O Lord, all who have departed this life in the faith.',
      'Grant rest to the souls of our fathers and mothers who have fallen asleep.',
      'Have mercy on all who draw near to death this day.',
      'By Thy death Thou hast trampled death — grant us the life eternal.',
    ],
    closingPrayer: 'Thou who at this hour stretched out Thine arms upon the cross — receive our evening sacrifice of praise. Amen.',
  },
  {
    id: 'hour_11',
    hourNumber: 11,
    nameEnglish: 'Eleventh Hour',
    nameAmharic: 'ሰዓተ ፲፩',
    nameGeez: 'ሰዓተ ፲፩',
    timeLabel: 'Vespers · 5 PM',
    startHour: 17,
    endHour: 18,
    description: 'The evening office, when the day draws to a close. We give thanks for the day completed and remember the taking down of the Lord\'s body from the cross by Joseph of Arimathea.',
    intention: 'Evening thanksgiving and remembrance of the burial of Christ',
    openingPrayers: [
      ...OPENING_COMMON,
      'O Gladsome Light of the holy glory of the Immortal Father — Heavenly, Holy, Blessed Jesus Christ — now that we have come to the setting of the sun and behold the light of evening, we praise God: Father, Son, and Holy Spirit.',
    ],
    psalms: [
      { number: 141, note: 'Lord, I cry unto Thee — the classic vespers psalm' },
      { number: 142, note: 'With my voice I cry to the Lord — a psalm of the evening' },
      { number: 104, note: 'Bless the Lord, O my soul — praise for creation at day\'s end' },
      { number: 119, note: 'Thy word is a lamp to my feet — sections of the great psalm' },
    ],
    scriptureReading: {
      reference: 'Luke 24:13–35',
      bookId: 'luke',
      chapter: 24,
      note: 'The road to Emmaus — Christ revealed at the evening hour',
    },
    intercessions: [
      'As this day ends, receive the sacrifice of our lips, O Lord.',
      'Protect us through the coming night from all harm and temptation.',
      'Remember our families, our neighbors, and all the faithful.',
      'Grant peace to the world and tranquility to all nations.',
    ],
    closingPrayer: 'Grant us, O Lord, to pass this evening and the coming night in peace, and to rise at dawn to praise Thee. Amen.',
  },
  {
    id: 'hour_12',
    hourNumber: 12,
    nameEnglish: 'Twelfth Hour',
    nameAmharic: 'ሰዓተ ፲፪',
    nameGeez: 'ሰዓተ ፲፪',
    timeLabel: 'Compline · 6 PM',
    startHour: 18,
    endHour: 23,
    description: 'The night prayer, a devotional office in praise of the Holy Virgin Mary. We entrust ourselves to her intercession before we sleep, following the ancient tradition of the Ethiopian Church.',
    intention: 'Praise of the Theotokos and prayer before sleep',
    openingPrayers: [
      ...OPENING_COMMON,
      'O pure Virgin, who gavest birth to God the Word, do not cease to intercede for us before Him who was born of thee — that He may preserve our souls from all harm and danger through the night.',
    ],
    psalms: [
      { number: 4,   note: 'When I call, answer me — the night prayer of David' },
      { number: 91,  note: 'Under His wings you will find refuge — protection through the night' },
      { number: 134, note: 'Lift up your hands in the sanctuary — a blessing before sleep' },
      { number: 31,  note: 'Into Thy hands I commit my spirit' },
    ],
    scriptureReading: {
      reference: 'Luke 1:46–55',
      bookId: 'luke',
      chapter: 1,
      note: 'The Magnificat — the song of the Holy Virgin Mary',
    },
    intercessions: [
      'O Holy Theotokos, intercede for us before thy Son and our God.',
      'Grant us peaceful sleep and keep us from every dream of darkness.',
      'At the last breath, be near us and lead us to the heavenly Kingdom.',
      'Glory to Thee, O God, glory to Thee — for all Thy blessings upon us this day.',
    ],
    closingPrayer: 'Into Thy hands, O Lord, I commend my spirit. Keep me under the shadow of Thy wings this night. Amen.',
  },
];

export function getCurrentHour(): HorologiumHour {
  const h = new Date().getHours();
  return (
    HOROLOGIUM_HOURS.find((hour) => h >= hour.startHour && h < hour.endHour) ??
    HOROLOGIUM_HOURS[0]
  );
}

export function getHourById(id: string): HorologiumHour | undefined {
  return HOROLOGIUM_HOURS.find((h) => h.id === id);
}
