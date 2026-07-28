import type { Metadata } from "next";
import { getPathwayWorks } from "../../content/sitePathways";
import { getTryPageCopy } from "../../content/loadPages";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getTryPageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function TryPage() {
  const [copy, works] = await Promise.all([getTryPageCopy(), getPathwayWorks("try")]);

  return (
    <main>
      <SiteHeader current="/try" />

      <section className="screen shell explore-intro" aria-labelledby="try-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="try-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
        <p className="section-link">
          <a href="https://www.mandarinos.app/" rel="noopener noreferrer">
            {copy.externalCtaLabel}
          </a>
        </p>
      </section>

      <section className="screen shell explore" aria-label="Works to try">
        <WorkList works={works} emptyMessage={copy.emptyMessage} />
      </section>

      <SiteFooter />
    </main>
  );
}
