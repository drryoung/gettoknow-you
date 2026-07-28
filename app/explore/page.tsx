import type { Metadata } from "next";
import { getNavThemes } from "../../content/loadThemes";
import { getExplorePageCopy, getThemesPageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeGrid } from "../components/ThemeGrid";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getExplorePageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function ExplorePage() {
  const [copy, navThemes, themesCopy] = await Promise.all([
    getExplorePageCopy(),
    getNavThemes(),
    getThemesPageCopy(),
  ]);

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="explore-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="explore-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
        <p className="section-link">
          <a className="action-link" href="/start-here">
            {copy.startHereLinkLabel}
          </a>
        </p>
      </section>

      <section className="screen shell explore-gateways" aria-label="Visitor pathways">
        <ul className="gateway-list">
          {copy.gatewaysWithHref.map((item) => (
            <li key={item.href} className="gateway-list__item">
              <h2 className="gateway-list__title">
                <a href={item.href}>{item.label}</a>
              </h2>
              <p className="gateway-list__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {navThemes.length > 0 ? (
        <section className="screen shell explore-themes" aria-labelledby="themes-title">
          <p className="eyebrow">{copy.themesEyebrow}</p>
          <h2 id="themes-title" className="explore-section-title">
            {copy.themesHeading}
          </h2>
          <p className="section-lede">{copy.themesLede}</p>
          <ThemeGrid
            themes={navThemes}
            emptyMessage={themesCopy.emptyMessage}
            inDevelopmentLabel={themesCopy.inDevelopmentLabel}
          />
          <p className="section-link">
            <a className="action-link" href="/themes">
              {copy.themesCtaLabel}
            </a>
          </p>
        </section>
      ) : null}

      <section className="screen shell explore-archive" aria-labelledby="library-title">
        <p className="eyebrow">{copy.libraryEyebrow}</p>
        <h2 id="library-title" className="explore-section-title">
          {copy.libraryHeading}
        </h2>
        <p className="section-lede">{copy.libraryLede}</p>
        <a className="action-link" href="/library">
          {copy.libraryCtaLabel}
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
