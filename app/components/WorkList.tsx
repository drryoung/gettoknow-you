import type { Work, WorkType } from "../../content/loadWorks";
import { distributionLinkLabel } from "../../content/platforms";

const TYPE_LABELS: Record<WorkType, string> = {
  essay: "Essay",
  story: "Story",
  practice: "Practice",
  project: "Project",
  video: "Video",
  article: "Article",
  guide: "Guide",
  resource: "Resource",
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
  primaryLabel = "Open",
}: {
  work: Work;
  primaryLabel?: string;
}) {
  const href = work.href;
  const externalBadge =
    work.contentMode === "reference" ? (
      <span className="explore-list__badge">External source</span>
    ) : null;

  return (
    <li className="explore-list__item">
      <p className="explore-list__meta">
        <span>{TYPE_LABELS[work.type]}</span>
        <span aria-hidden="true"> · </span>
        <span>Added </span>
        <time dateTime={work.date}>{formatDate(work.date)}</time>
        {(work.watchTime || work.readTime) && (
          <>
            <span aria-hidden="true"> · </span>
            <span>{work.watchTime || work.readTime}</span>
          </>
        )}
        {externalBadge ? (
          <>
            <span aria-hidden="true"> · </span>
            {externalBadge}
          </>
        ) : null}
      </p>
      <h2 className="explore-list__title">
        <a href={href}>{work.title}</a>
      </h2>
      <p className="explore-list__summary">{work.summary}</p>
      <p className="explore-list__links">
        <a href={href}>{primaryLabel}</a>
        {work.distributionLinks.map((link) => (
          <a key={`${link.platform}-${link.url}`} href={link.url} rel="noopener noreferrer">
            {distributionLinkLabel(link.platform, link.label)}
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
    return emptyMessage ? <p className="explore-empty">{emptyMessage}</p> : null;
  }

  return (
    <ul className="explore-list">
      {works.map((work) => (
        <WorkItem key={work.slug} work={work} primaryLabel={primaryLabel} />
      ))}
    </ul>
  );
}
