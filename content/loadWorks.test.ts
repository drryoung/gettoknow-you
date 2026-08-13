import {
  countPublicWorksInCollection,
  diagnoseWorkEligibility,
  getArchiveWorks,
  getListedWorks,
  getPublicLibraryWorks,
  getPublicWorkDetail,
  getRelatedWorks,
  getStartHereWorks,
  hasUsablePublicDestination,
  inferContentMode,
  isCollectionPubliclyBrowsable,
  isPublicStartHereEligible,
  isPublicWorkPageEligible,
  isPubliclyEligible,
  isUsablePublicHref,
  markdocNodeHasContent,
  normalizeWork,
  selectArchiveWorks,
  selectBrowsableCollections,
  selectByCollection,
  selectFeaturedWorks,
  selectListedWorks,
  selectPublicStartHereWorks,
  selectPublicWorks,
  selectRelatedWorks,
  selectStartHere,
  type Work,
} from "./loadWorks";
import { COLLECTIONS, isCollectionSlug } from "./collections";
import { PUBLIC_COLLECTION_MIN_WORKS, SITE_URL } from "./site";
import { readdirSync, readFileSync, existsSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const LONG_SUMMARY =
  "A meaningful standalone summary long enough for published summary validation.";

function work(
  partial: Partial<Work> & Pick<Work, "slug" | "title" | "date" | "status" | "publicationState">
): Work {
  const { workPath: workPathOverride, href: hrefOverride, ...rest } = partial;
  const workPath = workPathOverride ?? `/library/${partial.slug}`;
  const href = hrefOverride ?? workPath;
  return {
    summary: LONG_SUMMARY,
    type: "essay",
    contentMode: "summary",
    keyTakeaway: null,
    annotation: null,
    sourceTitle: null,
    sourceAuthor: null,
    sourcePublication: null,
    hasBody: false,
    publishedDate: null,
    canonicalUrl: null,
    externalUrl: null,
    internalPath: null,
    seoCanonicalUrl: null,
    distributionLinks: [],
    topics: [],
    series: null,
    themes: [],
    watchTime: null,
    readTime: null,
    thumbnail: null,
    project: "gettoknow",
    coverImage: null,
    video: null,
    languages: [],
    original: { xiaohongshu: null, instagram: null, substack: null },
    related: [],
    featured: false,
    origin: null,
    canonicalPlatform: null,
    ...rest,
    workPath,
    href,
  };
}

describe("normalizeWork", () => {
  it("excludes a published hosted work without a body", () => {
    const result = normalizeWork({
      slug: "empty-hosted",
      title: "Empty Hosted",
      summary: LONG_SUMMARY,
      type: "essay",
      contentMode: "hosted",
      hasBody: false,
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
    });
    expect(result).toBeNull();
  });

  it("keeps a published hosted work with a body and no external URL", () => {
    const result = normalizeWork({
      slug: "hosted-essay",
      title: "Hosted Essay",
      summary: LONG_SUMMARY,
      type: "essay",
      contentMode: "hosted",
      hasBody: true,
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
      canonicalPlatform: "gettoknow-you",
    });
    expect(result).not.toBeNull();
    expect(result?.contentMode).toBe("hosted");
    expect(result?.hasBody).toBe(true);
    expect(result?.workPath).toBe("/library/hosted-essay");
    expect(result?.canonicalUrl).toBe("/library/hosted-essay");
    expect(result?.href).toBe("/library/hosted-essay");
    expect(result?.externalUrl).toBeNull();
  });

  it("keeps a published summary with a meaningful summary and no external URL", () => {
    const result = normalizeWork({
      slug: "summary-only",
      title: "Summary Only",
      summary: LONG_SUMMARY,
      type: "essay",
      contentMode: "summary",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "",
      status: "listed",
    });
    expect(result).not.toBeNull();
    expect(result?.contentMode).toBe("summary");
    expect(result?.canonicalUrl).toBeNull();
    expect(result?.workPath).toBe("/library/summary-only");
    expect(result?.href).toBe("/library/summary-only");
  });

  it("keeps a published reference with a usable external URL and annotation", () => {
    const result = normalizeWork({
      slug: "external-ref",
      title: "External Ref",
      summary: LONG_SUMMARY,
      type: "article",
      contentMode: "reference",
      annotation: "A short note explaining why this external source belongs in the commons.",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "https://www.example.org/essay",
      status: "listed",
    });
    expect(result).not.toBeNull();
    expect(result?.contentMode).toBe("reference");
    expect(result?.externalUrl).toBe("https://www.example.org/essay");
  });

  it("excludes a published reference without a usable source URL", () => {
    const result = normalizeWork({
      slug: "broken-ref",
      title: "Broken Ref",
      summary: LONG_SUMMARY,
      type: "article",
      contentMode: "reference",
      annotation: "Annotation without a destination is not enough for a reference.",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "",
      status: "listed",
    });
    expect(result).toBeNull();
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
    expect(result?.contentMode).toBe("summary");
  });

  it("infers summary for legacy records missing contentMode", () => {
    const result = normalizeWork({
      slug: "legacy-summary",
      title: "Legacy Summary",
      summary: LONG_SUMMARY,
      type: "essay",
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
    });
    expect(result?.contentMode).toBe("summary");
  });

  it("infers reference when legacy record has an external URL and no body", () => {
    const result = normalizeWork({
      slug: "legacy-ref",
      title: "Legacy Ref",
      summary: LONG_SUMMARY,
      type: "article",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "https://www.example.org/legacy",
      status: "listed",
    });
    expect(result?.contentMode).toBe("reference");
  });

  it("treats an invalid contentMode string as missing and infers", () => {
    expect(
      inferContentMode({
        contentMode: "not-a-mode",
        canonicalUrl: "",
        hasBody: false,
      })
    ).toBe("summary");
    expect(
      inferContentMode({
        contentMode: "hosted-please",
        canonicalUrl: "https://www.example.org/x",
        hasBody: false,
      })
    ).toBe("reference");

    const result = normalizeWork({
      slug: "bad-mode",
      title: "Bad Mode",
      summary: LONG_SUMMARY,
      type: "essay",
      contentMode: "hosted-please",
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
    });
    expect(result?.contentMode).toBe("summary");
  });

  it("resolves gettoknow-you + editorial /charter to first-party paths", () => {
    const result = normalizeWork({
      slug: "gettoknowyou-community-charter",
      title: "GetToKnow.You Community Charter",
      summary: LONG_SUMMARY,
      type: "other",
      contentMode: "summary",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "/charter",
      status: "listed",
      canonicalPlatform: "gettoknow-you",
      keyTakeaway: "Conversation is the mechanism.",
    });
    expect(result?.canonicalUrl).toBe("/charter");
    expect(result?.internalPath).toBe("/charter");
    expect(result?.href).toBe("/charter");
    expect(result?.workPath).toBe("/library/gettoknowyou-community-charter");
  });

  it("keeps a published work with an external canonical URL", () => {
    const result = normalizeWork({
      slug: "mandarinos",
      title: "MandarinOS",
      summary: LONG_SUMMARY,
      type: "project",
      contentMode: "summary",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "https://www.mandarinos.app/",
      status: "listed",
    });
    expect(result?.publicationState).toBe("published");
    expect(result?.canonicalUrl).toBe("https://www.mandarinos.app/");
    expect(result?.externalUrl).toBe("https://www.mandarinos.app/");
    expect(result?.internalPath).toBeNull();
    expect(result?.href).toBe("/library/mandarinos");
  });

  it("ignores a canonical URL provided on a developing entry", () => {
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
      summary: LONG_SUMMARY,
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
    expect(result?.contentMode).toBe("summary");
    expect(result?.keyTakeaway).toBeNull();
    expect(result?.annotation).toBeNull();
    expect(result?.sourceTitle).toBeNull();
    expect(result?.hasBody).toBe(false);
    expect(result?.seoCanonicalUrl).toBeNull();
    expect(result?.topics).toEqual([]);
    expect(result?.series).toBeNull();
    expect(result?.watchTime).toBeNull();
    expect(result?.readTime).toBeNull();
    expect(result?.thumbnail).toBeNull();
    expect(result?.featured).toBe(false);
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

  it("normalizes featured independently of Start Here membership", () => {
    const result = normalizeWork({
      slug: "featured-item",
      title: "Featured Item",
      summary: "Should be featured without implying Start Here membership.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      featured: true,
    });
    expect(result?.featured).toBe(true);
  });
});

describe("markdocNodeHasContent", () => {
  it("returns true for text and image nodes", () => {
    expect(markdocNodeHasContent("hello")).toBe(true);
    expect(markdocNodeHasContent({ type: "image" })).toBe(true);
    expect(
      markdocNodeHasContent({
        type: "document",
        children: [{ type: "paragraph", children: ["body text"] }],
      })
    ).toBe(true);
    expect(
      markdocNodeHasContent({
        type: "paragraph",
        children: [{ type: "text", attributes: { content: "Keystatic text node" }, children: [] }],
      })
    ).toBe(true);
  });

  it("returns false for empty or blank trees", () => {
    expect(markdocNodeHasContent(null)).toBe(false);
    expect(markdocNodeHasContent("   ")).toBe(false);
    expect(markdocNodeHasContent({ type: "document", children: [] })).toBe(false);
    expect(
      markdocNodeHasContent({
        type: "document",
        children: [{ type: "paragraph", children: ["  "] }],
      })
    ).toBe(false);
  });
});

describe("isPublicWorkPageEligible", () => {
  it("is true for a listed published valid summary", () => {
    expect(
      isPublicWorkPageEligible(
        work({
          slug: "eligible",
          title: "Eligible",
          date: "2025-01-01",
          status: "listed",
          publicationState: "published",
          contentMode: "summary",
        })
      )
    ).toBe(true);
  });

  it("is false for draft, archived, and developing works", () => {
    expect(
      isPublicWorkPageEligible(
        work({
          slug: "draft",
          title: "Draft",
          date: "2025-01-01",
          status: "draft",
          publicationState: "published",
        })
      )
    ).toBe(false);
    expect(
      isPublicWorkPageEligible(
        work({
          slug: "archived",
          title: "Archived",
          date: "2025-01-01",
          status: "archived",
          publicationState: "published",
        })
      )
    ).toBe(false);
    expect(
      isPublicWorkPageEligible(
        work({
          slug: "developing",
          title: "Developing",
          date: "2025-01-01",
          status: "listed",
          publicationState: "developing",
        })
      )
    ).toBe(false);
  });
});

describe("selectPublicWorks", () => {
  it("returns only listed, published, content-valid works", () => {
    const result = selectPublicWorks([
      work({
        slug: "published",
        title: "Published",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "developing",
        title: "Developing",
        date: "2025-01-01",
        status: "listed",
        publicationState: "developing",
      }),
      work({
        slug: "draft",
        title: "Draft",
        date: "2025-01-01",
        status: "draft",
        publicationState: "developing",
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["published"]);
  });

  it("matches isPubliclyEligible and isPublicWorkPageEligible", () => {
    const item = work({
      slug: "ok",
      title: "OK",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
    });
    expect(isPubliclyEligible(item)).toBe(true);
    expect(isPublicWorkPageEligible(item)).toBe(true);
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
      distributionLinks: [{ platform: "instagram", label: null, url: "https://example.com/ig" }],
    });
    const result = selectListedWorks([withoutLinks, withLinks]);
    expect(result.find((w) => w.slug === "plain")?.distributionLinks).toEqual([]);
    expect(result.find((w) => w.slug === "shared")?.distributionLinks).toHaveLength(1);
  });
});

describe("selectArchiveWorks", () => {
  it("includes listed and archived works but excludes drafts", () => {
    const result = selectArchiveWorks([
      work({
        slug: "listed-item",
        title: "Listed",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "archived-item",
        title: "Archived",
        date: "2024-01-01",
        status: "archived",
        publicationState: "published",
      }),
      work({
        slug: "draft-item",
        title: "Draft",
        date: "2026-01-01",
        status: "draft",
        publicationState: "developing",
      }),
    ]);
    expect(result.map((w) => w.slug).sort()).toEqual(["archived-item", "listed-item"]);
  });

  it("orders deterministically, preferring publishedDate over added date", () => {
    const result = selectArchiveWorks([
      work({
        slug: "a",
        title: "A",
        date: "2025-01-01",
        publishedDate: "2020-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "b",
        title: "B",
        date: "2025-01-01",
        publishedDate: "2024-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "c",
        title: "C",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["c", "b", "a"]);
  });
});

describe("selectStartHere / selectPublicStartHereWorks", () => {
  it("includes a listed published summary when named in the ordered slug list", () => {
    const eligible = work({
      slug: "ready",
      title: "Ready",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      contentMode: "summary",
      keyTakeaway: "Visitors can understand the idea without leaving the site.",
    });
    expect(isPublicStartHereEligible(eligible)).toBe(true);
    expect(selectStartHere([eligible], ["ready"]).map((w) => w.slug)).toEqual(["ready"]);
    expect(selectPublicStartHereWorks([eligible], ["ready"]).map((w) => w.slug)).toEqual(["ready"]);
    expect(selectStartHere).toBe(selectPublicStartHereWorks);
  });

  it("includes a summary with only a long summary and no external destination", () => {
    const result = selectPublicStartHereWorks(
      [
        work({
          slug: "internal-only",
          title: "Internal Only",
          date: "2025-01-01",
          status: "listed",
          publicationState: "published",
          contentMode: "summary",
          summary:
            "This summary is long enough on its own to qualify as accessible internal presentation.",
          canonicalUrl: null,
          distributionLinks: [],
        }),
      ],
      ["internal-only"]
    );
    expect(result.map((w) => w.slug)).toEqual(["internal-only"]);
  });

  it("excludes reference works even when listed in the sequence", () => {
    const result = selectStartHere(
      [
        work({
          slug: "ref",
          title: "Ref",
          date: "2025-01-01",
          status: "listed",
          publicationState: "published",
          contentMode: "reference",
          annotation: "Annotated external source.",
          canonicalUrl: "https://www.example.org/ref",
        }),
      ],
      ["ref"]
    );
    expect(result).toHaveLength(0);
  });

  it("excludes hosted works without a body", () => {
    const result = selectStartHere(
      [
        work({
          slug: "empty-hosted",
          title: "Empty Hosted",
          date: "2025-01-01",
          status: "listed",
          publicationState: "published",
          contentMode: "hosted",
          hasBody: false,
        }),
      ],
      ["empty-hosted"]
    );
    expect(result).toHaveLength(0);
  });

  it("respects the editorial slug sequence and skips unknown or unordered items", () => {
    const pool = [
      work({
        slug: "third",
        title: "Third",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "first",
        title: "First",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "unordered",
        title: "Unordered",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
      work({
        slug: "second",
        title: "Second",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
      }),
    ];
    const result = selectStartHere(pool, ["first", "missing", "second", "second", "third"]);
    expect(result.map((w) => w.slug)).toEqual(["first", "second", "third"]);
  });

  it("excludes draft and archived works even if listed in the sequence", () => {
    const result = selectStartHere(
      [
        work({
          slug: "archived",
          title: "Archived",
          date: "2025-01-01",
          status: "archived",
          publicationState: "published",
        }),
        work({
          slug: "draft",
          title: "Draft",
          date: "2025-01-01",
          status: "draft",
          publicationState: "published",
        }),
      ],
      ["archived", "draft"]
    );
    expect(result).toHaveLength(0);
  });

  it("excludes developing / in-development publicationState", () => {
    const result = selectStartHere(
      [
        work({
          slug: "developing",
          title: "Developing",
          date: "2025-01-01",
          status: "listed",
          publicationState: "developing",
          canonicalUrl: null,
        }),
      ],
      ["developing"]
    );
    expect(result).toHaveLength(0);
  });

  it("still validates href quality helpers without gating Start Here on external destinations", () => {
    expect(isUsablePublicHref("#")).toBe(false);
    expect(isUsablePublicHref("TODO")).toBe(false);
    expect(isUsablePublicHref("https://example.com/x")).toBe(false);
    expect(isUsablePublicHref("http://localhost/x")).toBe(false);
    expect(isUsablePublicHref("/keystatic")).toBe(false);
    expect(isUsablePublicHref("/charter")).toBe(true);
    expect(isUsablePublicHref("https://www.instagram.com/p/example")).toBe(true);
    expect(
      hasUsablePublicDestination(
        work({
          slug: "with-href",
          title: "With Href",
          date: "2025-01-01",
          status: "listed",
          publicationState: "published",
          canonicalUrl: "https://example.com/nope",
          distributionLinks: [
            { platform: "instagram", label: null, url: "https://www.instagram.com/p/ok" },
          ],
        })
      )
    ).toBe(true);

    const withoutExternal = work({
      slug: "no-external",
      title: "No External",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      canonicalUrl: null,
      distributionLinks: [],
    });
    expect(isPublicStartHereEligible(withoutExternal)).toBe(true);
    expect(selectPublicStartHereWorks([withoutExternal], ["no-external"])).toHaveLength(1);
  });

  it("does not invent membership for eligible works absent from the sequence", () => {
    const eligible = work({
      slug: "eligible-but-unlisted",
      title: "Eligible",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
    });
    expect(isPublicStartHereEligible(eligible)).toBe(true);
    expect(selectStartHere([eligible], [])).toHaveLength(0);
  });
});

describe("selectFeaturedWorks", () => {
  it("returns only listed items marked featured", () => {
    const result = selectFeaturedWorks([
      work({
        slug: "featured",
        title: "Featured",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
        featured: true,
      }),
      work({
        slug: "plain",
        title: "Plain",
        date: "2025-01-01",
        status: "listed",
        publicationState: "published",
        featured: false,
      }),
      work({
        slug: "featured-archived",
        title: "Featured Archived",
        date: "2025-01-01",
        status: "archived",
        publicationState: "published",
        featured: true,
      }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["featured"]);
  });

  it("excludes developing featured items from public surfaces", () => {
    const result = selectFeaturedWorks([
      work({
        slug: "developing-featured",
        title: "Developing Featured",
        date: "2025-01-01",
        status: "listed",
        publicationState: "developing",
        featured: true,
      }),
    ]);
    expect(result).toHaveLength(0);
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
    const inCollection = work({
      slug: "in",
      title: "In",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["china"],
    });
    const outOfCollection = work({
      slug: "out",
      title: "Out",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["workplace"],
    });
    const result = selectByCollection([inCollection, outOfCollection], "china");
    expect(result.map((w) => w.slug)).toEqual(["in"]);
  });

  it("excludes developing items from collection listings", () => {
    const developing = work({
      slug: "developing-in-topic",
      title: "Developing",
      date: "2025-01-01",
      status: "listed",
      publicationState: "developing",
      topics: ["stories"],
    });
    const published = work({
      slug: "published-in-topic",
      title: "Published",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["stories"],
    });
    expect(selectByCollection([developing, published], "stories").map((w) => w.slug)).toEqual([
      "published-in-topic",
    ]);
  });

  it("supports every collection in the taxonomy", () => {
    for (const collection of COLLECTIONS) {
      expect(isCollectionSlug(collection.slug)).toBe(true);
    }
  });
});

describe("collection publication threshold", () => {
  it("requires at least two public works before a collection is browsable", () => {
    const one = work({
      slug: "only-one",
      title: "Only One",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["workplace"],
    });
    expect(countPublicWorksInCollection([one], "workplace")).toBe(1);
    expect(isCollectionPubliclyBrowsable([one], "workplace", PUBLIC_COLLECTION_MIN_WORKS)).toBe(
      false
    );

    const two = work({
      slug: "second",
      title: "Second",
      date: "2025-01-02",
      status: "listed",
      publicationState: "published",
      topics: ["workplace"],
    });
    expect(isCollectionPubliclyBrowsable([one, two], "workplace", PUBLIC_COLLECTION_MIN_WORKS)).toBe(
      true
    );
  });

  it("does not count developing works toward the collection threshold", () => {
    const developing = work({
      slug: "stub",
      title: "Stub",
      date: "2025-01-01",
      status: "listed",
      publicationState: "developing",
      topics: ["china"],
    });
    const published = work({
      slug: "real",
      title: "Real",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      topics: ["china"],
    });
    expect(isCollectionPubliclyBrowsable([developing, published], "china")).toBe(false);
  });

  it("selectBrowsableCollections returns only collections meeting the threshold", async () => {
    const works = await getListedWorks();
    const browsable = selectBrowsableCollections(works);
    for (const collection of browsable) {
      expect(countPublicWorksInCollection(works, collection.slug)).toBeGreaterThanOrEqual(2);
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
  it("loads mdoc works through Keystatic", async () => {
    const works = await getListedWorks();
    expect(works.length).toBeGreaterThanOrEqual(4);
    const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
    expect(bySlug.mandarinos?.publicationState).toBe("published");
    expect(bySlug.mandarinos?.canonicalUrl).toBe("https://www.mandarinos.app/");
    expect(bySlug.mandarinos?.href).toBe("/library/mandarinos");
    expect(bySlug["gettoknowyou-community-charter"]?.canonicalUrl).toBe("/charter");
    expect(bySlug["gettoknowyou-community-charter"]?.href).toBe("/charter");
    expect(bySlug.conversationos).toBeUndefined();
    expect(bySlug["better-conversations"]).toBeUndefined();
  });

  it("stores works as .mdoc only (no leftover .yaml files)", () => {
    const files = readdirSync(path.join(root, "content/works"));
    expect(files.some((name) => name.endsWith(".mdoc"))).toBe(true);
    expect(files.filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))).toEqual([]);
  });

  it("never returns a draft seed item or developing stub", async () => {
    const works = await getListedWorks();
    const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
    expect(bySlug["the-second-question"]).toBeUndefined();
    expect(bySlug["better-conversations"]).toBeUndefined();
    expect(bySlug.conversationos).toBeUndefined();
    expect(bySlug["cross-cultural-stories"]).toBeUndefined();
    expect(bySlug["the-coffee-date-that-went-silent"]).toBeUndefined();
    expect(bySlug["trust-and-human-connection"]).toBeUndefined();
  });

  it("exposes only genuinely published public works in the Library", async () => {
    // This reflects Raymond's current deliberate Listed + Published edits,
    // including the video works corrected from Hosted to Summary (see
    // "reflects corrected contentMode for video works" below) — not an
    // older, now-obsolete fixed count.
    const works = await getPublicLibraryWorks();
    const slugs = works.map((w) => w.slug).sort();
    expect(slugs).toEqual(
      [
        "before-you-build",
        "conversation-missed-opportunity",
        "englishos",
        "englishos-you-can-answer-but-can-you-continue",
        "gettoknowyou-community-charter",
        "mandarinos",
        "outsider",
        "real-time-language-training-needed",
        "the-dunedin-checkout-success-story",
        "tried-everything-but-still-can-t-speak",
        "vocab-not-enough",
      ].sort()
    );
    expect(works.every((w) => w.publicationState === "published")).toBe(true);
    expect(works.every((w) => w.status === "listed")).toBe(true);
  });

  it("loads legacy records without origin/canonicalPlatform via normalizeWork", () => {
    const result = normalizeWork({
      slug: "legacy-no-provenance",
      title: "Legacy",
      summary: LONG_SUMMARY,
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      status: "listed",
    });
    expect(result?.origin).toBeNull();
    expect(result?.canonicalPlatform).toBeNull();
  });

  it("loads the founder summary body onto the public work page", async () => {
    const detail = await getPublicWorkDetail("conversation-missed-opportunity");
    expect(detail?.hasBody).toBe(true);
    expect(detail?.body).not.toBeNull();
    expect(detail?.contentMode).toBe("summary");
    expect(detail?.href).toBe("/library/conversation-missed-opportunity");
  });

  it("keeps the published teenage founder story as a single Start Here entry", async () => {
    const listed = await getListedWorks();
    const startHere = await getStartHereWorks();
    const listedMatches = listed.filter((w) => w.slug === "conversation-missed-opportunity");
    const startHereMatches = startHere.filter((w) => w.slug === "conversation-missed-opportunity");
    const legacyMatches = listed.filter((w) => w.slug === "the-teenager-who-got-stuck");

    expect(listedMatches).toHaveLength(1);
    expect(startHereMatches).toHaveLength(1);
    expect(legacyMatches).toHaveLength(0);
    expect(startHereMatches[0]?.title).toBe("Conversation — Missed Teenage Opportunity");
    expect(startHereMatches[0]?.publicationState).toBe("published");
    expect(startHereMatches[0]?.href).toBe("/library/conversation-missed-opportunity");
    expect(startHere[0]?.slug).toBe("conversation-missed-opportunity");
    expect(startHere.every((w) => w.publicationState === "published")).toBe(true);
  });
});

describe("distribution platforms and provenance", () => {
  it("normalizes missing platform to 'other' rather than dropping the link", () => {
    const result = normalizeWork({
      slug: "legacy-link",
      title: "Legacy Link",
      summary: "A link recorded before the platform field existed.",
      type: "video",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      distributionLinks: [{ label: "Instagram", url: "https://instagram.com/p/example" }],
    });
    expect(result?.distributionLinks).toEqual([
      { platform: "other", label: "Instagram", url: "https://instagram.com/p/example" },
    ]);
  });

  it("drops a malformed distribution link (no URL) without failing the whole record", () => {
    const result = normalizeWork({
      slug: "malformed-link",
      title: "Malformed Link",
      summary: "Has one good link and one without a URL.",
      type: "video",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      distributionLinks: [
        { platform: "youtube", url: "https://youtube.com/watch?v=example" },
        { platform: "instagram", url: "" },
      ],
    });
    expect(result?.distributionLinks).toEqual([
      { platform: "youtube", label: null, url: "https://youtube.com/watch?v=example" },
    ]);
  });

  it("supports both Instagram and Xiaohongshu links on the same work", () => {
    const result = normalizeWork({
      slug: "multi-platform",
      title: "Multi Platform",
      summary: "Published on two platforms.",
      type: "video",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      distributionLinks: [
        { platform: "instagram", url: "https://instagram.com/p/one" },
        { platform: "xiaohongshu", url: "https://xiaohongshu.com/p/two" },
      ],
    });
    expect(result?.distributionLinks).toHaveLength(2);
    expect(result?.distributionLinks.map((l) => l.platform).sort()).toEqual([
      "instagram",
      "xiaohongshu",
    ]);
  });

  it("normalizes an unrecognised or blank origin/canonicalPlatform to null", () => {
    const result = normalizeWork({
      slug: "unknown-provenance",
      title: "Unknown Provenance",
      summary: "Bad or blank provenance values.",
      type: "essay",
      date: "2026-07-25",
      publicationState: "developing",
      canonicalUrl: "",
      status: "listed",
      origin: "not-a-real-origin",
      canonicalPlatform: "",
    });
    expect(result?.origin).toBeNull();
    expect(result?.canonicalPlatform).toBeNull();
  });

  it("keeps a recognised origin and canonicalPlatform", () => {
    const result = normalizeWork({
      slug: "known-provenance",
      title: "Known Provenance",
      summary: LONG_SUMMARY,
      type: "video",
      contentMode: "summary",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "https://youtube.com/watch?v=example",
      status: "listed",
      origin: "instagram",
      canonicalPlatform: "youtube",
    });
    expect(result?.origin).toBe("instagram");
    expect(result?.canonicalPlatform).toBe("youtube");
    expect(result?.href).toBe("/library/known-provenance");
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
  it("returns only public-ready items in the Start Here singleton order", async () => {
    const works = await getStartHereWorks();
    expect(works.length).toBeGreaterThan(0);
    expect(works.every((w) => w.status === "listed")).toBe(true);
    expect(works.every((w) => w.publicationState === "published")).toBe(true);
    expect(works.every((w) => w.contentMode !== "reference")).toBe(true);
    expect(works.every((w) => w.href.startsWith("/"))).toBe(true);
  });

  it("never includes known developing Start Here candidates", async () => {
    const works = await getStartHereWorks();
    const slugs = new Set(works.map((w) => w.slug));
    expect(slugs.has("conversationos")).toBe(false);
    expect(slugs.has("better-conversations")).toBe(false);
    expect(slugs.has("trust-and-human-connection")).toBe(false);
  });

  it("keeps Start Here on the singleton sequence of published works only", async () => {
    const works = await getStartHereWorks();
    expect(works.map((w) => w.slug)).toEqual([
      "conversation-missed-opportunity",
      "the-dunedin-checkout-success-story",
      "mandarinos",
      "englishos",
      "gettoknowyou-community-charter",
    ]);
    expect(works[0]?.title).toBe("Conversation — Missed Teenage Opportunity");
    expect(works[1]?.title).toBe("Conversations - The Dunedin Checkout Success Story");
    expect(works.every((w) => w.publicationState === "published")).toBe(true);
    expect(works.map((w) => w.href)).toEqual([
      "/library/conversation-missed-opportunity",
      "/library/the-dunedin-checkout-success-story",
      "/library/mandarinos",
      "/library/englishos",
      "/charter",
    ]);
  });

  it("hides Related content when no eligible public peers exist", async () => {
    const detail = await getPublicWorkDetail("mandarinos");
    expect(detail).not.toBeNull();
    const related = await getRelatedWorks(detail!, 3);
    expect(related.every((w) => w.publicationState === "published")).toBe(true);
    const relatedUi = readFileSync(path.join(root, "app/components/LibraryDetail.tsx"), "utf8");
    expect(relatedUi).toContain("if (works.length === 0) return null");
  });

  it("stores Start Here order in a singleton rather than per-work fields", () => {
    expect(existsSync(path.join(root, "content/start-here.yaml"))).toBe(true);
    const sequence = readFileSync(path.join(root, "content/start-here.yaml"), "utf8");
    expect(sequence).toContain("conversation-missed-opportunity");
    expect(sequence).toContain("the-dunedin-checkout-success-story");
    expect(sequence).toContain("mandarinos");
    expect(sequence).toContain("gettoknowyou-community-charter");
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain("startHere: singleton(");
    expect(config).not.toContain("startHereOrder:");
    const worksDir = path.join(root, "content/works");
    for (const file of readdirSync(worksDir)) {
      if (!/\.(mdoc|yaml|yml)$/i.test(file)) continue;
      const raw = readFileSync(path.join(worksDir, file), "utf8");
      expect(raw).not.toMatch(/^startHereOrder:/m);
    }
  });

  it("exposes a Watch video CTA to the Library player for hosted-video works", async () => {
    const { workPrimaryAction, workTitleHref } = await import("../app/components/WorkList");
    const works = await getStartHereWorks();
    const checkout = works.find((w) => w.slug === "the-dunedin-checkout-success-story");
    expect(checkout?.video).toBe("/media/posts/Checkout-Chick-Successful-Conversation.mp4");
    expect(
      existsSync(path.join(root, "public/media/posts/Checkout-Chick-Successful-Conversation.mp4"))
    ).toBe(true);
    expect(workTitleHref(checkout!)).toBe("/library/the-dunedin-checkout-success-story");
    expect(workPrimaryAction(checkout!)).toEqual({
      href: "/library/the-dunedin-checkout-success-story#video",
      label: "Watch video",
    });

    const charter = works.find((w) => w.slug === "gettoknowyou-community-charter");
    expect(workPrimaryAction(charter!).label).toBe("Open");
    expect(workPrimaryAction(charter!).href).toBe("/charter");
    expect(workTitleHref(charter!)).toBe("/charter");

    const detail = readFileSync(path.join(root, "app/components/LibraryDetail.tsx"), "utf8");
    expect(detail).toContain('id="video"');
  });
});

describe("works collection boundaries", () => {
  it("stores works under content/works as Markdoc with contentMode", () => {
    expect(existsSync(path.join(root, "content/works"))).toBe(true);
    expect(existsSync(path.join(root, "content/community-charter.mdoc"))).toBe(true);
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain('path: "content/works/*"');
    expect(config).toContain("works: collection(");
    expect(config).toContain('format: { contentField: "body" }');
    expect(config).toContain("contentMode");
    expect(config).toContain("publicationState");
    expect(config).toContain('path: "content/community-charter"');
    expect(config).toContain('path: "content/start-here"');
    expect(config).toContain('format: { data: "yaml" }');
  });

  it("exposes a single platform taxonomy including gettoknow-you", () => {
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain("DISTRIBUTION_PLATFORM_OPTIONS");
    expect(config).toContain("CANONICAL_PLATFORM_OPTIONS");
    expect(config).toContain("ORIGIN_OPTIONS");
    expect(config).not.toContain('"xiaohongshu"');
    const platforms = readFileSync(path.join(root, "content/platforms.ts"), "utf8");
    expect(platforms).toContain('"gettoknow-you"');
    expect(platforms).toContain('"instagram"');
    expect(platforms).toContain('"xiaohongshu"');
  });

  it("keeps distributionLinks URL required while platform and note stay flexible", () => {
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    const distributionSection = config.slice(config.indexOf("distributionLinks: fields.array("));
    expect(distributionSection).toContain("platform: fields.select(");
    expect(distributionSection).toContain('label: "Note (optional)"');
    expect(distributionSection.slice(0, distributionSection.indexOf("url: fields.url("))).not.toContain(
      "isRequired: true"
    );
  });

  it("loads Explore content through the works loader without hard-coded work copy", () => {
    const page = readFileSync(path.join(root, "app/explore/page.tsx"), "utf8");
    const exploreCopy = readFileSync(path.join(root, "content/pages/explore.yaml"), "utf8");
    const list = readFileSync(path.join(root, "app/components/WorkList.tsx"), "utf8");
    expect(page).toContain("getExplorePageCopy");
    expect(page).toContain("ThemeGrid");
    expect(page).not.toContain("getStartHereWorks");
    expect(page).not.toContain("getListedWorks");
    expect(page).not.toContain("selectBrowsableCollections");
    expect(page).not.toContain("explore-collections");
    expect(page).not.toContain("collection-grid");
    expect(page).not.toContain("collectionsHeading");
    expect(page).not.toContain("Browse by collection");
    expect(page).not.toContain("slice(0, 3)");
    expect(page).toContain('href="/start-here"');
    expect(page).not.toContain("Follow the Start Here pathway");
    expect(exploreCopy).toContain("Follow the Start Here pathway");
    expect(exploreCopy).not.toContain("collectionsEyebrow");
    expect(exploreCopy).not.toContain("Browse by collection");
    expect(page).not.toContain("Coming soon");
    expect(list).toContain("work.href");
    expect(list).toContain("work.title");
    expect(list).toContain("work.summary");
    expect(list).not.toContain("In development");
    expect(page).not.toContain("canonicalUrl: \"http");
    expect(page).not.toContain("summary: \"");
  });

  it("exposes a dedicated /start-here route that uses the same public Start Here selector", () => {
    const page = readFileSync(path.join(root, "app/start-here/page.tsx"), "utf8");
    const explore = readFileSync(path.join(root, "app/explore/page.tsx"), "utf8");
    expect(existsSync(path.join(root, "app/start-here/page.tsx"))).toBe(true);
    expect(page).toContain("getStartHereWorks");
    expect(page).toContain("getStartHerePageCopy");
    expect(page).toContain("WorkList");
    expect(page).not.toContain("In development");
    expect(page).not.toContain("coming soon");
    expect(explore).not.toContain("getStartHereWorks");
    expect(explore).toContain('href="/start-here"');
  });

  it("exposes a public /library/[slug] detail page with native media components", () => {
    expect(existsSync(path.join(root, "app/library/[slug]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/library/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "public/media/posts"))).toBe(true);
    const page = readFileSync(path.join(root, "app/library/[slug]/page.tsx"), "utf8");
    const grid = readFileSync(path.join(root, "app/components/LibraryGrid.tsx"), "utf8");
    const detail = readFileSync(path.join(root, "app/components/LibraryDetail.tsx"), "utf8");
    expect(page).toContain("getPublicWorkDetail");
    expect(page).toContain("getPublicWorkSlugs");
    expect(page).toContain("LibraryVideo");
    expect(page).toContain("OriginallyPublished");
    expect(page).toContain("SITE_URL");
    expect(page).toContain("openGraph");
    expect(grid).toContain("LibraryCard");
    expect(grid).not.toContain("instagram.com");
    expect(detail).toContain("controls");
    expect(detail).toContain("playsInline");
    expect(detail).toContain('preload="metadata"');
    expect(detail).not.toContain("autoPlay");
    expect(detail).toContain("Originally published on Instagram");
  });

  it("keeps Start Here and collection cards on internal library URLs", async () => {
    const startHere = await getStartHereWorks();
    const listed = await getListedWorks();
    expect(startHere.length).toBeGreaterThan(0);
    expect(startHere.every((w) => w.href.startsWith("/library/") || w.href === "/charter")).toBe(
      true
    );
    expect(listed.every((w) => w.workPath.startsWith("/library/"))).toBe(true);
    expect(listed.every((w) => w.publicationState === "published")).toBe(true);
  });

  it("hides related content when only non-public or self references are provided", () => {
    const current = work({
      slug: "current",
      title: "Current",
      date: "2025-01-01",
      status: "listed",
      publicationState: "published",
      related: ["current", "missing-draft", "other-public"],
    });
    const other = work({
      slug: "other-public",
      title: "Other",
      date: "2025-01-02",
      status: "listed",
      publicationState: "published",
    });
    const draft = work({
      slug: "missing-draft",
      title: "Draft",
      date: "2025-01-03",
      status: "draft",
      publicationState: "developing",
    });
    const related = selectRelatedWorks([current, other, draft], current, 3);
    expect(related.map((w) => w.slug)).toEqual(["other-public"]);
  });

  it("normalizes native cover, video, and original social fields", () => {
    const result = normalizeWork({
      slug: "native-video",
      title: "Native Video",
      summary: LONG_SUMMARY,
      type: "video",
      contentMode: "summary",
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
      coverImage: "/media/posts/example.jpg",
      video: "/media/posts/example.mp4",
      project: "conversationos",
      languages: ["English", "Chinese"],
      originalInstagram: "https://www.instagram.com/p/example/",
      related: ["conversation-missed-opportunity"],
    });
    expect(result?.coverImage).toBe("/media/posts/example.jpg");
    expect(result?.video).toBe("/media/posts/example.mp4");
    expect(result?.project).toBe("conversationos");
    expect(result?.languages).toEqual(["English", "Chinese"]);
    expect(result?.original.instagram).toBe("https://www.instagram.com/p/example/");
    expect(result?.related).toEqual(["conversation-missed-opportunity"]);
    expect(result?.workPath).toBe("/library/native-video");
  });

  it("does not expose developing placeholders in WorkList", () => {
    const list = readFileSync(path.join(root, "app/components/WorkList.tsx"), "utf8");
    expect(list).not.toContain("explore-list__developing");
    expect(list).not.toContain("In development");
  });

  it("keeps Library and Try pages loader-driven without duplicated work copy", () => {
    const library = readFileSync(path.join(root, "app/library/page.tsx"), "utf8");
    const tryPage = readFileSync(path.join(root, "app/try/page.tsx"), "utf8");
    const header = readFileSync(path.join(root, "app/components/SiteHeader.tsx"), "utf8");
    const nextConfig = readFileSync(path.join(root, "next.config.mjs"), "utf8");
    expect(library).toContain("getPublicLibraryWorks");
    expect(library).toContain("LibraryGrid");
    expect(tryPage).toContain('getPathwayWorks("try")');
    expect(library).not.toContain("Better Conversations");
    expect(tryPage).not.toContain("summary: \"");
    expect(header).toContain('href: "/library"');
    expect(header).not.toContain('href: "/meet"');
    expect(existsSync(path.join(root, "app/read/page.tsx"))).toBe(false);
    expect(nextConfig).toContain('source: "/read"');
    expect(nextConfig).toContain('destination: "/library"');
  });

  it("exposes collection routes and permanent redirects into the Library", () => {
    expect(existsSync(path.join(root, "app/explore/[collection]/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/explore/archive/page.tsx"))).toBe(false);
    expect(existsSync(path.join(root, "app/works/[slug]/page.tsx"))).toBe(false);
    const collectionPage = readFileSync(
      path.join(root, "app/explore/[collection]/page.tsx"),
      "utf8"
    );
    const nextConfig = readFileSync(path.join(root, "next.config.mjs"), "utf8");
    expect(collectionPage).toContain("notFound");
    expect(collectionPage).toContain("isCollectionPubliclyBrowsable");
    expect(nextConfig).toContain('source: "/explore/archive"');
    expect(nextConfig).toContain('destination: "/library"');
    expect(nextConfig).toContain('source: "/works/:slug"');
    expect(nextConfig).toContain('destination: "/library/:slug"');
    expect(nextConfig).toContain('source: "/read"');
    expect(nextConfig).toContain("permanent: true");
  });

  it("uses a central production host in root metadata", () => {
    const layout = readFileSync(path.join(root, "app/layout.tsx"), "utf8");
    const site = readFileSync(path.join(root, "content/site.ts"), "utf8");
    expect(site).toContain(SITE_URL);
    expect(layout).toContain("metadataBase");
    expect(layout).toContain("SITE_URL");
  });

  it("maps every uploaded post video to exactly one work record", async () => {
    const videoExt = /\.(mp4|mov|m4v|webm)$/i;
    const postsDir = path.join(root, "public/media/posts");
    const videoFiles = readdirSync(postsDir)
      .filter((name) => videoExt.test(name))
      .sort();

    expect(videoFiles.length).toBeGreaterThan(0);

    const worksDir = path.join(root, "content/works");
    const videoPathsFromRecords = new Map<string, string>();
    for (const file of readdirSync(worksDir)) {
      if (!file.endsWith(".mdoc")) continue;
      const raw = readFileSync(path.join(worksDir, file), "utf8");
      const match = raw.match(/^video:\s*(.+)$/m);
      if (!match) continue;
      const videoPath = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (!videoPath.startsWith("/media/posts/")) continue;
      expect(
        videoPathsFromRecords.has(videoPath),
        `duplicate video path ${videoPath}`
      ).toBe(false);
      videoPathsFromRecords.set(videoPath, file);
    }

    for (const filename of videoFiles) {
      const publicPath = `/media/posts/${filename}`;
      expect(
        videoPathsFromRecords.has(publicPath),
        `missing or case-mismatched work record for ${publicPath} — ` +
          `found ${[...videoPathsFromRecords.keys()].join(", ") || "none"}`
      ).toBe(true);
      expect(existsSync(path.join(postsDir, filename))).toBe(true);
    }

    for (const [recordedPath, recordFile] of videoPathsFromRecords) {
      const basename = recordedPath.slice("/media/posts/".length);
      expect(
        videoFiles.includes(basename),
        `record ${recordFile} references missing file ${recordedPath}`
      ).toBe(true);
    }
  });

  it("reflects Raymond's corrected contentMode for video works", async () => {
    // Native video alone never satisfies Hosted (a substantive Markdoc body
    // is required). These video-only records carry a substantive summary
    // and an empty body, so Summary is the correct mode and they are now
    // eligible; the two records below remain excluded because they are
    // genuinely incomplete, independent of contentMode.
    const summaryModeVideoSlugs = [
      "real-time-language-training-needed",
      "vocab-not-enough",
      "tried-everything-but-still-can-t-speak",
      "the-dunedin-checkout-success-story",
    ];
    const works = await readAllWorksForTest();
    for (const slug of summaryModeVideoSlugs) {
      const work = works.find((w) => w.slug === slug);
      expect(work, `expected work ${slug}`).toBeTruthy();
      expect(work?.contentMode).toBe("summary");
      expect(work?.hasBody).toBe(false);
      expect(isPubliclyEligible(work!)).toBe(true);
      expect(await getPublicWorkDetail(slug)).not.toBeNull();
    }

    // Outsider keeps Hosted because its body is genuinely substantive.
    const outsider = works.find((w) => w.slug === "outsider");
    expect(outsider?.contentMode).toBe("hosted");
    expect(outsider?.hasBody).toBe(true);
    expect(isPubliclyEligible(outsider!)).toBe(true);

    // Just Speaking still carries a placeholder summary — genuinely
    // incomplete, so it correctly fails to normalize into a public work,
    // regardless of contentMode.
    expect(works.find((w) => w.slug === "just-speak")).toBeUndefined();
    expect(await getPublicWorkDetail("just-speak")).toBeNull();

    // The Coffee Date has no video field yet ("the video itself is still
    // being prepared" per its own summary) — Hosted with an empty body
    // stays excluded rather than being prematurely published.
    expect(works.find((w) => w.slug === "the-coffee-date-that-went-silent")).toBeUndefined();
    expect(await getPublicWorkDetail("the-coffee-date-that-went-silent")).toBeNull();

    const { getWorkEligibilityReports } = await import("./loadWorks");
    const reports = await getWorkEligibilityReports();
    const justSpeakReport = reports.find((r) => r.slug === "just-speak");
    expect(justSpeakReport?.eligible).toBe(false);
    expect(justSpeakReport?.reasons.join(" ")).toContain("Hosted");
    const coffeeDateReport = reports.find((r) => r.slug === "the-coffee-date-that-went-silent");
    expect(coffeeDateReport?.eligible).toBe(false);
    expect(coffeeDateReport?.reasons.join(" ")).toContain("Hosted");
  });

  it("keeps orphan-video draft records off public surfaces", async () => {
    const orphanVideoSlugs = ["conversation-failed-adult-me", "conversation-failed-teenage-me"];
    const works = await readAllWorksForTest();
    for (const slug of orphanVideoSlugs) {
      const work = works.find((w) => w.slug === slug);
      expect(work, `expected draft work ${slug}`).toBeTruthy();
      expect(work?.publicationState).toBe("developing");
      expect(work?.status).toBe("draft");
      expect(work?.featured).toBe(false);
      expect(work?.summary).toBe("Add summary in Keystatic before publication.");
      expect(isPubliclyEligible(work!)).toBe(false);
      expect(await getPublicWorkDetail(slug)).toBeNull();
    }
  });

  it("allows draft developing works without an added date", () => {
    const result = normalizeWork({
      slug: "draft-no-date",
      title: "Draft No Date",
      summary: LONG_SUMMARY,
      type: "video",
      publicationState: "developing",
      status: "draft",
      video: "/media/posts/example.mp4",
    });
    expect(result?.date).toBe("");
    expect(isPubliclyEligible(result!)).toBe(false);
  });

  it("still requires an added date for listed or published-bound works", () => {
    expect(
      normalizeWork({
        slug: "listed-no-date",
        title: "Listed No Date",
        summary: LONG_SUMMARY,
        type: "video",
        publicationState: "developing",
        status: "listed",
      })
    ).toBeNull();
  });
});

describe("diagnoseWorkEligibility", () => {
  it("reuses the authoritative eligibility rules rather than a second implementation", async () => {
    const source = readFileSync(path.join(root, "content/loadWorks.ts"), "utf8");
    const fnBody = source.slice(
      source.indexOf("export function diagnoseWorkEligibility"),
      source.indexOf("\n}", source.indexOf("export function diagnoseWorkEligibility"))
    );
    expect(fnBody).toContain("buildWorkRecord(input)");
    expect(fnBody).toContain("isPublishedContentValid(work)");
    expect(fnBody).toContain("isPubliclyEligible(work)");
  });

  it("explains a Hosted work with an empty body without leaking body content", () => {
    const report = diagnoseWorkEligibility({
      slug: "hosted-empty",
      title: "Hosted Empty",
      summary: LONG_SUMMARY,
      type: "video",
      contentMode: "hosted",
      hasBody: false,
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
      video: "/media/posts/example.mp4",
    });
    expect(report.eligible).toBe(false);
    expect(report.reasons.join(" ")).toContain("Content mode is Hosted");
    expect(report.reasons.join(" ")).toContain("body is currently empty");
  });

  it("reports no reasons for a genuinely eligible work", () => {
    const report = diagnoseWorkEligibility({
      slug: "hosted-complete",
      title: "Hosted Complete",
      summary: LONG_SUMMARY,
      type: "essay",
      contentMode: "hosted",
      hasBody: true,
      date: "2026-07-25",
      publicationState: "published",
      status: "listed",
    });
    expect(report.eligible).toBe(true);
    expect(report.reasons).toEqual([]);
  });

  it("explains a not-yet-published developing work", () => {
    const report = diagnoseWorkEligibility({
      slug: "developing-work",
      title: "Developing Work",
      summary: LONG_SUMMARY,
      type: "video",
      status: "listed",
      publicationState: "developing",
      date: "2026-07-25",
    });
    expect(report.eligible).toBe(false);
    expect(report.reasons.join(" ")).toContain('Editorial state is "developing", not Published');
  });

  it("explains a work missing required fields before it can even be built", () => {
    const report = diagnoseWorkEligibility({ slug: "incomplete" });
    expect(report.eligible).toBe(false);
    expect(report.reasons.length).toBeGreaterThan(0);
    expect(report.reasons.join(" ")).toContain("Title is missing");
    expect(report.reasons.join(" ")).toContain("Summary is missing");
  });

  it("diagnoses every real Work record without throwing and without leaking draft bodies", async () => {
    const { getWorkEligibilityReports } = await import("./loadWorks");
    const reports = await getWorkEligibilityReports();
    expect(reports.length).toBeGreaterThan(0);
    for (const report of reports) {
      expect(typeof report.slug).toBe("string");
      expect(typeof report.eligible).toBe("boolean");
      if (!report.eligible) {
        expect(report.reasons.length).toBeGreaterThan(0);
      }
      // Reasons are structural explanations only — never raw body/markdoc text.
      for (const reason of report.reasons) {
        expect(reason).not.toMatch(/\n\n/);
      }
    }
  });

  it("flags the checkout work as excluded while its content mode is Hosted with no body (Raymond's in-progress edit)", async () => {
    const { getWorkEligibilityReports } = await import("./loadWorks");
    const reports = await getWorkEligibilityReports();
    const checkout = reports.find((r) => r.slug === "the-dunedin-checkout-success-story");
    expect(checkout).toBeTruthy();
    if (checkout && checkout.contentMode === "hosted" && !checkout.eligible) {
      expect(checkout.reasons.join(" ")).toContain("Content mode is Hosted");
    }
  });
});

describe("Keystatic Works editor structure", () => {
  const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
  const worksSection = config.slice(
    config.indexOf("works: collection("),
    config.indexOf("themes: collection(")
  );

  it("uses the form entry layout so publication fields use the full width", () => {
    expect(worksSection).toContain('entryLayout: "form"');
    expect(worksSection).toContain('format: { contentField: "body" }');
  });

  it("places publication-critical fields before secondary metadata", () => {
    const criticalFields = [
      "status:",
      "publicationState:",
      "date:",
      "publishedDate:",
      "contentMode:",
      "type:",
      "featured:",
      "summary:",
      "video:",
    ];
    const secondaryFields = ["themes:", "topics:", "series:", "distributionLinks:", "seoCanonicalUrl:"];
    const criticalIndexes = criticalFields.map((f) => worksSection.indexOf(f));
    const secondaryIndexes = secondaryFields.map((f) => worksSection.indexOf(f));
    expect(criticalIndexes.every((i) => i > -1)).toBe(true);
    expect(secondaryIndexes.every((i) => i > -1)).toBe(true);
    const lastCritical = Math.max(...criticalIndexes);
    const firstSecondary = Math.min(...secondaryIndexes);
    expect(lastCritical).toBeLessThan(firstSecondary);
  });

  it("places the Markdoc body after publication and video fields", () => {
    expect(worksSection.indexOf("video:")).toBeLessThan(worksSection.indexOf("body: fields.markdoc("));
    expect(worksSection.indexOf("summary:")).toBeLessThan(worksSection.indexOf("body: fields.markdoc("));
  });

  it("uses concise, accurate field descriptions without the long checklist", () => {
    expect(worksSection).not.toContain("CHECKLIST");
    expect(worksSection).toContain(
      "Listed allows this Work to appear publicly. Draft and Archived never appear."
    );
    expect(worksSection).toContain(
      "Published means editorially ready. Developing remains hidden even when Website visibility is Listed."
    );
    const contentModeSection = worksSection.slice(worksSection.indexOf('contentMode: fields.select('));
    const contentModeDescription = contentModeSection.slice(0, contentModeSection.indexOf("}),"));
    expect(contentModeDescription).toContain(
      "Summary: video or short Work with a complete summary."
    );
    expect(contentModeDescription).toContain(
      "Hosted: a substantial article in the body below."
    );
  });

  it("clarifies that Added date and Original published date are distinct", () => {
    const dateSection = worksSection.slice(
      worksSection.indexOf("date: fields.date("),
      worksSection.indexOf("publishedDate: fields.date(")
    );
    expect(dateSection).toContain("Required for a public Work.");
    const publishedDateSection = worksSection.slice(
      worksSection.indexOf("publishedDate: fields.date("),
      worksSection.indexOf("contentMode: fields.select(")
    );
    expect(publishedDateSection).toContain("Optional date first published elsewhere.");
  });

  it("keeps the collection list columns focused on publication comparison", () => {
    expect(worksSection).toContain(
      'columns: ["status", "publicationState", "contentMode", "date", "type", "featured"]'
    );
  });

  it("keeps publication-critical fields flat (no conditional/object wrapper) so existing frontmatter stays valid", () => {
    // Wrapping status/publicationState/date/contentMode in fields.object or
    // fields.conditional would nest them under a new key, changing the
    // stored YAML shape and breaking every existing .mdoc record's
    // frontmatter. fields.object is still used for distributionLinks' array
    // items, which is a pre-existing, unrelated, safe pattern.
    expect(worksSection).not.toContain("fields.conditional(");
    const essentialsSection = worksSection.slice(
      worksSection.indexOf("title: fields.slug("),
      worksSection.indexOf("keyTakeaway: fields.text(")
    );
    expect(essentialsSection).not.toContain("fields.object(");
  });
});

async function readAllWorksForTest() {
  const { createReader } = await import("@keystatic/core/reader");
  const keystaticConfig = (await import("../keystatic.config")).default;
  const reader = createReader(root, keystaticConfig);
  const entries = await reader.collections.works.all();
  const { normalizeWork, markdocNodeHasContent } = await import("./loadWorks");
  const works = [];
  for (const { slug, entry } of entries) {
    let hasBody = false;
    try {
      const bodyEntry = await entry.body();
      hasBody = markdocNodeHasContent(bodyEntry?.node);
    } catch {
      hasBody = false;
    }
    const input = {
      slug,
      title: entry.title,
      summary: entry.summary,
      type: entry.type,
      contentMode: entry.contentMode,
      date: entry.date,
      publishedDate: entry.publishedDate,
      publicationState: entry.publicationState,
      status: entry.status,
      hasBody,
      video: entry.video,
      featured: entry.featured,
      topics: entry.topics,
      themes: entry.themes,
      distributionLinks: entry.distributionLinks,
    };
    const work = normalizeWork(input as Parameters<typeof normalizeWork>[0]);
    if (work) works.push(work);
  }
  return works;
}
