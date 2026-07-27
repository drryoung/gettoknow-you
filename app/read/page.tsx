import type { Metadata } from "next";
import { getReadLibraryWorks } from "../../content/sitePathways";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Read",
  description:
    "The published library of GetToKnow.You—essays, stories, summaries, and references.",
};

export default async function ReadPage() {
  const works = await getReadLibraryWorks();

  return (
    <main>
      <SiteHeader current="/read" />

      <section className="screen shell explore-intro" aria-labelledby="read-title">
        <p className="eyebrow">Published library</p>
        <h1 id="read-title">Read</h1>
        <p className="explore-intro__lede">
          The complete published library—hosted essays, internal summaries, and annotated
          references. Every card opens its work page on GetToKnow.You so you can read the central
          idea without a social login.
        </p>
      </section>

      <section className="screen shell explore" aria-label="Published works">
        <WorkList
          works={works}
          emptyMessage="Published works will appear here as they are added to the commons."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
