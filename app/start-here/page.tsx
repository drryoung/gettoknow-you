import type { Metadata } from "next";
import { getStartHereWorks } from "../../content/loadWorks";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Start Here",
  description:
    "Begin with the stories and ideas behind GetToKnow.You, ConversationOS, and the belief that better conversations create stronger relationships.",
};

export default async function StartHerePage() {
  const works = await getStartHereWorks();

  return (
    <main>
      <SiteHeader current="/start-here" />

      <section className="screen shell explore-intro" aria-labelledby="start-here-title">
        <p className="eyebrow">A place to begin</p>
        <h1 id="start-here-title">Start Here</h1>
        <p className="explore-intro__lede">
          GetToKnow.You explores how better conversations create stronger relationships.
        </p>
        <p className="section-lede">
          Conversation is the mechanism. Relationships are the destination. Start with a few stories
          and ideas that explain where this project came from and what it is trying to build.
        </p>
      </section>

      <section className="screen shell explore" aria-label="Curated Start Here works">
        <WorkList
          works={works}
          emptyMessage="The curated Start Here sequence is still being assembled."
          primaryLabel="Open"
        />
      </section>

      <section className="screen shell explore-archive" aria-labelledby="start-here-next-title">
        <p className="eyebrow">What next</p>
        <h2 id="start-here-next-title" className="explore-section-title">
          These are the ideas behind GetToKnow.You
        </h2>
        <p className="section-lede">
          From here, you can explore more stories, read longer pieces, or try a working conversation
          practice through MandarinOS.
        </p>
        <p className="welcome-hero__actions">
          <a className="action-link action-link--primary" href="/explore">
            Explore
          </a>
          <a className="action-link" href="/read">
            Read
          </a>
          <a className="action-link" href="/try">
            Try
          </a>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
