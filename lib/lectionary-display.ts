const BOOK_NAMES: Record<string, string> = {
  Gen: 'Genesis',
  Ex: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deu: 'Deuteronomy',
  Jos: 'Joshua',
  Jdg: 'Judges',
  Rth: 'Ruth',
  '1Sa': '1 Samuel',
  '2Sa': '2 Samuel',
  '1Ki': '1 Kings',
  '2Ki': '2 Kings',
  '1Ch': '1 Chronicles',
  '2Ch': '2 Chronicles',
  Ezr: 'Ezra',
  Neh: 'Nehemiah',
  Est: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Pro: 'Proverbs',
  Ecc: 'Ecclesiastes',
  Sol: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Eze: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joe: 'Joel',
  Amo: 'Amos',
  Oba: 'Obadiah',
  Jon: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zep: 'Zephaniah',
  Hag: 'Haggai',
  Zec: 'Zechariah',
  Mal: 'Malachi',
  Mat: 'Matthew',
  Mrk: 'Mark',
  Luk: 'Luke',
  Lk: 'Luke',
  Jhn: 'John',
  Jn: 'John',
  Mt: 'Matthew',
  Act: 'Acts',
  Ac: 'Acts',
  Rom: 'Romans',
  Rm: 'Romans',
  '1Cr': '1 Corinthians',
  '2Cr': '2 Corinthians',
  '1Co': '1 Corinthians',
  '2Co': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Ep: 'Ephesians',
  Phl: 'Philippians',
  Col: 'Colossians',
  Co: 'Colossians',
  '1Tm': '1 Timothy',
  '2Tm': '2 Timothy',
  Tt: 'Titus',
  Tts: 'Titus',
  Phm: 'Philemon',
  Plm: 'Philemon',
  Hb: 'Hebrews',
  Heb: 'Hebrews',
  Jam: 'James',
  '1Pt': '1 Peter',
  '2Pt': '2 Peter',
  '1Jn': '1 John',
  '2Jn': '2 John',
  '3Jn': '3 John',
  Jud: 'Jude',
  Rev: 'Revelation',
  '1Th': '1 Thessalonians',
  '2Th': '2 Thessalonians',
  '2Ts': '2 Thessalonians',
  '1Ts': '1 Thessalonians',
};

const BOOK_PATTERN =
  /^(Ps(?:alm)?\.?|Isa|Jer|Eze|Dan|Hos|Joe|Amo|Oba|Jon|Mic|Nah|Hab|Zep|Hag|Zec|Mal|Gen|Ex|Lev|Num|Deu|Jos|Jdg|Rth|1Sa|2Sa|1Ki|2Ki|1Ch|2Ch|1Cr|2Cr|2Kg|Ezr|Neh|Est|Job|Pro|Ecc|Sol|Lam|Mat|Mrk|Luk|Lk|Jhn|Jn|Mt|Act|Ac|Rom|Rm|1Co|2Co|Gal|Eph|Ep|Phl|Col|Co|1Tm|2Tm|Tt|Tts|Phm|Plm|Hb|Heb|Jam|1Pt|2Pt|1Jn|2Jn|3Jn|Jud|Rev|1Th|2Th|2Ts|1Ts)\b/i;

export function expandScriptureRef(ref: string): string {
  if (ref === 'Festal hiatus' || ref.startsWith('UNCLEAR')) return ref;

  const match = ref.trim().match(BOOK_PATTERN);
  if (!match) return ref;

  const abbrev = match[1].replace(/\.$/, '');
  const normalized =
    abbrev.charAt(0).toUpperCase() === abbrev.charAt(0) && abbrev.length > 2
      ? abbrev.slice(0, 1).toUpperCase() + abbrev.slice(1)
      : abbrev;

  const lookupKey = Object.keys(BOOK_NAMES).find(
    (key) => key.toLowerCase() === normalized.toLowerCase() || key.toLowerCase() === abbrev.toLowerCase()
  );

  const bookName = lookupKey ? BOOK_NAMES[lookupKey] : null;
  if (!bookName) return ref;

  const rest = ref.slice(match[0].length).trim();
  return rest ? `${bookName} ${rest}` : bookName;
}
