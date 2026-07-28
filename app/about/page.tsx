import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { InfluencesBody } from "../components/InfluencesBody";
import { getAboutInfluences } from "../../content/loadAboutInfluences";
import { getAboutPageCopy } from "../../content/loadPages";

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getAboutPageCopy();
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
  };
}

export default async function AboutPage() {
  const [copy, influences] = await Promise.all([getAboutPageCopy(), getAboutInfluences()]);

  return (
    <main>
      <SiteHeader current="/about" />

      <section className="screen shell explore-intro" aria-labelledby="about-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="about-title">{copy.heading}</h1>
        <p className="explore-intro__lede">{copy.lede}</p>
      </section>

      <section className="screen shell about-ecosystem" aria-labelledby="ecosystem-title">
        <h2 id="ecosystem-title">{copy.ecosystemHeading}</h2>
        <ul className="ecosystem-list">
          {copy.ecosystem.map((item) => (
            <li key={item.label} className="ecosystem-list__item">
              <h3>{item.label}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="screen shell about-bio" aria-labelledby="raymond-title">
        <h2 id="raymond-title">{copy.bioHeading}</h2>
        {copy.bioParagraphs.map((paragraph, index) => (
          <p key={index} className="section-lede">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="screen shell about-influences" aria-labelledby="influences">
        <InfluencesBody body={influences.body} />
      </section>

      <section className="screen shell about-links" aria-label="Related links">
        <ul className="link-list">
          {copy.linksWithHref.map((link) => (
            <li key={link.href}>
              <a href={link.href} {...(link.external ? { rel: "noopener noreferrer" } : {})}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
