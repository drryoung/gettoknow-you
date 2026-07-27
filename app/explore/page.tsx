import type { Metadata } from "next";
import {
  getListedWorks,
  getStartHereWorks,
  type Work,
} from "../../content/loadWorks";
import { COLLECTIONS } from "../../content/collections";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A guided overview of the GetToKnow.You public commons—ideas to read, things to try, and ways to meet.",
};

const GATEWAYS = [
  {
    href: "/read",
    label: "Read",
    text: "Essays, stories, and thinking still taking shape.",
  },
  {
    href: "/try",
    label: "Try",
    text: "Projects and practices you can put into use.",
  },
  {
    href: "/meet",
    label: "Meet",
    text: "The emerging community and shared Charter.",
  },
  {
    href: "/about",
    label: "About",
    text: "Raymond, ConversationOS, and MandarinOS.",
  },
] as const;

function countByCollection(works: readonly Work[], slug: string): number {
  return works.filter((work) => work.topics.includes(slug)).length;
}

export default async function ExplorePage() {
  const [startHere, listedWorks] = await Promise.all([getStartHereWorks(), getListedWorks()]);
  const startHerePreview = startHere.slice(0, 3);

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="explore-title">
        <p className="eyebrow">Public commons</p>
        <h1 id="explore-title">Explore</h1>
        <p className="explore-intro__lede">
          A broad gateway into GetToKnow.You—selected works worth keeping in the commons, with clear
          paths into Read, Try, Meet, and About.
        </p>
      </section>

      <section className="screen shell explore-gateways" aria-label="Visitor pathways">
        <ul className="gateway-list">
          {GATEWAYS.map((item) => (
            <li key={item.href} className="gateway-list__item">
              <h2 className="gateway-list__title">
                <a href={item.href}>{item.label}</a>
              </h2>
              <p className="gateway-list__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {startHerePreview.length > 0 ? (
        <section className="screen shell explore-start-here" aria-labelledby="start-here-title">
          <p className="eyebrow">Start Here</p>
          <h2 id="start-here-title" className="explore-section-title">
            A place to begin
          </h2>
          <p className="section-lede">
            If you are new to GetToKnow.You, start with this short sequence—then open the full Start
            Here page when you want the complete path.
          </p>
          <WorkList works={startHerePreview} emptyMessage="" primaryLabel="Open" />
          <p className="section-link">
            <a className="action-link" href="/start-here">
              New here? Start here.
            </a>
          </p>
        </section>
      ) : null}

      <section className="screen shell explore-collections" aria-labelledby="collections-title">
        <p className="eyebrow">Collections</p>
        <h2 id="collections-title" className="explore-section-title">
          Browse by theme
        </h2>
        <p className="section-lede">
          Once you have a feel for GetToKnow.You, these collections let you follow a single thread
          further—conversation, relationships, culture, and more.
        </p>
        <ul className="collection-grid">
          {COLLECTIONS.map((collection) => {
            const count = countByCollection(listedWorks, collection.slug);
            return (
              <li key={collection.slug} className="collection-card">
                <h3 className="collection-card__title">
                  <a href={`/explore/${collection.slug}`}>{collection.name}</a>
                </h3>
                <p className="collection-card__text">{collection.description}</p>
                <p className="collection-card__count">
                  {count > 0
                    ? `${count} item${count === 1 ? "" : "s"}`
                    : "Coming soon"}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="screen shell explore-archive" aria-labelledby="archive-title">
        <p className="eyebrow">Archive</p>
        <h2 id="archive-title" className="explore-section-title">
          The complete library
        </h2>
        <p className="section-lede">
          Every published work, listed in one place, newest first. Useful once you want to see
          everything rather than a curated path.
        </p>
        <a className="action-link" href="/explore/archive">
          View the archive
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
