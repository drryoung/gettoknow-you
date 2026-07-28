import type { Metadata } from "next";
import { getNavThemes, getPublicThemes } from "../../content/loadThemes";
import { getThemesPageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeGrid, ThemeNavigation } from "../components/ThemeGrid";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getThemesPageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function ThemesPage() {
  const [copy, themes, navThemes] = await Promise.all([
    getThemesPageCopy(),
    getPublicThemes(),
    getNavThemes(),
  ]);

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="themes-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="themes-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
        <ThemeNavigation themes={navThemes} />
      </section>

      <section className="screen shell themes-index" aria-label="Theme rooms">
        <ThemeGrid
          themes={themes}
          emptyMessage={copy.emptyMessage}
          inDevelopmentLabel={copy.inDevelopmentLabel}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
