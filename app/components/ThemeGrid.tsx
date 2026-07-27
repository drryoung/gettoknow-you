import type { Theme } from "../../content/loadThemes";

export function ThemeCard({ theme }: { theme: Theme }) {
  const cover = theme.coverImage;
  const inDevelopment = theme.status === "placeholder";

  return (
    <li className="theme-card">
      <a className="theme-card__link" href={theme.themePath}>
        <div className="theme-card__media">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- editorial paths
            <img src={cover} alt="" role="presentation" />
          ) : (
            <div className="theme-card__media-fallback" aria-hidden="true" />
          )}
        </div>
        <div className="theme-card__body">
          {inDevelopment ? (
            <p className="theme-card__status">A room in development</p>
          ) : null}
          <h2 className="theme-card__title">{theme.title}</h2>
          <p className="theme-card__summary">{theme.summary}</p>
        </div>
      </a>
    </li>
  );
}

export function ThemeGrid({ themes }: { themes: Theme[] }) {
  if (themes.length === 0) {
    return <p className="explore-empty">Public theme rooms will appear here as they are opened.</p>;
  }

  return (
    <ul className="theme-grid">
      {themes.map((theme) => (
        <ThemeCard key={theme.slug} theme={theme} />
      ))}
    </ul>
  );
}

export function ThemeNavigation({ themes }: { themes: Theme[] }) {
  if (themes.length === 0) return null;

  return (
    <nav className="theme-nav" aria-label="Theme rooms">
      <ul className="theme-nav__list">
        {themes.map((theme) => (
          <li key={theme.slug}>
            <a href={theme.themePath}>{theme.title}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
