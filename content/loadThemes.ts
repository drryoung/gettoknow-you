/**
 * Theme loader — editorial “rooms” that curate existing works.
 *
 * Themes are separate Markdoc records (content/themes/*). Works remain the sole
 * source of individual material and reference themes by stable slug via
 * `themes` on each work. Public work eligibility is reused from loadWorks.
 *
 * Slug changes: title edits do not rewrite slugs. Deliberate slug changes need a
 * one-hop redirect in next.config.mjs (no automatic slug migration in this layer).
 */
import { createReader } from "@keystatic/core/reader";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import path from "path";
import keystaticConfig from "../keystatic.config";
import { isThemeId } from "./themeIds";
import {
  getListedWorks,
  isPubliclyEligible,
  markdocNodeHasContent,
  selectPublicWorks,
  type Work,
} from "./loadWorks";

const reader = createReader(path.join(process.cwd()), keystaticConfig);

export const THEME_STATUSES = ["draft", "placeholder", "published"] as const;
export type ThemeStatus = (typeof THEME_STATUSES)[number];

export type Theme = {
  slug: string;
  title: string;
  status: ThemeStatus;
  summary: string;
  placeholderMessage: string | null;
  coverImage: string | null;
  featuredWorks: string[];
  order: number;
  showInNavigation: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  /** True when the Markdoc introduction body has content. */
  hasIntroduction: boolean;
  themePath: string;
};

export type ThemeDetail = Theme & {
  introduction: RenderableTreeNode | null;
};

export type ResolvedThemePage = ThemeDetail & {
  featured: Work[];
  works: Work[];
};

function isThemeStatus(value: string): value is ThemeStatus {
  return (THEME_STATUSES as readonly string[]).includes(value);
}

function normalizeMediaPath(value: string | null | undefined): string | null {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return null;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  if (trimmed.startsWith("/keystatic") || trimmed.startsWith("/api/")) return null;
  return trimmed;
}

function normalizeFeaturedSlugs(values: ReadonlyArray<string | null> | null | undefined): string[] {
  if (!values) return [];
  const out: string[] = [];
  for (const value of values) {
    const slug = value?.trim();
    if (slug && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export function normalizeTheme(input: {
  slug: string;
  title?: string | null;
  status?: string | null;
  summary?: string | null;
  placeholderMessage?: string | null;
  coverImage?: string | null;
  featuredWorks?: ReadonlyArray<string | null> | null;
  order?: number | null;
  showInNavigation?: boolean | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  hasIntroduction?: boolean | null;
}): Theme | null {
  const title = input.title?.trim();
  const summary = input.summary?.trim();
  const statusRaw = input.status?.trim() ?? "";
  if (!title || !summary || !isThemeStatus(statusRaw)) return null;

  const order =
    typeof input.order === "number" && Number.isFinite(input.order) ? input.order : 100;

  return {
    slug: input.slug,
    title,
    status: statusRaw,
    summary,
    placeholderMessage: input.placeholderMessage?.trim() || null,
    coverImage: normalizeMediaPath(input.coverImage),
    featuredWorks: normalizeFeaturedSlugs(input.featuredWorks),
    order,
    showInNavigation: input.showInNavigation === true,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    hasIntroduction: input.hasIntroduction === true,
    themePath: `/themes/${input.slug}`,
  };
}

/** Public themes: placeholder or published. Draft themes stay private. */
export function isPublicTheme(theme: Theme): boolean {
  return theme.status === "placeholder" || theme.status === "published";
}

export function selectPublicThemes(themes: readonly Theme[]): Theme[] {
  return themes
    .filter(isPublicTheme)
    .slice()
    .sort((a, b) => {
      const byOrder = a.order - b.order;
      if (byOrder !== 0) return byOrder;
      return a.title.localeCompare(b.title);
    });
}

export function selectNavThemes(themes: readonly Theme[]): Theme[] {
  return selectPublicThemes(themes).filter((theme) => theme.showInNavigation);
}

/**
 * Resolve works for a theme: explicit featured first (eligible only), then
 * remaining public works that reference the theme slug. Deduplicated.
 */
export function selectThemeWorks(
  works: readonly Work[],
  theme: Pick<Theme, "slug" | "featuredWorks">
): { featured: Work[]; works: Work[] } {
  const publicWorks = selectPublicWorks(works);
  const bySlug = new Map(publicWorks.map((work) => [work.slug, work]));

  const featured: Work[] = [];
  for (const slug of theme.featuredWorks) {
    const work = bySlug.get(slug);
    if (work && !featured.includes(work)) featured.push(work);
  }

  const associated = publicWorks
    .filter((work) => work.themes.includes(theme.slug) && !featured.includes(work))
    .slice()
    .sort((a, b) => {
      const aDate = a.publishedDate ?? a.date;
      const bDate = b.publishedDate ?? b.date;
      const byDate = bDate.localeCompare(aDate);
      if (byDate !== 0) return byDate;
      return a.slug.localeCompare(b.slug);
    });

  return { featured, works: [...featured, ...associated] };
}

type RawThemeEntry = {
  slug: string;
  entry: {
    title: unknown;
    status: string;
    summary: string | null;
    placeholderMessage?: string | null;
    coverImage?: string | null;
    featuredWorks?: ReadonlyArray<string | null> | null;
    order?: number | null;
    showInNavigation?: boolean | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    body: () => Promise<{ node?: unknown } | null>;
  };
};

function themeTitle(entry: RawThemeEntry["entry"]): string | null {
  if (typeof entry.title === "string") return entry.title;
  if (
    entry.title &&
    typeof entry.title === "object" &&
    "name" in (entry.title as object) &&
    typeof (entry.title as { name?: unknown }).name === "string"
  ) {
    return (entry.title as { name: string }).name;
  }
  return null;
}

async function readAllThemes(): Promise<Theme[]> {
  const entries = (await reader.collections.themes.all()) as RawThemeEntry[];
  const themes: Theme[] = [];

  for (const { slug, entry } of entries) {
    let hasIntroduction = false;
    try {
      const bodyEntry = await entry.body();
      hasIntroduction = markdocNodeHasContent(bodyEntry?.node);
    } catch {
      hasIntroduction = false;
    }

    const theme = normalizeTheme({
      slug,
      title: themeTitle(entry),
      status: entry.status,
      summary: entry.summary,
      placeholderMessage: entry.placeholderMessage,
      coverImage: entry.coverImage,
      featuredWorks: entry.featuredWorks,
      order: entry.order,
      showInNavigation: entry.showInNavigation,
      seoTitle: entry.seoTitle,
      seoDescription: entry.seoDescription,
      hasIntroduction,
    });
    if (theme) themes.push(theme);
  }

  return themes;
}

export async function getPublicThemes(): Promise<Theme[]> {
  return selectPublicThemes(await readAllThemes());
}

export async function getNavThemes(): Promise<Theme[]> {
  return selectNavThemes(await readAllThemes());
}

export async function getThemeBySlug(slug: string): Promise<ThemeDetail | null> {
  const entry = await reader.collections.themes.read(slug);
  if (!entry) return null;

  let introduction: RenderableTreeNode | null = null;
  let hasIntroduction = false;
  try {
    const bodyEntry = await entry.body();
    const node = bodyEntry?.node ?? null;
    hasIntroduction = markdocNodeHasContent(node);
    if (hasIntroduction && node) {
      introduction = Markdoc.transform(
        node as unknown as Parameters<typeof Markdoc.transform>[0]
      ) as RenderableTreeNode;
    }
  } catch {
    introduction = null;
    hasIntroduction = false;
  }

  const theme = normalizeTheme({
    slug,
    title: themeTitle(entry as RawThemeEntry["entry"]),
    status: entry.status,
    summary: entry.summary,
    placeholderMessage: entry.placeholderMessage,
    coverImage: entry.coverImage,
    featuredWorks: entry.featuredWorks,
    order: entry.order,
    showInNavigation: entry.showInNavigation,
    seoTitle: entry.seoTitle,
    seoDescription: entry.seoDescription,
    hasIntroduction,
  });

  if (!theme || !isPublicTheme(theme)) return null;
  return { ...theme, introduction };
}

export async function getResolvedThemePage(slug: string): Promise<ResolvedThemePage | null> {
  const theme = await getThemeBySlug(slug);
  if (!theme) return null;
  const listed = await getListedWorks();
  // getListedWorks already returns public works; selectThemeWorks re-filters safely.
  const { featured, works } = selectThemeWorks(listed, theme);
  return { ...theme, featured, works };
}

export async function getPublicThemeSlugs(): Promise<string[]> {
  return (await getPublicThemes()).map((theme) => theme.slug);
}

/** Resolve theme slugs to current public theme records (unknown/draft omitted). */
export async function resolveThemesForWork(themeSlugs: readonly string[]): Promise<Theme[]> {
  if (themeSlugs.length === 0) return [];
  const bySlug = new Map((await getPublicThemes()).map((theme) => [theme.slug, theme]));
  const resolved: Theme[] = [];
  for (const slug of themeSlugs) {
    const theme = bySlug.get(slug);
    if (theme && !resolved.includes(theme)) resolved.push(theme);
  }
  return resolved;
}

/** Normalize work.themes field: keep known theme ids only. */
export function normalizeWorkThemes(
  values: ReadonlyArray<string | null> | null | undefined
): string[] {
  if (!values) return [];
  const out: string[] = [];
  for (const value of values) {
    const slug = value?.trim();
    if (slug && isThemeId(slug) && !out.includes(slug)) out.push(slug);
  }
  return out;
}

export { isPubliclyEligible };
