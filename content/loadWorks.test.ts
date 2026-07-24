import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  getListedWorks,
  normalizeWork,
  selectListedWorks,
  type Work,
} from "./loadWorks";

const root = process.cwd();

function work(
  partial: Partial<Work> & Pick<Work, "slug" | "title" | "date" | "status" | "publicationState">
): Work {
  return {
    summary: partial.summary ?? "Summary",
    type: partial.type ?? "essay",
    canonicalUrl:
      partial.canonicalUrl !== undefined
        ? partial.canonicalUrl
        : partial.publicationState === "developing"
          ? null
          : "https://example.com/work",
    distributionLinks: partial.distributionLinks ?? [],
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
      summary: "Points at the homepage.",
      type: "other",
      date: "2026-07-25",
      publicationState: "published",
      canonicalUrl: "/",
      status: "listed",
    });
    expect(result?.canonicalUrl).toBe("/");
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

describe("getListedWorks", () => {
  it("loads the initial commons entries through Keystatic", async () => {
    const works = await getListedWorks();
    expect(works.length).toBeGreaterThanOrEqual(6);
    const bySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
    expect(bySlug.mandarinos?.publicationState).toBe("published");
    expect(bySlug.mandarinos?.canonicalUrl).toBe("https://www.mandarinos.app/");
    expect(bySlug["gettoknowyou-community-charter"]?.canonicalUrl).toBe("/");
    expect(bySlug.conversationos?.publicationState).toBe("developing");
    expect(bySlug.conversationos?.canonicalUrl).toBeNull();
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
    expect(page).toContain("getListedWorks");
    expect(page).toContain("work.title");
    expect(page).toContain("work.summary");
    expect(page).toContain("In development");
    expect(page).not.toContain("canonicalUrl: \"http");
    expect(page).not.toContain("summary: \"");
    expect(page).not.toContain("MandarinOS is the first practical");
  });

  it("does not render a developing entry as an empty canonical link in the page source", () => {
    const page = readFileSync(path.join(root, "app/explore/page.tsx"), "utf8");
    expect(page).toContain("explore-list__developing");
    expect(page).toContain('publicationState === "published"');
  });
});
