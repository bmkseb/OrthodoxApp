import { getSupabase } from '@/lib/supabase';
import type { AudioTrack } from '@/contexts/audio-player-context';

export type Mezmur = {  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  language: string | null;
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

  const { data, error } = await supabase
    .from('mezmur')
    .select('video_id, title, artist, album, thumbnail_url, published_at, language')
    .order('artist', { ascending: true })
    .order('album', { ascending: true })
    .order('title', { ascending: true });

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

/** Artists with album and song counts, sorted alphabetically. */
export async function fetchArtists(): Promise<MezmurArtist[]> {
  const songs = await fetchAllMezmur();
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
      thumbnailUrl: artistSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
  };
}

export function mezmurListToAudioTracks(songs: Mezmur[]): AudioTrack[] {
  return songs.map(mezmurToAudioTrack);
}
