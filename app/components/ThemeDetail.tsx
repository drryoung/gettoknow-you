import type { ResolvedThemePage, Theme } from "../../content/loadThemes";
import type { Work } from "../../content/loadWorks";
import { getThemesPageCopy } from "../../content/loadPages";
import { LibraryGrid } from "./LibraryGrid";
import { WorkBody } from "./WorkBody";

export function ThemeHeader({ theme }: { theme: Theme }) {
  return (
    <header className="theme-detail__header">
      <p className="eyebrow">
        <a href="/themes">Themes</a>
      </p>
      <h1 id="theme-title">{theme.title}</h1>
      <p className="theme-detail__summary">{theme.summary}</p>
    </header>
  );
}

export function ThemePlaceholder({ message }: { message: string }) {
  return (
    <div className="theme-placeholder" role="status">
      <p className="theme-placeholder__message">{message}</p>
    </div>
  );
}

export function ThemeWorkGrid({
  featured,
  works,
  showPlaceholder,
  placeholderMessage,
  defaultPlaceholderMessage,
  featuredHeading,
  moreHeading,
  worksHeading,
}: {
  featured: Work[];
  works: Work[];
  showPlaceholder: boolean;
  placeholderMessage: string | null;
  defaultPlaceholderMessage: string;
  featuredHeading: string;
  moreHeading: string;
  worksHeading: string;
}) {
  if (showPlaceholder) {
    return (
      <ThemePlaceholder
        message={placeholderMessage?.trim() || defaultPlaceholderMessage}
      />
    );
  }

  const remaining = works.filter((work) => !featured.includes(work));

  return (
    <>
      {featured.length > 0 ? (
        <section className="theme-works" aria-labelledby="theme-featured-title">
          <h2 id="theme-featured-title" className="explore-section-title">
            {featuredHeading}
          </h2>
          <LibraryGrid works={featured} emptyMessage="" />
        </section>
      ) : null}

      {remaining.length > 0 || featured.length === 0 ? (
        <section className="theme-works" aria-labelledby="theme-works-title">
          <h2 id="theme-works-title" className="explore-section-title">
            {featured.length > 0 ? moreHeading : worksHeading}
          </h2>
          <LibraryGrid
            works={featured.length > 0 ? remaining : works}
            emptyMessage=""
          />
        </section>
      ) : null}
    </>
  );
}

export function ThemeRelatedPathways({
  eyebrow,
  heading,
  pathways,
}: {
  eyebrow: string;
  heading: string;
  pathways: Array<{ href: string; label: string; text: string }>;
}) {
  return (
    <section className="theme-pathways" aria-labelledby="theme-pathways-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id="theme-pathways-title" className="explore-section-title">
        {heading}
      </h2>
      <ul className="theme-pathways__list">
        {pathways.map((pathway) => (
          <li key={pathway.href}>
            <a href={pathway.href}>{pathway.label}</a>
            <p>{pathway.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function ThemeDetail({ theme }: { theme: ResolvedThemePage }) {
  const copy = await getThemesPageCopy();
  const showPlaceholder = theme.works.length === 0;
  const cover = theme.coverImage;

  return (
    <article className="theme-detail" aria-labelledby="theme-title">
      <ThemeHeader theme={theme} />

      {cover ? (
        <div className="theme-detail__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" role="presentation" />
        </div>
      ) : null}

      {theme.introduction ? (
        <div className="theme-detail__introduction">
          <WorkBody body={theme.introduction} />
        </div>
      ) : null}

      <ThemeWorkGrid
        featured={theme.featured}
        works={theme.works}
        showPlaceholder={showPlaceholder}
        placeholderMessage={theme.placeholderMessage}
        defaultPlaceholderMessage={copy.defaultPlaceholderMessage}
        featuredHeading={copy.featuredHeading}
        moreHeading={copy.moreHeading}
        worksHeading={copy.worksHeading}
      />

      <ThemeRelatedPathways
        eyebrow={copy.relatedEyebrow}
        heading={copy.relatedHeading}
        pathways={copy.relatedPathwaysWithHref}
      />
    </article>
  );
}
