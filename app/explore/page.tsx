import type { Metadata } from "next";
import { getListedWorks, type Work, type WorkType } from "../../content/loadWorks";

export const metadata: Metadata = {
  title: "Explore — GetToKnow.You",
  description:
    "Selected ideas, stories, practices, and projects from the GetToKnow.You public commons.",
};

const TYPE_LABELS: Record<WorkType, string> = {
  essay: "Essay",
  story: "Story",
  practice: "Practice",
  project: "Project",
  video: "Video",
  other: "Other",
};

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function WorkItem({ work }: { work: Work }) {
  const isPublished = work.publicationState === "published" && work.canonicalUrl;
  const title = isPublished ? (
    <a
      href={work.canonicalUrl!}
      {...(isExternalHref(work.canonicalUrl!)
        ? { rel: "noopener noreferrer" }
        : {})}
    >
      {work.title}
    </a>
  ) : (
    work.title
  );

  return (
    <li className="explore-list__item">
      <p className="explore-list__meta">
        <span>{TYPE_LABELS[work.type]}</span>
        <span aria-hidden="true"> · </span>
        <span>Added </span>
        <time dateTime={work.date}>{formatDate(work.date)}</time>
      </p>
      <h2 className="explore-list__title">{title}</h2>
      <p className="explore-list__summary">{work.summary}</p>
      <p className="explore-list__links">
        {isPublished ? (
          <a
            href={work.canonicalUrl!}
            {...(isExternalHref(work.canonicalUrl!)
              ? { rel: "noopener noreferrer" }
              : {})}
          >
            Canonical work
          </a>
        ) : (
          <span className="explore-list__developing">In development</span>
        )}
        {work.distributionLinks.map((link) => (
          <a key={`${link.label}-${link.url}`} href={link.url} rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
      </p>
    </li>
  );
}

export default async function ExplorePage() {
  const works = await getListedWorks();

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="/" aria-label="GetToKnow.You home">
          GetToKnow.You
        </a>
        <nav aria-label="Primary">
          <a href="/">Charter</a>
          <a href="/explore" aria-current="page">
            Explore
          </a>
        </nav>
      </header>

      <section className="screen shell explore-intro" aria-labelledby="explore-title">
        <p className="eyebrow">Public commons</p>
        <h1 id="explore-title">Explore</h1>
        <p className="explore-intro__lede">
          Selected ideas, stories, practices, and projects worth keeping in the commons—including
          published works and honest notes on work still taking shape.
        </p>
      </section>

      <section className="screen shell explore" aria-label="Curated works">
        {works.length === 0 ? (
          <p className="explore-empty">
            Curated works will appear here as they are approved for the public commons. The
            Community Charter remains the foundation of GetToKnow.You.
          </p>
        ) : (
          <ul className="explore-list">
            {works.map((work) => (
              <WorkItem key={work.slug} work={work} />
            ))}
          </ul>
        )}
      </section>

      <footer className="footer shell">
        <div>
          <b>GetToKnow.You</b>
          <p>A public commons for meaningful conversation and relationship.</p>
        </div>
        <small>
          <a href="/">Community Charter</a>
          {" · "}
          Response by email is deferred until a durable public address is published.
        </small>
      </footer>
    </main>
  );
}
