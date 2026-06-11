/**
 * Load Amharic + Ge'ez for Wudase Mariam — Sunday section.
 * Usage: node scripts/ingestion/seed-wudase-sunday-am-geez.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function loadEnvFile() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return false;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  return true;
}

const SECTION_ID = 'cccc6416-007e-404f-9f73-eaa5969cd386';
const BOOK_ID = '9cd0e0bd-c42d-4280-93a1-b6f7efab268d';

const SECTION_TITLES = {
  title_am: 'እሑድ',
  title_amharic: 'እሑድ',
  title_geez: 'ሰንበት',
};

const VERSES = [
  {
    position: 1,
    text_amharic:
      'ከሴቶች ይልቅ ተለይተሽ የተባረክሽ ሆይ፥ የተወደድሽ ተባልሽ፥ ከተለዩ የተለዩት በውስጧም የኪዳን ጽላት ያለባት የምትባል ሁለተኛ ክፍል አንቺ ነሽ፥ ኪዳንም በእግዚአብሔር ጣቶች የተጻፉ አሥሩ ቃላት ናቸው፡፡ ያለመለወጥ ካንቺ ሰው የሆነ መድኃኒታችን ኢየሱስ ክርስቶስን ደኅንነት ስሙን መጀመሪያ ስሙን አስቀድሞ በየውጣ ነገረን ለአዲስ ኪዳንም አስታራቂ ሆነ፥ በከበረ ደሙም መፍሰስ ያመኑትንና ንጹሐን የሆኑትን ወገኖች አነጻቸው፡፡ ቅድስት ሆይ ለምኚልን፡፡',
    text_geez:
      'ተሰመይኪ ፍቅርተ ኦ ቡርክት እምአንስት፡፡ አንቲ ውእቱ ዳግሚት ቀመር እንተ ትሰመይ ቅድስተ ቅዱሳን ውስቴታ ጽላተ ኪዳን፡፡ ፲ቱ ቃላት እለ ተጽሕፉ በአጻብዒሁ ለእግዚአብሔር ቀዲሙ ዜነወነ በየውጣ እንተ ይእቲ ቀዳሚ ስሙ ለመድኃኒነ ኢየሱስ ክርስቶስ ዘተሰብአ እምኔኪ ዘእንበለ ውላጤ ወኮነ ዓራቂ ለሐዲስ ኪዳን በሙኃዘ ደሙ ቅዱስ አንጽሖሙ ለመሃይምናን ወለሕዝብ ንጹሐን፡፡ ሰአሊ ለነ ቅድስት፡፡',
  },
  {
    position: 2,
    text_amharic:
      'ሁል ጊዜ ንጽሕት የሆንሽ አምላክን የወለድሽ እመቤታችን ሆይ፥ ሁላችን ስለዚህ እናገንሻለን ሰውን በሚወድ በጌታ ዘንድ ይቅርታን እናገኝ ዘንድ እንለምንሻለን ወደአንቺም እናንቃዕርራለን፡፡ በማይነቅዝ ዕንጨት የተሠራች በውስጥና በውጭ በወርቅ የተለበጠች ታቦት ያለመለወጥና ያለመከፈል ሰው የሆነ የእግዚአብሔርን ቃል ይመስልልናል፥ ይኸውም መለየት የሌለበት ንጹሕ አምላክ ነው፥ ከአብ ጋር የተካከለ ነው በአብ ጥበብ ያለ ወንድ ዘር እንደ እኛ ሆነ መለኮቱን አዋሐደ ያለ ርኵሰት ካንቺ ዘንድ ሰው ሆነ፡፡ ቅድስት ሆይ ለምኚልን፡፡',
    text_geez:
      'ወበእንተዝ ናዐብየኪ ኵልነ ኦ እግዝእትነ ወላዲተ አምላክ ንጽሕት ኵሉ ጊዜ ንስእል ወናንቀዐዱ ኀቤኪ ከመ ንርከብ ሣህለ በኀበ መፍቀሬ ሰብእ፡፡ ታቦት በወርቅ ልቡጥ እምኵሉ ገቦሃ እንተ ገብርዋ እምዕፅ ዘኢይነቅዝ ይትሜሰል ለነ ዘእግዚአብሔር ቃለ ዘኮነ ሰብአ ዘእንበለ ፍልጠት ወኢውላጤ መለኮት ንጹሕ ዘአልቦ ሙስና ዘዕሩይ ምስለ አብ ወቦቱ አብሠራ ለንጽሕት ዘእንበለ ዘርእ ኮነ ከማነ በከዊነ ጥበቡ ቅዱስ ዘተሰብአ እምኔኪ ዘእንበለ ርኵስ ደመረ መለኮቶ፡፡ ሰአሊ ለነ ቅድስት፡፡',
  },
  {
    position: 3,
    text_amharic:
      'በእግዚአብሔር ሥዕል የተሣሉ ኪሩቤል የሚጋርዱሽ መቅደስ አንቺ ነሽ፥ ያለ መለወጥ ካንቺ ሰው የሆነው ቃል ኃጢአታችንን የሚያስተሠርይልን አበሳችንን የሚያደመስስ ሆነ፡፡ ቅድስት ሆይ ለምኚልን፡፡',
    text_geez:
      'መቅደስ ዘይኬልልዋ ኪሩበል እለ ሥዑላን በሥዕለ እግዚአብሔር ቃል ዘተሰብአ እምኔኪ ዘእንበለ ውላጤ ኮነ ሠራዬ ኃጢአትነ ወደምሳሴ አበሳነ፡፡ ሰአሊ ለነ ቅድስት፡፡',
  },
  {
    position: 4,
    text_amharic:
      'የተሠወረ መና ያለብሽ የንጹሕ ወርቅ መሶብ አንቺ ነሽ፥ መናም ከሰማይ የወረደውና ለዓለም ሁሉ ሕይወትን የሚያድለው ኅብስት ነው፡፡ ቅድስት ሆይ ለምኚልን፡፡',
    text_geez:
      'አንቲ ውእቱ መሶበ ወርቅ ንጹሕ እንተ ውስቴታ መና ኅቡእ ኅብስት ዘወረደ እምሰማያት ወሀቤ ሕይወት ለኵሉ ዓለም፡፡ ሰአሊ ለነ ቅድስት፡፡',
  },
];

async function main() {
  if (!loadEnvFile()) {
    console.error('Missing .env');
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key);

  const { error: sectionError } = await sb
    .from('prayer_sections')
    .update(SECTION_TITLES)
    .eq('id', SECTION_ID);
  if (sectionError) throw sectionError;

  for (const verse of VERSES) {
    const payload = {
      text_amharic: verse.text_amharic,
      text_geez: verse.text_geez,
      content_am: verse.text_amharic,
      content_geez: verse.text_geez,
    };
    const { error } = await sb
      .from('prayer_verses')
      .update(payload)
      .eq('section_id', SECTION_ID)
      .eq('position', verse.position);
    if (error) throw error;
    console.log(`Updated verse ${verse.position}`);
  }

  const { data: book, error: bookError } = await sb
    .from('prayer_books')
    .select('available_languages')
    .eq('id', BOOK_ID)
    .single();
  if (bookError) throw bookError;

  const langs = new Set(book?.available_languages ?? ['english']);
  langs.add('english');
  langs.add('amharic');
  langs.add('geez');

  const { error: langError } = await sb
    .from('prayer_books')
    .update({ available_languages: [...langs] })
    .eq('id', BOOK_ID);
  if (langError) throw langError;

  console.log('Done — Wudase Mariam Sunday Amharic + Ge\'ez loaded.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
