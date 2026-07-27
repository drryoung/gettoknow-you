/**
 * Platform / provenance taxonomy for the GetToKnow.You content library.
 *
 * Single source of truth for the machine-readable platform values used by:
 *   - `distributionLinks[].platform` (which platform a link points to)
 *   - `canonicalPlatform` (which platform hosts the authoritative version)
 *   - `origin` (where an item was first published)
 *
 * keystatic.config.ts imports these option lists to build its select fields,
 * and content/loadWorks.ts imports the value lists to validate stored data.
 * Extend by adding one entry to the relevant list below — no other file
 * needs to change.
 */

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  xiaohongshu: "Xiaohongshu",
  youtube: "YouTube",
  substack: "Substack",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  podcast: "Podcast",
  workshop: "Workshop",
  interview: "Interview",
  other: "Other",
};

/** Platforms a distribution link may point to. */
export const DISTRIBUTION_PLATFORM_VALUES = [
  "instagram",
  "xiaohongshu",
  "youtube",
  "substack",
  "linkedin",
  "facebook",
  "tiktok",
  "website",
  "podcast",
  "other",
] as const;
export type DistributionPlatform = (typeof DISTRIBUTION_PLATFORM_VALUES)[number];

/** Platforms that may host the authoritative canonical version. */
export const CANONICAL_PLATFORM_VALUES = [
  "website",
  "instagram",
  "xiaohongshu",
  "youtube",
  "substack",
  "linkedin",
  "facebook",
  "tiktok",
  "podcast",
  "other",
] as const;
export type CanonicalPlatform = (typeof CANONICAL_PLATFORM_VALUES)[number];

/** Where an item was first published, before any later distribution. */
export const ORIGIN_VALUES = [
  "instagram",
  "xiaohongshu",
  "youtube",
  "substack",
  "linkedin",
  "facebook",
  "tiktok",
  "workshop",
  "podcast",
  "interview",
  "website",
  "other",
] as const;
export type Origin = (typeof ORIGIN_VALUES)[number];

function toOptions(values: readonly string[]): { label: string; value: string }[] {
  return values.map((value) => ({ label: PLATFORM_LABELS[value] ?? value, value }));
}

export const DISTRIBUTION_PLATFORM_OPTIONS = toOptions(DISTRIBUTION_PLATFORM_VALUES);
export const CANONICAL_PLATFORM_OPTIONS = toOptions(CANONICAL_PLATFORM_VALUES);
export const ORIGIN_OPTIONS = toOptions(ORIGIN_VALUES);

export function isDistributionPlatform(value: string): value is DistributionPlatform {
  return (DISTRIBUTION_PLATFORM_VALUES as readonly string[]).includes(value);
}

export function isCanonicalPlatform(value: string): value is CanonicalPlatform {
  return (CANONICAL_PLATFORM_VALUES as readonly string[]).includes(value);
}

export function isOrigin(value: string): value is Origin {
  return (ORIGIN_VALUES as readonly string[]).includes(value);
}

export function platformLabel(value: string): string {
  return PLATFORM_LABELS[value] ?? value;
}
