import type { Metadata } from "next";
import { getStartHereWorks } from "../../content/loadWorks";
import { getStartHerePageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getStartHerePageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function StartHerePage() {
  const [copy, works] = await Promise.all([getStartHerePageCopy(), getStartHereWorks()]);

  return (
    <main>
      <SiteHeader current="/start-here" />

      <section className="screen shell explore-intro" aria-labelledby="start-here-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="start-here-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
        <p className="section-lede">{copy.supporting}</p>
      </section>

      <section className="screen shell explore" aria-label="Curated Start Here works">
        <WorkList works={works} emptyMessage={copy.emptyMessage} />
      </section>

      <section className="screen shell explore-archive" aria-labelledby="start-here-next-title">
        <p className="eyebrow">{copy.nextEyebrow}</p>
        <h2 id="start-here-next-title" className="explore-section-title">
          {copy.nextHeading}
        </h2>
        <p className="section-lede">{copy.nextLede}</p>
        <p className="welcome-hero__actions">
          <a className="action-link action-link--primary" href="/explore">
            Explore
          </a>
          <a className="action-link" href="/library">
            Library
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
