import type { Metadata } from "next";
import { getArchiveWorks } from "../../../content/loadWorks";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { WorkList } from "../../components/WorkList";

export const metadata: Metadata = {
  title: "Archive",
  description: "The complete, reverse-chronological index of the GetToKnow.You content library.",
};

export default async function ArchivePage() {
  const works = await getArchiveWorks();

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="archive-page-title">
        <p className="eyebrow">
          <a href="/explore">Explore</a> · Archive
        </p>
        <h1 id="archive-page-title">Archive</h1>
        <p className="explore-intro__lede">
          The complete library, newest first. This includes everything that has been published or
          retained for the record—not just the curated Start Here sequence or collections.
        </p>
      </section>

      <section className="screen shell explore" aria-label="Complete archive">
        <WorkList
          works={works}
          emptyMessage="The archive is empty for now. Published works will be listed here as they are added."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
