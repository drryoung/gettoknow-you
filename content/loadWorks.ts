/**
 * Server-side curated works loader.
 *
 * Reads the Keystatic `works` collection and returns only listed entries,
 * sorted by date descending. Separate from the Community Charter domain.
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
  canonicalUrl: string;
  distributionLinks: DistributionLink[];
  status: WorkStatus;
};

function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

function isWorkStatus(value: string): value is WorkStatus {
  return value === "listed" || value === "archived";
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
    const title = entry.title?.trim();
    const summary = entry.summary?.trim();
    const type = entry.type;
    const date = entry.date?.trim();
    const canonicalUrl = entry.canonicalUrl?.trim();
    const status = entry.status;

    if (!title || !summary || !date || !canonicalUrl) continue;
    if (!isWorkType(type) || !isWorkStatus(status)) continue;

    works.push({
      slug,
      title,
      summary,
      type,
      date,
      canonicalUrl,
      distributionLinks: normalizeDistributionLinks(entry.distributionLinks),
      status,
    });
  }

  return selectListedWorks(works);
}
