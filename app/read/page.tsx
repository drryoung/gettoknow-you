import type { Metadata } from "next";
import { getPathwayWorks } from "../../content/sitePathways";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Read",
  description:
    "Essays, reflections, stories, and ConversationOS thinking from the GetToKnow.You commons.",
};

export default async function ReadPage() {
  const works = await getPathwayWorks("read");

  return (
    <main>
      <SiteHeader current="/read" />

      <section className="screen shell explore-intro" aria-labelledby="read-title">
        <p className="eyebrow">Ideas and stories</p>
        <h1 id="read-title">Read</h1>
        <p className="explore-intro__lede">
          Essays, reflections, stories, and ConversationOS thinking. This collection is beginning
          and will grow over time—including future Xiaohongshu references, Substack essays, selected
          videos, and native GetToKnow.You writing.
        </p>
      </section>

      <section className="screen shell explore" aria-label="Works to read">
        <WorkList
          works={works}
          emptyMessage="Reading material will appear here as essays, stories, and references are added to the commons."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
