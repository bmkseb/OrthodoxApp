export type DailyTeachingCategory =
  | 'faith'
  | 'prayer'
  | 'humility'
  | 'fasting'
  | 'saints'
  | 'salvation'
  | 'love'
  | 'forgiveness';

export type DailyTeachingRelatedLink = {
  labelEn: string;
  labelAm: string;
  href: string;
};

export type DailyTeaching = {
  id: string;
  category: DailyTeachingCategory;
  categoryEn: string;
  categoryAm: string;
  titleEn: string;
  titleAm: string;
  readMin: number;
  paragraphsEn: string[];
  paragraphsAm: string[];
  scripture: {
    textEn: string;
    textAm: string;
    referenceEn: string;
    referenceAm: string;
    bookId?: string;
    chapter?: number;
  };
  reflectionEn: string;
  reflectionAm: string;
  prayerEn: string;
  prayerAm: string;
  related: {
    saint?: DailyTeachingRelatedLink;
    feast?: DailyTeachingRelatedLink;
    fast?: DailyTeachingRelatedLink;
    bibleReading?: DailyTeachingRelatedLink & { bookId: string; chapter: number };
  };
};

/** Curated Orthodox teachings — rotated by day of year. */
export const DAILY_TEACHINGS: DailyTeaching[] = [
  {
    id: 'humility-desert',
    category: 'humility',
    categoryEn: 'Humility',
    categoryAm: 'ትሑትነት',
    titleEn: 'The Ladder of Humility',
    titleAm: 'የትሑትነት መደረጃ',
    readMin: 3,
    paragraphsEn: [
      'In the Ethiopian Orthodox tradition, humility is not weakness but the foundation of every virtue. The desert fathers taught that a proud heart cannot receive grace, for grace flows only into the lowly soul that knows its need for God.',
      'St. Moses the Black, once a feared outlaw, became a gentle father of monks through repentance and humility. His life reminds us that no past is too heavy for Christ to transform when we bow our hearts before God.',
      'Humility begins in small acts: listening before speaking, forgiving before judging, and receiving correction without defensiveness. Each day offers countless opportunities to practice this sacred discipline.',
    ],
    paragraphsAm: [
      'በኢትዮጵያ ኦርቶዶክስ ትምህርት ትሑትነት ድክመት አይደለም፤ የእያንዳንዱ በጎ ስራ መሠረት ነው። የምድረ ቤተ ምኞት አባቶች ኩራት የሞላበት ልብ ṭጸን አይቀበልም ብለው ያስተምሩ ነበር፤ ṭጸን ወደ እግዚአብሔር ፍጻሜ የሚያስተውል ግን ወደ ዝቅተኝነት የሚገባ ነው።',
      'ቅዱስ ሙሴ ጥቁር እንደ ኃይለኛ ወንጀበኛ ሆኖ ጀምሮ በንስሐና በትሑትነት ለአባቶች አባት ሆነ። ልብን በእግዚአብሔር ፊት ስንደፍር ምንም ያለፈ ታሪክ ለመለወጥ በጣም ከባድ አይደለም።',
      'ትሑትነት በአነስተኛ ተግባራት ይጀምራል፤ ከመናገር በፊት መስማት፣ ከመፍረድ በፊት መምሸት፣ እና ማስተካከልን ያለ ተቃዋሚነት መቀበል።',
    ],
    scripture: {
      textEn:
        'Learn from me, for I am gentle and humble in heart; and you will find rest for your souls.',
      textAm: 'ከእኔ ተምሩ፤ እኔ የቀናና የትሑት ልብ ነኝና ለነፍሳችሁ ዕረፍት ታገኛላችሁ።',
      referenceEn: 'Matthew 11:29',
      referenceAm: 'ማቴዎስ ፲፩፡፪፱',
      bookId: 'matthew',
      chapter: 11,
    },
    reflectionEn: 'How can I practice humility today in my words, my work, and my relationships?',
    reflectionAm: 'ዛሬ በቃላቴ፣ በሥራዬ እና በግንኙነቶቼ ትሑትነትን እንዴት ልተገብር?',
    prayerEn:
      'Lord Jesus Christ, who humbled Yourself for our salvation, soften my proud heart. Teach me to seek the lowest place, that I may find You there. Amen.',
    prayerAm:
      'ጌታ ኢየሱስ ክርስቶስ ለመዳናችን ራስህን ያዋረድክ፣ ኩራት የሞላበት ልቤን አስለስል። ዝቅተኛውን ስፍራ እንዳገኝህ አስተምረኝ። አሜን።',
    related: {
      saint: {
        labelEn: 'St. Moses the Black',
        labelAm: 'ቅዱስ ሙሴ ጥቁር',
        href: '/(tabs)/calendar',
      },
      bibleReading: {
        labelEn: 'Matthew 11',
        labelAm: 'ማቴዎስ ፲፩',
        bookId: 'matthew',
        chapter: 11,
        href: '/book/matthew/11',
      },
    },
  },
  {
    id: 'prayer-heart',
    category: 'prayer',
    categoryEn: 'Prayer',
    categoryAm: 'ጸሎት',
    titleEn: 'Prayer of the Heart',
    titleAm: 'የልብ ጸሎት',
    readMin: 4,
    paragraphsEn: [
      'Orthodox prayer is not merely recitation but communion with the living God. The Church Fathers call the heart the altar where true prayer is offered, especially when the mind grows still and the Name of Christ dwells within.',
      'Short, repeated prayers — such as the Jesus Prayer — train the soul to abide in God throughout the day. Even a few minutes of attentive prayer can reshape the whole rhythm of our life.',
      'Do not measure prayer by eloquence. Measure it by sincerity, persistence, and the quiet desire to be transformed by divine love.',
    ],
    paragraphsAm: [
      'ኦርቶዶክስ ጸሎት መደበኛ ንግግር ብቻ አይደለም፤ ከሕያው እግዚአብሔር ጋር የሚያደርግ ግንኙነት ነው። አባቶች ልብ እውነተኛ ጸሎት የሚቀርብበት መሠዊያ ነው ይላሉ፤ በተለይ አእምሮ ሲረጋጋ እና ስም ክርስቶስ በውስጥ ሲኖር።',
      'አጭር እና የሚደገም ጸሎት — እንደ የኢየሱስ ጸሎት — ነፍስን በቀን ሁሉ በእግዚአብሔር ውስጥ እንዲኖር ያስተምራል። ጥቂት ደቂቃ ትኩረት የሞላበት ጸሎትም ሕይወታችንን ሙሉ በሙሉ ሊለውጥ ይችላል።',
      'ጸሎትን በቃላት አብራራነት አትመድብ። በትክክለኝነት፣ በቁርጠኝነት እና በእግዚአብሔር ፍቅር ለመለወጥ በሚያስተውል ጸጕር መለኪያ ተጠቀምበት።',
    ],
    scripture: {
      textEn: 'But when you pray, enter into your inner room, and having shut your door, pray to your Father who is in secret.',
      textAm: 'ጸልዩ ሲሉ ግን ወደ ውስጥዎ ክፍል ግቡ፤ በሚስጥር የሚሰማውን አባታችሁን ጸልዩ።',
      referenceEn: 'Matthew 6:6',
      referenceAm: 'ማቴዎስ ፮፡፮',
      bookId: 'matthew',
      chapter: 6,
    },
    reflectionEn: 'What is keeping me from deeper prayer — distraction, busyness, or fear of silence?',
    reflectionAm: 'ከጥልቅ ጸሎት የሚያራቀኝ ምንድን ነው — ትኩረት መበተን፣ ብዙ ሥራ፣ ወይስ የሐይማኖት ፍርሀት?',
    prayerEn:
      'O Lord, teach me to pray as I ought. Quiet my restless thoughts and make my heart a dwelling place for Your Holy Spirit. Amen.',
    prayerAm: 'አቤቱ፣ እንደሚገባ እንዳጸልይ አስተምረኝ። ወደ ተንቀሳቃሾች አሳቦቼን አስታርቅ፣ ልቤን ለመንፈስ ቅዱስ መኖሪያ አድርገው። አሜን።',
    related: {
      fast: {
        labelEn: 'Wednesday & Friday fasts',
        labelAm: 'ረቡዕና አርብ ጾም',
        href: '/(tabs)/calendar',
      },
      bibleReading: {
        labelEn: 'Luke 11',
        labelAm: 'ሉቃስ ፲፩',
        bookId: 'luke',
        chapter: 11,
        href: '/book/luke/11',
      },
    },
  },
  {
    id: 'fasting-discipline',
    category: 'fasting',
    categoryEn: 'Fasting',
    categoryAm: 'ጾም',
    titleEn: 'The Gift of Fasting',
    titleAm: 'የጾም ስጦታ',
    readMin: 3,
    paragraphsEn: [
      'Fasting in the Ethiopian Orthodox Church is a medicine for the soul, not a punishment for the body. By restraining the appetite, the believer learns that man does not live by bread alone, but by every word that proceeds from God.',
      'The Church prescribes communal fasts — Lent, Advent, Wednesdays and Fridays — so that the faithful journey together toward repentance and joy. Private fasting should always be guided by spiritual fatherhood and love.',
      'True fasting pairs abstinence with generosity: almsgiving, forgiveness, and renewed prayer. Without these, fasting remains empty ritual.',
    ],
    paragraphsAm: [
      'በኢትዮጵያ ኦርቶዶክስ ቤተ ክርስቲያን ጾም ለነፍስ መድሃኒት ነው፤ ለሰውነት ቅጣት አይደለም። ተፈጋጋሪነትን በመገታት ሰው በእንጀራ ብቻ አይኖርም፤ ከእግዚአብሔር የሚወጣውን በእያንዳንዱ ቃል ይኖራል።',
      'ቤተ ክርስቲያን የጋራ ጾሞችን — ዐቢይ ጾም፣ ጾመ ነቢያት፣ ረቡዕና አርብ — ታዘዛለች፤ እምነተኞች በአንድነት ወደ ንስሐና ደስታ ይጓዛሉ። የግል ጾም ሁልጊዜ በመንፈሳዊ አባትና በፍቅር ይመራል።',
      'እውነተኛ ጾም ከመገታት ጋር ቸርነትን ያጣምራል፤ መልካም ሥራ፣ ምሕረትና የተደሰተ ጸሎት። እነዚህ ከሌሉ ጾም ባዶ ስርዓተ ሃይማኖት ብቻ ይሆናል።',
    ],
    scripture: {
      textEn: 'When you fast, don\u2019t be like the hypocrites... but you, when you fast, anoint your head and wash your face.',
      textAm: 'ጾማችሁን ሲጾሙ እንደ ግብረ ሰነጣጥ አትሁኑ... አንተ ግን ራስህን ቀባ እና ፊትህን ሠራብ።',
      referenceEn: 'Matthew 6:16-17',
      referenceAm: 'ማቴዎስ ፮፡፲፮-፲፯',
      bookId: 'matthew',
      chapter: 6,
    },
    reflectionEn: 'How can I fast this week not only from food, but from anger, gossip, and selfish comfort?',
    reflectionAm: 'በዚህ ሳምንት ከምግብ ብቻ ሳይሆን ከቁጣ፣ ከስም ማጣት እና ከራስ ዋጋ መቸከል እንዴት ልጾም?',
    prayerEn:
      'Grant me, O Lord, a fasting that purifies my heart. Strengthen me to offer my body as a living sacrifice, holy and acceptable to You. Amen.',
    prayerAm: 'አቤቱ ልቤን የሚያጸድቅ ጾም ስጠኝ። ሰውነቴን ሕያው መሥዋዕት፣ ቅዱስና ለአንተ የሚቀበል እንዳቀርብ አበርታኝ። አሜን።',
    related: {
      fast: {
        labelEn: 'Liturgical fasting calendar',
        labelAm: 'የጾም የቀን መቁጠሪያ',
        href: '/(tabs)/calendar',
      },
      feast: {
        labelEn: 'Upcoming feasts',
        labelAm: 'የሚቀርቡ በዓላት',
        href: '/(tabs)/calendar',
      },
    },
  },
  {
    id: 'love-neighbor',
    category: 'love',
    categoryEn: 'Love',
    categoryAm: 'ፍቅር',
    titleEn: 'Love of Neighbor',
    titleAm: 'የፍቅር ጐረቤት',
    readMin: 3,
    paragraphsEn: [
      'Christ commands that we love our neighbor as ourselves. In Orthodox Ethiopia, this love is expressed not only in sentiment but in concrete mercy: feeding the hungry, visiting the sick, and honoring the poor as icons of Christ.',
      'To love the neighbor is to see the image of God in every person — especially those who are difficult, forgotten, or unlike us. Charity without personal encounter remains incomplete.',
      'Small acts of kindness performed in Christ\u2019s name carry eternal weight. The Church teaches that what we do to the least of these, we do unto the Lord Himself.',
    ],
    paragraphsAm: [
      'ክርስቶስ ጐረቤታችንን እንደ ራሳችን እንድንወድ ይነግራል። በኦርቶዶክስ ኢትዮጵያ ይህ ፍቅር በስሜት ብቻ ሳይሆን በተግባራዊ ምሕረት ይገለጻል፤ ራብተኛን ማጠጣት፣ ሕሙምን መጎብኘት፣ ድሆችን እንደ የክርስቶስ ምስል ማክበር።',
      'ጐረቤትን መውደድ በእያንዳንዱ ሰው የእግዚአብሔር ምስል ማየት ነው — በተለይ አስቸጋሪ፣ የተረሱ ወይም ከእኛ የተለዩ። ግልጽ ግንኙነት የሌለው ቸርነት ያልተሟላ ነው።',
      'በስም ክርስቶስ የሚከናወኑ ትናንሽ ደግ ተግባራት ዘላለማዊ ክብደት አላቸው። ለእነዚህ ትንሹ የሚያደርገውን ለጌታው እራሱ እንደሚያደርገው ቤተ ክርስቲያን ትማራለች።',
    ],
    scripture: {
      textEn: 'A new commandment I give to you, that you love one another. Just as I have loved you, you also love one another.',
      textAm: 'አዲስ ትእዛዝ እሰጣችኋለሁ፤ እርስ በርሳችሁ ትወዱ። እኔ እንደ ወደድኋችሁ እንዲሁም እናንተ ውደዱ።',
      referenceEn: 'John 13:34',
      referenceAm: 'ዮሐንስ ፲፫፡፴፬',
      bookId: 'john',
      chapter: 13,
    },
    reflectionEn: 'How can I better love my neighbor this week — especially someone I have overlooked or avoided?',
    reflectionAm: 'በዚህ ሳምንት ጐረቤቴን እንዴት በተሻለ ሁኔታ ልወድ — በተለይ ችላ የበለፀጽሁትን ወይም ያለፈግንሁትን?',
    prayerEn:
      'Lord, open my eyes to see You in my neighbor. Make my hands instruments of Your mercy and my words channels of Your peace. Amen.',
    prayerAm: 'ጌታ ሆይ፣ በጐረቤቴ ውስጥ አንተን እንዳይ ፈትኝ። እጆቼን የምሕረትህ መሳሪያ፣ ቃላቴን የሰላምህ መንገድ አድርገው። አሜን።',
    related: {
      bibleReading: {
        labelEn: '1 John 4',
        labelAm: '፩ ዮሐንስ ፬',
        bookId: '1john',
        chapter: 4,
        href: '/book/1john/4',
      },
    },
  },
  {
    id: 'faith-tradition',
    category: 'faith',
    categoryEn: 'Faith',
    categoryAm: 'እምነት',
    titleEn: 'Faith Handed Down',
    titleAm: 'የተላለፈ እምነት',
    readMin: 4,
    paragraphsEn: [
      'The Ethiopian Orthodox Church treasures Holy Scripture and Holy Tradition as one living stream of divine revelation. The Church does not invent faith anew each generation; she guards the deposit entrusted to the apostles.',
      'To believe is to enter into communion with the saints who have gone before us — martyrs, fathers, mothers, and confessors who witnessed Christ across centuries. Their faith is not museum relic but living fire.',
      'Study, worship, and obedience together preserve the faith. Personal opinion alone cannot sustain the soul; we need the Church as mother and teacher.',
    ],
    paragraphsAm: [
      'ኢትዮጵያ ኦርቶዶክስ ቤተ ክርስቲያን ቅዱስ መጽሐፍንና ቅዱስ ትምህርትን እንደ አንድ ሕያው የእግዚአብሔር ራዕይ ታስቀምጣለች። ቤተ ክርስቲያን እምነትን በየትውልድ አዲስ አትፈጥርም፤ ለሐዋርያት የተሰጠውን ይጠብቃለች።',
      'መከር ከዘንድ ቅዱሳን ጋር ግንኙነት መግባት ነው — በዘመናት ክርስቶስን የመሰከሩ ተማሪዎች፣ አባቶች፣ እናት አባቶችና አማልክቶች። እምነታቸው የሙዚየም ቅርስ ሳይሆን ሕያው እሳት ነው።',
      'መማር፣ መገለጽና ታዛዝ በአንድነት እምነትን ይጠብቃሉ። የግል አስተያየት ብቻ ነፍስን አይደግፍም፤ ቤተ ክርስቲያንን እንደ እናትና መምህር እንፈልጋለን።',
    ],
    scripture: {
      textEn: 'Now, brothers, stand firm and hold the traditions which you have been taught, whether by word or by letter.',
      textAm: 'እንግዲህ ወንድሞቼ ሆይ፣ በቃል ወይም በመልእክት እንደ ተማርናችሁ ትምህርትን ይዛችሁ ቁሙ።',
      referenceEn: '2 Thessalonians 2:15',
      referenceAm: '፪ ተሰሎንቄ ፪፡፲፭',
      bookId: '2thessalonians',
      chapter: 2,
    },
    reflectionEn: 'Where am I tempted to rely on my own understanding rather than the wisdom of the Church?',
    reflectionAm: 'የቤተ ክርስቲያን ጥበብን ሳይሆን በራሴ ግንዛቤ ላይ ለመታመን የት እጠጋለሁ?',
    prayerEn:
      'O Holy Trinity, strengthen my faith in Your holy Church. Guard me from pride and grant me a teachable spirit. Amen.',
    prayerAm: 'ኦ ቅዱስ ሥላሴ፣ በቅድስት ቤተ ክርስቲያን እምነቴን አበርታ። ከኩራት ጠብቀኝ፣ የሚማር መንፈስ ስጠኝ። አሜን።',
    related: {
      bibleReading: {
        labelEn: 'Hebrews 11',
        labelAm: 'ዕብራይስጥ ፲፩',
        bookId: 'hebrews',
        chapter: 11,
        href: '/book/hebrews/11',
      },
    },
  },
  {
    id: 'forgiveness-mercy',
    category: 'forgiveness',
    categoryEn: 'Forgiveness',
    categoryAm: 'ምሕረት',
    titleEn: 'The Freedom of Forgiveness',
    titleAm: 'የምሕረት ነፃነት',
    readMin: 3,
    paragraphsEn: [
      'Forgiveness is not the denial of wrong, but the refusal to let hatred become our master. Christ forgave from the cross, and He calls His disciples to release others as they have been released by God.',
      'In the Divine Liturgy, Orthodox Christians pray for forgiveness before receiving Holy Communion. We cannot approach the Holy Mysteries while clinging to bitterness in the heart.',
      'To forgive is a daily labor. It may require many prayers and much time. Yet each step toward mercy heals the forgiver as much as the forgiven.',
    ],
    paragraphsAm: [
      'ምሕረት ወንጀብን መካድ አይደለም፤ ጥላቻ ጌት እንዳይሆን መቃወም ነው። ክርስቶስ ከመስቀል ላይ አይቅ አለ፣ ደቀ መዝሙራንም እንደ እግዚአብሔር ያሰናበተው ሌሎችን እንዲፈቱ ይጠራል።',
      'በቅዳሴ ጸሎት ኦርቶዶክስ ክርስቲያኖች ቅዱስ ቁርባን ከመቀበል በፊት ምሕረትን ይጸልያሉ። ልብን በመራራነት ይዘን ቅዱስ ምስጢር መቅረብ አይቻልም።',
      'መምሸት የዕለት ተዕለት ሥራ ነው። ብዙ ጸሎቶችና ጊዜ ሊፈልግ ይችላል። ነገር ግን ወደ ምሕረት የሚወስደው እርምጃ ለሚሰጠውም እንደሚቀበለው ይፈውሳል።',
    ],
    scripture: {
      textEn: 'Forgive us our debts, as we also forgive our debtors.',
      textAm: 'ዕዳችንን እንደምንምረውም ይሁን ዕዳችንን ስላይን።',
      referenceEn: 'Matthew 6:12',
      referenceAm: 'ማቴዎስ ፮፡፲፪',
      bookId: 'matthew',
      chapter: 6,
    },
    reflectionEn: 'Is there someone I need to forgive today — in prayer if not yet in person?',
    reflectionAm: 'ዛሬ ሊሰጥ ወይም ቢያንስ በጸሎት ሊቀበል የሚገባ ሰው አለኝ?',
    prayerEn:
      'Lord, as You have forgiven me, teach me to forgive. Free my heart from resentment and fill it with Your compassion. Amen.',
    prayerAm: 'ጌታ ሆይ፣ እንደ ይቅ አለኸኝ እኔም እንድምረ አስተምረኝ። ልቤን ከመራራነት አስለቅቀው በርህምነትህ ሙላው። አሜን።',
    related: {
      bibleReading: {
        labelEn: 'Matthew 18',
        labelAm: 'ማቴዎስ ፲፰',
        bookId: 'matthew',
        chapter: 18,
        href: '/book/matthew/18',
      },
    },
  },
  {
    id: 'saints-communion',
    category: 'saints',
    categoryEn: 'Saints',
    categoryAm: 'ቅዱሳን',
    titleEn: 'Communion of Saints',
    titleAm: 'የቅዱሳን ኅብረት',
    readMin: 3,
    paragraphsEn: [
      'Orthodox Christians confess one Church that spans heaven and earth. The saints are not distant heroes but living members of Christ\u2019s body who continue to pray for the faithful.',
      'Icons, hymns, and feast days keep their memory present in the life of the Church. To honor a saint is to imitate their love for God and their courage in truth.',
      'Ask the saints to intercede, not as replacements for Christ, but as elder brothers and sisters who have finished the race and now cheer us on toward the heavenly Jerusalem.',
    ],
    paragraphsAm: [
      'ኦርቶዶክስ ክርስቲያኖች ሰማይንና ምድርን የሚያገናኝ አንድ ቤተ ክርስቲያን እንደሚያምኑ ይናገራሉ። ቅዱሳን ሩቅ ጀግኖች ሳይሆኑ ለሃይማኖተኞች የሚጸልዩ ሕያው የክርስቶስ አካል ክፍሎች ናቸው።',
      'እባቦች፣ መዝሙሮችና የበዓል ቀኖች ማስታወሻቸውን በሕይወት ቤተ ክርስቲያን ውስጥ ይቆያሉ። ቅዱስን ማክበር ለእግዚአብሔር ፍቅርና ለእውነት ያላቸውን ድፍረት መከተል ነው።',
      'ቅዱሳንን እንደ ክርስቶስ ተካ ኳስ ሳይሆን እንደ ዘርፈ ሩጫ ያጠናቀቁትን ወንድሞችና እህቶች ለመካድ ጸልዩ።',
    ],
    scripture: {
      textEn: 'Therefore, since we are surrounded by so great a cloud of witnesses, let us run with perseverance the race set before us.',
      textAm: 'እንግዲህ እኛን የሚያስተውሉ ብዙ ምስክሮች እንደተከበብን በእኛ ፊት የቀረበውን ዕለት እስከ መጨረሻ በጽናት እንሮጥ።',
      referenceEn: 'Hebrews 12:1',
      referenceAm: 'ዕብራይስጥ ፲፪፡፩',
      bookId: 'hebrews',
      chapter: 12,
    },
    reflectionEn: 'Which saint\u2019s example speaks to my struggles right now, and how can I learn from them?',
    reflectionAm: 'የትኛው ቅዱስ ምሳሌ ከአሁኑ ትግሌዬ ጋር ይናገርናል፣ ከእነሱ ምን ልማር?',
    prayerEn:
      'Holy saints of God, pray for us. Inspire us to live faithfully, courageously, and with hope in Christ our King. Amen.',
    prayerAm: 'ቅዱሳን ሆይ፣ ለእኛ ጸልዩ። በክርስቶስ ንጉሳችን በእምነት፣ በድፍረትና በተስፋ እንድንኖር አነቃቁን። አሜን።',
    related: {
      saint: {
        labelEn: 'Saints calendar',
        labelAm: 'የቅዱሳን ቀን መቁጠሪያ',
        href: '/(tabs)/calendar',
      },
      feast: {
        labelEn: 'Monthly commemorations',
        labelAm: 'ወርሃዊ ቀኖች',
        href: '/(tabs)/calendar',
      },
    },
  },
  {
    id: 'salvation-theosis',
    category: 'salvation',
    categoryEn: 'Salvation',
    categoryAm: 'መዳን',
    titleEn: 'Salvation as Theosis',
    titleAm: 'መዳን እንደ አምላካዊነት',
    readMin: 4,
    paragraphsEn: [
      'Orthodox Christianity understands salvation not as a mere legal verdict but as participation in divine life. By grace, human beings are called to become by mercy what God is by nature — this is theosis, deification by grace.',
      'Baptism, Chrismation, Eucharist, repentance, and ascetic struggle are gifts that unite us to Christ. Salvation is dynamic: we are being saved daily as we cooperate with the Holy Spirit.',
      'The goal is not escape from the world but transfiguration within it — to bear the light of Christ in family, work, worship, and service to the poor.',
    ],
    paragraphsAm: [
      'ኦርቶዶክስ ክርስትና መዳንን እንደ ብቻ የሕግ ውሳኔ ሳይሆን በአምላካዊ ሕይወት ተሳትፎ ይረዳው። በጸጋ ሰዎች በምሕረት እግዚአብሔር በተፈጥሮ የሆነውን ለመሆን ይጠራሉ — ይህ አምላካዊነት ነው።',
      'ጥምቀት፣ ምሕረት፣ ቅዱስ ቁርባን፣ ንስሐና ጸንታ የክርስቶስ ጋር የሚያገናኙ ስጦታዎች ናቸው። መዳን ተንቀሳቃሽ ነው፤ ከመንፈስ ቅዱስ ጋር በሚተባበርበት ጊዜ በየዕለት እንድንድን ነው።',
      'ግቡ ከዓለም መሸሽ ሳይሆን በውስጡ መለወጥ ነው — በቤተሰብ፣ በሥራ፣ በመገለጽና በድሆች አገልግሎት ብርሃን ክርስቶስን ማሳየት።',
    ],
    scripture: {
      textEn: 'Beloved, now we are children of God. It is not yet revealed what we will be, but we know that when he is revealed, we will be like him.',
      textAm: 'ውድሞቼ ሆይ፣ አሁን የእግዚአብሔር ልጆች ነን። ምን እንሆናለን እንደሚታወቅ ገና አልተገለጸም፤ ነገር ግን እርሱ ሲገለጽ እንደ እርሱ እንሆናለን እናውቃለን።',
      referenceEn: '1 John 3:2',
      referenceAm: '፩ ዮሐንስ ፫፡፪',
      bookId: '1john',
      chapter: 3,
    },
    reflectionEn: 'Where is God inviting me to grow closer to Him this week through worship, repentance, or service?',
    reflectionAm: 'በመገለጽ፣ በንስሐ ወይም በአገልግሎት እግዚአብሔር በዚህ ሳምንት ወደ እርሱ እንዴት እንዲቅርብ ይጋብዘኛል?',
    prayerEn:
      'O Christ our God, who became man that we might become god by grace, renew Your image within me and lead me in the path of salvation. Amen.',
    prayerAm: 'ኦ ክርስቶስ አምላካችን ሆይ፣ በጸጋ እንድንሆን ሰው ሆነህ የመጣህ፣ ምስልህን በእኔ አድስና በመዳን መንገድ አቅደኝ። አሜን።',
    related: {
      bibleReading: {
        labelEn: 'Romans 8',
        labelAm: 'ሮሜ ፰',
        bookId: 'romans',
        chapter: 8,
        href: '/book/romans/8',
      },
    },
  },
];
