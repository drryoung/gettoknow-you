import type { Metadata } from "next";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { InfluencesBody } from "../components/InfluencesBody";
import { getAboutInfluences } from "../../content/loadAboutInfluences";

export const metadata: Metadata = {
  title: "About",
  description:
    "Raymond Young, GetToKnow.You, ConversationOS, and MandarinOS—how the ecosystem fits together.",
};

export default async function AboutPage() {
  const influences = await getAboutInfluences();

  return (
    <main>
      <SiteHeader current="/about" />

      <section className="screen shell explore-intro" aria-labelledby="about-title">
        <p className="eyebrow">Founder and ecosystem</p>
        <h1 id="about-title">About</h1>
        <p className="explore-intro__lede">
          GetToKnow.You is an emerging public commons for meaningful conversation and relationship.
          It sits at the centre of a small ecosystem that is still taking shape.
        </p>
      </section>

      <section className="screen shell about-ecosystem" aria-labelledby="ecosystem-title">
        <h2 id="ecosystem-title">How the pieces fit</h2>
        <ul className="ecosystem-list">
          <li className="ecosystem-list__item">
            <h3>GetToKnow.You</h3>
            <p>The umbrella mission and emerging public commons.</p>
          </li>
          <li className="ecosystem-list__item">
            <h3>ConversationOS</h3>
            <p>
              The developing framework for conversations that build understanding and
              relationships.
            </p>
          </li>
          <li className="ecosystem-list__item">
            <h3>MandarinOS</h3>
            <p>The first practical application—a conversation simulator for Mandarin learners.</p>
          </li>
          <li className="ecosystem-list__item">
            <h3>Raymond Young</h3>
            <p>The founder and personal voice behind the work.</p>
          </li>
        </ul>
      </section>

      <section className="screen shell about-bio" aria-labelledby="raymond-title">
        <h2 id="raymond-title">Raymond Young</h2>
        <p className="section-lede">
          Raymond’s career has crossed technology, organisations, education, China, Australia, and
          New Zealand. GetToKnow.You grows from long experience observing how people communicate—and
          how often they fail to understand one another.
        </p>
        <p className="section-lede">
          The project is not a finished community platform. It is a careful beginning: a charter, a
          commons of curated works, and practical experiments such as MandarinOS.
        </p>
      </section>

      <section
        className="screen shell about-influences"
        aria-labelledby="influences"
      >
        <InfluencesBody body={influences.body} />
      </section>

      <section className="screen shell about-links" aria-label="Related links">
        <ul className="link-list">
          <li>
            <a href="https://www.mandarinos.app/" rel="noopener noreferrer">
              MandarinOS.app
            </a>
          </li>
          <li>
            <a href="/try">Try ConversationOS and MandarinOS</a>
          </li>
          <li>
            <a href="/charter">Community Charter</a>
          </li>
          <li>
            <a href="/explore">Explore the commons</a>
          </li>
          <li>
            <a href="/meet">Meet the emerging community</a>
          </li>
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
