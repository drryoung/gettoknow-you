/**
 * Server-side content-library loader (GetToKnow.You).
 *
 * Reads the Keystatic `works` collection — the single source of truth for
 * every library item. Separate from the Community Charter domain.
 *
 * Hybrid publishing model (one record, many surfaces):
 *   - Hosted   → full material in the Markdoc body on GetToKnow.You
 *   - Summary  → meaningful standalone summary/adaptation; external links optional
 *   - Reference → annotated external source; not Start Here by default
 *
 * Visitor layers derived from this one collection (never duplicated):
 *   - Start Here  → listed + published + hosted/summary with internal presentation
 *   - Collections → items whose `topics` include a given collection slug
 *   - Archive     → every non-draft item, reverse-chronological
 *   - Library     → /library and /library/[slug] for listed + published works
 *   - Work pages  → /works/[slug] permanently redirects to /library/[slug]
 *
 * Draft items never appear in any public listing. Developing items remain
 * editable in Keystatic but are excluded from every public surface.
 *
 * Note: `content/works/*.mdoc` is the Content Library store. There is no
 * parallel `content/library` collection — that would duplicate records.
 */
import { createReader } from "@keystatic/core/reader";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import path from "path";
import keystaticConfig from "../keystatic.config";
import { COLLECTIONS, isCollectionSlug, type CollectionDef } from "./collections";
import { PUBLIC_COLLECTION_MIN_WORKS } from "./site";
import { isThemeId } from "./themeIds";
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

export const WORK_PROJECTS = ["gettoknow", "conversationos", "mandarinos"] as const;
export type WorkProject = (typeof WORK_PROJECTS)[number];

export const WORK_LANGUAGES = ["English", "Chinese"] as const;
export type WorkLanguage = (typeof WORK_LANGUAGES)[number];

/**
 * `draft` — never shown publicly.
 * `listed` — appears on /explore, its collections, Start Here, and the library.
 * `archived` — kept in Git; excluded from public surfaces.
 */
export type WorkStatus = "draft" | "listed" | "archived";

export type PublicationState = "published" | "developing";

export const CONTENT_MODES = ["hosted", "summary", "reference"] as const;
export type ContentMode = (typeof CONTENT_MODES)[number];

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
  contentMode: ContentMode;
  keyTakeaway: string | null;
  annotation: string | null;
  sourceTitle: string | null;
  sourceAuthor: string | null;
  sourcePublication: string | null;
  /** True when the Markdoc body has real content. */
  hasBody: boolean;
  /** Stable internal library URL: /library/[slug]. */
  workPath: string;
  /**
   * Primary card/list href: usually workPath; may be a first-party page such as
   * /charter when that path is the full experience for this record.
   */
  href: string;
  /** Project badge for library cards. */
  project: WorkProject;
  /** Cover image path for library cards and heroes. */
  coverImage: string | null;
  /** Native on-site video path (MP4 under /media/...). */
  video: string | null;
  /** Languages present in the material. */
  languages: WorkLanguage[];
  /** Optional discovery links to the original social posts. */
  original: {
    xiaohongshu: string | null;
    instagram: string | null;
    substack: string | null;
  };
  /** Explicit related work slugs; empty means use series/topic matching. */
  related: string[];
  /**
   * Stable Theme identifiers (content/themes). Distinct from `topics` (collections).
   * Display titles are resolved from theme records, never stored here.
   */
  themes: string[];
  /** Date this record was added to the commons (not necessarily published). */
  date: string;
  /** Actual publication date, when known. Null if unknown. */
  publishedDate: string | null;
  publicationState: PublicationState;
  /**
   * Resolved authoritative URL for provenance display.
   * When canonicalPlatform is gettoknow-you, this is workPath.
   * Otherwise the editorial canonicalUrl when usable.
   */
  canonicalUrl: string | null;
  /** canonicalUrl when it is an absolute http(s) URL; otherwise null. */
  externalUrl: string | null;
  /** canonicalUrl when it is an internal site path; otherwise null. */
  internalPath: string | null;
  /** Optional explicit HTML rel=canonical override for duplicated external works. */
  seoCanonicalUrl: string | null;
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
  /** Which platform hosts the authoritative version, when known. */
  canonicalPlatform: CanonicalPlatform | null;
};

export type WorkDetail = Work & {
  /** Transformed Markdoc body when present; null when empty. */
  body: RenderableTreeNode | null;
};

/** Raw entry shape used by normalizeWork (Keystatic reader or fixtures). */
export type WorkEntryInput = {
  slug: string;
  title?: string | null;
  summary?: string | null;
  type?: string | null;
  contentMode?: string | null;
  keyTakeaway?: string | null;
  annotation?: string | null;
  sourceTitle?: string | null;
  sourceAuthor?: string | null;
  sourcePublication?: string | null;
  hasBody?: boolean | null;
  date?: string | null;
  publishedDate?: string | null;
  publicationState?: string | null;
  canonicalUrl?: string | null;
  seoCanonicalUrl?: string | null;
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
  coverImage?: string | null;
  video?: string | null;
  languages?: ReadonlyArray<string | null> | null;
  project?: string | null;
  originalXiaohongshu?: string | null;
  originalInstagram?: string | null;
  originalSubstack?: string | null;
  related?: ReadonlyArray<string | null> | null;
  themes?: ReadonlyArray<string | null> | null;
  featured?: boolean | null;
  startHereOrder?: number | null;
  origin?: string | null;
  canonicalPlatform?: string | null;
};

/** First-party site paths that may be the primary card destination for a work. */
const FIRST_PARTY_PAGE_PATHS = new Set([
  "/charter",
  "/try",
  "/meet",
  "/about",
  "/read",
  "/library",
  "/explore",
  "/start-here",
]);

function isWorkProject(value: string): value is WorkProject {
  return (WORK_PROJECTS as readonly string[]).includes(value);
}

function isWorkLanguage(value: string): value is WorkLanguage {
  return (WORK_LANGUAGES as readonly string[]).includes(value);
}

function normalizeLanguages(
  values: ReadonlyArray<string | null> | null | undefined
): WorkLanguage[] {
  if (!values) return [];
  const out: WorkLanguage[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed && isWorkLanguage(trimmed) && !out.includes(trimmed)) {
      out.push(trimmed);
    }
  }
  return out;
}

function normalizeRelatedSlugs(
  values: ReadonlyArray<string | null> | null | undefined
): string[] {
  if (!values) return [];
  const out: string[] = [];
  for (const value of values) {
    const slug = value?.trim();
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

function normalizeMediaPath(value: string | null | undefined): string | null {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  if (isExternalHref(trimmed)) {
    return isUsablePublicHref(trimmed) ? trimmed : null;
  }
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/keystatic") || trimmed.startsWith("/api/")) return null;
  return trimmed;
}

function normalizeOptionalUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  return isExternalHref(trimmed) && isUsablePublicHref(trimmed) ? trimmed : null;
}

function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

function isWorkStatus(value: string): value is WorkStatus {
  return value === "draft" || value === "listed" || value === "archived";
}

function isPublicationState(value: string): value is PublicationState {
  return value === "published" || value === "developing";
}

function isContentMode(value: string): value is ContentMode {
  return (CONTENT_MODES as readonly string[]).includes(value);
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const BLOCKED_PUBLIC_HOSTS = new Set(["localhost", "127.0.0.1", "example.com", "www.example.com"]);

/**
 * Destination quality for public links.
 * Reject placeholders, local/dev hosts, malformed URLs, and non-http(s) schemes.
 * Internal paths must be absolute site paths and must not point at Keystatic or API surfaces.
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
  if (/\s/.test(trimmed)) return false;
  return true;
}

export function workPathForSlug(slug: string): string {
  return `/library/${slug}`;
}

/**
 * Infer contentMode for legacy records that predate the field.
 * Conservative: external URL → reference-leaning summary; otherwise summary.
 * Explicit hosted is never inferred — that requires a body and editorial choice.
 */
export function inferContentMode(input: {
  contentMode?: string | null;
  canonicalUrl?: string | null;
  hasBody?: boolean | null;
}): ContentMode {
  const raw = input.contentMode?.trim();
  if (raw && isContentMode(raw)) return raw;

  const url = input.canonicalUrl?.trim() || "";
  if (url && isExternalHref(url) && !input.hasBody) {
    // External catalogue entries without a body default to reference when
    // migrating incomplete records — public eligibility still requires annotation.
    return "reference";
  }
  return "summary";
}

/**
 * Normalise distribution links. A link is kept only when it has a usable
 * URL; a missing or unrecognised platform falls back to "other" rather than
 * discarding an otherwise-valid link.
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
    if (!url || !isUsablePublicHref(url)) continue;
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

/** Keep only recognised Theme identifiers; unknown values are dropped silently. */
function normalizeWorkThemeIds(
  themes: ReadonlyArray<string | null> | null | undefined
): string[] {
  if (!themes?.length) return [];
  const out: string[] = [];
  for (const value of themes) {
    const slug = value?.trim();
    if (slug && isThemeId(slug) && !out.includes(slug)) out.push(slug);
  }
  return out;
}

function normalizeStartHereOrder(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

function meaningfulText(value: string | null | undefined, min = 1): string | null {
  const trimmed = value?.trim() || "";
  return trimmed.length >= min ? trimmed : null;
}

/** Whether a Markdoc AST node tree contains visible text or media. */
export function markdocNodeHasContent(node: unknown): boolean {
  if (node == null) return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node !== "object") return false;
  const record = node as {
    type?: string;
    attributes?: Record<string, unknown>;
    children?: unknown[];
  };
  if (record.type === "image") return true;
  if (record.type === "text" || typeof record.attributes?.content === "string") {
    const content = record.attributes?.content;
    if (typeof content === "string" && content.trim().length > 0) return true;
  }
  if (Array.isArray(record.children) && record.children.length > 0) {
    return record.children.some((child) => markdocNodeHasContent(child));
  }
  return false;
}

/**
 * True when the work has enough internal content for a useful public page /
 * Start Here card without forcing a social login.
 */
export function hasAccessibleInternalPresentation(
  work: Pick<Work, "contentMode" | "hasBody" | "summary" | "keyTakeaway" | "annotation">
): boolean {
  if (work.contentMode === "reference") return false;
  if (work.contentMode === "hosted") return work.hasBody;
  // summary
  if (!work.summary.trim()) return false;
  return Boolean(work.keyTakeaway || work.annotation || work.hasBody || work.summary.length >= 40);
}

/**
 * Central published-content validation by content mode.
 * Returns false when a published work is incomplete for public use.
 */
export function isPublishedContentValid(
  work: Pick<
    Work,
    | "contentMode"
    | "hasBody"
    | "summary"
    | "keyTakeaway"
    | "annotation"
    | "canonicalUrl"
    | "externalUrl"
    | "canonicalPlatform"
  >
): boolean {
  switch (work.contentMode) {
    case "hosted":
      return work.hasBody;
    case "summary":
      return Boolean(meaningfulText(work.summary, 20));
    case "reference": {
      const sourceOk = Boolean(work.externalUrl && isUsablePublicHref(work.externalUrl));
      const noteOk = Boolean(meaningfulText(work.annotation, 20) || meaningfulText(work.summary, 20));
      return sourceOk && noteOk;
    }
    default:
      return false;
  }
}

/** Primary list/card destination for a public work. */
export function resolveWorkHref(
  work: Pick<Work, "workPath" | "canonicalUrl" | "internalPath">
): string {
  const candidate = work.internalPath || work.canonicalUrl;
  if (candidate && FIRST_PARTY_PAGE_PATHS.has(candidate.split("?")[0] ?? "")) {
    return candidate.split("?")[0] ?? work.workPath;
  }
  return work.workPath;
}

/**
 * Resolve the authoritative URL shown in provenance.
 * GetToKnow.You canonical works use the derived internal work path.
 */
export function resolveCanonicalUrl(input: {
  slug: string;
  publicationState: PublicationState;
  canonicalPlatform: CanonicalPlatform | null;
  canonicalUrl: string | null;
}): string | null {
  if (input.publicationState === "developing") return null;

  const raw = input.canonicalUrl?.trim() || null;
  const rawPath = raw?.split("?")[0] ?? null;

  if (input.canonicalPlatform === "gettoknow-you") {
    // Prefer an explicit first-party page (for example /charter) when it is
    // the authoritative GetToKnow.You surface; otherwise derive /works/[slug].
    if (rawPath && FIRST_PARTY_PAGE_PATHS.has(rawPath) && isUsablePublicHref(rawPath)) {
      return rawPath;
    }
    return workPathForSlug(input.slug);
  }

  if (!raw) return null;
  if (!isUsablePublicHref(raw)) return null;
  return raw;
}

/**
 * Normalise one collection entry.
 * Returns null when required fields are missing, or when a published work
 * fails content-mode validation (excluded safely rather than shown broken).
 */
export function normalizeWork(input: WorkEntryInput): Work | null {
  const title = input.title?.trim();
  const summary = input.summary?.trim();
  const type = input.type?.trim() ?? "";
  const date = input.date?.trim();
  const publishedDate = input.publishedDate?.trim() || null;
  const publicationState = input.publicationState?.trim() ?? "";
  const status = input.status?.trim() ?? "";
  const hasBody = input.hasBody === true;
  const contentMode = inferContentMode({
    contentMode: input.contentMode,
    canonicalUrl: input.canonicalUrl,
    hasBody,
  });

  if (!title || !summary || !date) return null;
  if (!isWorkType(type) || !isWorkStatus(status) || !isPublicationState(publicationState)) {
    return null;
  }

  const workPath = workPathForSlug(input.slug);
  const canonicalPlatform = normalizeCanonicalPlatform(input.canonicalPlatform);
  const editorialCanonicalUrl = input.canonicalUrl?.trim() || null;
  const canonicalUrl = resolveCanonicalUrl({
    slug: input.slug,
    publicationState,
    canonicalPlatform,
    canonicalUrl: editorialCanonicalUrl,
  });

  const externalUrl = canonicalUrl && isExternalHref(canonicalUrl) ? canonicalUrl : null;
  const internalPath =
    canonicalUrl && !isExternalHref(canonicalUrl) ? canonicalUrl : null;

  const seoRaw = input.seoCanonicalUrl?.trim() || null;
  const seoCanonicalUrl =
    seoRaw && isExternalHref(seoRaw) && isUsablePublicHref(seoRaw) ? seoRaw : null;

  const coverImage =
    normalizeMediaPath(input.coverImage) ?? normalizeMediaPath(input.thumbnail);
  const projectRaw = input.project?.trim() ?? "";
  const project = isWorkProject(projectRaw) ? projectRaw : "gettoknow";

  const work: Work = {
    slug: input.slug,
    title,
    summary,
    type,
    contentMode,
    keyTakeaway: meaningfulText(input.keyTakeaway),
    annotation: meaningfulText(input.annotation),
    sourceTitle: meaningfulText(input.sourceTitle),
    sourceAuthor: meaningfulText(input.sourceAuthor),
    sourcePublication: meaningfulText(input.sourcePublication),
    hasBody,
    workPath,
    href: workPath,
    project,
    coverImage,
    video: normalizeMediaPath(input.video),
    languages: normalizeLanguages(input.languages),
    original: {
      xiaohongshu: normalizeOptionalUrl(input.originalXiaohongshu),
      instagram: normalizeOptionalUrl(input.originalInstagram),
      substack: normalizeOptionalUrl(input.originalSubstack),
    },
    related: normalizeRelatedSlugs(input.related),
    themes: normalizeWorkThemeIds(input.themes),
    date,
    publishedDate,
    publicationState,
    canonicalUrl,
    externalUrl,
    internalPath,
    seoCanonicalUrl,
    distributionLinks: normalizeDistributionLinks(input.distributionLinks),
    status,
    topics: normalizeTopics(input.topics),
    series: input.series?.trim() || null,
    watchTime: input.watchTime?.trim() || null,
    readTime: input.readTime?.trim() || null,
    thumbnail: normalizeMediaPath(input.thumbnail),
    featured: input.featured === true,
    startHereOrder: normalizeStartHereOrder(input.startHereOrder),
    origin: normalizeOrigin(input.origin),
    canonicalPlatform,
  };

  work.href = resolveWorkHref(work);

  if (publicationState === "published" && !isPublishedContentValid(work)) {
    return null;
  }

  return work;
}

/** Pure filter/sort: listed works, newest added-date first. */
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
 * Authoritative public eligibility for cards, library listings, collections,
 * related works, and work pages. Draft, archived, developing, and invalid
 * published records never appear on public surfaces.
 */
export function isPubliclyEligible(work: Work): boolean {
  return (
    work.status === "listed" &&
    work.publicationState === "published" &&
    isPublishedContentValid(work)
  );
}

/** All publicly eligible works, newest publication (or added) date first. */
export function selectPublicWorks(works: readonly Work[]): Work[] {
  return works
    .filter(isPubliclyEligible)
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
 * Archive layer: every non-draft item (listed or archived), sorted
 * reverse-chronologically by published date when known, falling back to
 * added date.
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
 * Public Start Here eligibility.
 *
 * Requires listed + published + positive order + hosted/summary with an
 * accessible internal presentation. Reference works are excluded by default.
 * External URLs are never required.
 */
export function isPublicStartHereEligible(work: Work): boolean {
  return (
    work.status === "listed" &&
    work.publicationState === "published" &&
    work.startHereOrder !== null &&
    work.startHereOrder >= 1 &&
    work.contentMode !== "reference" &&
    hasAccessibleInternalPresentation(work)
  );
}

/**
 * @deprecated Destination helper retained for tests that still probe URL quality.
 * Start Here no longer requires an external destination.
 */
export function hasUsablePublicDestination(
  work: Pick<Work, "canonicalUrl" | "distributionLinks" | "workPath" | "href">
): boolean {
  if (work.href && isUsablePublicHref(work.href)) return true;
  if (work.workPath && isUsablePublicHref(work.workPath)) return true;
  if (work.canonicalUrl && isUsablePublicHref(work.canonicalUrl)) return true;
  return work.distributionLinks.some((link) => isUsablePublicHref(link.url));
}

/**
 * Public Start Here sequence: eligible works ascending by startHereOrder.
 * Deterministic when two works share an order.
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

/** Featured layer: publicly eligible items marked featured. */
export function selectFeaturedWorks(works: readonly Work[]): Work[] {
  return selectPublicWorks(works).filter((work) => work.featured);
}

/** Collection layer: public items whose topics include the given collection slug. */
export function selectByCollection(works: readonly Work[], collectionSlug: string): Work[] {
  return selectPublicWorks(works).filter((work) => work.topics.includes(collectionSlug));
}

/** Count publicly eligible works in a collection topic. */
export function countPublicWorksInCollection(
  works: readonly Work[],
  collectionSlug: string
): number {
  return selectByCollection(works, collectionSlug).length;
}

/** A collection is browsable when it has enough real published material. */
export function isCollectionPubliclyBrowsable(
  works: readonly Work[],
  collectionSlug: string,
  minimum = 2
): boolean {
  return countPublicWorksInCollection(works, collectionSlug) >= minimum;
}

/** Collection cards and routes appear only when enough published works exist. */
export function selectBrowsableCollections(
  works: readonly Work[],
  minimum = PUBLIC_COLLECTION_MIN_WORKS
): CollectionDef[] {
  return COLLECTIONS.filter((collection) =>
    isCollectionPubliclyBrowsable(works, collection.slug, minimum)
  );
}

/**
 * Related content: explicit `related` slugs first, then shared series, then topics.
 */
export function selectRelatedWorks(
  works: readonly Work[],
  item: Pick<Work, "slug" | "series" | "topics" | "related">,
  limit = 3
): Work[] {
  const publicWorks = selectPublicWorks(works);
  const bySlug = new Map(publicWorks.map((work) => [work.slug, work]));
  const related: Work[] = [];

  for (const slug of item.related ?? []) {
    if (related.length >= limit) break;
    if (slug === item.slug) continue;
    const work = bySlug.get(slug);
    if (work && !related.includes(work)) related.push(work);
  }

  const candidates = publicWorks.filter((work) => work.slug !== item.slug);
  const bySeries = item.series ? candidates.filter((work) => work.series === item.series) : [];
  const byTopic = candidates.filter(
    (work) => !bySeries.includes(work) && work.topics.some((t) => item.topics.includes(t))
  );

  for (const work of [...bySeries, ...byTopic]) {
    if (related.length >= limit) break;
    if (!related.includes(work)) related.push(work);
  }
  return related;
}

/** Whether a work may be shown on /works/[slug]. Alias for {@link isPubliclyEligible}. */
export function isPublicWorkPageEligible(work: Work): boolean {
  return isPubliclyEligible(work);
}

type RawWorksEntry = {
  slug: string;
  entry: {
    title: unknown;
    summary: string | null;
    type: string;
    contentMode?: string;
    keyTakeaway?: string | null;
    annotation?: string | null;
    sourceTitle?: string | null;
    sourceAuthor?: string | null;
    sourcePublication?: string | null;
    body: () => Promise<{ node?: unknown } | null>;
    date: string | null;
    publishedDate?: string | null;
    publicationState: string;
    canonicalUrl?: string | null;
    seoCanonicalUrl?: string | null;
    distributionLinks?: ReadonlyArray<{
      platform?: string | null;
      label?: string | null;
      url?: string | null;
    }> | null;
    status: string;
    topics?: ReadonlyArray<string | null> | null;
    series?: string | null;
    watchTime?: string | null;
    readTime?: string | null;
    thumbnail?: string | null;
    coverImage?: string | null;
    video?: string | null;
    languages?: ReadonlyArray<string | null> | null;
    project?: string | null;
    originalXiaohongshu?: string | null;
    originalInstagram?: string | null;
    originalSubstack?: string | null;
    related?: ReadonlyArray<string | null> | null;
    themes?: ReadonlyArray<string | null> | null;
    featured?: boolean | null;
    startHereOrder?: number | null;
    origin?: string | null;
    canonicalPlatform?: string | null;
  };
};

function entryToInput(
  slug: string,
  entry: RawWorksEntry["entry"],
  hasBody: boolean
): WorkEntryInput {
  const title =
    typeof entry.title === "string"
      ? entry.title
      : entry.title &&
          typeof entry.title === "object" &&
          "name" in (entry.title as object) &&
          typeof (entry.title as { name?: unknown }).name === "string"
        ? (entry.title as { name: string }).name
        : null;

  return {
    slug,
    title,
    summary: entry.summary,
    type: entry.type,
    contentMode: entry.contentMode,
    keyTakeaway: entry.keyTakeaway,
    annotation: entry.annotation,
    sourceTitle: entry.sourceTitle,
    sourceAuthor: entry.sourceAuthor,
    sourcePublication: entry.sourcePublication,
    hasBody,
    date: entry.date,
    publishedDate: entry.publishedDate,
    publicationState: entry.publicationState,
    canonicalUrl: entry.canonicalUrl,
    seoCanonicalUrl: entry.seoCanonicalUrl,
    distributionLinks: entry.distributionLinks,
    status: entry.status,
    topics: entry.topics,
    series: entry.series,
    watchTime: entry.watchTime,
    readTime: entry.readTime,
    thumbnail: entry.thumbnail,
    coverImage: entry.coverImage,
    video: entry.video,
    languages: entry.languages,
    project: entry.project,
    originalXiaohongshu: entry.originalXiaohongshu,
    originalInstagram: entry.originalInstagram,
    originalSubstack: entry.originalSubstack,
    related: entry.related,
    themes: entry.themes,
    featured: entry.featured,
    startHereOrder: entry.startHereOrder,
    origin: entry.origin,
    canonicalPlatform: entry.canonicalPlatform,
  };
}

async function readAllWorks(): Promise<Work[]> {
  const entries = (await reader.collections.works.all()) as RawWorksEntry[];
  const works: Work[] = [];

  for (const { slug, entry } of entries) {
    let hasBody = false;
    try {
      const bodyEntry = await entry.body();
      hasBody = markdocNodeHasContent(bodyEntry?.node);
    } catch {
      hasBody = false;
    }

    const work = normalizeWork(entryToInput(slug, entry, hasBody));
    if (work) works.push(work);
  }

  return works;
}

/** Public library listing — published, listed, content-valid works only. */
export async function getListedWorks(): Promise<Work[]> {
  return selectPublicWorks(await readAllWorks());
}

/** Alias for the public published library (Read page). */
export async function getPublicLibraryWorks(): Promise<Work[]> {
  return getListedWorks();
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
  item: Pick<Work, "slug" | "series" | "topics" | "related">,
  limit = 3
): Promise<Work[]> {
  return selectRelatedWorks(await readAllWorks(), item, limit);
}

export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const works = await readAllWorks();
  return works.find((work) => work.slug === slug) ?? null;
}

/**
 * Load a public work detail page. Returns null when the slug is missing,
 * draft, archived, developing, or otherwise not publicly eligible.
 */
export async function getPublicWorkDetail(slug: string): Promise<WorkDetail | null> {
  const entry = await reader.collections.works.read(slug);
  if (!entry) return null;

  let bodyNode: unknown = null;
  let hasBody = false;
  let body: RenderableTreeNode | null = null;
  try {
    const bodyEntry = await entry.body();
    bodyNode = bodyEntry?.node ?? null;
    hasBody = markdocNodeHasContent(bodyNode);
    if (hasBody && bodyNode) {
      body = Markdoc.transform(
        bodyNode as Parameters<typeof Markdoc.transform>[0]
      ) as RenderableTreeNode;
    }
  } catch {
    hasBody = false;
    body = null;
  }

  const work = normalizeWork(entryToInput(slug, entry as RawWorksEntry["entry"], hasBody));
  if (!work || !isPublicWorkPageEligible(work)) return null;

  return { ...work, body };
}

/** Slugs safe for generateStaticParams on /works/[slug]. */
export async function getPublicWorkSlugs(): Promise<string[]> {
  const works = await readAllWorks();
  return works.filter(isPublicWorkPageEligible).map((work) => work.slug);
}
