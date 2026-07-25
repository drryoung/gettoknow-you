import type { Metadata } from "next";
import { getListedWorks } from "../../content/loadWorks";
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

export default async function ExplorePage() {
  const works = await getListedWorks();

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

      <section className="screen shell explore" aria-label="Curated works">
        <h2 className="explore-section-title">All curated works</h2>
        <WorkList
          works={works}
          emptyMessage="Curated works will appear here as they are approved for the public commons."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
