/** 16:9 list thumb — no baked-in letterbox bars (unlike hqdefault / API `high`). */
export function youtubeListThumbnailUrl(videoId: string, storedUrl?: string | null): string {
  const id = extractYoutubeVideoId(storedUrl) ?? (videoId.trim() || null);
  if (!id) return storedUrl?.trim() ?? '';
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

function extractYoutubeVideoId(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const match = url.match(/\/vi(?:_webp)?\/([^/]+)\//);
  return match?.[1] ?? null;
}
