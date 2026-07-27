/**
 * Stable Theme identifiers for GetToKnow.You.
 *
 * Public display titles live on theme Markdoc records under content/themes/.
 * Works reference these slugs only — never visible titles — so renaming a theme
 * does not require editing associated works.
 *
 * Distinct from content/collections.ts (Layer-2 collection taxonomy / topics).
 */
export const THEME_IDS = [
  "better-conversations",
  "cross-cultural-understanding",
  "language-and-relationships",
  "trust-and-human-connection",
  "building-gettoknow-you",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

/** Keystatic multiselect options (value = stable slug). Labels are editorial aids only. */
export const THEME_OPTIONS = [
  { label: "Better Conversations", value: "better-conversations" },
  { label: "Cross-Cultural Understanding", value: "cross-cultural-understanding" },
  { label: "Language and Relationships", value: "language-and-relationships" },
  { label: "Trust and Human Connection", value: "trust-and-human-connection" },
  { label: "Building GetToKnow.You", value: "building-gettoknow-you" },
] as const;

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}
