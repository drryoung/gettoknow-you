import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  getArchiveWorks,
  getListedWorks,
  normalizeWork,
  selectArchiveWorks,
  selectByCollection,
  selectFeaturedWorks,
  selectListedWorks,
  selectRelatedWorks,
  selectStartHere,
  type Work,
} from "./loadWorks";
import { COLLECTIONS, isCollectionSlug } from "./collections";

const root = process.cwd();

function work(
  partial: Partial<Work> & Pick<Work, "slug" | "title" | "date" | "status" | "publicationState">
): Work {
  const canonicalUrl =
    partial.canonicalUrl !== undefined
      ? partial.canonicalUrl
      : partial.publicationState === "developing"
        ? null
        : "https://example.com/work";
  return {
    summary: "Summary",
    type: "essay",
    publishedDate: null,
    canonicalUrl,
    externalUrl: null,
    internalPath: null,
    distributionLinks: [],
    topics: [],
    series: null,
    watchTime: null,
    readTime: null,
    thumbnail: null,
    featured: false,
    startHereOrder: null,
    ...partial,
  };
}

describe("normalizeWork", () => {
  it("keeps a published work with a canonical URL", () => {
    const result = normalizeWork({
      slug: "mandarinos",
      title: "MandarinOS",
      summary: "A project.",
      type: "project",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "https://www.mandarinos.app/",
      status: "listed",
    });
    expect(result?.publicationState).toBe("published");
    expect(result?.canonicalUrl).toBe("https://www.mandarinos.app/");
    expect(result?.externalUrl).toBe("https://www.mandarinos.app/");
    expect(result?.internalPath).toBeNull();
  });

  it("keeps a developing work without a canonical URL", () => {
    const result = normalizeWork({
      slug: "conversationos",
      title: "ConversationOS",
      summary: "In progress.",
      type: "project",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
    });
    expect(result).not.toBeNull();
    expect(result?.publicationState).toBe("developing");
    expect(result?.canonicalUrl).toBeNull();
  });

  it("excludes a published work that lacks a canonical URL", () => {
    const result = normalizeWork({
      slug: "broken",
      title: "Broken",
      summary: "Missing URL.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "",
      status: "listed",
    });
    expect(result).toBeNull();
  });

  it("excludes a published work with a whitespace-only canonical URL", () => {
    const result = normalizeWork({
      slug: "whitespace-url",
      title: "Whitespace URL",
      summary: "Blank URL padded with spaces.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "   ",
      status: "listed",
    });
    expect(result).toBeNull();
  });

  it("accepts an internal site path as a published canonical URL", () => {
    const result = normalizeWork({
      slug: "signpost",
      title: "Signpost",
      summary: "Points at the charter page.",
      type: "other",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "/charter",
      status: "listed",
    });
    expect(result?.canonicalUrl).toBe("/charter");
    expect(result?.internalPath).toBe("/charter");
    expect(result?.externalUrl).toBeNull();
  });

  it("ignores a canonical URL provided on a developing entry, so no link is ever shown", () => {
    const result = normalizeWork({
      slug: "developing-with-url",
      title: "Developing With URL",
      summary: "A developing entry that happens to have a URL set.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "https://example.com/should-not-render",
      status: "listed",
    });
    expect(result?.publicationState).toBe("developing");
    expect(result?.canonicalUrl).toBeNull();
    expect(result?.externalUrl).toBeNull();
  });

  it("returns null for malformed type, status, or publicationState", () => {
    const base = {
      slug: "malformed",
      title: "Malformed",
      summary: "Bad enum values.",
      date: "2026-07-25",
      canonicalUrl: "https://example.com",
      status: "listed",
      publicationState: "published",
    } as const;
    expect(normalizeWork({ ...base, type: "not-a-type" })).toBeNull();
    expect(normalizeWork({ ...base, type: "essay", status: "not-a-status" })).toBeNull();
    expect(
      normalizeWork({ ...base, type: "essay", publicationState: "not-a-state" })
    ).toBeNull();
  });

  it("accepts the draft status so items can be hidden from public view", () => {
    const result = normalizeWork({
      slug: "hidden",
      title: "Hidden",
      summary: "Not ready yet.",
      type: "video",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "draft",
    });
    expect(result?.status).toBe("draft");
  });

  it("does not break rendering when optional metadata is missing", () => {
    const result = normalizeWork({
      slug: "minimal",
      title: "Minimal",
      summary: "Only the required fields.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
    });
    expect(result).not.toBeNull();
    expect(result?.topics).toEqual([]);
    expect(result?.series).toBeNull();
    expect(result?.watchTime).toBeNull();
    expect(result?.readTime).toBeNull();
    expect(result?.thumbnail).toBeNull();
    expect(result?.featured).toBe(false);
    expect(result?.startHereOrder).toBeNull();
    expect(result?.publishedDate).toBeNull();
  });

  it("drops unknown topic slugs instead of failing", () => {
    const result = normalizeWork({
      slug: "unknown-topic",
      title: "Unknown Topic",
      summary: "Has a bogus topic mixed with a real one.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      topics: ["stories", "not-a-real-collection"],
    });
    expect(result?.topics).toEqual(["stories"]);
  });

  it("normalizes featured and startHereOrder", () => {
    const result = normalizeWork({
      slug: "featured-item",
      title: "Featured Item",
      summary: "Should be featured and first in Start Here.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      featured: true,
      startHereOrder: 1,
    });
    expect(result?.featured).toBe(true);
    expect(result?.startHereOrder).toBe(1);
  });
});

describe("selectListedWorks", () => {
  it("returns only listed works", () => {
    const result = selectListedWorks([
      work({
        slug: "a",
        title: "A",
        date: "2024-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "b",
        title: "B",
        date: "2024-06-01",
        status: "archived",
        publicationState: "published",
      }),
      work({
        slug: "c",
        title: "C",
        date: "2025-01-01",
        status: "listed",
        publicationState: "developing",
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["c", "a"]);
  });

  it("excludes archived works", () => {
    const result = selectListedWorks([
      work({
        slug: "kept",
        title: "Kept",
        date: "2025-02-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "old",
        title: "Old",
        date: "2025-03-01",
        status: "archived",
        publicationState: "published",
      }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("kept");
  });

  it("excludes draft works so they never appear publicly", () => {
    const result = selectListedWorks([
      work({
        slug: "public",
        title: "Public",
        date: "2025-02-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "secret",
        title: "Secret",
        date: "2025-03-01",
        status: "draft",
        publicationState: "developing",
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["public"]);
  });

  it("sorts listed works by date descending", () => {
    const result = selectListedWorks([
      work({
        slug: "older",
        title: "Older",
        date: "2023-05-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "newest",
        title: "Newest",
        date: "2025-08-01",
        status: "listed",
        publicationState: "developing",
      }),
      work({
        slug: "middle",
        title: "Middle",
        date: "2024-11-15",
        status: "listed",
        publicationState: "published",
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["newest", "middle", "older"]);
  });

  it("treats distribution links as optional", () => {
    const withoutLinks = work({
      slug: "plain",
      title: "Plain",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      distributionLinks: [],
    });
    const withLinks = work({
      slug: "shared",
      title: "Shared",
      date: "2025-02-01",
      status: "listed",
      publicationState: "published",
      distributionLinks: [{ label: "Instagram", url: "https://example.com/ig" }],
    });
    const result = selectListedWorks([withoutLinks, withLinks]);
    expect(result.find((w) => w.slug === "plain")?.distributionLinks).toEqual([]);
    expect(result.find((w) => w.slug === "shared")?.distributionLinks).toHaveLength(1);
  });
});

describe("selectArchiveWorks", () => {
  it("includes listed and archived works but excludes drafts", () => {
    const result = selectArchiveWorks([
      work({ slug: "listed-item", title: "Listed", date: "2025-01-01", status: "listed", publicationState: "published" }),
      work({ slug: "archived-item", title: "Archived", date: "2024-01-01", status: "archived", publicationState: "published" }),
      work({ slug: "draft-item", title: "Draft", date: "2026-01-01", status: "draft", publicationState: "developing" }),
    ]);
    expect(result.map((w) => w.slug).sort()).toEqual(["archived-item", "listed-item"]);
  });

  it("orders deterministically, preferring publishedDate over added date", () => {
    const result = selectArchiveWorks([
      work({ slug: "a", title: "A", date: "2025-01-01", publishedDate: "2020-01-01", status: "listed", publicationState: "published" }),
      work({ slug: "b", title: "B", date: "2025-01-01", publishedDate: "2024-01-01", status: "listed", publicationState: "published" }),
      work({ slug: "c", title: "C", date: "2025-01-01", status: "listed", publicationState: "published" }),
    ]);
    // c has no publishedDate, so it falls back to `date` (2025-01-01), placing it first.
    expect(result.map((w) => w.slug)).toEqual(["c", "b", "a"]);
  });
});

describe("selectStartHere", () => {
  it("respects ascending startHereOrder and excludes items without one", () => {
    const result = selectStartHere([
      work({ slug: "third", title: "Third", date: "2025-01-01", status: "listed", publicationState: "published", startHereOrder: 3 }),
      work({ slug: "first", title: "First", date: "2025-01-01", status: "listed", publicationState: "published", startHereOrder: 1 }),
      work({ slug: "unordered", title: "Unordered", date: "2025-01-01", status: "listed", publicationState: "published" }),
      work({ slug: "second", title: "Second", date: "2025-01-01", status: "listed", publicationState: "published", startHereOrder: 2 }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["first", "second", "third"]);
  });

  it("excludes archived and draft items even if they carry an order", () => {
    const result = selectStartHere([
      work({ slug: "archived", title: "Archived", date: "2025-01-01", status: "archived", publicationState: "published", startHereOrder: 1 }),
      work({ slug: "draft", title: "Draft", date: "2025-01-01", status: "draft", publicationState: "developing", startHereOrder: 2 }),
    ]);
    expect(result).toHaveLength(0);
  });
});

describe("selectFeaturedWorks", () => {
  it("returns only listed items marked featured", () => {
    const result = selectFeaturedWorks([
      work({ slug: "featured", title: "Featured", date: "2025-01-01", status: "listed", publicationState: "published", featured: true }),
      work({ slug: "plain", title: "Plain", date: "2025-01-01", status: "listed", publicationState: "published", featured: false }),
      work({ slug: "featured-archived", title: "Featured Archived", date: "2025-01-01", status: "archived", publicationState: "published", featured: true }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["featured"]);
  });
});

describe("selectByCollection", () => {
  it("lets one item appear in multiple collections without duplicating the source item", () => {
    const shared = work({
      slug: "shared-item",
      title: "Shared Item",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["stories", "conversation", "relationships"],
    });
    const stories = selectByCollection([shared], "stories");
    const conversation = selectByCollection([shared], "conversation");
    expect(stories).toHaveLength(1);
    expect(conversation).toHaveLength(1);
    expect(stories[0]).toBe(conversation[0]);
  });

  it("excludes items that do not belong to the collection", () => {
    const inCollection = work({ slug: "in", title: "In", date: "2025-01-01", status: "listed", publicationState: "published", topics: ["china"] });
    const outOfCollection = work({ slug: "out", title: "Out", date: "2025-01-01", status: "listed", publicationState: "published", topics: ["workplace"] });
    const result = selectByCollection([inCollection, outOfCollection], "china");
    expect(result.map((w) => w.slug)).toEqual(["in"]);
  });

  it("supports every collection in the taxonomy", () => {
    for (const collection of COLLECTIONS) {
      expect(isCollectionSlug(collection.slug)).toBe(true);
    }
  });
});

describe("selectRelatedWorks", () => {
  it("prefers shared series, then falls back to shared topics", () => {
    const target = work({
      slug: "target",
      title: "Target",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      series: "Conversations I Wish I'd Had",
      topics: ["stories", "conversation"],
    });
    const sameSeries = work({
      slug: "same-series",
      title: "Same Series",
      date: "2025-01-02",
      status: "listed",
      publicationState: "published",
      series: "Conversations I Wish I'd Had",
      topics: ["workplace"],
    });
    const sameTopic = work({
      slug: "same-topic",
      title: "Same Topic",
      date: "2025-01-03",
      status: "listed",
      publicationState: "published",
      topics: ["stories"],
    });
    const unrelated = work({
      slug: "unrelated",
      title: "Unrelated",
      date: "2025-01-04",
      status: "listed",
      publicationState: "published",
      topics: ["china"],
    });
    const result = selectRelatedWorks([target, sameSeries, sameTopic, unrelated], target, 2);
    expect(result.map((w) => w.slug)).toEqual(["same-series", "same-topic"]);
  });
});

describe("getListedWorks", () => {
  it("loads the initial commons entries through Keystatic", async () => {
    const works = await getListedWorks();
    expect(works.length).toBeGreaterThanOrEqual(6);
    const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
    expect(bySlug.mandarinos?.publicationState).toBe("published");
    expect(bySlug.mandarinos?.canonicalUrl).toBe("https://www.mandarinos.app/");
    expect(bySlug["gettoknowyou-community-charter"]?.canonicalUrl).toBe("/charter");
    expect(bySlug.conversationos?.publicationState).toBe("developing");
    expect(bySlug.conversationos?.canonicalUrl).toBeNull();
  });

  it("never returns a draft seed item", async () => {
    const works = await getListedWorks();
    const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
    expect(bySlug["the-dunedin-checkout-success-story"]).toBeUndefined();
    expect(bySlug["the-second-question"]).toBeUndefined();
  });
});

describe("getArchiveWorks", () => {
  it("returns a deterministic reverse-chronological list excluding drafts", async () => {
    const works = await getArchiveWorks();
    expect(works.length).toBeGreaterThan(0);
    expect(works.every((w) => w.status !== "draft")).toBe(true);
    const dates = works.map((w) => w.publishedDate ?? w.date);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });
});

describe("getStartHereWorks", () => {
  it("returns items in ascending startHereOrder", async () => {
    const { getStartHereWorks } = await import("./loadWorks");
    const works = await getStartHereWorks();
    const orders = works.map((w) => w.startHereOrder);
    expect(orders.every((order) => order !== null)).toBe(true);
    expect([...orders]).toEqual([...orders].sort((a, b) => (a ?? 0) - (b ?? 0)));
  });
});

describe("works collection boundaries", () => {
  it("stores works under content/works, not as a charter twin", () => {
    expect(existsSync(path.join(root, "content/works"))).toBe(true);
    expect(existsSync(path.join(root, "content/community-charter.mdoc"))).toBe(true);
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain('path: "content/works/*"');
    expect(config).toContain("works: collection(");
    expect(config).toContain("publicationState");
    expect(config).toContain('path: "content/community-charter"');
  });

  it("loads Explore content through the works loader without hard-coded work copy", () => {
    const page = readFileSync(path.join(root, "app/explore/page.tsx"), "utf8");
    const list = readFileSync(path.join(root, "app/components/WorkList.tsx"), "utf8");
    expect(page).toContain("getListedWorks");
    expect(page).toContain("getStartHereWorks");
    expect(page).toContain("WorkList");
    expect(list).toContain("work.title");
    expect(list).toContain("work.summary");
    expect(list).toContain("In development");
    expect(page).not.toContain("canonicalUrl: \"http");
    expect(page).not.toContain("summary: \"");
    expect(page).not.toContain("MandarinOS is the first practical");
  });

  it("does not render a developing entry as an empty canonical link in the page source", () => {
    const list = readFileSync(path.join(root, "app/components/WorkList.tsx"), "utf8");
    expect(list).toContain("explore-list__developing");
    expect(list).toContain('publicationState === "published"');
  });

  it("keeps Read and Try pages loader-driven without duplicated work copy", () => {
    const read = readFileSync(path.join(root, "app/read/page.tsx"), "utf8");
    const tryPage = readFileSync(path.join(root, "app/try/page.tsx"), "utf8");
    expect(read).toContain('getPathwayWorks("read")');
    expect(tryPage).toContain('getPathwayWorks("try")');
    expect(read).not.toContain("Better Conversations");
    expect(tryPage).not.toContain("MandarinOS is the first practical");
    expect(read).not.toContain("summary: \"");
    expect(tryPage).not.toContain("summary: \"");
  });

  it("exposes a dedicated collection route and archive route", () => {
    expect(existsSync(path.join(root, "app/explore/[collection]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/explore/archive/page.tsx"))).toBe(true);
    const collectionPage = readFileSync(
      path.join(root, "app/explore/[collection]/page.tsx"),
      "utf8"
    );
    expect(collectionPage).toContain("notFound");
    expect(collectionPage).toContain("getCollectionWorks");
  });
});
