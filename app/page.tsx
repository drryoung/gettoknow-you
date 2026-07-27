import type { Metadata } from "next";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { Thread } from "./components/Thread";
import { getHomepageFeatured } from "../content/sitePathways";
import type { Work } from "../content/loadWorks";

export const metadata: Metadata = {
  title: {
    absolute: "GetToKnow.You — Better conversations, deeper relationships",
  },
  description:
    "A public commons for meaningful conversation and relationship—ideas to read, things to try, and an emerging community.",
};

const PATHWAYS = [
  {
    href: "/explore",
    label: "Explore",
    text: "A guided introduction to the ideas, stories, projects, and emerging community.",
  },
  {
    href: "/read",
    label: "Read",
    text: "Essays, reflections, stories, and ConversationOS thinking—plus room for future writing and social references.",
  },
  {
    href: "/try",
    label: "Try",
    text: "MandarinOS, ConversationOS practices, and future workshops or experiments you can put into use.",
  },
  {
    href: "/meet",
    label: "Meet",
    text: "The emerging community, future conversations and gatherings, and the shared Community Charter.",
  },
  {
    href: "/about",
    label: "About",
    text: "Raymond Young, why he is building GetToKnow.You, and how ConversationOS and MandarinOS fit together.",
  },
] as const;

function FeaturedWork({ work }: { work: Work }) {
  const isPublished = work.publicationState === "published";
  return (
    <li className="featured-list__item">
      <h3 className="featured-list__title">
        {isPublished ? <a href={work.href}>{work.title}</a> : work.title}
      </h3>
      <p className="featured-list__summary">{work.summary}</p>
      {!isPublished ? (
        <p className="featured-list__state">In development</p>
      ) : null}
    </li>
  );
}

export default async function Home() {
  const featured = await getHomepageFeatured();

  return (
    <main>
      <SiteHeader />

      <section className="screen shell welcome-hero" aria-labelledby="welcome-title">
        <Thread className="hero-thread" />
        <div className="welcome-hero__copy">
          <p className="eyebrow">GetToKnow.You</p>
          <h1 id="welcome-title">Get to know someone.</h1>
          <p className="welcome-hero__lede">
            Better conversations can help us understand one another and build relationships that
            matter.
          </p>
          <p className="welcome-hero__actions">
            <a className="action-link action-link--primary" href="/start-here">
              Start Here
            </a>
            <a className="action-link" href="/explore">
              Explore GetToKnow.You
            </a>
          </p>
        </div>
      </section>

      <section className="screen shell pathways" aria-labelledby="pathways-title">
        <p className="eyebrow">Where to begin</p>
        <h2 id="pathways-title">Five ways in</h2>
        <p className="section-lede">
          Whether you arrived from social media, MandarinOS, or a personal recommendation, start
          wherever feels natural.
        </p>
        <ul className="pathway-list">
          {PATHWAYS.map((pathway) => (
            <li key={pathway.href} className="pathway-list__item">
              <h3 className="pathway-list__title">
                <a href={pathway.href}>{pathway.label}</a>
              </h3>
              <p className="pathway-list__text">{pathway.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="screen shell featured" aria-labelledby="featured-title">
        <p className="eyebrow">From the commons</p>
        <h2 id="featured-title">A few places to start</h2>
        <p className="section-lede">
          Selected from the curated works collection—published pieces and honest notes on work
          still taking shape.
        </p>

        <div className="featured-groups">
          <div className="featured-group">
            <h3 className="featured-group__heading">
              <a href="/read">Read</a>
            </h3>
            <ul className="featured-list">
              {featured.read.map((work) => (
                <FeaturedWork key={work.slug} work={work} />
              ))}
            </ul>
          </div>

          <div className="featured-group">
            <h3 className="featured-group__heading">
              <a href="/try">Try</a>
            </h3>
            <ul className="featured-list">
              {featured.try.map((work) => (
                <FeaturedWork key={work.slug} work={work} />
              ))}
            </ul>
          </div>

          <div className="featured-group">
            <h3 className="featured-group__heading">
              <a href="/meet">Meet</a>
            </h3>
            <ul className="featured-list">
              {featured.meet.map((work) => (
                <FeaturedWork key={work.slug} work={work} />
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="screen shell about-preview" aria-labelledby="about-preview-title">
        <p className="eyebrow">The founder</p>
        <h2 id="about-preview-title">Raymond Young</h2>
        <p className="section-lede about-preview__text">
          Raymond is building GetToKnow.You from a career that has crossed technology, organisations,
          education, China, Australia, and New Zealand—and from long experience watching how people
          communicate, and how often they fail to understand one another.
        </p>
        <p className="section-link">
          <a href="/about">About Raymond and the ecosystem</a>
        </p>
      </section>

      <section className="screen shell charter-note" aria-labelledby="charter-note-title">
        <h2 id="charter-note-title" className="charter-note__heading">
          Community Charter
        </h2>
        <p className="charter-note__text">
          The Community Charter sets out how we hope to treat one another as this commons grows.
        </p>
        <p className="section-link">
          <a href="/charter">Read the Community Charter</a>
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
