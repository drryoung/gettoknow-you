import { describe, expect, it } from "vitest";
import {
  PATHWAY_SLUGS,
  selectWorksBySlugs,
  getPathwayWorks,
  getHomepageFeatured,
  getReadLibraryWorks,
} from "./sitePathways";
import { getListedWorks, type Work } from "./loadWorks";

function stubWork(slug: string): Work {
  return {
    slug,
    title: slug,
    summary: "Summary",
    type: "essay",
    contentMode: "summary",
    keyTakeaway: null,
    annotation: null,
    sourceTitle: null,
    sourceAuthor: null,
    sourcePublication: null,
    hasBody: false,
    workPath: `/library/${slug}`,
    href: `/library/${slug}`,
    project: "gettoknow",
    coverImage: null,
    video: null,
    languages: [],
    original: { xiaohongshu: null, instagram: null, substack: null },
    related: [],
    date: "2026-07-25",
    publishedDate: null,
    publicationState: "published",
    canonicalUrl: null,
    externalUrl: null,
    internalPath: null,
    seoCanonicalUrl: null,
    distributionLinks: [],
    status: "listed",
    topics: [],
    series: null,
    themes: [],
    watchTime: null,
    readTime: null,
    thumbnail: null,
    featured: false,
    origin: null,
    canonicalPlatform: null,
  };
}

describe("sitePathways", () => {
  it("maps approved slugs into Try and Meet without inventing titles", () => {
    expect(PATHWAY_SLUGS.try).toEqual(["mandarinos"]);
    expect(PATHWAY_SLUGS.meet).toEqual(["gettoknowyou-community-charter"]);
  });

  it("selects works in the declared slug order", () => {
    const works = [stubWork("b"), stubWork("a"), stubWork("c")];
    expect(selectWorksBySlugs(works, ["a", "c"]).map((w) => w.slug)).toEqual(["a", "c"]);
  });

  it("loads Try pathway works through the public works loader", async () => {
    const tryWorks = await getPathwayWorks("try");
    const listed = await getListedWorks();
    const listedSlugs = new Set(listed.map((w) => w.slug));

    expect(tryWorks.map((w) => w.slug)).toEqual(["mandarinos"]);
    for (const work of tryWorks) {
      expect(listedSlugs.has(work.slug)).toBe(true);
      expect(work.title.length).toBeGreaterThan(0);
      expect(work.summary.length).toBeGreaterThan(0);
    }
  });

  it("loads the Read library as all publicly eligible works", async () => {
    const library = await getReadLibraryWorks();
    const listed = await getListedWorks();
    expect(library.map((w) => w.slug)).toEqual(listed.map((w) => w.slug));
  });

  it("limits homepage featured works to at most two published items", async () => {
    const featured = await getHomepageFeatured();
    expect(featured.length).toBeLessThanOrEqual(2);
    expect(featured.every((w) => w.publicationState === "published")).toBe(true);
  });
});
