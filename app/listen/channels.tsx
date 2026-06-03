import { Redirect } from 'expo-router';

/** Legacy route — Hymns Catalog See All lives at /listen/catalog. */
export default function ListenChannelsRedirect() {
  return <Redirect href={{ pathname: '/listen/catalog', params: { section: 'channels' } }} />;
}
