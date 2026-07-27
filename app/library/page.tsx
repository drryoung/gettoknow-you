import type { Metadata } from "next";
import { getPublicLibraryWorks } from "../../content/loadWorks";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { LibraryGrid } from "../components/LibraryGrid";

export const metadata: Metadata = {
  title: "Library",
  description:
    "The GetToKnow.You content library—published articles, stories, and videos hosted on this site.",
};

export default async function LibraryPage() {
  const works = await getPublicLibraryWorks();

  return (
    <main>
      <SiteHeader current="/library" />

      <section className="screen shell explore-intro" aria-labelledby="library-title">
        <p className="eyebrow">Published works</p>
        <h1 id="library-title">Library</h1>
        <p className="explore-intro__lede">
          The permanent home for GetToKnow.You content. Read and watch here without a social login.
          Xiaohongshu, Instagram, and Substack remain optional discovery links when they exist.
        </p>
      </section>

      <section className="screen shell library-index" aria-label="Library items">
        <LibraryGrid
          works={works}
          emptyMessage="Published library items will appear here as they are added."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
