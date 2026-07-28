import type { Metadata } from "next";
import { getPathwayWorks } from "../../content/sitePathways";
import { getMeetPageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getMeetPageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function MeetPage() {
  const [copy, works] = await Promise.all([getMeetPageCopy(), getPathwayWorks("meet")]);

  return (
    <main>
      <SiteHeader current="/meet" />

      <section className="screen shell explore-intro" aria-labelledby="meet-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="meet-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
      </section>

      <section className="screen shell meet-intent" aria-labelledby="meet-intent-title">
        <h2 id="meet-intent-title">{copy.intentHeading}</h2>
        <p className="section-lede">{copy.intentText}</p>
        <p className="section-link">
          <a href="/charter">{copy.charterCtaLabel}</a>
        </p>
      </section>

      <section className="screen shell explore" aria-label="Community foundations">
        <WorkList works={works} emptyMessage={copy.emptyMessage} />
      </section>

      <SiteFooter />
    </main>
  );
}
