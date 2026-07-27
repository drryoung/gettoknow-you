import type { Work, WorkDetail } from "../../content/loadWorks";
import { COLLECTIONS } from "../../content/collections";
import { libraryProjectLabel, libraryTypeLabel } from "./LibraryGrid";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function LibraryMetadata({ work }: { work: WorkDetail | Work }) {
  const displayDate = work.publishedDate ?? work.date;
  const themeNames = work.topics
    .map((slug) => COLLECTIONS.find((c) => c.slug === slug)?.name)
    .filter(Boolean);

  return (
    <dl className="library-metadata">
      <div>
        <dt>Type</dt>
        <dd>{libraryTypeLabel(work.type)}</dd>
      </div>
      <div>
        <dt>Project</dt>
        <dd>{libraryProjectLabel(work.project)}</dd>
      </div>
      <div>
        <dt>Date</dt>
        <dd>
          <time dateTime={displayDate}>{formatDate(displayDate)}</time>
        </dd>
      </div>
      {work.languages.length > 0 ? (
        <div>
          <dt>Languages</dt>
          <dd>{work.languages.join(" · ")}</dd>
        </div>
      ) : null}
      {themeNames.length > 0 ? (
        <div>
          <dt>Themes</dt>
          <dd>{themeNames.join(" · ")}</dd>
        </div>
      ) : null}
      {work.watchTime || work.readTime ? (
        <div>
          <dt>Length</dt>
          <dd>{work.watchTime || work.readTime}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function LibraryVideo({
  src,
  title,
  poster,
}: {
  src: string;
  title: string;
  poster?: string | null;
}) {
  const mime = src.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4";

  return (
    <div className="library-video">
      <video
        className="library-video__player"
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        aria-label={`Video: ${title}`}
      >
        <source src={src} type={mime} />
        <p>
          Your browser does not support embedded video.{" "}
          <a href={src}>Download or open the video file</a>.
        </p>
      </video>
    </div>
  );
}

export function RelatedContent({ works }: { works: Work[] }) {
  if (works.length === 0) return null;

  return (
    <section className="screen shell library-related" aria-labelledby="library-related-title">
      <p className="eyebrow">Continue</p>
      <h2 id="library-related-title" className="explore-section-title">
        Related content
      </h2>
      <ul className="library-related__list">
        {works.map((work) => (
          <li key={work.slug}>
            <a href={work.href}>{work.title}</a>
            <p>{work.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function originalLinkLabel(platform: "xiaohongshu" | "instagram" | "substack"): string {
  if (platform === "xiaohongshu") return "Watch the original on Xiaohongshu";
  if (platform === "instagram") return "Originally published on Instagram";
  return "Read the original article on Substack";
}

export function OriginallyPublished({
  original,
}: {
  original: Work["original"];
}) {
  const links = (
    [
      original.xiaohongshu
        ? { href: original.xiaohongshu, platform: "xiaohongshu" as const }
        : null,
      original.instagram
        ? { href: original.instagram, platform: "instagram" as const }
        : null,
      original.substack
        ? { href: original.substack, platform: "substack" as const }
        : null,
    ] as const
  ).filter(Boolean) as { href: string; platform: "xiaohongshu" | "instagram" | "substack" }[];

  if (links.length === 0) return null;

  return (
    <section className="library-original" aria-labelledby="library-original-title">
      <h2 id="library-original-title" className="library-original__title">
        Originally published
      </h2>
      <p className="library-original__note">
        These links are optional discovery references. The lasting version lives on GetToKnow.You.
      </p>
      <ul className="library-original__links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="noopener noreferrer">
              {originalLinkLabel(link.platform)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Distribution links that are not already shown as original-publication links. */
export function supplementaryDistributionLinks(work: Work) {
  const originalUrls = new Set(
    [work.original.xiaohongshu, work.original.instagram, work.original.substack].filter(Boolean)
  );
  return work.distributionLinks.filter((link) => !originalUrls.has(link.url));
}
