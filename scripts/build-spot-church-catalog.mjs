/**
 * Resolves SPOT Church playlist titles → YouTube video IDs (Invidious channel index).
 * Run: node scripts/build-spot-church-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CHANNEL_ID = 'UCtBsjKsdqdAFHv_snt-otmA';
const CHANNEL_NAME = 'SPOT Church';

const RISE_AND_MEASURE = {
  id: 'rise-and-measure',
  album: 'Rise & Measure',
  titles: [
    'Rise & Measure (Week 8)',
    'Rise & Measure (Week 6)',
    'Rise & Measure (Week 5)',
    'Rise & Measure (Week 4)',
    'Rise & Measure (Week 3)',
    'Rise & Measure (Week 2)',
    'Rise & Measure (Week 1)',
  ],
};

const ROAD_TO_DAMASCUS = {
  id: 'road-to-damascus',
  album: 'Road to Damascus',
  titles: [
    'Violence to Live',
    'The Golden Censor - Sermon',
    'Us vs. The World',
    'The Plight of a Righteous Man',
    'A Bridge to a Lost Connection || RTD Sermon',
    'Be Alive Now || RTD Sermon',
    'Embracing the Unexpected Plan || RTD Sermon',
    'The Truth, And Our Fear Of Living It || RTD Sermon',
    'Create in Me a Loving Heart || RTD Sermon',
    'REAL ID: Identity in Christ || RTD Sermon',
    'When The Story Becomes A Revelation || RTD Sermon',
    'Am I in a Spiritual Winter? || RTD Sermon',
    'Faith Tested Through Fire || RTD Sermon',
    "Keep Your Guard Up: Don't Let Your Mind Wander",
    'For He has won, the Winner of Winners || RTD Sermon',
    'Unshakeable Confidence || RTD Sermon',
    'Beloved & Needed || RTD Sermon',
  ],
};

const GREAT_LENT = {
  id: 'great-lent-2026',
  album: 'Great Lent 2026',
  titles: [
    'The Resurrection Of Christ',
    'Why Are You Seeking the Living Among the Dead? || Holy 50 Reflection',
    'The Three Running Souls || Resurrection Sunday',
    'Communion with Christ || Bright Saturday Reflection',
    'Bring Your Brokenness to Christ || Good Friday Reflection',
    'Christ Still Wants You At The Table || Holy Thursday Reflection',
    'Abundance of Love || Holy Wednesday Reflection',
    'Are You Ready for Christ? || Holy Tuesday Reflection',
    'Conforming to the World || Holy Monday Reflection',
    'Blessed is He, That Comes in the Name of the Lord, Hosanna in the Highest || Matthew 21: 1-11',
    'Trust in the Lord || Lenten Reflection',
    "Your King is Here, O' Israel",
    'In the Cover of Night || Lenten Reflection',
    'We Speak What We Know, And Testify What We Have Seen || John 3: 1-12',
    'Psalm 40:8-9 || Reflection',
    'The Lord Gives Intentionally',
    'Multiplying Talents || Lenten Reflection',
    'Psalm 50:2-3 || Reflection',
    'I Will Make You Ruler of Many Things || Matthew 25: 14-40',
    "My way vs. God's Way || Lenten Reflection",
    'The Mount of Olives',
    'Whoever Reads, Let Him Understand || Matthew 24: 1-36',
    'Paralysis || Lenten Reflection',
    'Do You Want to Be Made Well?',
    'Healing Beyond the Pool || John 5: 1-25',
    'Sacrament of the Unction of the Sick Service',
    'Seek the Lord || Lenten Reflection',
    "Has Zeal for My Father's House Consumed Me?",
    'Relinquishing Control || Lenten Reflection',
    'Where is Your Treasure?',
    'Your Father Who Is In a Secret Place Will Reward You Openly || Matthew 6: 16-24',
    'Christ’s Humble Descent || Lenten Reflection',
    'With His Mercifulness || English Spiritual Hymn',
    'The One that Descends',
    'The Light Has Come Into The World || John 3:5-25',
  ],
};

const MANUAL_IDS = {
  'rise & measure (week 1)': '4VvXr9OYSdA',
  'sacrament of the unction of the sick service': 'T7ogmaKRONY',
  'the light has come into the world || john 3:5-25': 'fORJ7m3vt6s',
};

function normalizeTitle(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "'")
    .replace(/\s+/g, ' ');
}

async function fetchChannelVideos() {
  const localPath = path.join(__dirname, 'spot-invidious.json');
  if (fs.existsSync(localPath)) {
    const cached = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    if (cached.videos?.length) return cached.videos;
  }

  const res = await fetch(
    `https://invidious.flokinet.to/api/v1/channels/${CHANNEL_ID}/videos`
  );
  if (!res.ok) throw new Error(`Invidious ${res.status}`);
  const json = await res.json();
  return json.videos ?? [];
}

function indexVideos(videos) {
  const map = new Map();
  for (const video of videos) {
    map.set(normalizeTitle(video.title), video.videoId);
  }
  return map;
}

function resolveTitle(title, index) {
  const norm = normalizeTitle(title);
  if (MANUAL_IDS[norm]) return MANUAL_IDS[norm];
  if (index.has(norm)) return index.get(norm);

  const compact = norm.replace(/[^a-z0-9| ]/g, '');
  for (const [key, id] of index) {
    const kc = key.replace(/[^a-z0-9| ]/g, '');
    if (kc === compact) return id;
  }

  for (const [key, id] of index) {
    if (key.includes(norm.slice(0, 24)) || norm.includes(key.slice(0, 24))) return id;
  }

  return null;
}

async function searchSpotVideo(title) {
  const query = `${title} SPOT Church`;
  const res = await fetch(
    `https://invidious.flokinet.to/api/v1/search?q=${encodeURIComponent(query)}&type=video`
  );
  if (!res.ok) return null;
  const json = await res.json();
  const results = Array.isArray(json) ? json : [];
  const want = normalizeTitle(title);

  for (const hit of results) {
    if (hit.author !== CHANNEL_NAME || !hit.videoId) continue;
    const got = normalizeTitle(hit.title ?? '');
    if (got === want) return hit.videoId;
    if (got.includes(want.slice(0, 20)) || want.includes(got.slice(0, 20))) return hit.videoId;
  }

  for (const hit of results) {
    if (hit.author === CHANNEL_NAME && hit.videoId) return hit.videoId;
  }

  return null;
}

async function buildPlaylist(playlist, index) {
  const tracks = [];
  const missing = [];
  for (const title of playlist.titles) {
    let videoId = resolveTitle(title, index);
    if (!videoId) {
      videoId = await searchSpotVideo(title);
      await new Promise((r) => setTimeout(r, 400));
    }
    if (!videoId) {
      missing.push(title);
      continue;
    }
    tracks.push({ videoId, title });
  }
  return { tracks, missing };
}

async function main() {
  const videos = await fetchChannelVideos();
  const index = indexVideos(videos);

  const rise = await buildPlaylist(RISE_AND_MEASURE, index);
  const lent = await buildPlaylist(GREAT_LENT, index);
  const rtd = await buildPlaylist(ROAD_TO_DAMASCUS, index);

  const out = `/** Generated by scripts/build-spot-church-catalog.mjs — do not edit by hand. */
export const SPOT_CHURCH_CHANNEL = ${JSON.stringify(CHANNEL_NAME)} as const;

export const SPOT_CHURCH_CHANNEL_ID = ${JSON.stringify(CHANNEL_ID)} as const;

export type SpotChurchTrack = { videoId: string; title: string };

export type SpotChurchPlaylist = {
  id: string;
  album: string;
  tracks: SpotChurchTrack[];
};

export const SPOT_CHURCH_PLAYLISTS: SpotChurchPlaylist[] = ${JSON.stringify(
    [
      { id: RISE_AND_MEASURE.id, album: RISE_AND_MEASURE.album, tracks: rise.tracks },
      { id: GREAT_LENT.id, album: GREAT_LENT.album, tracks: lent.tracks },
      { id: ROAD_TO_DAMASCUS.id, album: ROAD_TO_DAMASCUS.album, tracks: rtd.tracks },
    ],
    null,
    2
  )};
`;

  fs.writeFileSync(path.join(ROOT, 'data/spotChurchCatalog.ts'), out);

  console.log(`Rise & Measure: ${rise.tracks.length}/${RISE_AND_MEASURE.titles.length}`);
  if (rise.missing.length) console.log('  missing rise:', rise.missing);
  console.log(`Great Lent: ${lent.tracks.length}/${GREAT_LENT.titles.length}`);
  if (lent.missing.length) console.log('  missing lent:', lent.missing);
  console.log(`Road to Damascus: ${rtd.tracks.length}/${ROAD_TO_DAMASCUS.titles.length}`);
  if (rtd.missing.length) console.log('  missing rtd:', rtd.missing);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
