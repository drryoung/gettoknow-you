import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  getPublicWorkDetail,
  getPublicWorkSlugs,
  getRelatedWorks,
  type WorkDetail,
} from "../../../content/loadWorks";
import { platformLabel } from "../../../content/platforms";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { WorkBody } from "../../components/WorkBody";
import { WorkList, isExternalHref } from "../../components/WorkList";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublicWorkSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getPublicWorkDetail(slug);
  if (!work) {
    return { title: "Work not found" };
  }

  const metadata: Metadata = {
    title: work.title,
    description: work.summary,
  };

  // Only emit an external HTML canonical when explicitly configured for a
  // duplicated external work. Summary/reference pages keep the internal URL.
  if (work.seoCanonicalUrl) {
    metadata.alternates = { canonical: work.seoCanonicalUrl };
  }

  return metadata;
}

function Provenance({ work }: { work: WorkDetail }) {
  const rows: { label: string; value: ReactNode }[] = [];

  if (work.origin) {
    rows.push({
      label: "First published on",
      value: platformLabel(work.origin),
    });
  }

  if (work.canonicalPlatform || work.canonicalUrl) {
    const platform = work.canonicalPlatform
      ? platformLabel(work.canonicalPlatform)
      : null;
    const href = work.canonicalUrl;
    rows.push({
      label: "Canonical version",
      value:
        href && isExternalHref(href) ? (
          <a href={href} rel="noopener noreferrer">
            {platform ?? "Open canonical source"}
          </a>
        ) : href ? (
          <a href={href}>{platform ?? "On GetToKnow.You"}</a>
        ) : (
          (platform ?? "Not specified")
        ),
    });
  }

  if (rows.length === 0) return null;

  return (
    <dl className="work-provenance">
      {rows.map((row) => (
        <div key={row.label} className="work-provenance__row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Distribution({ work }: { work: WorkDetail }) {
  if (work.distributionLinks.length === 0 && !work.externalUrl) return null;

  const externalCanonical =
    work.externalUrl && work.contentMode !== "reference" ? work.externalUrl : null;

  return (
    <section className="work-aside" aria-labelledby="work-also-title">
      <h2 id="work-also-title" className="work-aside__title">
        {work.contentMode === "reference" ? "Source" : "Also available on"}
      </h2>
      <ul className="work-aside__links">
        {work.contentMode === "reference" && work.externalUrl ? (
          <li>
            <a href={work.externalUrl} rel="noopener noreferrer">
              {work.sourcePublication
                ? `Read the original in ${work.sourcePublication}`
                : "Read the original source"}
            </a>
          </li>
        ) : null}
        {externalCanonical && work.contentMode !== "reference" ? (
          <li>
            <a href={externalCanonical} rel="noopener noreferrer">
              {work.canonicalPlatform
                ? `Open on ${platformLabel(work.canonicalPlatform)}`
                : "Open canonical source"}
            </a>
          </li>
        ) : null}
        {work.distributionLinks.map((link) => (
          <li key={`${link.platform}-${link.url}`}>
            <a href={link.url} rel="noopener noreferrer">
              {link.label || platformLabel(link.platform)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReferenceCitation({ work }: { work: WorkDetail }) {
  if (work.contentMode !== "reference") return null;
  const parts = [
    work.sourceAuthor,
    work.sourceTitle || work.title,
    work.sourcePublication,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return <p className="work-citation">{parts.join(" — ")}</p>;
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = await getPublicWorkDetail(slug);
  if (!work) notFound();

  const related = await getRelatedWorks(work, 3);
  const modeLabel =
    work.contentMode === "hosted"
      ? "Hosted on GetToKnow.You"
      : work.contentMode === "summary"
        ? "Summary"
        : "External reference";

  return (
    <main>
      <SiteHeader />

      <article className="screen shell work-page">
        <p className="eyebrow">{modeLabel}</p>
        <h1>{work.title}</h1>
        <p className="work-page__summary">{work.summary}</p>

        <ReferenceCitation work={work} />

        {work.keyTakeaway ? (
          <p className="work-page__takeaway">
            <strong>Key takeaway.</strong> {work.keyTakeaway}
          </p>
        ) : null}

        {work.annotation ? <p className="work-page__annotation">{work.annotation}</p> : null}

        {work.contentMode === "hosted" && work.body ? <WorkBody body={work.body} /> : null}

        {work.contentMode === "summary" && work.body ? <WorkBody body={work.body} /> : null}

        <Provenance work={work} />
        <Distribution work={work} />

        {work.series ? (
          <p className="work-page__series">
            Series: <span>{work.series}</span>
          </p>
        ) : null}
      </article>

      {related.length > 0 ? (
        <section className="screen shell explore" aria-labelledby="work-related-title">
          <p className="eyebrow">Continue</p>
          <h2 id="work-related-title" className="explore-section-title">
            Related works
          </h2>
          <WorkList works={related} emptyMessage="" primaryLabel="Open" />
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
