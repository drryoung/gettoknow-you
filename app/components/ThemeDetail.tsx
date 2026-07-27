import type { ResolvedThemePage, Theme } from "../../content/loadThemes";
import type { Work } from "../../content/loadWorks";
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
}: {
  featured: Work[];
  works: Work[];
  showPlaceholder: boolean;
  placeholderMessage: string | null;
}) {
  if (showPlaceholder) {
    return (
      <ThemePlaceholder
        message={
          placeholderMessage?.trim() ||
          "This room is being developed. Material will appear here as it is published."
        }
      />
    );
  }

  const remaining = works.filter((work) => !featured.includes(work));

  return (
    <>
      {featured.length > 0 ? (
        <section className="theme-works" aria-labelledby="theme-featured-title">
          <h2 id="theme-featured-title" className="explore-section-title">
            Featured
          </h2>
          <LibraryGrid works={featured} emptyMessage="" />
        </section>
      ) : null}

      {remaining.length > 0 || featured.length === 0 ? (
        <section className="theme-works" aria-labelledby="theme-works-title">
          <h2 id="theme-works-title" className="explore-section-title">
            {featured.length > 0 ? "More in this theme" : "Works in this theme"}
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

export function ThemeRelatedPathways() {
  return (
    <section className="theme-pathways" aria-labelledby="theme-pathways-title">
      <p className="eyebrow">Pathways</p>
      <h2 id="theme-pathways-title" className="explore-section-title">
        Related pathways
      </h2>
      <ul className="theme-pathways__list">
        <li>
          <a href="/start-here">Start Here</a>
          <p>A guided entry into the commons.</p>
        </li>
        <li>
          <a href="/library">Library</a>
          <p>Every published work in one place.</p>
        </li>
        <li>
          <a href="/explore">Explore</a>
          <p>Collections and visitor pathways.</p>
        </li>
      </ul>
    </section>
  );
}

export function ThemeDetail({ theme }: { theme: ResolvedThemePage }) {
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
      />

      <ThemeRelatedPathways />
    </article>
  );
}
