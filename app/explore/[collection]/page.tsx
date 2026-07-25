import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "../../../content/collections";
import { getCollectionWorks } from "../../../content/loadWorks";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { WorkList } from "../../components/WorkList";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const works = await getCollectionWorks(slug);

  return (
    <main>
      <SiteHeader current="/explore" />

      <section className="screen shell explore-intro" aria-labelledby="collection-title">
        <p className="eyebrow">
          <a href="/explore">Explore</a> · Collection
        </p>
        <h1 id="collection-title">{collection.name}</h1>
        <p className="explore-intro__lede">{collection.description}</p>
      </section>

      <section className="screen shell explore" aria-label={`${collection.name} items`}>
        <WorkList
          works={works}
          emptyMessage="Nothing published in this collection yet—coming soon."
        />
      </section>

      <SiteFooter />
    </main>
  );
}
