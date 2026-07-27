import type { Work, WorkProject, WorkType } from "../../content/loadWorks";

const TYPE_LABELS: Partial<Record<WorkType, string>> = {
  essay: "Article",
  story: "Article",
  article: "Article",
  video: "Video",
  practice: "Article",
  project: "Article",
  guide: "Article",
  resource: "Article",
  other: "Article",
};

const PROJECT_LABELS: Record<WorkProject, string> = {
  gettoknow: "GetToKnow.You",
  conversationos: "ConversationOS",
  mandarinos: "MandarinOS",
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

export function libraryTypeLabel(type: WorkType): string {
  return type === "video" ? "Video" : TYPE_LABELS[type] ?? "Article";
}

export function libraryProjectLabel(project: WorkProject): string {
  return PROJECT_LABELS[project];
}

export function LibraryCard({ work }: { work: Work }) {
  const cover = work.coverImage;
  const displayDate = work.publishedDate ?? work.date;

  return (
    <li className="library-card">
      <a className="library-card__link" href={work.href}>
        <div className="library-card__media">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- library covers are editorial paths/URLs
            <img src={cover} alt="" role="presentation" />
          ) : (
            <div className="library-card__media-fallback" aria-hidden="true" />
          )}
        </div>
        <div className="library-card__body">
          <p className="library-card__meta">
            <span className="library-card__badge">{libraryTypeLabel(work.type)}</span>
            <span className="library-card__badge library-card__badge--project">
              {libraryProjectLabel(work.project)}
            </span>
            <time dateTime={displayDate}>{formatDate(displayDate)}</time>
          </p>
          <h2 className="library-card__title">{work.title}</h2>
          <p className="library-card__summary">{work.summary}</p>
        </div>
      </a>
    </li>
  );
}

export function LibraryGrid({
  works,
  emptyMessage,
}: {
  works: Work[];
  emptyMessage: string;
}) {
  if (works.length === 0) {
    return emptyMessage ? <p className="explore-empty">{emptyMessage}</p> : null;
  }

  return (
    <ul className="library-grid">
      {works.map((work) => (
        <LibraryCard key={work.slug} work={work} />
      ))}
    </ul>
  );
}
