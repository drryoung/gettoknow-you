import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import {
  getAboutPageCopy,
  getExplorePageCopy,
  getFooterCopy,
  getHomePageCopy,
  getLibraryPageCopy,
  getMeetPageCopy,
  getStartHerePageCopy,
  getThemesPageCopy,
  getTryPageCopy,
  getCharterPageShell,
} from "./loadPages";

const root = process.cwd();

describe("page copy loaders", () => {
  it("loads homepage copy with pathways and preserved hero wording", async () => {
    const copy = await getHomePageCopy();
    expect(copy.heroHeading).toBe("Get to know someone.");
    expect(copy.pathwaysWithHref).toHaveLength(5);
    expect(copy.pathwaysWithHref[0]?.href).toBe("/start-here");
    expect(copy.seoTitle).toContain("GetToKnow.You");
  });

  it("loads Explore, Library, Try, Meet, About, Themes, Footer, Start Here, and Charter shell", async () => {
    const [
      explore,
      library,
      tryPage,
      meet,
      about,
      themes,
      footer,
      startHere,
      charterShell,
    ] = await Promise.all([
      getExplorePageCopy(),
      getLibraryPageCopy(),
      getTryPageCopy(),
      getMeetPageCopy(),
      getAboutPageCopy(),
      getThemesPageCopy(),
      getFooterCopy(),
      getStartHerePageCopy(),
      getCharterPageShell(),
    ]);

    expect(explore.heading).toBe("Explore");
    expect(explore.gatewaysWithHref.map((g) => g.href)).toEqual([
      "/themes",
      "/library",
      "/try",
      "/about",
    ]);
    expect(library.heading).toBe("Library");
    expect(library.originalNote).toContain("optional discovery references");
    expect(tryPage.externalCtaLabel).toBe("Open MandarinOS.app");
    expect(meet.intentHeading).toBe("What this may become");
    expect(about.ecosystem).toHaveLength(4);
    expect(about.bioParagraphs).toHaveLength(2);
    expect(themes.inDevelopmentLabel).toBe("A room in development");
    expect(themes.featuredHeading).toBe("Featured");
    expect(themes.relatedPathwaysWithHref).toHaveLength(3);
    expect(footer.tagline).toContain("public commons");
    expect(startHere.eyebrow).toBe("A place to begin");
    expect(charterShell.pageEyebrow).toBe("Constitutional foundation");
    expect(charterShell.pageHeading).toBe("Community Charter");
  });

  it("keeps page routes free of duplicated migrated hero literals", () => {
    const files = [
      "app/page.tsx",
      "app/explore/page.tsx",
      "app/library/page.tsx",
      "app/try/page.tsx",
      "app/meet/page.tsx",
      "app/about/page.tsx",
      "app/start-here/page.tsx",
      "app/themes/page.tsx",
    ];
    const banned = [
      "Get to know someone.",
      "Five ways in",
      "What this may become",
      "Rooms for exploring published work by thread",
      "The permanent home for GetToKnow.You content",
      "A place to begin",
      "Founder and ecosystem",
    ];
    for (const file of files) {
      const raw = readFileSync(path.join(root, file), "utf8");
      for (const phrase of banned) {
        expect(raw, `${file} should not hard-code “${phrase}”`).not.toContain(phrase);
      }
      expect(raw).toMatch(/get\w+PageCopy|getHomePageCopy|getStartHerePageCopy|getFooterCopy/);
    }
  });

  it("exposes page singletons in Keystatic", () => {
    const config = readFileSync(path.join(root, "keystatic.config.ts"), "utf8");
    for (const name of [
      "homePage",
      "explorePage",
      "libraryPage",
      "tryPage",
      "meetPage",
      "aboutPage",
      "themesPage",
      "siteFooter",
    ]) {
      expect(config).toContain(`${name}: singleton(`);
    }
    expect(existsSync(path.join(root, "content/pages"))).toBe(true);
    expect(readdirSync(path.join(root, "content/pages")).sort()).toEqual([
      "about.yaml",
      "explore.yaml",
      "home.yaml",
      "library.yaml",
      "meet.yaml",
      "themes.yaml",
      "try.yaml",
    ]);
  });
});
