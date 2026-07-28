/**
 * Typed loaders for visitor-facing page copy (Keystatic singletons).
 * Presentation stays in React; editorial wording lives in content/pages and content/site.
 */
import { createReader } from "@keystatic/core/reader";
import path from "path";
import keystaticConfig from "../keystatic.config";

const reader = createReader(path.join(process.cwd()), keystaticConfig);

function requiredText(value: unknown, label: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`Page content missing required field: ${label}`);
  return text;
}

function optionalText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

export type LinkedText = {
  label: string;
  text: string;
};

export type HomePageCopy = {
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroHeading: string;
  heroLede: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  pathwaysEyebrow: string;
  pathwaysHeading: string;
  pathwaysLede: string;
  pathways: LinkedText[];
  featuredEyebrow: string;
  featuredHeading: string;
  featuredLede: string;
  founderEyebrow: string;
  founderHeading: string;
  founderText: string;
  founderCtaLabel: string;
  charterHeading: string;
  charterText: string;
  charterCtaLabel: string;
};

/** Stable pathway keys map to fixed routes in code (URLs are not CMS-editable). */
export const HOME_PATHWAY_HREFS: Readonly<Record<string, string>> = {
  "start-here": "/start-here",
  explore: "/explore",
  library: "/library",
  try: "/try",
  about: "/about",
};

export const EXPLORE_GATEWAY_HREFS: Readonly<Record<string, string>> = {
  themes: "/themes",
  library: "/library",
  try: "/try",
  about: "/about",
};

export type ExplorePageCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  lede: string;
  startHereLinkLabel: string;
  gateways: LinkedText[];
  themesEyebrow: string;
  themesHeading: string;
  themesLede: string;
  themesCtaLabel: string;
  libraryEyebrow: string;
  libraryHeading: string;
  libraryLede: string;
  libraryCtaLabel: string;
};

export type SimpleIntroPageCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  lede: string;
  emptyMessage: string;
};

export type LibraryPageCopy = SimpleIntroPageCopy & {
  originalNote: string;
};

export type TryPageCopy = SimpleIntroPageCopy & {
  externalCtaLabel: string;
};

export type MeetPageCopy = SimpleIntroPageCopy & {
  intentHeading: string;
  intentText: string;
  charterCtaLabel: string;
};

export type AboutPageCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  lede: string;
  ecosystemHeading: string;
  ecosystem: LinkedText[];
  bioHeading: string;
  bioParagraphs: string[];
  links: { label: string; hrefKey: string }[];
};

export const ABOUT_LINK_HREFS: Readonly<Record<string, string>> = {
  mandarinos: "https://www.mandarinos.app/",
  try: "/try",
  charter: "/charter",
  explore: "/explore",
  meet: "/meet",
};

export type StartHerePageCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  lede: string;
  supporting: string;
  emptyMessage: string;
  nextEyebrow: string;
  nextHeading: string;
  nextLede: string;
};

export type ThemesPageCopy = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  heading: string;
  lede: string;
  emptyMessage: string;
  inDevelopmentLabel: string;
  relatedEyebrow: string;
  relatedHeading: string;
  relatedPathways: LinkedText[];
  defaultPlaceholderMessage: string;
  featuredHeading: string;
  moreHeading: string;
  worksHeading: string;
};

export const THEME_RELATED_HREFS: Readonly<Record<string, string>> = {
  "start-here": "/start-here",
  library: "/library",
  explore: "/explore",
};

export type FooterCopy = {
  tagline: string;
};

export type CharterPageShell = {
  pageEyebrow: string;
  pageHeading: string;
  seoTitle: string;
  seoDescription: string;
};

function readLinkedItems(
  items: ReadonlyArray<{ key?: string | null; label?: string | null; text?: string | null }> | null | undefined,
  hrefMap: Readonly<Record<string, string>>,
  label: string
): LinkedText[] {
  if (!items?.length) throw new Error(`Page content missing required list: ${label}`);
  const out: LinkedText[] = [];
  for (const item of items) {
    const key = item.key?.trim() || "";
    const itemLabel = item.label?.trim() || "";
    const text = item.text?.trim() || "";
    if (!key || !hrefMap[key] || !itemLabel || !text) {
      throw new Error(`Page content has an incomplete ${label} item (key=${key || "missing"}).`);
    }
    out.push({ label: itemLabel, text });
  }
  return out;
}

function readLinkedKeys(
  items: ReadonlyArray<{ key?: string | null; label?: string | null; text?: string | null }> | null | undefined,
  hrefMap: Readonly<Record<string, string>>,
  label: string
): Array<LinkedText & { key: string }> {
  if (!items?.length) throw new Error(`Page content missing required list: ${label}`);
  return items.map((item) => {
    const key = item.key?.trim() || "";
    const itemLabel = item.label?.trim() || "";
    const text = item.text?.trim() || "";
    if (!key || !hrefMap[key] || !itemLabel || !text) {
      throw new Error(`Page content has an incomplete ${label} item (key=${key || "missing"}).`);
    }
    return { key, label: itemLabel, text };
  });
}

export async function getHomePageCopy(): Promise<HomePageCopy & { pathwaysWithHref: Array<LinkedText & { href: string }> }> {
  const data = await reader.singletons.homePage.read();
  if (!data) throw new Error("Homepage content is missing (content/pages/home.yaml).");
  const pathways = readLinkedKeys(data.pathways, HOME_PATHWAY_HREFS, "homepage pathways");
  return {
    seoTitle: requiredText(data.seoTitle, "home.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "home.seoDescription"),
    heroEyebrow: requiredText(data.heroEyebrow, "home.heroEyebrow"),
    heroHeading: requiredText(data.heroHeading, "home.heroHeading"),
    heroLede: requiredText(data.heroLede, "home.heroLede"),
    primaryCtaLabel: requiredText(data.primaryCtaLabel, "home.primaryCtaLabel"),
    secondaryCtaLabel: requiredText(data.secondaryCtaLabel, "home.secondaryCtaLabel"),
    pathwaysEyebrow: requiredText(data.pathwaysEyebrow, "home.pathwaysEyebrow"),
    pathwaysHeading: requiredText(data.pathwaysHeading, "home.pathwaysHeading"),
    pathwaysLede: requiredText(data.pathwaysLede, "home.pathwaysLede"),
    pathways: pathways.map(({ label, text }) => ({ label, text })),
    pathwaysWithHref: pathways.map((p) => ({
      label: p.label,
      text: p.text,
      href: HOME_PATHWAY_HREFS[p.key]!,
    })),
    featuredEyebrow: requiredText(data.featuredEyebrow, "home.featuredEyebrow"),
    featuredHeading: requiredText(data.featuredHeading, "home.featuredHeading"),
    featuredLede: requiredText(data.featuredLede, "home.featuredLede"),
    founderEyebrow: requiredText(data.founderEyebrow, "home.founderEyebrow"),
    founderHeading: requiredText(data.founderHeading, "home.founderHeading"),
    founderText: requiredText(data.founderText, "home.founderText"),
    founderCtaLabel: requiredText(data.founderCtaLabel, "home.founderCtaLabel"),
    charterHeading: requiredText(data.charterHeading, "home.charterHeading"),
    charterText: requiredText(data.charterText, "home.charterText"),
    charterCtaLabel: requiredText(data.charterCtaLabel, "home.charterCtaLabel"),
  };
}

export async function getExplorePageCopy(): Promise<
  ExplorePageCopy & { gatewaysWithHref: Array<LinkedText & { href: string }> }
> {
  const data = await reader.singletons.explorePage.read();
  if (!data) throw new Error("Explore page content is missing (content/pages/explore.yaml).");
  const gateways = readLinkedKeys(data.gateways, EXPLORE_GATEWAY_HREFS, "explore gateways");
  return {
    seoTitle: requiredText(data.seoTitle, "explore.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "explore.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "explore.eyebrow"),
    heading: requiredText(data.heading, "explore.heading"),
    lede: requiredText(data.lede, "explore.lede"),
    startHereLinkLabel: requiredText(data.startHereLinkLabel, "explore.startHereLinkLabel"),
    gateways: gateways.map(({ label, text }) => ({ label, text })),
    gatewaysWithHref: gateways.map((g) => ({
      label: g.label,
      text: g.text,
      href: EXPLORE_GATEWAY_HREFS[g.key]!,
    })),
    themesEyebrow: requiredText(data.themesEyebrow, "explore.themesEyebrow"),
    themesHeading: requiredText(data.themesHeading, "explore.themesHeading"),
    themesLede: requiredText(data.themesLede, "explore.themesLede"),
    themesCtaLabel: requiredText(data.themesCtaLabel, "explore.themesCtaLabel"),
    libraryEyebrow: requiredText(data.libraryEyebrow, "explore.libraryEyebrow"),
    libraryHeading: requiredText(data.libraryHeading, "explore.libraryHeading"),
    libraryLede: requiredText(data.libraryLede, "explore.libraryLede"),
    libraryCtaLabel: requiredText(data.libraryCtaLabel, "explore.libraryCtaLabel"),
  };
}

export async function getLibraryPageCopy(): Promise<LibraryPageCopy> {
  const data = await reader.singletons.libraryPage.read();
  if (!data) throw new Error("Library page content is missing (content/pages/library.yaml).");
  return {
    seoTitle: requiredText(data.seoTitle, "library.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "library.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "library.eyebrow"),
    heading: requiredText(data.heading, "library.heading"),
    lede: requiredText(data.lede, "library.lede"),
    emptyMessage: requiredText(data.emptyMessage, "library.emptyMessage"),
    originalNote: requiredText(data.originalNote, "library.originalNote"),
  };
}

export async function getTryPageCopy(): Promise<TryPageCopy> {
  const data = await reader.singletons.tryPage.read();
  if (!data) throw new Error("Try page content is missing (content/pages/try.yaml).");
  return {
    seoTitle: requiredText(data.seoTitle, "try.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "try.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "try.eyebrow"),
    heading: requiredText(data.heading, "try.heading"),
    lede: requiredText(data.lede, "try.lede"),
    emptyMessage: requiredText(data.emptyMessage, "try.emptyMessage"),
    externalCtaLabel: requiredText(data.externalCtaLabel, "try.externalCtaLabel"),
  };
}

export async function getMeetPageCopy(): Promise<MeetPageCopy> {
  const data = await reader.singletons.meetPage.read();
  if (!data) throw new Error("Meet page content is missing (content/pages/meet.yaml).");
  return {
    seoTitle: requiredText(data.seoTitle, "meet.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "meet.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "meet.eyebrow"),
    heading: requiredText(data.heading, "meet.heading"),
    lede: requiredText(data.lede, "meet.lede"),
    emptyMessage: requiredText(data.emptyMessage, "meet.emptyMessage"),
    intentHeading: requiredText(data.intentHeading, "meet.intentHeading"),
    intentText: requiredText(data.intentText, "meet.intentText"),
    charterCtaLabel: requiredText(data.charterCtaLabel, "meet.charterCtaLabel"),
  };
}

export async function getAboutPageCopy(): Promise<
  AboutPageCopy & { linksWithHref: Array<{ label: string; href: string; external: boolean }> }
> {
  const data = await reader.singletons.aboutPage.read();
  if (!data) throw new Error("About page content is missing (content/pages/about.yaml).");
  const ecosystem = (data.ecosystem ?? []).map((item) => ({
    label: requiredText(item.label, "about.ecosystem.label"),
    text: requiredText(item.text, "about.ecosystem.text"),
  }));
  if (ecosystem.length === 0) throw new Error("About page ecosystem list is empty.");
  const bioParagraphs = (data.bioParagraphs ?? [])
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  if (bioParagraphs.length === 0) throw new Error("About page bio paragraphs are missing.");
  const links = (data.links ?? []).map((item) => {
    const hrefKey = item.hrefKey?.trim() || "";
    const label = item.label?.trim() || "";
    if (!hrefKey || !ABOUT_LINK_HREFS[hrefKey] || !label) {
      throw new Error(`About page link is incomplete (hrefKey=${hrefKey || "missing"}).`);
    }
    return { label, hrefKey };
  });
  return {
    seoTitle: requiredText(data.seoTitle, "about.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "about.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "about.eyebrow"),
    heading: requiredText(data.heading, "about.heading"),
    lede: requiredText(data.lede, "about.lede"),
    ecosystemHeading: requiredText(data.ecosystemHeading, "about.ecosystemHeading"),
    ecosystem,
    bioHeading: requiredText(data.bioHeading, "about.bioHeading"),
    bioParagraphs,
    links,
    linksWithHref: links.map((link) => ({
      label: link.label,
      href: ABOUT_LINK_HREFS[link.hrefKey]!,
      external: /^https?:\/\//i.test(ABOUT_LINK_HREFS[link.hrefKey]!),
    })),
  };
}

export async function getStartHerePageCopy(): Promise<StartHerePageCopy> {
  const data = await reader.singletons.startHere.read();
  if (!data) throw new Error("Start Here content is missing (content/start-here.yaml).");
  return {
    seoTitle: requiredText(data.seoTitle, "startHere.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "startHere.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "startHere.eyebrow"),
    heading: requiredText(data.heading, "startHere.heading"),
    lede: requiredText(data.lede, "startHere.lede"),
    supporting: requiredText(data.supporting, "startHere.supporting"),
    emptyMessage: requiredText(data.emptyMessage, "startHere.emptyMessage"),
    nextEyebrow: requiredText(data.nextEyebrow, "startHere.nextEyebrow"),
    nextHeading: requiredText(data.nextHeading, "startHere.nextHeading"),
    nextLede: requiredText(data.nextLede, "startHere.nextLede"),
  };
}

export async function getThemesPageCopy(): Promise<
  ThemesPageCopy & { relatedPathwaysWithHref: Array<LinkedText & { href: string }> }
> {
  const data = await reader.singletons.themesPage.read();
  if (!data) throw new Error("Themes page content is missing (content/pages/themes.yaml).");
  const related = readLinkedKeys(data.relatedPathways, THEME_RELATED_HREFS, "theme related pathways");
  return {
    seoTitle: requiredText(data.seoTitle, "themes.seoTitle"),
    seoDescription: requiredText(data.seoDescription, "themes.seoDescription"),
    eyebrow: requiredText(data.eyebrow, "themes.eyebrow"),
    heading: requiredText(data.heading, "themes.heading"),
    lede: requiredText(data.lede, "themes.lede"),
    emptyMessage: requiredText(data.emptyMessage, "themes.emptyMessage"),
    inDevelopmentLabel: requiredText(data.inDevelopmentLabel, "themes.inDevelopmentLabel"),
    relatedEyebrow: requiredText(data.relatedEyebrow, "themes.relatedEyebrow"),
    relatedHeading: requiredText(data.relatedHeading, "themes.relatedHeading"),
    relatedPathways: related.map(({ label, text }) => ({ label, text })),
    relatedPathwaysWithHref: related.map((p) => ({
      label: p.label,
      text: p.text,
      href: THEME_RELATED_HREFS[p.key]!,
    })),
    defaultPlaceholderMessage: requiredText(
      data.defaultPlaceholderMessage,
      "themes.defaultPlaceholderMessage"
    ),
    featuredHeading: requiredText(data.featuredHeading, "themes.featuredHeading"),
    moreHeading: requiredText(data.moreHeading, "themes.moreHeading"),
    worksHeading: requiredText(data.worksHeading, "themes.worksHeading"),
  };
}

export async function getFooterCopy(): Promise<FooterCopy> {
  const data = await reader.singletons.siteFooter.read();
  if (!data) throw new Error("Footer content is missing (content/site/footer.yaml).");
  return {
    tagline: requiredText(data.tagline, "footer.tagline"),
  };
}

export async function getCharterPageShell(): Promise<CharterPageShell> {
  const data = await reader.singletons.communityCharter.read();
  if (!data) throw new Error("Community Charter is missing.");
  return {
    pageEyebrow: requiredText(data.pageEyebrow, "charter.pageEyebrow"),
    pageHeading: requiredText(data.pageHeading, "charter.pageHeading"),
    seoTitle: optionalText(data.seoTitle) || requiredText(data.pageHeading, "charter.pageHeading"),
    seoDescription:
      optionalText(data.seoDescription) || requiredText(data.description, "charter.description"),
  };
}
