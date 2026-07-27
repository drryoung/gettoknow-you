import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicThemeSlugs,
  getResolvedThemePage,
} from "../../../content/loadThemes";
import { SITE_URL } from "../../../content/site";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { ThemeDetail } from "../../components/ThemeDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getPublicThemeSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const theme = await getResolvedThemePage(slug);
  if (!theme) {
    return { title: "Theme not found" };
  }

  const title = theme.seoTitle || theme.title;
  const description = theme.seoDescription || theme.summary;
  const canonical = `${SITE_URL}${theme.themePath}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(theme.coverImage ? { images: [{ url: theme.coverImage, alt: theme.title }] } : {}),
    },
  };
}

export default async function ThemePage({ params }: PageProps) {
  const { slug } = await params;
  const theme = await getResolvedThemePage(slug);
  if (!theme) notFound();

  return (
    <main>
      <SiteHeader current="/explore" />

      <div className="screen shell theme-page">
        <ThemeDetail theme={theme} />
      </div>

      <SiteFooter />
    </main>
  );
}
