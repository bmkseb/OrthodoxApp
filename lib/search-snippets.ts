/** Short excerpt centred on the first match of `query` inside `text`. */
export function buildSearchSnippet(text: string, query: string, radius = 72): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const q = query.trim();
  if (!q) return trimmed.length > radius * 2 ? `${trimmed.slice(0, radius * 2)}…` : trimmed;

  const lower = trimmed.toLowerCase();
  const needle = q.toLowerCase();
  const idx = lower.indexOf(needle);
  if (idx === -1) {
    return trimmed.length > radius * 2 ? `${trimmed.slice(0, radius * 2)}…` : trimmed;
  }

  const start = Math.max(0, idx - radius);
  const end = Math.min(trimmed.length, idx + needle.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < trimmed.length ? '…' : '';
  return `${prefix}${trimmed.slice(start, end).trim()}${suffix}`;
}
