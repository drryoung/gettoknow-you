import type { Metadata } from "next";
import { getPathwayWorks } from "../../content/sitePathways";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { WorkList } from "../components/WorkList";

export const metadata: Metadata = {
  title: "Try",
  description:
    "Practical projects, tools, and ConversationOS practices from the GetToKnow.You commons.",
};

export default async function TryPage() {
  const works = await getPathwayWorks("try");

  return (
    <main>
      <SiteHeader current="/try" />

      <section className="screen shell explore-intro" aria-labelledby="try-title">
        <p className="eyebrow">Practice and projects</p>
        <h1 id="try-title">Try</h1>
        <p className="explore-intro__lede">
          Practical experiences you can put into use. MandarinOS is available today as a working
          conversation practice.
        </p>
        <p className="section-link">
          <a href="https://www.mandarinos.app/" rel="noopener noreferrer">
            Open MandarinOS.app
          </a>
        </p>
      </section>

      <section className="screen shell explore" aria-label="Works to try">
        <WorkList
          works={works}
          emptyMessage="Practical projects will appear here as they are approved for the commons."
          primaryLabel="Open project"
        />
      </section>

      <SiteFooter />
    </main>
  );
}
