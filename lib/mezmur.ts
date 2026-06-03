import type { SavedListenKind } from '@/hooks/use-saved-hymns';
import { getSupabase } from '@/lib/supabase';
import { translate, type LanguageMode } from '@/lib/translations';
import type { AudioTrack } from '@/contexts/audio-player-context';
import { youtubeListThumbnailUrl } from '@/lib/youtube-thumbnail';
import { resolveMezmurAlbumThumbnail } from '@/constants/mezmur-album-art';
import { resolveMezmurChannelThumbnail } from '@/constants/mezmur-channel-art';
import { AHADU_ALBUM_NAMES } from '@/data/ahaduAlbums';
import {
  EGEZIHARYA_YILMA_CHANNEL,
  isMezmurSongsOnlyChannel,
  MEZMUR_CHANNEL_LANGUAGE,
  MEZMUR_DEBTER_ALBUMS,
  MEZMUR_DEBTER_CHANNEL,
  YOTC_CHOIR_CHANNEL,
  YOTC_NATION_OF_THE_CROSS_ALBUM,
  ZEHOHITE_BIRHAN_CHANNEL,
  type MezmurCategory,
  type MezmurLanguage,
} from '@/data/mezmurCatalog';
import {
  buildAhaduAlbumCards,
  buildAhaduPlaylistCards,
  isAhaduStudiosChannel,
  pickSongsForAhaduAlbum,
} from '@/lib/ahadu-albums';
import {
  hasEgeziharyaTrackOrder,
  pickSongsForEgeziharyaAlbum,
} from '@/lib/egeziharya-albums';
import {
  hasMahibereKidusanTrackOrder,
  pickSongsForMahibereKidusanAlbum,
} from '@/lib/mahibere-kidusan-albums';
import { MAHIBERE_KIDUSAN_CHANNEL } from '@/data/mezmurCatalog';
import { buildMedia21Mezmur } from '@/lib/media-21';
import {
  buildZehohiteBirhanMezmur,
  buildZehohiteBirhanAlbums,
  isZehohiteBirhanChannel,
  pickSongsForZehohiteAlbum,
} from '@/lib/zehohite-birhan';
import {
  buildAllBundledSermonMezmur,
  fetchSermonArtists,
  isBundledSermonChannel,
  isSermonCatalogSong,
} from '@/lib/sermon-catalog';
import {
  buildSpotChurchAlbums,
  isSpotChurchChannel,
  pickSongsForSpotAlbum,
} from '@/lib/spot-church';

export type Mezmur = {
  videoId: string;
  title: string;
  artist: string;
  album: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  language: string | null;
  type: string | null;
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

export type MezmurPlaylistCard = {
  artist: string;
  album: string;
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
  type?: string | null;
  description?: string | null;
};

let cachedSongs: Mezmur[] | null = null;
let cachePromise: Promise<Mezmur[]> | null = null;

function mapRow(row: MezmurRow): Mezmur {
  const song = normalizeMezmurCatalogEntry({
    videoId: row.video_id,
    title: row.title,
    artist: row.artist,
    album: row.album,
    thumbnailUrl: youtubeListThumbnailUrl(row.video_id, row.thumbnail_url),
    publishedAt: row.published_at,
    language: row.language,
    type: row.type ?? null,
    description: row.description ?? null,
  });
  if (isMezmurSongsOnlyChannel(song.artist)) {
    return { ...song, album: '' };
  }
  return song;
}

/** Correct channel ownership when Supabase still has stale artist values. */
export function normalizeMezmurCatalogEntry(song: Mezmur): Mezmur {
  if (
    song.artist === EGEZIHARYA_YILMA_CHANNEL &&
    MEZMUR_DEBTER_ALBUMS.has(song.album)
  ) {
    return { ...song, artist: MEZMUR_DEBTER_CHANNEL };
  }

  if (MEZMUR_DEBTER_ALBUMS.has(song.album)) {
    if (
      song.artist === EGEZIHARYA_YILMA_CHANNEL ||
      song.artist === 'Ahadu Studios'
    ) {
      return { ...song, artist: MEZMUR_DEBTER_CHANNEL };
    }
    return song;
  }

  if (/y\.?o\.?t\.?c|young orthodox tewahedo/i.test(song.artist)) {
    return { ...song, artist: YOTC_CHOIR_CHANNEL, album: YOTC_NATION_OF_THE_CROSS_ALBUM };
  }

  if (/mezmur debter/i.test(song.artist)) {
    const lang = song.language?.trim().toLowerCase();
    let album = song.album;
    if (!MEZMUR_DEBTER_ALBUMS.has(album)) {
      if (lang === 'english') album = 'English Hymns';
      else if (lang === 'amharic') album = 'Amharic Hymns';
      else if (album.toLowerCase().includes('english')) album = 'English Hymns';
      else album = 'Amharic Hymns';
    }
    return { ...song, artist: MEZMUR_DEBTER_CHANNEL, album };
  }

  return song;
}

function formatListenItemCountLabel(
  count: number,
  kind: SavedListenKind,
  mode: LanguageMode
): string {
  if (kind === 'sermon') {
    return count === 1
      ? translate('listen.oneSermon', mode)
      : translate('listen.nSermons', mode).replace('{n}', String(count));
  }
  return count === 1
    ? translate('listen.oneSong', mode)
    : translate('listen.nSongs', mode).replace('{n}', String(count));
}

export function formatMezmurChannelSubtitle(
  artist: string,
  albumCount: number,
  songCount: number,
  options?: { kind?: SavedListenKind; mode?: LanguageMode }
): string {
  const kind = options?.kind ?? 'hymn';
  const mode = options?.mode ?? 'en';

  if (isMezmurSongsOnlyChannel(artist)) {
    return formatListenItemCountLabel(songCount, kind, mode);
  }
  const playlistLabel = albumCount === 1 ? 'playlist' : 'playlists';
  const itemLabel = formatListenItemCountLabel(songCount, kind, mode);
  return `${albumCount} ${playlistLabel} · ${itemLabel}`;
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

  const coreColumns = 'video_id, title, artist, album, thumbnail_url, published_at, language';
  const typedColumns = `${coreColumns}, type`;

  let { data, error } = await supabase
    .from('mezmur')
    .select(`${typedColumns}, description`)
    .order('artist', { ascending: true })
    .order('album', { ascending: true })
    .order('title', { ascending: true });

  if (error) {
    ({ data, error } = await supabase
      .from('mezmur')
      .select(typedColumns)
      .order('artist', { ascending: true })
      .order('album', { ascending: true })
      .order('title', { ascending: true }));
  }

  if (error) {
    ({ data, error } = await supabase
      .from('mezmur')
      .select(coreColumns)
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
      const hymns = rows.filter(
        (song) =>
          !isSermonCatalogSong(song) &&
          song.artist !== ZEHOHITE_BIRHAN_CHANNEL &&
          song.artist !== 'Zehohite Birhan'
      );
      const merged = [
        ...hymns,
        ...buildMedia21Mezmur(),
        ...buildZehohiteBirhanMezmur(),
        ...buildAllBundledSermonMezmur(),
      ];
      cachedSongs = merged;
      return merged;
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

/** Normalize DB / sheet type values into catalog category shelves. */
export function resolveMezmurCategory(type: string | null | undefined): MezmurCategory {
  const value = type?.trim().toLowerCase();
  if (value === 'nisiha' || value === 'praise' || value === 'maryam' || value === 'fasting') {
    return value;
  }
  return 'other';
}

function emptyCategoryPlaylists(): Record<MezmurCategory, MezmurPlaylistCard[]> {
  return { nisiha: [], praise: [], maryam: [], fasting: [], other: [] };
}

/** Unique playlists grouped by language shelf and category shelf. */
export function groupPlaylistsByLanguageAndCategory(
  songs: Mezmur[]
): Record<MezmurLanguage, Record<MezmurCategory, MezmurPlaylistCard[]>> {
  const result: Record<MezmurLanguage, Record<MezmurCategory, MezmurPlaylistCard[]>> = {
    english: emptyCategoryPlaylists(),
    amharic: emptyCategoryPlaylists(),
  };

  const byAlbum = new Map<string, Mezmur[]>();
  for (const song of songs) {
    if (isSermonCatalogSong(song)) continue;
    if (isAhaduStudiosChannel(song.artist)) continue;
    const key = `${song.artist}\0${song.album}`;
    const list = byAlbum.get(key) ?? [];
    list.push(song);
    byAlbum.set(key, list);
  }

  for (const albumSongs of byAlbum.values()) {
    const first = albumSongs[0];
    if (!first) continue;
    const language = resolveMezmurLanguage(first);
    const category = resolveMezmurCategory(first.type);
    const videoThumb = albumSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null;
    result[language][category].push({
      artist: first.artist,
      album: first.album,
      songCount: albumSongs.length,
      thumbnailUrl: resolveMezmurAlbumThumbnail(first.artist, first.album, videoThumb),
    });
  }

  for (const card of buildAhaduPlaylistCards(songs)) {
    result.english.praise.push(card);
  }

  for (const language of ['english', 'amharic'] as MezmurLanguage[]) {
    for (const category of Object.keys(result[language]) as MezmurCategory[]) {
      result[language][category].sort((a, b) => a.album.localeCompare(b.album));
    }
  }

  return result;
}

export async function fetchPlaylistsGroupedByLanguageAndCategory(): Promise<
  Record<MezmurLanguage, Record<MezmurCategory, MezmurPlaylistCard[]>>
> {
  return groupPlaylistsByLanguageAndCategory(await fetchAllMezmur());
}

function playlistsFromSongs(songs: Mezmur[]): MezmurPlaylistCard[] {
  const nonAhadu = songs.filter(
    (song) => !isSermonCatalogSong(song) && !isAhaduStudiosChannel(song.artist)
  );
  const byAlbum = new Map<string, Mezmur[]>();
  for (const song of nonAhadu) {
    const key = `${song.artist}\0${song.album}`;
    const list = byAlbum.get(key) ?? [];
    list.push(song);
    byAlbum.set(key, list);
  }

  const cards = Array.from(byAlbum.values())
    .map((albumSongs) => {
      const first = albumSongs[0];
      if (!first) return null;
      const videoThumb = albumSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null;
      return {
        artist: first.artist,
        album: first.album,
        songCount: albumSongs.length,
        thumbnailUrl: resolveMezmurAlbumThumbnail(first.artist, first.album, videoThumb),
      };
    })
    .filter((item): item is MezmurPlaylistCard => Boolean(item))
    .sort((a, b) => a.album.localeCompare(b.album));

  return [...cards, ...buildAhaduPlaylistCards(songs)];
}

/** All playlists for one language — one bookshelf, any channel or theme. */
export function groupPlaylistsByLanguage(
  songs: Mezmur[]
): Record<MezmurLanguage, MezmurPlaylistCard[]> {
  const english = playlistsFromSongs(songs.filter((song) => resolveMezmurLanguage(song) === 'english'));
  const amharic = playlistsFromSongs(songs.filter((song) => resolveMezmurLanguage(song) === 'amharic'));
  return { english, amharic };
}

export async function fetchPlaylistsByLanguage(): Promise<
  Record<MezmurLanguage, MezmurPlaylistCard[]>
> {
  return groupPlaylistsByLanguage(await fetchAllMezmur());
}

/** Merge theme playlists from English and Amharic into one catalog per type. */
export function mergePlaylistsByCategory(
  grouped: Record<MezmurLanguage, Record<MezmurCategory, MezmurPlaylistCard[]>>
): Record<MezmurCategory, MezmurPlaylistCard[]> {
  const merged = emptyCategoryPlaylists();
  for (const language of ['english', 'amharic'] as MezmurLanguage[]) {
    for (const category of Object.keys(merged) as MezmurCategory[]) {
      merged[category].push(...grouped[language][category]);
    }
  }
  for (const category of Object.keys(merged) as MezmurCategory[]) {
    merged[category].sort((a, b) => a.album.localeCompare(b.album));
  }
  return merged;
}

export async function fetchPlaylistsByCategory(): Promise<
  Record<MezmurCategory, MezmurPlaylistCard[]>
> {
  const grouped = await fetchPlaylistsGroupedByLanguageAndCategory();
  return mergePlaylistsByCategory(grouped);
}

/** Flat catalog playlists (all themes/channels combined, deduped). */
export async function fetchAllCatalogPlaylists(): Promise<MezmurPlaylistCard[]> {
  const byCategory = await fetchPlaylistsByCategory();
  const map = new Map<string, MezmurPlaylistCard>();
  for (const list of Object.values(byCategory)) {
    for (const card of list) {
      map.set(`${card.artist}\0${card.album}`, card);
    }
  }
  return [...map.values()].sort((a, b) => a.album.localeCompare(b.album));
}

function emptyCategorySongs(): Record<MezmurCategory, Mezmur[]> {
  return { nisiha: [], praise: [], maryam: [], fasting: [], other: [] };
}

/** Songs grouped by language and theme — any channel, for the hymns See All catalog. */
export function groupSongsByLanguageAndCategory(
  songs: Mezmur[]
): Record<MezmurLanguage, Record<MezmurCategory, Mezmur[]>> {
  const result: Record<MezmurLanguage, Record<MezmurCategory, Mezmur[]>> = {
    english: emptyCategorySongs(),
    amharic: emptyCategorySongs(),
  };

  for (const song of songs) {
    if (isSermonCatalogSong(song)) continue;
    const language = resolveMezmurLanguage(song);
    const category = resolveMezmurCategory(song.type);
    result[language][category].push(song);
  }

  for (const language of ['english', 'amharic'] as MezmurLanguage[]) {
    for (const category of Object.keys(result[language]) as MezmurCategory[]) {
      result[language][category].sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  return result;
}

export async function fetchSongsGroupedByLanguageAndCategory(): Promise<
  Record<MezmurLanguage, Record<MezmurCategory, Mezmur[]>>
> {
  return groupSongsByLanguageAndCategory(await fetchAllMezmur());
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
      albumCount: isMezmurSongsOnlyChannel(name)
        ? 0
        : new Set(artistSongs.map((s) => s.album).filter(Boolean)).size,
      songCount: artistSongs.length,
      thumbnailUrl: resolveMezmurChannelThumbnail(
        name,
        artistSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Artists with album and song counts, sorted alphabetically (hymns only). */
export async function fetchArtists(): Promise<MezmurArtist[]> {
  const songs = (await fetchAllMezmur()).filter((song) => !isSermonCatalogSong(song));
  return artistsFromSongs(songs);
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

/** All songs for a channel (used for songs-only artists). */
export async function fetchSongsByArtist(artist: string): Promise<Mezmur[]> {
  const songs = await fetchAllMezmur();
  return songs
    .filter((s) => s.artist === artist)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/** Albums for one artist, sorted alphabetically. */
export async function fetchAlbumsByArtist(artist: string): Promise<MezmurAlbum[]> {
  if (isMezmurSongsOnlyChannel(artist)) return [];

  const songs = await fetchAllMezmur();
  if (isSpotChurchChannel(artist)) {
    return buildSpotChurchAlbums();
  }
  if (isZehohiteBirhanChannel(artist)) {
    return buildZehohiteBirhanAlbums();
  }
  if (isAhaduStudiosChannel(artist)) {
    return buildAhaduAlbumCards(songs);
  }

  const byAlbum = new Map<string, Mezmur[]>();

  for (const song of songs.filter((s) => s.artist === artist && s.album)) {
    const list = byAlbum.get(song.album) ?? [];
    list.push(song);
    byAlbum.set(song.album, list);
  }

  return Array.from(byAlbum.entries())
    .map(([name, albumSongs]) => ({
      name,
      songCount: albumSongs.length,
      thumbnailUrl: resolveMezmurAlbumThumbnail(
        artist,
        name,
        albumSongs.find((s) => s.thumbnailUrl)?.thumbnailUrl ?? null
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Songs for one artist + album, in tracklist order when curated. */
export async function fetchSongsByArtistAlbum(artist: string, album: string): Promise<Mezmur[]> {
  const songs = await fetchAllMezmur();
  if (isAhaduStudiosChannel(artist) && AHADU_ALBUM_NAMES.has(album)) {
    return pickSongsForAhaduAlbum(songs, album);
  }
  if (artist === EGEZIHARYA_YILMA_CHANNEL && hasEgeziharyaTrackOrder(album)) {
    return pickSongsForEgeziharyaAlbum(songs, album);
  }
  if (artist === MAHIBERE_KIDUSAN_CHANNEL && hasMahibereKidusanTrackOrder(album)) {
    return pickSongsForMahibereKidusanAlbum(songs, album);
  }
  if (isSpotChurchChannel(artist)) {
    return pickSongsForSpotAlbum(songs, album);
  }
  if (isZehohiteBirhanChannel(artist)) {
    return pickSongsForZehohiteAlbum(songs, album);
  }
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

function defaultSaveKindForMezmur(song: Mezmur): AudioTrack['saveKind'] {
  if (isSermonCatalogSong(song)) return 'sermon';
  return 'hymn';
}

/** Map a mezmur row to the shared audio player track shape. */
export function mezmurToAudioTrack(
  song: Mezmur,
  saveKind?: AudioTrack['saveKind']
): AudioTrack {
  return {
    id: song.videoId,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artworkUri: song.thumbnailUrl,
    videoId: song.videoId,
    categoryLabel: song.album,
    saveKind: saveKind ?? defaultSaveKindForMezmur(song),
  };
}

export function mezmurListToAudioTracks(
  songs: Mezmur[],
  saveKind?: AudioTrack['saveKind']
): AudioTrack[] {
  return songs.map((song) => mezmurToAudioTrack(song, saveKind));
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
    thumbnailUrl: youtubeListThumbnailUrl(entry.videoId, entry.thumbnailUrl),
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

export type MezmurSearchScope = 'hymns' | 'sermons' | 'all';

function filterSongsBySearchScope(songs: Mezmur[], scope: MezmurSearchScope): Mezmur[] {
  if (scope === 'all') return songs;
  if (scope === 'sermons') return songs.filter(isSermonCatalogSong);
  return songs.filter((song) => !isSermonCatalogSong(song));
}

/** Search channels, playlists, and songs across the mezmur catalog. */
export async function searchMezmurCatalog(
  query: string,
  scope: MezmurSearchScope = 'all'
): Promise<MezmurSearchResults> {
  const q = query.trim().toLowerCase();
  if (!q) return { channels: [], playlists: [], songs: [] };

  const songs = filterSongsBySearchScope(await fetchAllMezmur(), scope);
  const artists =
    scope === 'sermons'
      ? await fetchSermonArtists()
      : scope === 'hymns'
        ? await fetchArtists()
        : [...(await fetchArtists()), ...(await fetchSermonArtists())];
  const channels = artists.filter((artist) => artist.name.toLowerCase().includes(q));

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
          thumbnailUrl: resolveMezmurAlbumThumbnail(
            song.artist,
            song.album,
            song.thumbnailUrl || null
          ),
        },
      });
    }
    const entry = playlistMap.get(key)!;
    entry.album.songCount += 1;
    if (!entry.album.thumbnailUrl && song.thumbnailUrl) {
      entry.album.thumbnailUrl = resolveMezmurAlbumThumbnail(
        song.artist,
        song.album,
        song.thumbnailUrl
      );
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
