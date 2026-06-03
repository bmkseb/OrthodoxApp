/** Mezmur Debter Zetewahedo — full uploads playlist sync. */
export const MEZMUR_DEBTER_YT_CHANNEL_ID = 'UCQOlCKlhhIMSF4le-VQ8D7Q';
export const MEZMUR_DEBTER_ARTIST = 'Mezmur Debter Zetewahedo';
export const MEZMUR_DEBTER_ALBUM_ENGLISH = 'English Hymns';
export const MEZMUR_DEBTER_ALBUM_AMHARIC = 'Amharic Hymns';

/** Legacy / mistaken albums — removed on each sync. */
export const MEZMUR_DEBTER_PURGE_ALBUMS = [
  'Annual Collection',
  'Great Lent Mezmurs',
  'የዐቢይ ጾም መዝሙራት',
  'የዓመቱ ያሬዳዊ መዝሙራት || Mezmur Collection',
  'Other',
];

/** Explicit English-released hymns (must contain the word "English"). */
const ENGLISH_TITLE_MARKERS = /\benglish\b/i;

const ETHIOPIC = /[\u1200-\u137F]/;

/** Latin-script tokens that are Amharic transliteration, not English vocabulary. */
const AMHARIC_LATIN_WORDS = new Set([
  'be',
  'ye',
  'li',
  'ze',
  'ba',
  'ne',
  'se',
  'te',
  'le',
  'mez',
  'mezmur',
  'zemari',
  'bezemari',
  'zemarit',
  'diakon',
  'deacon',
  'kidus',
  'mariam',
  'tsion',
  'gebriel',
  'gabriel',
  'michael',
  'tinsae',
  'lidet',
  'timket',
  'kidane',
  'peraklitos',
  'tekleshaymanot',
  'mezmurat',
  'debter',
  'zetewahedo',
  'nisiha',
  'liqe',
  'mezem',
  'kisis',
  'yemstir',
  'ent',
  'ende',
  'mahlet',
  'tesfa',
  'zema',
  'bet',
]);

/** Common English words (function words + hymn vocabulary). */
const ENGLISH_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'from',
  'by',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'shall',
  'should',
  'may',
  'might',
  'must',
  'can',
  'could',
  'not',
  'no',
  'yes',
  'it',
  'its',
  'as',
  'if',
  'so',
  'we',
  'us',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'they',
  'them',
  'their',
  'i',
  'me',
  'my',
  'mine',
  'who',
  'whom',
  'whose',
  'which',
  'what',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'than',
  'too',
  'very',
  'just',
  'only',
  'own',
  'same',
  'into',
  'over',
  'under',
  'again',
  'once',
  'here',
  'there',
  'then',
  'now',
  'english',
  'hymn',
  'hymns',
  'song',
  'songs',
  'lord',
  'god',
  'christ',
  'jesus',
  'holy',
  'virgin',
  'mary',
  'praise',
  'worship',
  'come',
  'behold',
  'believe',
  'through',
  'this',
  'that',
  'these',
  'those',
  'one',
  'two',
  'new',
  'old',
  'good',
  'great',
  'ever',
  'living',
  'true',
  'light',
  'life',
  'love',
  'faith',
  'hope',
  'peace',
  'mercy',
  'grace',
  'glory',
  'spirit',
  'father',
  'son',
  'cross',
  'king',
  'kingdom',
  'salvation',
  'eternal',
  'divine',
  'blessed',
  'almighty',
  'creation',
  'eucharist',
  'emmanuel',
  'savior',
  'saviour',
  'baptism',
  'baptiz',
  'christmas',
  'epiphany',
  'resurrection',
  'pentecost',
  'gardener',
  'lebanon',
  'amen',
  'alleluia',
  'hallelujah',
  'hosanna',
  'version',
  'official',
  'video',
  'lyrics',
  'music',
  'choir',
  'voice',
  'voices',
  'sing',
  'singing',
  'called',
  'name',
  'names',
  'day',
  'days',
  'night',
  'world',
  'heaven',
  'heavens',
  'earth',
  'heart',
  'soul',
  'souls',
  'people',
  'child',
  'children',
  'man',
  'men',
  'woman',
  'women',
  'born',
  'risen',
  'died',
  'death',
  'blood',
  'body',
  'bread',
  'wine',
  'cup',
  'table',
  'tomb',
  'temple',
  'church',
  'orthodox',
  'tewahedo',
  'ethiopian',
  'african',
  'africa',
  'lion',
  'judah',
  'david',
  'solomon',
  'moses',
  'abraham',
  'isaac',
  'jacob',
  'joseph',
  'peter',
  'paul',
  'john',
  'mark',
  'luke',
  'matthew',
  'judas',
  'pilate',
  'herod',
  'bethlehem',
  'nazareth',
  'jerusalem',
  'calvary',
  'golgotha',
  'nazarene',
  'messiah',
  'prophet',
  'prophets',
  'apostle',
  'apostles',
  'angel',
  'angels',
  'saint',
  'saints',
  'hymnal',
  'volume',
  'vol',
  'part',
  'pt',
  'feat',
  'ft',
  'vs',
  'remix',
  'live',
  'studio',
  'acoustic',
  'cover',
]);

const DEBTER_NON_HYMN_TITLE = [
  /\bintro\b/i,
  /mezmur debter zetewahedo intro/i,
  /በቅርብ ቀን/i,
  /coming soon/i,
  /\bpreview\b/i,
  /\bteaser\b/i,
  /\btrailer\b/i,
  /annual collection/i,
  /apartment tour/i,
  /tour community/i,
  /#\s*shorts\b/i,
  /\bshorts\b/i,
  /\bvlog\b/i,
  /\bpodcast\b/i,
  /\binterview\b/i,
  /\blecture\b/i,
  /\bdocumentary\b/i,
];

/** Latin-only titles that are Amharic transliteration, not English hymns. */
const AMHARIC_LATIN_MARKERS =
  /\b(zemari|bezemari|zemarit|diakon|deacon|mezmur collection|liqe mezem|kisis|ተሾመ|yemstir|ye\s|be\s|kidus|mariam|tsion|gebriel|michael|hosanna|tinsae|lidet|timket|kidane|peraklitos|tekleshaymanot|mezmurat)\b/i;

export function isDebterEnglishTitle(title) {
  return ENGLISH_TITLE_MARKERS.test(title);
}

export function hasEthiopicScript(title) {
  return ETHIOPIC.test(title);
}

/** True when a Latin-script token is an English word (not Amharic transliteration). */
export function isEnglishWordToken(word) {
  const lower = (word ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (!lower || lower.length < 2) return false;
  if (AMHARIC_LATIN_WORDS.has(lower)) return false;
  if (ENGLISH_WORDS.has(lower)) return true;

  if (lower.length >= 4 && /[aeiouy]/.test(lower)) {
    if (/(tion|sion|ness|ment|able|ible|ous|ful|less|ing|ed|ly|est|ist|ism)$/.test(lower)) {
      return true;
    }
  }

  return false;
}

/** At least one English word in the title (mixed Geʽez + English titles → English playlist). */
export function hasEnglishWordInTitle(title) {
  const tokens = (title ?? '').match(/\b[A-Za-z]{2,}\b/g);
  if (!tokens?.length) return false;
  return tokens.some((token) => isEnglishWordToken(token));
}

function isLatinOnlyEnglishHymn(title) {
  const head = (title.split('||')[0] ?? title).trim();
  if (!/[A-Za-z]/.test(head)) return false;
  if (AMHARIC_LATIN_MARKERS.test(title)) return false;

  if (
    /^(the |a |an |my |our |his |her |you |who |when |where |come |behold |believe |through |from |all |he |she |i |we |o |holy |with |for |this |that |his |her )/i.test(
      head
    )
  ) {
    return true;
  }

  if (
    /\b(hymn|eucharist|christ|lord|god|emmanuel|savior|saviour|virgin mary|baptiz|christmas|epiphany|resurrection|pentecost|gardener|lebanon)\b/i.test(
      title
    )
  ) {
    return true;
  }

  return /^[\x20-\x7E"'“”‘’?!.:|,\-–—0-9()]+$/.test(head) && head.length > 12;
}

/** English vs Amharic shelf + album for each upload. */
export function classifyDebterLanguage(title) {
  const trimmed = (title ?? '').trim();
  if (!trimmed) return 'amharic';

  if (isDebterEnglishTitle(trimmed)) return 'english';
  if (hasEnglishWordInTitle(trimmed)) return 'english';
  if (hasEthiopicScript(trimmed)) return 'amharic';
  if (isLatinOnlyEnglishHymn(trimmed)) return 'english';

  return 'amharic';
}

export function debterAlbumForLanguage(language) {
  return language === 'english' ? MEZMUR_DEBTER_ALBUM_ENGLISH : MEZMUR_DEBTER_ALBUM_AMHARIC;
}

/** Drop non-hymn uploads (intros, teasers, shorts, etc.). */
export function isDebterMezmurTitle(title) {
  const lower = (title ?? '').trim().toLowerCase();
  if (!lower) return false;
  for (const pattern of DEBTER_NON_HYMN_TITLE) {
    if (pattern.test(lower)) return false;
  }
  return true;
}

/** Theme shelf (nisiha / praise / maryam / fasting / other). */
export function classifyDebterType(title) {
  const t = (title ?? '').toLowerCase();
  if (/ንስሓ|nisiha|repent/.test(t)) return 'nisiha';
  if (/mary|mariam|maria|virgin|ድንግል|ማርያም|እመቤ|lideta|lidet/.test(t)) return 'maryam';
  if (/ጾም|tsom|lent|fast|abiy tsom|ሆሣዕና|hosanna/.test(t)) return 'fasting';
  if (/praise|ሊቀ|hallelujah|ሃሌ/.test(t)) return 'praise';
  return 'other';
}
