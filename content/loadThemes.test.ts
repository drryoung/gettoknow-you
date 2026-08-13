import { describe, expect, it } from "vitest";
import {
  isPublicTheme,
  normalizeTheme,
  normalizeWorkThemes,
  selectNavThemes,
  selectPublicThemes,
  selectThemeWorks,
  type Theme,
} from "./loadThemes";
import { normalizeWork, type Work } from "./loadWorks";
import { SITE_URL } from "./site";
import { isThemeId } from "./themeIds";

const LONG_SUMMARY =
  "A meaningful standalone summary long enough for published summary validation.";

function theme(
  partial: Partial<Theme> & Pick<Theme, "slug" | "title" | "status" | "summary">
): Theme {
  return {
    placeholderMessage: null,
    coverImage: null,
    featuredWorks: [],
    order: 100,
    showInNavigation: true,
    seoTitle: null,
    seoDescription: null,
    hasIntroduction: false,
    themePath: `/themes/${partial.slug}`,
    ...partial,
  };
}

function work(
  partial: Partial<Work> & Pick<Work, "slug" | "title" | "date" | "status" | "publicationState">
): Work {
  const workPath = partial.workPath ?? `/library/${partial.slug}`;
  return {
    summary: LONG_SUMMARY,
    type: "essay",
    contentMode: "summary",
    keyTakeaway: "A usable key takeaway for public summary mode.",
    annotation: null,
    sourceTitle: null,
    sourceAuthor: null,
    sourcePublication: null,
    hasBody: false,
    publishedDate: partial.publishedDate ?? partial.date,
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
    workPath,
    href: partial.href ?? workPath,
    ...partial,
  };
}

describe("theme eligibility", () => {
  it("treats placeholder and published as public; draft as private", () => {
    expect(isPublicTheme(theme({ slug: "a", title: "A", status: "draft", summary: "s" }))).toBe(
      false
    );
    expect(
      isPublicTheme(theme({ slug: "b", title: "B", status: "placeholder", summary: "s" }))
    ).toBe(true);
    expect(
      isPublicTheme(theme({ slug: "c", title: "C", status: "published", summary: "s" }))
    ).toBe(true);
  });

  it("excludes draft themes from public lists and sorts by order then title", () => {
    const list = selectPublicThemes([
      theme({ slug: "z", title: "Zebra", status: "published", summary: "s", order: 20 }),
      theme({ slug: "d", title: "Draft", status: "draft", summary: "s", order: 1 }),
      theme({ slug: "a", title: "Alpha", status: "placeholder", summary: "s", order: 20 }),
      theme({ slug: "b", title: "Beta", status: "published", summary: "s", order: 10 }),
    ]);
    expect(list.map((t) => t.slug)).toEqual(["b", "a", "z"]);
  });

  it("nav themes require showInNavigation and public status", () => {
    const list = selectNavThemes([
      theme({
        slug: "hidden",
        title: "Hidden",
        status: "published",
        summary: "s",
        showInNavigation: false,
      }),
      theme({
        slug: "shown",
        title: "Shown",
        status: "placeholder",
        summary: "s",
        showInNavigation: true,
      }),
      theme({
        slug: "draft",
        title: "Draft",
        status: "draft",
        summary: "s",
        showInNavigation: true,
      }),
    ]);
    expect(list.map((t) => t.slug)).toEqual(["shown"]);
  });
});

describe("theme work aggregation", () => {
  const eligibleA = work({
    slug: "a",
    title: "A",
    date: "2026-07-20",
    status: "listed",
    publicationState: "published",
    themes: ["better-conversations"],
  });
  const eligibleB = work({
    slug: "b",
    title: "B",
    date: "2026-07-25",
    status: "listed",
    publicationState: "published",
    themes: ["better-conversations"],
  });
  const draftWork = work({
    slug: "draft-work",
    title: "Draft",
    date: "2026-07-26",
    status: "draft",
    publicationState: "developing",
    themes: ["better-conversations"],
  });
  const otherTheme = work({
    slug: "other",
    title: "Other",
    date: "2026-07-27",
    status: "listed",
    publicationState: "published",
    themes: ["trust-and-human-connection"],
  });

  it("aggregates eligible works for a published theme, newest first", () => {
    const { works } = selectThemeWorks([eligibleA, eligibleB, draftWork, otherTheme], {
      slug: "better-conversations",
      featuredWorks: [],
    });
    expect(works.map((w) => w.slug)).toEqual(["b", "a"]);
  });

  it("excludes ineligible works", () => {
    const { works } = selectThemeWorks([draftWork, otherTheme], {
      slug: "better-conversations",
      featuredWorks: [],
    });
    expect(works).toEqual([]);
  });

  it("places featured works first and deduplicates", () => {
    const { featured, works } = selectThemeWorks([eligibleA, eligibleB], {
      slug: "better-conversations",
      featuredWorks: ["a", "a", "missing-slug"],
    });
    expect(featured.map((w) => w.slug)).toEqual(["a"]);
    expect(works.map((w) => w.slug)).toEqual(["a", "b"]);
  });

  it("does not crash on missing featured slugs", () => {
    const { featured, works } = selectThemeWorks([eligibleB], {
      slug: "better-conversations",
      featuredWorks: ["does-not-exist", "b"],
    });
    expect(featured.map((w) => w.slug)).toEqual(["b"]);
    expect(works.map((w) => w.slug)).toEqual(["b"]);
  });

  it("allows zero works for placeholder themes (empty aggregation is valid)", () => {
    const { works } = selectThemeWorks([otherTheme], {
      slug: "cross-cultural-understanding",
      featuredWorks: [],
    });
    expect(works).toEqual([]);
  });
});

describe("stable theme references", () => {
  it("keeps known theme ids and drops unknown values", () => {
    expect(
      normalizeWorkThemes([
        "better-conversations",
        "not-a-theme",
        "cross-cultural-understanding",
        "better-conversations",
        null,
      ])
    ).toEqual(["better-conversations", "cross-cultural-understanding"]);
  });

  it("title changes do not affect stable slug or themePath", () => {
    const before = normalizeTheme({
      slug: "cross-cultural-understanding",
      title: "Cross-Cultural Understanding",
      status: "placeholder",
      summary: "Exploring culture.",
    });
    const after = normalizeTheme({
      slug: "cross-cultural-understanding",
      title: "Living Between Cultures",
      status: "placeholder",
      summary: "Exploring culture.",
    });
    expect(before?.slug).toBe(after?.slug);
    expect(before?.themePath).toBe("/themes/cross-cultural-understanding");
    expect(after?.themePath).toBe("/themes/cross-cultural-understanding");
    expect(after?.title).toBe("Living Between Cultures");
  });

  it("work.themes stores stable ids, not display titles", () => {
    const normalized = normalizeWork({
      slug: "sample",
      title: "Sample",
      summary: LONG_SUMMARY,
      type: "story",
      date: "2026-07-27",
      status: "listed",
      publicationState: "published",
      contentMode: "summary",
      keyTakeaway: "A usable key takeaway for public summary mode.",
      themes: ["better-conversations", "Cross-Cultural Understanding"],
    });
    expect(normalized?.themes).toEqual(["better-conversations"]);
    expect(isThemeId(normalized!.themes[0])).toBe(true);
  });
});

describe("theme metadata inputs", () => {
  it("prefers seo overrides when present", () => {
    const record = normalizeTheme({
      slug: "better-conversations",
      title: "Better Conversations",
      status: "published",
      summary: "Card summary.",
      seoTitle: "SEO Title",
      seoDescription: "SEO description.",
      coverImage: "/media/posts/example.jpg",
    });
    expect(record).not.toBeNull();
    const title = record!.seoTitle || record!.title;
    const description = record!.seoDescription || record!.summary;
    expect(title).toBe("SEO Title");
    expect(description).toBe("SEO description.");
    expect(`${SITE_URL}${record!.themePath}`).toBe(`${SITE_URL}/themes/better-conversations`);
    expect(record!.coverImage).toBe("/media/posts/example.jpg");
  });
});

describe("filesystem theme records", () => {
  it("ships the five initial public theme files", async () => {
    const { readdirSync, readFileSync, existsSync } = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "content", "themes");
    expect(existsSync(dir)).toBe(true);
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdoc")).sort();
    expect(files).toEqual([
      "EnglishOS.mdoc",
      "better-conversations.mdoc",
      "building-gettoknow-you.mdoc",
      "cross-cultural-understanding.mdoc",
      "trust-and-human-connection.mdoc",
    ]);

    const cross = readFileSync(path.join(dir, "cross-cultural-understanding.mdoc"), "utf8");
    expect(cross).toContain("status: placeholder");
    expect(cross).toContain("This room is being developed.");
    expect(cross).not.toMatch(/^slug:/m);
  });
});

describe("theme routes and library integration", () => {
  it("exposes /themes and /themes/[slug] pages", async () => {
    const { existsSync, readFileSync } = await import("fs");
    const path = await import("path");
    const root = process.cwd();
    expect(existsSync(path.join(root, "app/themes/page.tsx"))).toBe(true);
    expect(existsSync(path.join(root, "app/themes/[slug]/page.tsx"))).toBe(true);
    const detail = readFileSync(path.join(root, "app/themes/[slug]/page.tsx"), "utf8");
    expect(detail).toContain("getResolvedThemePage");
    expect(detail).toContain("ThemeDetail");
  });

  it("resolves library theme labels to /themes/[slug] links", async () => {
    const { readFileSync } = await import("fs");
    const path = await import("path");
    const root = process.cwd();
    const library = readFileSync(path.join(root, "app/library/[slug]/page.tsx"), "utf8");
    const meta = readFileSync(path.join(root, "app/components/LibraryDetail.tsx"), "utf8");
    expect(library).toContain("resolveThemesForWork");
    expect(meta).toContain("theme.themePath");
    expect(meta).toContain("Themes");
  });

  it("keeps existing library redirects unchanged", async () => {
    const { readFileSync } = await import("fs");
    const path = await import("path");
    const nextConfig = readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
    expect(nextConfig).toContain('source: "/read"');
    expect(nextConfig).toContain('destination: "/library"');
    expect(nextConfig).toContain('source: "/works/:slug"');
    expect(nextConfig).toContain('destination: "/library/:slug"');
  });
});
