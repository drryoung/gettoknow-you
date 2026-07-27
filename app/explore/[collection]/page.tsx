import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "../../../content/collections";
import {
  getCollectionWorks,
  getListedWorks,
  isCollectionPubliclyBrowsable,
} from "../../../content/loadWorks";
import { PUBLIC_COLLECTION_MIN_WORKS } from "../../../content/site";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { WorkList } from "../../components/WorkList";

type CollectionPageProps = {
  params: Promise<{ collection: string }>;
};

export async function generateStaticParams() {
  const works = await getListedWorks();
  return COLLECTIONS.filter((collection) =>
    isCollectionPubliclyBrowsable(works, collection.slug, PUBLIC_COLLECTION_MIN_WORKS)
  ).map((collection) => ({ collection: collection.slug }));
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

  const listedWorks = await getListedWorks();
  if (
    !isCollectionPubliclyBrowsable(listedWorks, slug, PUBLIC_COLLECTION_MIN_WORKS)
  ) {
    notFound();
  }

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
        <WorkList works={works} emptyMessage="" />
      </section>

      <SiteFooter />
    </main>
  );
}
