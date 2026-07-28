import type { Metadata } from "next";
import { getCommunityCharter } from "../../content/loadCharter";
import { getCharterPageShell } from "../../content/loadPages";
import { CharterBody } from "../components/CharterBody";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { Thread } from "../components/Thread";

export async function generateMetadata(): Promise<Metadata> {
  const shell = await getCharterPageShell();
  return {
    title: shell.seoTitle,
    description: shell.seoDescription,
  };
}

export default async function CharterPage() {
  const [charter, shell] = await Promise.all([getCommunityCharter(), getCharterPageShell()]);

  return (
    <main>
      <SiteHeader />

      <section id="top" className="screen shell charter-hero" aria-labelledby="charter-title">
        <Thread className="hero-thread" />
        <div className="charter-hero__copy">
          <p className="eyebrow">{shell.pageEyebrow}</p>
          <h1 id="charter-title">{shell.pageHeading}</h1>
          <p className="charter-hero__meta">
            Version {charter.version} — {charter.status}
          </p>
          <p className="charter-hero__description">{charter.description}</p>
        </div>
      </section>

      <article
        className="screen shell charter"
        aria-label={charter.title}
        data-document-title={charter.title}
      >
        <CharterBody body={charter.body} />
      </article>

      <SiteFooter
        note={`© ${new Date().getFullYear()} GetToKnow.You. Community Charter v${charter.version} — ${charter.status}.`}
      />
    </main>
  );
}
