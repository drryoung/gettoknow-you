import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicWorkDetail,
  getPublicWorkSlugs,
  getRelatedWorks,
} from "../../../content/loadWorks";
import { resolveThemesForWork } from "../../../content/loadThemes";
import { getLibraryPageCopy } from "../../../content/loadPages";
import { distributionLinkLabel } from "../../../content/platforms";
import { SITE_URL } from "../../../content/site";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { WorkBody } from "../../components/WorkBody";
import {
  ExternalVideoEmbed,
  LibraryMetadata,
  LibraryVideo,
  OriginallyPublished,
  RelatedContent,
  supplementaryDistributionLinks,
} from "../../components/LibraryDetail";

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
    return { title: "Library item not found" };
  }

  const canonicalPath = work.workPath;
  const canonical =
    work.seoCanonicalUrl ?? `${SITE_URL}${canonicalPath}`;

  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical },
    openGraph: {
      title: work.title,
      description: work.summary,
      url: canonical,
      ...(work.coverImage ? { images: [{ url: work.coverImage, alt: work.title }] } : {}),
    },
  };
}

export default async function LibraryItemPage({ params }: PageProps) {
  const { slug } = await params;
  const work = await getPublicWorkDetail(slug);
  if (!work) notFound();

  const related = await getRelatedWorks(work, 3);
  const themes = await resolveThemesForWork(work.themes);
  const libraryCopy = await getLibraryPageCopy();
  const cover = work.coverImage;
  const alsoAvailable = supplementaryDistributionLinks(work);

  return (
    <main>
      <SiteHeader current="/library" />

      <article className="screen shell library-item">
        {cover ? (
          <div className="library-item__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={work.title} />
          </div>
        ) : null}

        <p className="eyebrow">Library</p>
        <h1>{work.title}</h1>
        <LibraryMetadata work={work} themes={themes} />
        <p className="library-item__summary">{work.summary}</p>

        {work.keyTakeaway ? (
          <p className="work-page__takeaway">
            <strong>Key takeaway.</strong> {work.keyTakeaway}
          </p>
        ) : null}

        {work.video ? (
          <LibraryVideo src={work.video} title={work.title} poster={cover} />
        ) : work.externalVideoUrl ? (
          <ExternalVideoEmbed url={work.externalVideoUrl} title={work.title} />
        ) : null}

        {work.annotation ? <p className="work-page__annotation">{work.annotation}</p> : null}

        {work.body ? <WorkBody body={work.body} /> : null}

        <OriginallyPublished original={work.original} note={libraryCopy.originalNote} />

        {alsoAvailable.length > 0 ? (
          <section className="library-original" aria-labelledby="library-also-title">
            <h2 id="library-also-title" className="library-original__title">
              Also available on
            </h2>
            <ul className="library-original__links">
              {alsoAvailable.map((link) => (
                <li key={`${link.platform}-${link.url}`}>
                  <a href={link.url} rel="noopener noreferrer">
                    {distributionLinkLabel(link.platform, link.label, "also")}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <RelatedContent works={related} />
      <SiteFooter />
    </main>
  );
}
