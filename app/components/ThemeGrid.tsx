import type { Theme } from "../../content/loadThemes";

export function ThemeCard({
  theme,
  inDevelopmentLabel,
}: {
  theme: Theme;
  inDevelopmentLabel: string;
}) {
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
          {inDevelopment ? <p className="theme-card__status">{inDevelopmentLabel}</p> : null}
          <h2 className="theme-card__title">{theme.title}</h2>
          <p className="theme-card__summary">{theme.summary}</p>
        </div>
      </a>
    </li>
  );
}

export function ThemeGrid({
  themes,
  emptyMessage,
  inDevelopmentLabel,
}: {
  themes: Theme[];
  emptyMessage: string;
  inDevelopmentLabel: string;
}) {
  if (themes.length === 0) {
    return emptyMessage ? <p className="explore-empty">{emptyMessage}</p> : null;
  }

  return (
    <ul className="theme-grid">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.slug}
          theme={theme}
          inDevelopmentLabel={inDevelopmentLabel}
        />
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
