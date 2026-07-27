import type { Metadata } from "next";
import {
  getListedWorks,
  selectBrowsableCollections,
} from "../../content/loadWorks";
import { getNavThemes } from "../../content/loadThemes";
import { COLLECTIONS } from "../../content/collections";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeGrid } from "../components/ThemeGrid";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "A map of themes and collections in the GetToKnow.You public commons.",
};

const GATEWAYS = [
  {
    href: "/themes",
    label: "Themes",
    text: "Editorial rooms for conversation, culture, language, trust, and building the commons.",
  },
  {
    href: "/library",
    label: "Library",
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
  const navThemes = await getNavThemes();
  const browsable = selectBrowsableCollections(listedWorks);
  const browsableSlugs = new Set(browsable.map((collection) => collection.slug));
  const futureCollections = COLLECTIONS.filter(
    (collection) => !browsableSlugs.has(collection.slug)
  );

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

      {navThemes.length > 0 ? (
        <section className="screen shell explore-themes" aria-labelledby="themes-title">
          <p className="eyebrow">Themes</p>
          <h2 id="themes-title" className="explore-section-title">
            Rooms in the commons
          </h2>
          <p className="section-lede">
            Each theme is an editorial room—some already gathering published work, others still
            being framed.
          </p>
          <ThemeGrid themes={navThemes} />
          <p className="section-link">
            <a className="action-link" href="/themes">
              Browse all themes
            </a>
          </p>
        </section>
      ) : null}

      {browsable.length > 0 ? (
        <section className="screen shell explore-collections" aria-labelledby="collections-title">
          <p className="eyebrow">Collections</p>
          <h2 id="collections-title" className="explore-section-title">
            Browse by collection
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

      {futureCollections.length > 0 ? (
        <section className="screen shell explore-future" aria-label="Collections in preparation">
          <p className="section-lede explore-future__note">
            {futureCollections.map((collection, index) => (
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
        <a className="action-link" href="/library">
          Browse the library
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
