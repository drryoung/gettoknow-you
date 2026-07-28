import type { Metadata } from "next";
import { getHomepageFeatured } from "../content/sitePathways";
import { getHomePageCopy } from "../content/loadPages";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Thread } from "./components/Thread";
import { WorkList } from "./components/WorkList";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getHomePageCopy();
  return {
    title: { absolute: copy.seoTitle },
    description: copy.seoDescription,
  };
}

export default async function Home() {
  const [copy, featured] = await Promise.all([getHomePageCopy(), getHomepageFeatured()]);

  return (
    <main>
      <SiteHeader />

      <section className="screen shell welcome-hero" aria-labelledby="welcome-title">
        <Thread className="hero-thread" />
        <div className="welcome-hero__copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1 id="welcome-title">{copy.heroHeading}</h1>
          <p className="welcome-hero__lede">{copy.heroLede}</p>
          <p className="welcome-hero__actions">
            <a className="action-link action-link--primary" href="/start-here">
              {copy.primaryCtaLabel}
            </a>
            <a className="action-link" href="/explore">
              {copy.secondaryCtaLabel}
            </a>
          </p>
        </div>
      </section>

      <section className="screen shell pathways" aria-labelledby="pathways-title">
        <p className="eyebrow">{copy.pathwaysEyebrow}</p>
        <h2 id="pathways-title">{copy.pathwaysHeading}</h2>
        <p className="section-lede">{copy.pathwaysLede}</p>
        <ul className="pathway-list">
          {copy.pathwaysWithHref.map((pathway) => (
            <li key={pathway.href} className="pathway-list__item">
              <h3 className="pathway-list__title">
                <a href={pathway.href}>{pathway.label}</a>
              </h3>
              <p className="pathway-list__text">{pathway.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 ? (
        <section className="screen shell featured" aria-labelledby="featured-title">
          <p className="eyebrow">{copy.featuredEyebrow}</p>
          <h2 id="featured-title">{copy.featuredHeading}</h2>
          <p className="section-lede">{copy.featuredLede}</p>
          <WorkList works={featured} emptyMessage="" />
        </section>
      ) : null}

      <section className="screen shell about-preview" aria-labelledby="about-preview-title">
        <p className="eyebrow">{copy.founderEyebrow}</p>
        <h2 id="about-preview-title">{copy.founderHeading}</h2>
        <p className="section-lede about-preview__text">{copy.founderText}</p>
        <p className="section-link">
          <a href="/about">{copy.founderCtaLabel}</a>
        </p>
      </section>

      <section className="screen shell charter-note" aria-labelledby="charter-note-title">
        <h2 id="charter-note-title" className="charter-note__heading">
          {copy.charterHeading}
        </h2>
        <p className="charter-note__text">{copy.charterText}</p>
        <p className="section-link">
          <a href="/charter">{copy.charterCtaLabel}</a>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
