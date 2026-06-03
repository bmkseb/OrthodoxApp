/** Mahibere Kidusan — curated album track order (YouTube Music / Topic). */
export const MAHIBERE_KIDUSAN_CHANNEL = 'Mahibere Kidusan';

/** YouTube Music album playlist for Proclaim His Name. */
export const PROCLAIM_HIS_NAME_PLAYLIST_ID = 'OLAK5uy_mXqjbCG-abWey_No91qJyVzal72ioFZPU';

export const PROCLAIM_HIS_NAME_TRACK_ORDER = [
  'Proclaim His Name',
  'They Honor Her',
  'Peace Be Upon You',
  'The Holy Church',
  'The Holy Virgin Mary',
  'Saint TekleHaymanot',
  'He Never Left',
  'We Give Glory to the Mother',
  'Done for Me',
] as const;

export type MahibereKidusanAlbumDef = {
  album: string;
  songs: readonly string[];
};

export const MAHIBERE_KIDUSAN_ORDERED_ALBUMS: MahibereKidusanAlbumDef[] = [
  { album: 'Proclaim His Name', songs: PROCLAIM_HIS_NAME_TRACK_ORDER },
];

export const MAHIBERE_KIDUSAN_ALBUM_NAMES = new Set(
  MAHIBERE_KIDUSAN_ORDERED_ALBUMS.map((entry) => entry.album)
);
