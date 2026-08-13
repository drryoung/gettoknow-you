/**
 * Presentation-level mapping of curated works to visitor pathways.
 *
 * Read uses the full public library. Try and Meet keep slug-based curation
 * so those pages can highlight practical projects and community material
 * without hard-coding titles or summaries in TSX.
 */
import { getFeaturedWorks, getListedWorks, getPublicLibraryWorks, type Work } from "./loadWorks";

export type PathwaySection = "try" | "meet";

/** Approved slug → section assignments for Try / Meet surfaces. */
export const PATHWAY_SLUGS: Readonly<Record<PathwaySection, readonly string[]>> = {
  try: ["mandarinos", "englishos"],
  meet: ["gettoknowyou-community-charter"],
};

export function selectWorksBySlugs(
  works: readonly Work[],
  slugs: readonly string[]
): Work[] {
  const bySlug = new Map(works.map((work) => [work.slug, work]));
  const selected: Work[] = [];
  for (const slug of slugs) {
    const work = bySlug.get(slug);
    if (work) selected.push(work);
  }
  return selected;
}

export async function getPathwayWorks(section: PathwaySection): Promise<Work[]> {
  const works = await getListedWorks();
  return selectWorksBySlugs(works, PATHWAY_SLUGS[section]);
}

/** Complete published library for Read. */
export async function getReadLibraryWorks(): Promise<Work[]> {
  return getPublicLibraryWorks();
}

/** Homepage: at most two featured published works. */
export async function getHomepageFeatured(): Promise<Work[]> {
  const works = await getFeaturedWorks();
  return works.slice(0, 2);
}
