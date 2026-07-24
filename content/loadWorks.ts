/**
 * Server-side curated works loader.
 *
 * Reads the Keystatic `works` collection and returns only listed entries,
 * sorted by date descending. Separate from the Community Charter domain.
 *
 * Published works require a canonical URL. Developing works may omit it.
 */
import { createReader } from "@keystatic/core/reader";
import path from "path";
import keystaticConfig from "../keystatic.config";

const reader = createReader(path.join(process.cwd()), keystaticConfig);

export const WORK_TYPES = [
  "essay",
  "story",
  "practice",
  "project",
  "video",
  "other",
] as const;

export type WorkType = (typeof WORK_TYPES)[number];

export type WorkStatus = "listed" | "archived";

export type PublicationState = "published" | "developing";

export type DistributionLink = {
  label: string;
  url: string;
};

export type Work = {
  slug: string;
  title: string;
  summary: string;
  type: WorkType;
  date: string;
  publicationState: PublicationState;
  /** Present for published works; null for developing works. */
  canonicalUrl: string | null;
  distributionLinks: DistributionLink[];
  status: WorkStatus;
};

/** Raw entry shape used by normalizeWork (Keystatic reader or fixtures). */
export type WorkEntryInput = {
  slug: string;
  title?: string | null;
  summary?: string | null;
  type?: string | null;
  date?: string | null;
  publicationState?: string | null;
  canonicalUrl?: string | null;
  distributionLinks?: ReadonlyArray<{ label: string | null; url: string | null }> | null;
  status?: string | null;
};

function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

function isWorkStatus(value: string): value is WorkStatus {
  return value === "listed" || value === "archived";
}

function isPublicationState(value: string): value is PublicationState {
  return value === "published" || value === "developing";
}

function normalizeDistributionLinks(
  links: ReadonlyArray<{ label: string | null; url: string | null }> | null | undefined
): DistributionLink[] {
  if (!links?.length) return [];
  const out: DistributionLink[] = [];
  for (const link of links) {
    const label = link.label?.trim();
    const url = link.url?.trim();
    if (label && url) out.push({ label, url });
  }
  return out;
}

/**
 * Normalise one collection entry.
 * Returns null when required fields are missing, or when a published work
 * has no canonical URL (excluded safely rather than shown as broken).
 */
export function normalizeWork(input: WorkEntryInput): Work | null {
  const title = input.title?.trim();
  const summary = input.summary?.trim();
  const type = input.type?.trim() ?? "";
  const date = input.date?.trim();
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

  return {
    slug: input.slug,
    title,
    summary,
    type,
    date,
    publicationState,
    canonicalUrl: publicationState === "developing" ? null : canonicalUrl,
    distributionLinks: normalizeDistributionLinks(input.distributionLinks),
    status,
  };
}

/**
 * Pure filter/sort used by the loader and unit tests.
 * Returns only listed works, newest date first (slug as stable tie-break).
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

export async function getListedWorks(): Promise<Work[]> {
  const entries = await reader.collections.works.all();
  const works: Work[] = [];

  for (const { slug, entry } of entries) {
    const work = normalizeWork({
      slug,
      title: typeof entry.title === "string" ? entry.title : null,
      summary: entry.summary,
      type: entry.type,
      date: entry.date,
      publicationState: entry.publicationState,
      canonicalUrl: entry.canonicalUrl,
      distributionLinks: entry.distributionLinks,
      status: entry.status,
    });
    if (work) works.push(work);
  }

  return selectListedWorks(works);
}
