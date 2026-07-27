import type { Metadata } from "next";
import { getNavThemes, getPublicThemes } from "../../content/loadThemes";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeGrid, ThemeNavigation } from "../components/ThemeGrid";

export const metadata: Metadata = {
  title: "Themes",
  description:
    "Editorial rooms in the GetToKnow.You commons—conversation, culture, language, trust, and building the site.",
};

export default async function ThemesPage() {
  const themes = await getPublicThemes();
  const navThemes = await getNavThemes();

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="themes-title">
        <p className="eyebrow">Public commons</p>
        <h1 id="themes-title">Themes</h1>
        <p className="explore-intro__lede">
          Rooms for exploring published work by thread—some already gathering material, others still
          being framed.
        </p>
        <ThemeNavigation themes={navThemes} />
      </section>

      <section className="screen shell themes-index" aria-label="Theme rooms">
        <ThemeGrid themes={themes} />
      </section>

      <SiteFooter />
    </main>
  );
}
