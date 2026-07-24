import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  getListedWorks,
  selectListedWorks,
  type Work,
} from "./loadWorks";

const root = process.cwd();

function work(partial: Partial<Work> & Pick<Work, "slug" | "title" | "date" | "status">): Work {
  return {
    summary: partial.summary ?? "Summary",
    type: partial.type ?? "essay",
    canonicalUrl: partial.canonicalUrl ?? "https://example.com/work",
    distributionLinks: partial.distributionLinks ?? [],
    ...partial,
  };
}

describe("selectListedWorks", () => {
  it("returns only listed works", () => {
    const result = selectListedWorks([
      work({ slug: "a", title: "A", date: "2024-01-01", status: "listed" }),
      work({ slug: "b", title: "B", date: "2024-06-01", status: "archived" }),
      work({ slug: "c", title: "C", date: "2025-01-01", status: "listed" }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["c", "a"]);
  });

  it("excludes archived works", () => {
    const result = selectListedWorks([
      work({ slug: "kept", title: "Kept", date: "2025-02-01", status: "listed" }),
      work({ slug: "old", title: "Old", date: "2025-03-01", status: "archived" }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("kept");
  });

  it("sorts listed works by date descending", () => {
    const result = selectListedWorks([
      work({ slug: "older", title: "Older", date: "2023-05-01", status: "listed" }),
      work({ slug: "newest", title: "Newest", date: "2025-08-01", status: "listed" }),
      work({ slug: "middle", title: "Middle", date: "2024-11-15", status: "listed" }),
    ]);
    expect(result.map((w) => w.slug)).toEqual(["newest", "middle", "older"]);
  });

  it("treats distribution links as optional", () => {
    const withoutLinks = work({
      slug: "plain",
      title: "Plain",
      date: "2025-01-01",
      status: "listed",
      distributionLinks: [],
    });
    const withLinks = work({
      slug: "shared",
      title: "Shared",
      date: "2025-02-01",
      status: "listed",
      distributionLinks: [{ label: "Instagram", url: "https://example.com/ig" }],
    });
    const result = selectListedWorks([withoutLinks, withLinks]);
    expect(result.find((w) => w.slug === "plain")?.distributionLinks).toEqual([]);
    expect(result.find((w) => w.slug === "shared")?.distributionLinks).toHaveLength(1);
  });
});

describe("getListedWorks", () => {
  it("handles an empty collection safely", async () => {
    const works = await getListedWorks();
    expect(Array.isArray(works)).toBe(true);
    expect(works).toEqual([]);
  });
});

describe("works collection boundaries", () => {
  it("stores works under content/works, not as a charter twin", () => {
    expect(existsSync(path.join(root, "content/works"))).toBe(true);
    expect(existsSync(path.join(root, "content/community-charter.mdoc"))).toBe(true);
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    expect(config).toContain('path: "content/works/*"');
    expect(config).toContain("works: collection(");
    expect(config).toContain('path: "content/community-charter"');
  });

  it("loads Explore content through the works loader, not hard-coded copy", () => {
    const page = readFileSync(path.join(root, "app/explore/page.tsx"), "utf8");
    expect(page).toContain("getListedWorks");
    expect(page).toContain("work.title");
    expect(page).toContain("work.summary");
    expect(page).not.toContain("canonicalUrl: \"http");
    expect(page).not.toContain("summary: \"");
  });
});
