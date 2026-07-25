import type { Work, WorkType } from "../../content/loadWorks";

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

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function WorkItem({
  work,
  primaryLabel = "Canonical work",
}: {
  work: Work;
  primaryLabel?: string;
}) {
  const isPublished = work.publicationState === "published" && work.canonicalUrl;
  const title = isPublished ? (
    <a
      href={work.canonicalUrl!}
      {...(isExternalHref(work.canonicalUrl!) ? { rel: "noopener noreferrer" } : {})}
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
            {...(isExternalHref(work.canonicalUrl!) ? { rel: "noopener noreferrer" } : {})}
          >
            {primaryLabel}
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

export function WorkList({
  works,
  emptyMessage,
  primaryLabel,
}: {
  works: Work[];
  emptyMessage: string;
  primaryLabel?: string;
}) {
  if (works.length === 0) {
    return <p className="explore-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="explore-list">
      {works.map((work) => (
        <WorkItem key={work.slug} work={work} primaryLabel={primaryLabel} />
      ))}
    </ul>
  );
}
