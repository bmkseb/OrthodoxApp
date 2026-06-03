import {
  buildSpotChurchArtist,
  buildSpotChurchMezmur,
  buildSpotChurchPlaylistCards,
  isSpotChurchChannel,
} from '@/lib/spot-church';
import type { Mezmur, MezmurArtist, MezmurPlaylistCard } from '@/lib/mezmur';

export function isBundledSermonChannel(artist: string): boolean {
  return isSpotChurchChannel(artist);
}

export function isSermonCatalogSong(song: Mezmur): boolean {
  return song.type === 'sermon' || isBundledSermonChannel(song.artist);
}

export function buildAllBundledSermonMezmur(): Mezmur[] {
  return buildSpotChurchMezmur();
}

export async function fetchSermonArtists(): Promise<MezmurArtist[]> {
  return [buildSpotChurchArtist()];
}

export async function fetchSermonPlaylistCards(): Promise<MezmurPlaylistCard[]> {
  return buildSpotChurchPlaylistCards();
}

export async function fetchSermonSongs(): Promise<Mezmur[]> {
  return buildAllBundledSermonMezmur();
}
