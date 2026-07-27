import type { Metadata } from "next";
import {
  getListedWorks,
  selectBrowsableCollections,
} from "../../content/loadWorks";
import { COLLECTIONS } from "../../content/collections";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A map of themes and collections in the GetToKnow.You public commons.",
};

const GATEWAYS = [
  {
    href: "/read",
    label: "Read",
    text: "The complete published library—newest first.",
  },
  {
    href: "/try",
    label: "Try",
    text: "Projects and practices you can put into use.",
  },
  {
    href: "/about",
    label: "About",
    text: "Raymond, ConversationOS, and MandarinOS.",
  },
] as const;

export default async function ExplorePage() {
  const listedWorks = await getListedWorks();
  const browsable = selectBrowsableCollections(listedWorks);
  const browsableSlugs = new Set(browsable.map((collection) => collection.slug));
  const futureThemes = COLLECTIONS.filter((collection) => !browsableSlugs.has(collection.slug));

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="explore-title">
        <p className="eyebrow">Public commons</p>
        <h1 id="explore-title">Explore</h1>
        <p className="explore-intro__lede">
          A map of the themes and collections in GetToKnow.You—useful once you know where you want
          to go next.
        </p>
        <p className="section-link">
          <a className="action-link" href="/start-here">
            New to GetToKnow.You? Follow the Start Here pathway.
          </a>
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

      {browsable.length > 0 ? (
        <section className="screen shell explore-collections" aria-labelledby="collections-title">
          <p className="eyebrow">Collections</p>
          <h2 id="collections-title" className="explore-section-title">
            Browse by theme
          </h2>
          <p className="section-lede">
            Each collection gathers published works around one thread—conversation, relationships,
            culture, and more.
          </p>
          <ul className="collection-grid">
            {browsable.map((collection) => {
              const count = listedWorks.filter((work) =>
                work.topics.includes(collection.slug)
              ).length;
              return (
                <li key={collection.slug} className="collection-card">
                  <h3 className="collection-card__title">
                    <a href={`/explore/${collection.slug}`}>{collection.name}</a>
                  </h3>
                  <p className="collection-card__text">{collection.description}</p>
                  <p className="collection-card__count">
                    {count} item{count === 1 ? "" : "s"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {futureThemes.length > 0 ? (
        <section className="screen shell explore-future" aria-label="Themes in preparation">
          <p className="section-lede explore-future__note">
            {futureThemes.map((collection, index) => (
              <span key={collection.slug}>
                {index > 0 ? " · " : null}
                {collection.name} — more material is being prepared.
              </span>
            ))}
          </p>
        </section>
      ) : null}

      <section className="screen shell explore-archive" aria-labelledby="library-title">
        <p className="eyebrow">Library</p>
        <h2 id="library-title" className="explore-section-title">
          Published works
        </h2>
        <p className="section-lede">
          Every published work in one place, newest first—the definitive public library.
        </p>
        <a className="action-link" href="/read">
          Browse the library
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
