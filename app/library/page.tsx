import type { Metadata } from "next";
import { getPublicLibraryWorks } from "../../content/loadWorks";
import { getLibraryPageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { LibraryGrid } from "../components/LibraryGrid";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getLibraryPageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function LibraryPage() {
  const [copy, works] = await Promise.all([getLibraryPageCopy(), getPublicLibraryWorks()]);

  return (
    <main>
      <SiteHeader current="/library" />

      <section className="screen shell explore-intro" aria-labelledby="library-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="library-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
      </section>

      <section className="screen shell library-index" aria-label="Library items">
        <LibraryGrid works={works} emptyMessage={copy.emptyMessage} />
      </section>

      <SiteFooter />
    </main>
  );
}
