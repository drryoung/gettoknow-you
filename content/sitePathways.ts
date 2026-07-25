/**
 * Presentation-level mapping of curated works to visitor pathways.
 *
 * This is not a content taxonomy stored on every work record.
 * It selects approved slugs for Read / Try / Meet surfaces so pages
 * remain loader-driven without hard-coding titles or summaries in TSX.
 */
import { getListedWorks, type Work } from "./loadWorks";

export type PathwaySection = "read" | "try" | "meet";

/** Approved slug → section assignments for the current provisional commons. */
export const PATHWAY_SLUGS: Readonly<Record<PathwaySection, readonly string[]>> = {
  read: [
    "better-conversations",
    "cross-cultural-stories",
    "trust-and-human-connection",
  ],
  try: ["mandarinos", "conversationos"],
  meet: ["gettoknowyou-community-charter"],
};

/** Homepage featured preview: a small curated subset per pathway. */
export const HOMEPAGE_FEATURED_SLUGS: Readonly<Record<PathwaySection, readonly string[]>> =
  PATHWAY_SLUGS;

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

export async function getHomepageFeatured(): Promise<Record<PathwaySection, Work[]>> {
  const works = await getListedWorks();
  return {
    read: selectWorksBySlugs(works, HOMEPAGE_FEATURED_SLUGS.read),
    try: selectWorksBySlugs(works, HOMEPAGE_FEATURED_SLUGS.try),
    meet: selectWorksBySlugs(works, HOMEPAGE_FEATURED_SLUGS.meet),
  };
}
