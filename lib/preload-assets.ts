import { Image } from 'expo-image';

const TAB_HERO_URIS = [
  'https://picsum.photos/900/500?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/900/600?random=50',
  'https://picsum.photos/900/520?random=40',
  'https://picsum.photos/800/400?random=21',
] as const;

let started = false;

export async function preloadTabAssets() {
  if (started) return;
  started = true;
  await Promise.allSettled(TAB_HERO_URIS.map((uri) => Image.prefetch(uri, 'memory-disk')));
}
