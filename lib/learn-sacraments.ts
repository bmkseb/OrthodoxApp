/** Parent sacrament rows styled as section headers in Learn collection trees. */
export const LEARN_SACRAMENT_HEADER_SLUGS = new Set([
  'sacrament-of-the-eucharist',
  'mystery-of-the-holy-eucharist',
  'sacrament-of-myron-holy-oil',
  'mystery-of-holy-unction',
  'the-9-major-feasts',
  'the-9-minor-feasts-of-the-lord',
]);

export function isLearnSacramentHeader(slug: string | undefined): boolean {
  return slug != null && LEARN_SACRAMENT_HEADER_SLUGS.has(slug);
}
