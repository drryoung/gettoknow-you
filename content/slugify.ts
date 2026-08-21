/**
 * Stable, URL-safe slug generation from an editorial title.
 *
 * Used as the `slug.generate` function for Keystatic's `fields.slug` on new
 * Works/Themes records, so an owner typing a title never has to think about
 * filenames or slugs. Only ever runs when Keystatic generates or regenerates
 * a slug for an entry — it never touches existing filenames on disk.
 *
 * Titles that mix non-Latin script (for example Chinese) with an ASCII
 * subtitle keep the ASCII portion as the slug, matching the pattern already
 * used for existing EnglishOS records. Titles with no usable ASCII fall back
 * to a short stable placeholder rather than producing an empty slug.
 */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (base) return base;

  const fallback = `work-${Date.now().toString(36)}`;
  return fallback;
}
