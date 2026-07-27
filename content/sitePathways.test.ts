import { describe, expect, it } from "vitest";
import {
  PATHWAY_SLUGS,
  selectWorksBySlugs,
  getPathwayWorks,
  getHomepageFeatured,
} from "./sitePathways";
import { getListedWorks, type Work } from "./loadWorks";

function stubWork(slug: string): Work {
  return {
    slug,
    title: slug,
    summary: "Summary",
    type: "essay",
    date: "2026-07-25",
    publishedDate: null,
    publicationState: "developing",
    canonicalUrl: null,
    externalUrl: null,
    internalPath: null,
    distributionLinks: [],
    status: "listed",
    topics: [],
    series: null,
    watchTime: null,
    readTime: null,
    thumbnail: null,
    featured: false,
    startHereOrder: null,
    origin: null,
    canonicalPlatform: null,
  };
}

describe("sitePathways", () => {
  it("maps approved slugs into Read, Try, and Meet without inventing titles", () => {
    expect(PATHWAY_SLUGS.read).toEqual([
      "better-conversations",
      "cross-cultural-stories",
      "trust-and-human-connection",
    ]);
    expect(PATHWAY_SLUGS.try).toEqual(["mandarinos", "conversationos"]);
    expect(PATHWAY_SLUGS.meet).toEqual(["gettoknowyou-community-charter"]);
  });

  it("selects works in the declared slug order", () => {
    const works = [stubWork("b"), stubWork("a"), stubWork("c")];
    expect(selectWorksBySlugs(works, ["a", "c"]).map((w) => w.slug)).toEqual(["a", "c"]);
  });

  it("loads Read and Try pathway works through the works loader", async () => {
    const read = await getPathwayWorks("read");
    const tryWorks = await getPathwayWorks("try");
    const listed = await getListedWorks();
    const listedSlugs = new Set(listed.map((w) => w.slug));

    expect(read.map((w) => w.slug)).toEqual([...PATHWAY_SLUGS.read]);
    expect(tryWorks.map((w) => w.slug)).toEqual([...PATHWAY_SLUGS.try]);
    for (const work of [...read, ...tryWorks]) {
      expect(listedSlugs.has(work.slug)).toBe(true);
      expect(work.title.length).toBeGreaterThan(0);
      expect(work.summary.length).toBeGreaterThan(0);
    }
  });

  it("loads homepage featured groups from the same pathway map", async () => {
    const featured = await getHomepageFeatured();
    expect(featured.read.map((w) => w.slug)).toEqual([...PATHWAY_SLUGS.read]);
    expect(featured.try.map((w) => w.slug)).toEqual([...PATHWAY_SLUGS.try]);
    expect(featured.meet.map((w) => w.slug)).toEqual([...PATHWAY_SLUGS.meet]);
  });
});
