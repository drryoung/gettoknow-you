import type { Metadata } from "next";
import { getPathwayWorks } from "../../content/sitePathways";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Meet",
  description:
    "The emerging GetToKnow.You community, future gatherings, and the shared Community Charter.",
};

export default async function MeetPage() {
  const works = await getPathwayWorks("meet");

  return (
    <main>
      <SiteHeader current="/meet" />

      <section className="screen shell explore-intro" aria-labelledby="meet-title">
        <p className="eyebrow">Community</p>
        <h1 id="meet-title">Meet</h1>
        <p className="explore-intro__lede">
          GetToKnow.You exists so people can encounter and know one another more deeply. The
          community is emerging—there is no registration form here, and no claim of live events or
          member rooms until they truly exist.
        </p>
      </section>

      <section className="screen shell meet-intent" aria-labelledby="meet-intent-title">
        <h2 id="meet-intent-title">What this may become</h2>
        <p className="section-lede">
          Over time, Meet may hold conversations, workshops, and community experiments. Until then,
          this page is an honest place to understand the intention and the shared foundation.
        </p>
        <p className="section-link">
          <a href="/charter">Read the Community Charter</a>
        </p>
      </section>

      <section className="screen shell explore" aria-label="Community foundations">
        <WorkList
          works={works}
          emptyMessage="Community foundations will appear here as they are added to the commons."
          primaryLabel="Open foundation"
        />
      </section>

      <SiteFooter />
    </main>
  );
}
