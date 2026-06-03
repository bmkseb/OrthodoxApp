/**
 * Builds ዘኆኅተ ብርሃን ሚዲያ catalog from @zehohitebirhan_official uploads.
 * Keeps mezmur/hymns only; splits into English Hymns and Amharic Hymns playlists.
 * Run: node scripts/build-zehohite-birhan-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CHANNEL_NAME = 'ዘኆኅተ ብርሃን ሚዲያ';
const CHANNEL_HANDLE = '@zehohitebirhan_official';
const ENGLISH_ALBUM = 'English Hymns';
const AMHARIC_ALBUM = 'Amharic Hymns';

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  console.error('Missing YOUTUBE_API_KEY in .env');
  process.exit(1);
}

async function ytFetch(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set('key', YOUTUBE_API_KEY);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`YouTube API: ${err.error?.message ?? res.status}`);
  }
  return res.json();
}

async function resolveChannelId() {
  const data = await ytFetch('search', {
    part: 'snippet',
    q: 'zehohitebirhan_official Zehohite Birhan Media',
    type: 'channel',
    maxResults: '10',
  });
  for (const item of data.items ?? []) {
    const title = item.snippet?.title ?? '';
    if (
      title.includes('ዘኆኅተ') ||
      title.toLowerCase().includes('zehohite birhan')
    ) {
      return item.id?.channelId ?? null;
    }
  }
  throw new Error('Could not resolve Zehohite Birhan Media channel ID');
}

async function fetchChannelVideos(channelId) {
  const data = await ytFetch('channels', { part: 'contentDetails', id: channelId });
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new Error('Uploads playlist missing');

  const videos = [];
  let pageToken = '';
  do {
    const page = await ytFetch('playlistItems', {
      part: 'snippet',
      playlistId: uploadsId,
      maxResults: '50',
      ...(pageToken ? { pageToken } : {}),
    });
    for (const item of page.items ?? []) {
      const sn = item.snippet;
      const videoId = sn?.resourceId?.videoId;
      const title = sn?.title ?? '';
      if (!videoId || title === 'Private video' || title === 'Deleted video') continue;
      videos.push({ videoId, title });
    }
    pageToken = page.nextPageToken ?? '';
  } while (pageToken);

  return videos;
}

const EXCLUDE_PHRASES = [
  'apartment tour',
  'meet the apartment',
  'community',
  'podcast',
  '#podcast',
  'ኆኅተ ትረካ',
  'ኆኅተ ሥዕላት',
  'ኆኅተ አትሮንስ',
  'ኆኅተ 12',
  'ጥያቄዎ',
  'ቃለ አዋዲ',
  'መጽሐፍ ቅዱስ',
  'ጥናት መግቢያ',
  'ኦርቶዶክሳዊ የመዳን',
  'sermon',
  'interview',
  'lecture',
  'discussion',
  'debate',
  'ቆይታ',
  'የጥምቀት ጥያቄ',
  '#shorts',
  'ስኬት ሕይወት',
  'ኮረቱን',
  'መሰደድን ሁሉ',
  'ጾመ ፍልሠ',
  'ጰራቅሊጦስ',
  'መንፈስ ቅዱስ በምሥጢረ',
  'ሕማማት እና ሥርዓት',
  'አምላክ ተወለደ',
  'ሰው የሆነ አምላክ',
  'introducing the ethiopian',
  'crossing oneself',
  'st yared',
  'ፌሚኒዝም',
  'ጸሎተ ሃይማኖት',
  'ሃይማኖት ምንድን',
  'የመገለጥ ሃይማኖት',
  'ነቢያት ስለ',
  'ስሱን ተማምኜ',
  'እርሱን ተማምኜ',
  'የእናቴ እንባ',
  'የሥርዐተ ቅዳሴ',
  'finding of the true cross?',
  'why this nation',
  'በዓለ ጰራቅሊጦስ',
];

function shouldExclude(title) {
  const lower = title.toLowerCase();
  for (const phrase of EXCLUDE_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) return true;
  }
  if (/ጥያቄ|ትምህርት|ክፍል \d|ችግር|ምክር|#new🛑.*ትምህርት/i.test(title)) {
    if (!/መዝሙ|mezmur|hymn|ዜማ/i.test(title)) return true;
  }
  return false;
}

function isMezmurTitle(title) {
  if (shouldExclude(title)) return false;

  if (
    /mezmur|መዝሙር|hymn|HYMN|ዜማ|ኆኅተ ዜማ|መዘምራን|ወረብ|አልበም|children'?s song|yelijoch|orthodox english mezmur|non-stop orthodox|መንጦላ|melody|curtain|ascension|epiphany|timket|nativity|annunciation|hoşanna|hosanna|cana of galilee/i.test(
      title
    )
  ) {
    return true;
  }

  if (/ስብስብ|ስብስብ|compilation|collection/i.test(title) && /መዝሙ|mezmur|hymn/i.test(title)) {
    return true;
  }

  if (/ዘማሪ|ዲያቆን|ዲ\/ን|ዘማሪት/.test(title)) {
    if (/መዝሙ|mezmur|hymn|ዜማ|ወረብ|song|melody|ascension|epiphany|nativity|annunciation/i.test(title)) {
      return true;
    }
    if (!/🛑.*(ጥያቄ|ትምህርት|ክፍል|ችግር)/i.test(title)) {
      return true;
    }
  }

  return false;
}

function cleanTitle(title) {
  return title
    .replace(/@zehohitebirhan_official/gi, '')
    .replace(/Zehohitebirhan Media Official/gi, '')
    .replace(/Zehohite Birhan Media/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyLanguage(title) {
  const t = title;
  if (
    /english hymn|orthodox english|english mezmur|HYMNS OF|ORTHODOX ENGLISH|St\. Michael English|Children's Song|THE SEVEN CURTAINS|A GREAT MELODY|WITH SAINT JOHN|In the Land of Ephrathah|HOLY WATER|Crossing Oneself|Nativity Story|Hymn of Praise|Wonderful Are Your Deeds|ANNUNCIATION AND NATIVITY/i.test(
      t
    )
  ) {
    return 'english';
  }

  const head = t.split('|')[0].trim();
  const latin = (head.match(/[a-zA-Z]/g) || []).length;
  const ethiopic = (head.match(/[\u1200-\u137F]/g) || []).length;

  if (latin >= 12 && latin > ethiopic) return 'english';
  if (/^[A-Z0-9\s🛑#|.-]+$/.test(head) && latin > 8) return 'english';

  return 'amharic';
}

async function main() {
  const channelId = await resolveChannelId();
  console.log('Channel ID:', channelId);

  const all = await fetchChannelVideos(channelId);
  console.log(`Fetched ${all.length} uploads.`);

  const mezmur = all.filter((v) => isMezmurTitle(v.title));
  console.log(`Mezmur filter: ${mezmur.length} videos.`);

  const englishTracks = [];
  const amharicTracks = [];

  for (const video of mezmur) {
    const track = { videoId: video.videoId, title: cleanTitle(video.title) };
    if (classifyLanguage(video.title) === 'english') {
      englishTracks.push(track);
    } else {
      amharicTracks.push(track);
    }
  }

  englishTracks.sort((a, b) => a.title.localeCompare(b.title));
  amharicTracks.sort((a, b) => a.title.localeCompare(b.title));

  const out = `/** Generated by scripts/build-zehohite-birhan-catalog.mjs — do not edit by hand. */
export const ZEHOHITE_BIRHAN_CHANNEL = ${JSON.stringify(CHANNEL_NAME)} as const;

export const ZEHOHITE_BIRHAN_CHANNEL_HANDLE = ${JSON.stringify(CHANNEL_HANDLE)} as const;

export const ZEHOHITE_BIRHAN_CHANNEL_ID = ${JSON.stringify(channelId)} as const;

export const ZEHOHITE_BIRHAN_ENGLISH_ALBUM = ${JSON.stringify(ENGLISH_ALBUM)} as const;

export const ZEHOHITE_BIRHAN_AMHARIC_ALBUM = ${JSON.stringify(AMHARIC_ALBUM)} as const;

export type ZehohiteBirhanTrack = { videoId: string; title: string };

export type ZehohiteBirhanPlaylist = {
  id: string;
  album: string;
  language: 'english' | 'amharic';
  tracks: ZehohiteBirhanTrack[];
};

export const ZEHOHITE_BIRHAN_PLAYLISTS: ZehohiteBirhanPlaylist[] = ${JSON.stringify(
    [
      { id: 'english', album: ENGLISH_ALBUM, language: 'english', tracks: englishTracks },
      { id: 'amharic', album: AMHARIC_ALBUM, language: 'amharic', tracks: amharicTracks },
    ],
    null,
    2
  )};
`;

  fs.writeFileSync(path.join(ROOT, 'data/zehohiteBirhanCatalog.ts'), out);

  console.log(`English Hymns: ${englishTracks.length}`);
  console.log(`Amharic Hymns: ${amharicTracks.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
