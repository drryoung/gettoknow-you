/**
 * Server-side content-library loader (GetToKnow.You).
 *
 * Reads the Keystatic `works` collection — the single source of truth for
 * every library item (video, essay, story, article, guide, resource...).
 * Separate from the Community Charter domain.
 *
 * Three visitor layers are derived from this one collection, never
 * duplicated into separate content sources:
 *   - Start Here  → listed + published items with a positive `startHereOrder`
 *                   and a usable destination, ascending (public-safe)
 *   - Collections → items whose `topics` include a given collection slug
 *   - Archive     → every non-draft item, reverse-chronological
 *
 * Published works require a canonical URL. Developing works may omit it.
 * Draft items never appear in any public listing.
 */
import { createReader } from "@keystatic/core/reader";
import path from "path";
import keystaticConfig from "../keystatic.config";
import { isCollectionSlug } from "./collections";
import {
  isCanonicalPlatform,
  isDistributionPlatform,
  isOrigin,
  type CanonicalPlatform,
  type DistributionPlatform,
  type Origin,
} from "./platforms";

const reader = createReader(path.join(process.cwd()), keystaticConfig);

export const WORK_TYPES = [
  "essay",
  "story",
  "practice",
  "project",
  "video",
  "article",
  "guide",
  "resource",
  "other",
] as const;

export type WorkType = (typeof WORK_TYPES)[number];

/**
 * `draft` — never shown publicly.
 * `listed` — appears on /explore, its collections, Start Here, and the archive.
 * `archived` — appears only in the archive (excluded from Start Here / collections).
 */
export type WorkStatus = "draft" | "listed" | "archived";

export type PublicationState = "published" | "developing";

export type DistributionLink = {
  platform: DistributionPlatform;
  /** Optional extra note (for example "Reel" or "Post 2"). Null if not set. */
  label: string | null;
  url: string;
};

export type Work = {
  slug: string;
  title: string;
  summary: string;
  type: WorkType;
  /** Date this record was added to the commons (not necessarily published). */
  date: string;
  /** Actual publication date, when known. Null if unknown. */
  publishedDate: string | null;
  publicationState: PublicationState;
  /** Present for published works; null for developing works. */
  canonicalUrl: string | null;
  /** canonicalUrl when it is an absolute http(s) URL; otherwise null. */
  externalUrl: string | null;
  /** canonicalUrl when it is an internal site path; otherwise null. */
  internalPath: string | null;
  /** Optional platform adaptations (Xiaohongshu, YouTube, Instagram, ...). */
  distributionLinks: DistributionLink[];
  status: WorkStatus;
  /** Collection slugs this item belongs to (see content/collections.ts). */
  topics: string[];
  /** Optional series name grouping related items. */
  series: string | null;
  watchTime: string | null;
  readTime: string | null;
  thumbnail: string | null;
  featured: boolean;
  /** Position in the curated Start Here sequence, ascending. Null = not included. */
  startHereOrder: number | null;
  /** Where this item was first published, when known. Editorial record only. */
  origin: Origin | null;
  /** Which platform hosts the authoritative canonicalUrl, when known. */
  canonicalPlatform: CanonicalPlatform | null;
};

/** Raw entry shape used by normalizeWork (Keystatic reader or fixtures). */
export type WorkEntryInput = {
  slug: string;
  title?: string | null;
  summary?: string | null;
  type?: string | null;
  date?: string | null;
  publishedDate?: string | null;
  publicationState?: string | null;
  canonicalUrl?: string | null;
  distributionLinks?: ReadonlyArray<{
    platform?: string | null;
    label?: string | null;
    url?: string | null;
  }> | null;
  status?: string | null;
  topics?: ReadonlyArray<string | null> | null;
  series?: string | null;
  watchTime?: string | null;
  readTime?: string | null;
  thumbnail?: string | null;
  featured?: boolean | null;
  startHereOrder?: number | null;
  origin?: string | null;
  canonicalPlatform?: string | null;
};

function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

function isWorkStatus(value: string): value is WorkStatus {
  return value === "draft" || value === "listed" || value === "archived";
}

function isPublicationState(value: string): value is PublicationState {
  return value === "published" || value === "developing";
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const BLOCKED_PUBLIC_HOSTS = new Set(["localhost", "127.0.0.1", "example.com", "www.example.com"]);

/**
 * Destination quality for public Start Here (and related link safety).
 * A non-empty string is not enough: reject placeholders, local/dev hosts,
 * malformed URLs, and non-http(s) schemes. Internal paths must be absolute
 * site paths and must not point at Keystatic or API surfaces.
 */
export function isUsablePublicHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  if (
    lower === "#" ||
    lower.startsWith("#") ||
    lower.includes("todo") ||
    lower.includes("placeholder") ||
    lower.includes("coming-soon") ||
    lower.includes("coming soon")
  ) {
    return false;
  }

  if (isExternalHref(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.protocol !== "http:" && url.protocol !== "https:") return false;
      const host = url.hostname.toLowerCase();
      if (BLOCKED_PUBLIC_HOSTS.has(host) || host.endsWith(".localhost")) return false;
      if (!host.includes(".")) return false;
      return true;
    } catch {
      return false;
    }
  }

  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/keystatic") || trimmed.startsWith("/api/")) return false;
  // Reject obviously broken path shapes while allowing ordinary site routes.
  if (/\s/.test(trimmed)) return false;
  return true;
}

/**
 * Normalise distribution links. A link is kept only when it has a usable
 * URL; a missing or unrecognised platform falls back to "other" rather than
 * discarding an otherwise-valid link. The optional label is a free-text note
 * on top of the platform, not a replacement for it.
 */
function normalizeDistributionLinks(
  links:
    | ReadonlyArray<{ platform?: string | null; label?: string | null; url?: string | null }>
    | null
    | undefined
): DistributionLink[] {
  if (!links?.length) return [];
  const out: DistributionLink[] = [];
  for (const link of links) {
    const url = link.url?.trim();
    if (!url) continue;
    const platformRaw = link.platform?.trim() ?? "";
    const platform: DistributionPlatform = isDistributionPlatform(platformRaw)
      ? platformRaw
      : "other";
    const label = link.label?.trim() || null;
    out.push({ platform, label, url });
  }
  return out;
}

function normalizeOrigin(value: string | null | undefined): Origin | null {
  const trimmed = value?.trim();
  return trimmed && isOrigin(trimmed) ? trimmed : null;
}

function normalizeCanonicalPlatform(value: string | null | undefined): CanonicalPlatform | null {
  const trimmed = value?.trim();
  return trimmed && isCanonicalPlatform(trimmed) ? trimmed : null;
}

/** Keep only recognised collection slugs; unknown values are dropped silently. */
function normalizeTopics(topics: ReadonlyArray<string | null> | null | undefined): string[] {
  if (!topics?.length) return [];
  const out: string[] = [];
  for (const topic of topics) {
    const slug = topic?.trim();
    if (slug && isCollectionSlug(slug) && !out.includes(slug)) out.push(slug);
  }
  return out;
}

function normalizeStartHereOrder(value: number | null | undefined): number | null {
  // Only positive integers are meaningful for public Start Here ordering.
  // Zero, negatives, and non-integers normalise to null (excluded).
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

/** True when a work has a destination suitable for a public Start Here card. */
export function hasUsablePublicDestination(
  work: Pick<Work, "canonicalUrl" | "distributionLinks">
): boolean {
  if (work.canonicalUrl && isUsablePublicHref(work.canonicalUrl)) return true;
  return work.distributionLinks.some((link) => isUsablePublicHref(link.url));
}

/**
 * Normalise one collection entry.
 * Returns null when required fields are missing, or when a published work
 * has no canonical URL (excluded safely rather than shown as broken).
 * Missing optional metadata (topics, series, durations, ordering, ...)
 * never causes rejection — it simply falls back to an empty/null default.
 */
export function normalizeWork(input: WorkEntryInput): Work | null {
  const title = input.title?.trim();
  const summary = input.summary?.trim();
  const type = input.type?.trim() ?? "";
  const date = input.date?.trim();
  const publishedDate = input.publishedDate?.trim() || null;
  const publicationState = input.publicationState?.trim() ?? "";
  const status = input.status?.trim() ?? "";
  const canonicalUrl = input.canonicalUrl?.trim() || null;

  if (!title || !summary || !date) return null;
  if (!isWorkType(type) || !isWorkStatus(status) || !isPublicationState(publicationState)) {
    return null;
  }

  if (publicationState === "published" && !canonicalUrl) {
    return null;
  }

  const resolvedCanonicalUrl = publicationState === "developing" ? null : canonicalUrl;
  const externalUrl =
    resolvedCanonicalUrl && isExternalHref(resolvedCanonicalUrl) ? resolvedCanonicalUrl : null;
  const internalPath =
    resolvedCanonicalUrl && !isExternalHref(resolvedCanonicalUrl) ? resolvedCanonicalUrl : null;

  return {
    slug: input.slug,
    title,
    summary,
    type,
    date,
    publishedDate,
    publicationState,
    canonicalUrl: resolvedCanonicalUrl,
    externalUrl,
    internalPath,
    distributionLinks: normalizeDistributionLinks(input.distributionLinks),
    status,
    topics: normalizeTopics(input.topics),
    series: input.series?.trim() || null,
    watchTime: input.watchTime?.trim() || null,
    readTime: input.readTime?.trim() || null,
    thumbnail: input.thumbnail?.trim() || null,
    featured: input.featured === true,
    startHereOrder: normalizeStartHereOrder(input.startHereOrder),
    origin: normalizeOrigin(input.origin),
    canonicalPlatform: normalizeCanonicalPlatform(input.canonicalPlatform),
  };
}

/**
 * Pure filter/sort used by the loader and unit tests.
 * Returns only listed works, newest added-date first (slug as stable tie-break).
 */
export function selectListedWorks(works: readonly Work[]): Work[] {
  return works
    .filter((work) => work.status === "listed")
    .slice()
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      return a.slug.localeCompare(b.slug);
    });
}

/**
 * Archive layer: every non-draft item (listed or archived), sorted
 * reverse-chronologically by published date when known, falling back to
 * added date. Deterministic via a slug tie-break.
 */
export function selectArchiveWorks(works: readonly Work[]): Work[] {
  return works
    .filter((work) => work.status !== "draft")
    .slice()
    .sort((a, b) => {
      const aDate = a.publishedDate ?? a.date;
      const bDate = b.publishedDate ?? b.date;
      const byDate = bDate.localeCompare(aDate);
      if (byDate !== 0) return byDate;
      return a.slug.localeCompare(b.slug);
    });
}

/**
 * Public Start Here eligibility — stricter than Explore listing.
 *
 * A work appears only when all of the following hold:
 *   - status is `listed` (draft and archived are excluded)
 *   - publicationState is `published` (developing / in-progress signposts are excluded)
 *   - startHereOrder is a positive integer
 *   - a usable public destination exists (canonicalUrl, or a distribution link)
 *
 * Setting startHereOrder alone is never enough. Social-media visitors must
 * never be sent into incomplete or placeholder content.
 */
export function isPublicStartHereEligible(work: Work): boolean {
  return (
    work.status === "listed" &&
    work.publicationState === "published" &&
    work.startHereOrder !== null &&
    work.startHereOrder >= 1 &&
    hasUsablePublicDestination(work)
  );
}

/**
 * Public Start Here sequence: eligible listed+published works with a
 * positive startHereOrder, ascending. Deterministic when two works share
 * an order (publishedDate/date descending, then slug ascending).
 *
 * This is the authoritative public selector. `selectStartHere` remains as a
 * compatibility alias used by existing call sites and tests.
 */
export function selectPublicStartHereWorks(works: readonly Work[]): Work[] {
  return works
    .filter(isPublicStartHereEligible)
    .slice()
    .sort((a, b) => {
      const byOrder = (a.startHereOrder ?? 0) - (b.startHereOrder ?? 0);
      if (byOrder !== 0) return byOrder;
      const aDate = a.publishedDate ?? a.date;
      const bDate = b.publishedDate ?? b.date;
      const byDate = bDate.localeCompare(aDate);
      if (byDate !== 0) return byDate;
      return a.slug.localeCompare(b.slug);
    });
}

/** @deprecated Prefer `selectPublicStartHereWorks` for new call sites. */
export const selectStartHere = selectPublicStartHereWorks;

/** Featured layer: listed items eligible for prominent display. */
export function selectFeaturedWorks(works: readonly Work[]): Work[] {
  return selectListedWorks(works).filter((work) => work.featured);
}

/**
 * Collection layer: listed items whose topics include the given collection
 * slug. A single work can appear in multiple collections through this
 * metadata without being duplicated in the source of truth.
 */
export function selectByCollection(works: readonly Work[], collectionSlug: string): Work[] {
  return selectListedWorks(works).filter((work) => work.topics.includes(collectionSlug));
}

/**
 * Related-content foundation: other listed items sharing the same series,
 * then items sharing at least one topic. Excludes the item itself and stays
 * to a small, deliberately unranked-beyond-relevance limit.
 */
export function selectRelatedWorks(
  works: readonly Work[],
  item: Pick<Work, "slug" | "series" | "topics">,
  limit = 3
): Work[] {
  const candidates = selectListedWorks(works).filter((work) => work.slug !== item.slug);

  const bySeries = item.series
    ? candidates.filter((work) => work.series === item.series)
    : [];
  const byTopic = candidates.filter(
    (work) => !bySeries.includes(work) && work.topics.some((t) => item.topics.includes(t))
  );

  const related: Work[] = [];
  for (const work of [...bySeries, ...byTopic]) {
    if (related.length >= limit) break;
    if (!related.includes(work)) related.push(work);
  }
  return related;
}

async function readAllWorks(): Promise<Work[]> {
  const entries = await reader.collections.works.all();
  const works: Work[] = [];

  for (const { slug, entry } of entries) {
    const work = normalizeWork({
      slug,
      title: typeof entry.title === "string" ? entry.title : null,
      summary: entry.summary,
      type: entry.type,
      date: entry.date,
      publishedDate: entry.publishedDate,
      publicationState: entry.publicationState,
      canonicalUrl: entry.canonicalUrl,
      distributionLinks: entry.distributionLinks,
      status: entry.status,
      topics: entry.topics,
      series: entry.series,
      watchTime: entry.watchTime,
      readTime: entry.readTime,
      thumbnail: entry.thumbnail,
      featured: entry.featured,
      startHereOrder: entry.startHereOrder,
      origin: entry.origin,
      canonicalPlatform: entry.canonicalPlatform,
    });
    if (work) works.push(work);
  }

  return works;
}

export async function getListedWorks(): Promise<Work[]> {
  return selectListedWorks(await readAllWorks());
}

export async function getArchiveWorks(): Promise<Work[]> {
  return selectArchiveWorks(await readAllWorks());
}

export async function getStartHereWorks(): Promise<Work[]> {
  return selectPublicStartHereWorks(await readAllWorks());
}

export async function getFeaturedWorks(): Promise<Work[]> {
  return selectFeaturedWorks(await readAllWorks());
}

export async function getCollectionWorks(collectionSlug: string): Promise<Work[]> {
  return selectByCollection(await readAllWorks(), collectionSlug);
}

export async function getRelatedWorks(
  item: Pick<Work, "slug" | "series" | "topics">,
  limit = 3
): Promise<Work[]> {
  return selectRelatedWorks(await readAllWorks(), item, limit);
}
