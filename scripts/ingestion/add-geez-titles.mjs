/**
 * One-off helper: merge title_geez into data/bibleCanon.json
 * Run: node scripts/ingestion/add-geez-titles.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonPath = path.join(ROOT, 'data', 'bibleCanon.json');

/** Classical Ge'ez manuscript / printed Bible titles */
const TITLE_GEEZ = {
  genesis: 'መጽሐፈ ፍጥረት',
  exodus: 'መጽሐፈ ወጸአት',
  leviticus: 'መጽሐፈ ሌዋውያን',
  numbers: 'መጽሐፈ ኍልቍ',
  deuteronomy: 'መጽሐፈ ዘዳግም',
  joshua: 'መጽሐፈ ኢያሱ',
  judges: 'መጽሐፈ መሳፍንት',
  ruth: 'መጽሐፈ ሩት',
  samuel: 'መጽሐፈ ሳሙኤል',
  kings: 'መጽሐፈ ነገሥት',
  '1_chronicles': 'መጽሐፈ ዜና መዝሙር ቀዳማዊ',
  '2_chronicles': 'መጽሐፈ ዜና መዝሙር ካልዕ',
  jubilees: 'መጽሐፈ ኩፍላይ',
  enoch: 'መጽሐፈ ሄኖክ',
  ezra_nehemiah: 'መጽሐፈ ዕዝራ ሥራዓዊ እና ነህምያ',
  ezra_sutu_el: 'መጽሐፈ ዕዝራ ሱቱኤል',
  tobit: 'መጽሐፈ ቶቢት',
  judith: 'መጽሐፈ ይሁዲት',
  esther: 'መጽሐፈ አስቴር',
  meqabyan_1: 'መጽሐፈ መቃብያን ቀዳማዊ',
  meqabyan_2_3: 'መጽሐፈ መቃብያን ካልዕ እና ሣልስዕ',
  joseph_ben_gurion: 'መጽሐፈ ዮሴፍ ወልደ ከንግርዮን',
  job: 'መጽሐፈ ኢዮብ',
  psalms: 'መዝሙር ዳዊት',
  proverbs: 'መጽሐፈ ምሳሌ',
  tegsats: 'መጽሐፈ ተግሣጽ',
  wisdom: 'ጥበበ ሰሎሞን',
  ecclesiastes: 'መጽሐፈ መክብብ',
  song_of_songs: 'መጽሐፈ መኃልየ መኃልይ',
  isaiah: 'መጽሐፈ ኢሳይያስ',
  jeremiah: 'መጽሐፈ ኤርምያስ',
  ezekiel: 'መጽሐፈ ሕዝቅኤል',
  daniel: 'መጽሐፈ ዳንኤል',
  hosea: 'መጽሐፈ ሆሴዕ',
  amos: 'መጽሐፈ ዓሞጽ',
  micah: 'መጽሐፈ ሚክያስ',
  joel: 'መጽሐፈ ዮኤል',
  obadiah: 'መጽሐፈ አብድያስ',
  jonah: 'መጽሐፈ ዮናስ',
  nahum: 'መጽሐፈ ናሆም',
  habakkuk: 'መጽሐፈ ዕንባቆም',
  zephaniah: 'መጽሐፈ ሶፎንያስ',
  haggai: 'መጽሐፈ ሐጌ',
  zechariah: 'መጽሐፈ ዘካርያስ',
  malachi: 'መጽሐፈ ሚልክያስ',
  sirach: 'መጽሐፈ ትምህርተ ሲራክ',
  matthew: 'ወንጌል ማቴዎስ',
  mark: 'ወንጌል ማርቆስ',
  luke: 'ወንጌል ሉቃስ',
  john: 'ወንጌል ዮሐንስ',
  acts: 'መጽሐፈ ሐዋርያት',
  romans: 'መልእክተ ሮሜ',
  '1_corinthians': 'መልእክተ ቆሮንቶስ ቀዳማዊ',
  '2_corinthians': 'መልእክተ ቆሮንቶስ ካልዕ',
  galatians: 'መልእክተ ገላትያ',
  ephesians: 'መልእክተ ኤፌሶን',
  philippians: 'መልእክተ ፊልጵስዩስ',
  colossians: 'መልእክተ ቆላስይስ',
  '1_thessalonians': 'መልእክተ ተሰሎንቄ ቀዳማዊ',
  '2_thessalonians': 'መልእክተ ተሰሎንቄ ካልዕ',
  '1_timothy': 'መልእክተ ጢሞቴዎስ ቀዳማዊ',
  '2_timothy': 'መልእክተ ጢሞቴዎስ ካልዕ',
  titus: 'መልእክተ ጢቶስ',
  philemon: 'መልእክተ ፊልሞና',
  hebrews: 'መልእክተ ዕብራውያን',
  james: 'መልእክተ ያዕቆብ',
  '1_peter': 'መልእክተ ጴጥሮስ ቀዳማዊ',
  '2_peter': 'መልእክተ ጴጥሮስ ካልዕ',
  '1_john': 'መልእክተ ዮሐንስ ቀዳማዊ',
  '2_john': 'መልእክተ ዮሐንስ ካልዕ',
  '3_john': 'መልእክተ ዮሐንስ ሣልስዕ',
  jude: 'መልእክተ ይሁዳ',
  revelation: 'ራእየ ዮሐንስ',
  serate_tsion: 'ስራተ ፅዮን',
  teezaz: 'መጽሐፈ ተዕዛዝ',
  gitsew: 'መጽሐፈ ግጽወ',
  abtilis: 'መጽሐፈ አብቲሊስ',
  covenant_1: 'መጽሐፈ ኪዳን ቀዳማዊ',
  covenant_2: 'መጽሐፈ ኪዳን ካልዕ',
  clement: 'መጽሐፈ ቅላንጦስ',
  didascalia: 'መጽሐፈ ዲዳስቃሊያ',
};

const books = JSON.parse(fs.readFileSync(canonPath, 'utf8'));
const updated = books.map((book) => {
  const title_geez = TITLE_GEEZ[book.book_id];
  if (!title_geez) {
    throw new Error(`Missing Ge'ez title for ${book.book_id}`);
  }
  const { title_geez: _old, ...rest } = book;
  return { ...rest, title_geez };
});

fs.writeFileSync(canonPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
console.log(`Updated ${updated.length} books with title_geez`);
