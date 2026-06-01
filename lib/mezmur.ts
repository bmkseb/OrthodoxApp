import { getSupabase } from '@/lib/supabase';
import type { AudioTrack } from '@/contexts/audio-player-context';
import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import { MEZMUR_CHANNEL_LANGUAGE, type MezmurLanguage } from '@/data/mezmurCatalog';

export type Mezmur = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  language: string | null;
  description: string | null;
};

export type MezmurArtist = {
  name: string;
  albumCount: number;
  songCount: number;
  thumbnailUrl: string | null;
};

export type MezmurAlbum = {
  name: string;
  songCount: number;
  thumbnailUrl: string | null;
};

type MezmurRow = {
  video_id: string;
  title: string;
  artist: string;
  album: string;
  thumbnail_url: string | null;
  published_at: string | null;
  language: string | null;
  description?: string | null;
};

let cachedSongs: Mezmur[] | null = null;
let cachePromise: Promise<Mezmur[]> | null = null;

function mapRow(row: MezmurRow): Mezmur {
  return {
    videoId: row.video_id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    thumbnailUrl: row.thumbnail_url ?? '',
    publishedAt: row.published_at,
    language: row.language,
    description: row.description ?? null,
  };
}

export function decodeRouteParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function encodeRouteParam(value: string): string {
  return encodeURIComponent(value);
}

/** Clears the in-memory catalog cache (e.g. after pull-to-refresh). */
export function clearMezmurCache() {
  cachedSongs = null;
  cachePromise = null;
}

async function fetchAllMezmurRows(): Promise<Mezmur[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const baseColumns =
    'video_id, title, artist, album, thumbnail_url, published_at, language';

  let { data, error } = await supabase
    .from('mezmur')
    .select(`${baseColumns}, description`)
    .order('artist', { ascending: true })
    .order('album', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    ({ data, error } = await supabase
      .from('mezmur')
      .select(baseColumns)
      .order('artist', { ascending: true })
      .order('album', { ascending: true })
      .order('title', { ascending: true }));
  }

  if (error) throw error;
  return ((data ?? []) as MezmurRow[]).map(mapRow);
}

/** Fetches the full mezmur catalog once per session, then groups client-side. */
export async function fetchAllMezmur(): Promise<Mezmur[]> {
  if (cachedSongs) return cachedSongs;
  if (!cachePromise) {
    cachePromise = fetchAllMezmurRows().then((rows) => {
      cachedSongs = rows;
      return rows;
    });
  }
  return cachePromise;
}

/** Resolve catalog language for a song (channel map, then DB value, then album fallback). */
export function resolveMezmurLanguage(song: Mezmur): MezmurLanguage {
  const byChannel = MEZMUR_CHANNEL_LANGUAGE[song.artist];
  if (byChannel) return byChannel;

  const lang = song.language?.trim().toLowerCase();
  if (lang === 'amharic' || lang === 'am') return 'amharic';
  if (lang === 'english' || lang === 'en') return 'english';

  const album = song.album.toLowerCase();
  if (album.includes('english')) return 'english';
  return 'amharic';
}

function artistsFromSongs(songs: Mezmur[]): MezmurArtist[] {
  const byArtist = new Map<string, Mezmur[]>();

  for (const song of songs) {
    const list = byArtist.get(song.artist) ?? [];
    list.push(song);
    byArtist.set(song.artist, list);
  }

  return Array.from(byArtist.entries())
    .map(([name, artistSongs]) => ({
      name,
      albumCount: new Set(artistSongs.map((s) => s.album)).size,
      songCount: artistSongs.length,
      thumbnailUrl: resolveMezmurChannelThumbnail(
        name,
        artistSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Artists with album and song counts, sorted alphabetically. */
export async function fetchArtists(): Promise<MezmurArtist[]> {
  return artistsFromSongs(await fetchAllMezmur());
}

/** Artists that have at least one song in the given language shelf. */
export async function fetchArtistsByLanguage(language: MezmurLanguage): Promise<MezmurArtist[]> {
  const songs = await fetchAllMezmur();
  return artistsFromSongs(songs.filter((song) => resolveMezmurLanguage(song) === language));
}

/** Group all catalog artists by language shelf. */
export async function fetchArtistsGroupedByLanguage(): Promise<
  Record<MezmurLanguage, MezmurArtist[]>
> {
  const songs = await fetchAllMezmur();
  const english: Mezmur[] = [];
  const amharic: Mezmur[] = [];

  for (const song of songs) {
    if (resolveMezmurLanguage(song) === 'english') english.push(song);
    else amharic.push(song);
  }

  return {
    english: artistsFromSongs(english),
    amharic: artistsFromSongs(amharic),
  };
}

/** Albums for one artist, sorted alphabetically. */
export async function fetchAlbumsByArtist(artist: string): Promise<MezmurAlbum[]> {
  const songs = await fetchAllMezmur();
  const byAlbum = new Map<string, Mezmur[]>();

  for (const song of songs.filter((s) => s.artist === artist)) {
    const list = byAlbum.get(song.album) ?? [];
    list.push(song);
    byAlbum.set(song.album, list);
  }

  return Array.from(byAlbum.entries())
    .map(([name, albumSongs]) => ({
      name,
      songCount: albumSongs.length,
      thumbnailUrl: albumSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Songs for one artist + album, in title order. */
export async function fetchSongsByArtistAlbum(artist: string, album: string): Promise<Mezmur[]> {
  const songs = await fetchAllMezmur();
  return songs.filter((s) => s.artist === artist && s.album === album);
}

/** YouTube video description for a single mezmur (catalog cache or direct query). */
export async function fetchMezmurDescription(videoId: string): Promise<string | null> {
  const songs = await fetchAllMezmur();
  const cached = songs.find((song) => song.videoId === videoId);
  if (cached?.description?.trim()) return cached.description.trim();

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('mezmur')
    .select('description')
    .eq('video_id', videoId)
    .maybeSingle();

  if (error?.code === '42703') return null;
  if (error || !data?.description?.trim()) return null;
  return data.description.trim();
}

/** Map a mezmur row to the shared audio player track shape. */
export function mezmurToAudioTrack(song: Mezmur): AudioTrack {
  return {
    id: song.videoId,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artworkUri: song.thumbnailUrl,
    videoId: song.videoId,
    categoryLabel: song.album,
    saveKind: 'hymn',
  };
}

export function mezmurListToAudioTracks(songs: Mezmur[]): AudioTrack[] {
  return songs.map(mezmurToAudioTrack);
}

/** Pick a random catalog song (uses in-memory cache when available). */
export async function fetchRandomMezmur(): Promise<Mezmur | null> {
  const songs = await fetchAllMezmur();
  if (songs.length === 0) return null;
  return songs[Math.floor(Math.random() * songs.length)] ?? null;
}

export function filterByQuery<T>(items: T[], query: string, getParts: (item: T) => (string | null | undefined)[]): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => getParts(item).some((part) => part?.toLowerCase().includes(q)));
}

/** Find a catalog song whose title contains the needle (case-insensitive). */
export function findMezmurByTitleNeedle(songs: Mezmur[], needle: string): Mezmur | undefined {
  const q = needle.trim().toLowerCase();
  if (!q) return undefined;
  return songs.find((song) => song.title.toLowerCase().includes(q));
}

export function listeningEntryToMezmur(entry: {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
}): Mezmur {
  return {
    videoId: entry.videoId,
    title: entry.title,
    artist: entry.artist,
    album: entry.album,
    thumbnailUrl: entry.thumbnailUrl,
    publishedAt: null,
    language: null,
    description: null,
  };
}

export type MezmurSearchResults = {
  channels: MezmurArtist[];
  playlists: { artist: string; album: MezmurAlbum }[];
  songs: Mezmur[];
};

/** Search channels, playlists, and songs across the full mezmur catalog. */
export async function searchMezmurCatalog(query: string): Promise<MezmurSearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { channels: [], playlists: [], songs: [] };

  const songs = await fetchAllMezmur();
  const channels = (await fetchArtists()).filter((artist) => artist.name.toLowerCase().includes(q));

  const playlistMap = new Map<string, { artist: string; album: MezmurAlbum }>();
  for (const song of songs) {
    const albumMatches = song.album.toLowerCase().includes(q);
    const comboMatches = `${song.artist} ${song.album}`.toLowerCase().includes(q);
    if (!albumMatches && !comboMatches) continue;

    const key = `${song.artist}::${song.album}`;
    if (!playlistMap.has(key)) {
      playlistMap.set(key, {
        artist: song.artist,
        album: {
          name: song.album,
          songCount: 0,
          thumbnailUrl: song.thumbnailUrl || null,
        },
      });
    }
    const entry = playlistMap.get(key)!;
    entry.album.songCount += 1;
    if (!entry.album.thumbnailUrl && song.thumbnailUrl) {
      entry.album.thumbnailUrl = song.thumbnailUrl;
    }
  }

  const playlists = Array.from(playlistMap.values()).sort((a, b) =>
    a.album.name.localeCompare(b.album.name)
  );

  const matchedSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.album.toLowerCase().includes(q) ||
      song.language?.toLowerCase().includes(q)
  );

  return { channels, playlists, songs: matchedSongs };
}
