/**
 * Keystatic local content editor — GetToKnow.You.
 * Storage is local-only; production routes are disabled separately.
 *
 * Works are single Markdoc records: metadata in frontmatter, optional body
 * below. Record once; publish and curate everywhere from the same entry.
 */
import { config, fields, singleton, collection } from "@keystatic/core";
import { COLLECTIONS } from "./content/collections";
import { THEME_OPTIONS } from "./content/themeIds";
import {
  CANONICAL_PLATFORM_OPTIONS,
  DISTRIBUTION_PLATFORM_OPTIONS,
  ORIGIN_OPTIONS,
} from "./content/platforms";

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "GetToKnow.You Content" },
    navigation: {
      Community: ["communityCharter", "startHere"],
      Pages: [
        "homePage",
        "explorePage",
        "libraryPage",
        "tryPage",
        "meetPage",
        "aboutPage",
        "themesPage",
      ],
      Site: ["siteFooter"],
      Commons: ["works", "themes"],
    },
  },
  singletons: {
    communityCharter: singleton({
      label: "Community Charter",
      path: "content/community-charter",
      format: { contentField: "body" },
      entryLayout: "form",
      schema: {
        title: fields.text({
          label: "Document title",
          description: "Shown in the page hero and browser tab.",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        version: fields.text({
          label: "Version",
          description: 'For example "0.1".',
          validation: { isRequired: true, length: { min: 1, max: 20 } },
        }),
        status: fields.text({
          label: "Status",
          description: 'For example "Working Draft".',
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        description: fields.text({
          label: "Short description",
          description: "Used for page metadata. Keep it to one or two sentences.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        pageEyebrow: fields.text({
          label: "Page eyebrow",
          description: "Small label above the page heading on the charter route.",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        pageHeading: fields.text({
          label: "Page heading",
          description: "Primary heading on the public charter page.",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        seoTitle: fields.text({
          label: "SEO title",
          description: "Optional browser-tab / metadata title override.",
          validation: { length: { max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          description: "Optional metadata description override.",
          multiline: true,
          validation: { length: { max: 400 } },
        }),
        body: fields.markdoc({
          label: "Charter text",
          description:
            "Headings, paragraphs, emphasis, and numbered lists only. Do not paste HTML or layout code.",
          extension: "mdoc",
          options: {
            bold: true,
            italic: true,
            strikethrough: false,
            code: false,
            heading: [2, 3],
            blockquote: false,
            orderedList: true,
            unorderedList: true,
            table: false,
            link: false,
            image: false,
            divider: false,
            codeBlock: false,
          },
        }),
      },
    }),
    startHere: singleton({
      label: "Start Here",
      path: "content/start-here",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        supporting: fields.text({
          label: "Supporting text",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 600 } },
        }),
        emptyMessage: fields.text({
          label: "Empty message",
          description: "Shown when no Start Here works are publicly eligible.",
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
        nextEyebrow: fields.text({
          label: "Next section eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        nextHeading: fields.text({
          label: "Next section heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        nextLede: fields.text({
          label: "Next section lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        items: fields.array(fields.text({ label: "Work slug" }), {
          label: "Sequence",
          description:
            "Ordered Start Here items by stable work slug. Use gettoknowyou-community-charter for the Community Charter Library signpost (authoritative charter text remains the Community Charter singleton). Only publicly eligible works appear; missing or ineligible slugs are skipped.",
          itemLabel: (props) => props.value || "Work slug",
        }),
      },
    }),
    homePage: singleton({
      label: "Homepage",
      path: "content/pages/home",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        heroEyebrow: fields.text({
          label: "Hero eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heroHeading: fields.text({
          label: "Hero heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        heroLede: fields.text({
          label: "Hero lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        primaryCtaLabel: fields.text({
          label: "Primary CTA label",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        secondaryCtaLabel: fields.text({
          label: "Secondary CTA label",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        pathwaysEyebrow: fields.text({
          label: "Pathways eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        pathwaysHeading: fields.text({
          label: "Pathways heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        pathwaysLede: fields.text({
          label: "Pathways lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        pathways: fields.array(
          fields.object({
            key: fields.text({
              label: "Pathway key",
              description: "Stable key used by the site frame. Do not change casually.",
              validation: { isRequired: true, length: { min: 1, max: 60 } },
            }),
            label: fields.text({
              label: "Label",
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
            text: fields.text({
              label: "Text",
              multiline: true,
              validation: { isRequired: true, length: { min: 1, max: 400 } },
            }),
          }),
          {
            label: "Pathways",
            itemLabel: (props) => props.fields.label.value || "Pathway",
          }
        ),
        featuredEyebrow: fields.text({
          label: "Featured eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        featuredHeading: fields.text({
          label: "Featured heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        featuredLede: fields.text({
          label: "Featured lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        founderEyebrow: fields.text({
          label: "Founder eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        founderHeading: fields.text({
          label: "Founder heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        founderText: fields.text({
          label: "Founder text",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 800 } },
        }),
        founderCtaLabel: fields.text({
          label: "Founder CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        charterHeading: fields.text({
          label: "Charter heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        charterText: fields.text({
          label: "Charter text",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        charterCtaLabel: fields.text({
          label: "Charter CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
      },
    }),
    explorePage: singleton({
      label: "Explore page",
      path: "content/pages/explore",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        startHereLinkLabel: fields.text({
          label: "Start Here link label",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        gateways: fields.array(
          fields.object({
            key: fields.text({
              label: "Gateway key",
              description: "Stable key used by the site frame. Do not change casually.",
              validation: { isRequired: true, length: { min: 1, max: 60 } },
            }),
            label: fields.text({
              label: "Label",
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
            text: fields.text({
              label: "Text",
              multiline: true,
              validation: { isRequired: true, length: { min: 1, max: 400 } },
            }),
          }),
          {
            label: "Gateways",
            itemLabel: (props) => props.fields.label.value || "Gateway",
          }
        ),
        themesEyebrow: fields.text({
          label: "Themes eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        themesHeading: fields.text({
          label: "Themes heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        themesLede: fields.text({
          label: "Themes lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        themesCtaLabel: fields.text({
          label: "Themes CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        libraryEyebrow: fields.text({
          label: "Library eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        libraryHeading: fields.text({
          label: "Library heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        libraryLede: fields.text({
          label: "Library lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        libraryCtaLabel: fields.text({
          label: "Library CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
      },
    }),
    libraryPage: singleton({
      label: "Library page",
      path: "content/pages/library",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        emptyMessage: fields.text({
          label: "Empty message",
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
        originalNote: fields.text({
          label: "Original links note",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
      },
    }),
    tryPage: singleton({
      label: "Try page",
      path: "content/pages/try",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        externalCtaLabel: fields.text({
          label: "External CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        emptyMessage: fields.text({
          label: "Empty message",
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
      },
    }),
    meetPage: singleton({
      label: "Meet page",
      path: "content/pages/meet",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        intentHeading: fields.text({
          label: "Intent heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        intentText: fields.text({
          label: "Intent text",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 600 } },
        }),
        charterCtaLabel: fields.text({
          label: "Charter CTA label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        emptyMessage: fields.text({
          label: "Empty message",
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
      },
    }),
    aboutPage: singleton({
      label: "About page",
      path: "content/pages/about",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        ecosystemHeading: fields.text({
          label: "Ecosystem heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        ecosystem: fields.array(
          fields.object({
            label: fields.text({
              label: "Label",
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
            text: fields.text({
              label: "Text",
              multiline: true,
              validation: { isRequired: true, length: { min: 1, max: 400 } },
            }),
          }),
          {
            label: "Ecosystem",
            itemLabel: (props) => props.fields.label.value || "Ecosystem item",
          }
        ),
        bioHeading: fields.text({
          label: "Bio heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        bioParagraphs: fields.array(
          fields.text({
            label: "Paragraph",
            multiline: true,
            validation: { isRequired: true, length: { min: 1, max: 800 } },
          }),
          {
            label: "Bio paragraphs",
            itemLabel: (props) =>
              props.value ? props.value.slice(0, 48) + (props.value.length > 48 ? "…" : "") : "Paragraph",
          }
        ),
        links: fields.array(
          fields.object({
            hrefKey: fields.text({
              label: "Link key",
              description: "Stable key used by the site frame. Do not change casually.",
              validation: { isRequired: true, length: { min: 1, max: 60 } },
            }),
            label: fields.text({
              label: "Label",
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
          }),
          {
            label: "Links",
            itemLabel: (props) => props.fields.label.value || "Link",
          }
        ),
      },
    }),
    themesPage: singleton({
      label: "Themes page",
      path: "content/pages/themes",
      format: { data: "yaml" },
      schema: {
        seoTitle: fields.text({
          label: "SEO title",
          validation: { isRequired: true, length: { min: 1, max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        eyebrow: fields.text({
          label: "Eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        emptyMessage: fields.text({
          label: "Empty message",
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
        inDevelopmentLabel: fields.text({
          label: "In-development label",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        relatedEyebrow: fields.text({
          label: "Related pathways eyebrow",
          validation: { isRequired: true, length: { min: 1, max: 60 } },
        }),
        relatedHeading: fields.text({
          label: "Related pathways heading",
          validation: { isRequired: true, length: { min: 1, max: 160 } },
        }),
        relatedPathways: fields.array(
          fields.object({
            key: fields.text({
              label: "Pathway key",
              description: "Stable key used by the site frame. Do not change casually.",
              validation: { isRequired: true, length: { min: 1, max: 60 } },
            }),
            label: fields.text({
              label: "Label",
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
            text: fields.text({
              label: "Text",
              multiline: true,
              validation: { isRequired: true, length: { min: 1, max: 400 } },
            }),
          }),
          {
            label: "Related pathways",
            itemLabel: (props) => props.fields.label.value || "Pathway",
          }
        ),
        defaultPlaceholderMessage: fields.text({
          label: "Default placeholder message",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 600 } },
        }),
        featuredHeading: fields.text({
          label: "Featured works heading",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        moreHeading: fields.text({
          label: "More works heading",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
        worksHeading: fields.text({
          label: "Works heading",
          validation: { isRequired: true, length: { min: 1, max: 80 } },
        }),
      },
    }),
    siteFooter: singleton({
      label: "Site footer",
      path: "content/site/footer",
      format: { data: "yaml" },
      schema: {
        tagline: fields.text({
          label: "Tagline",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
      },
    }),
  },
  collections: {
    works: collection({
      label: "Works (Content Library)",
      path: "content/works/*",
      slugField: "title",
      format: { contentField: "body" },
      // "content" layout puts the (usually empty, often long) document body
      // in its own focus pane and keeps every other field in a persistent
      // sidebar — so publication-critical fields never require scrolling
      // past the body to compare two records. See docs/CONTENT_GOVERNANCE.md.
      entryLayout: "content",
      columns: ["status", "publicationState", "contentMode", "type", "date", "featured"],
      schema: {
        // ============================================================
        // A. IDENTITY + PUBLICATION ESSENTIALS
        // Everything that decides whether a record can appear publicly.
        // Keep this group first and short enough to compare two records
        // without scrolling.
        // ============================================================
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true, length: { min: 1, max: 160 } },
          },
        }),
        status: fields.select({
          label: "Website visibility",
          options: [
            { label: "Draft — never shown publicly", value: "draft" },
            { label: "Listed — publicly visible once every other requirement is met", value: "listed" },
            { label: "Archived — kept for the record; not shown publicly", value: "archived" },
          ],
          defaultValue: "listed",
          description:
            "CHECKLIST — a record only appears in the public Library, Start Here, and theme pages when ALL of these are true: Website visibility is Listed; Editorial state (below) is Published; Added date is set; and the content required by Content mode is present (Hosted needs the body written below; Summary needs a full sentence or two; Reference needs a working source URL). Missing any one hides it everywhere. — Draft: never shown publicly, regardless of other fields. Archived: kept in Git for the record; also never shown publicly.",
        }),
        publicationState: fields.select({
          label: "Editorial state",
          options: [
            { label: "Published", value: "published" },
            { label: "Developing", value: "developing" },
          ],
          defaultValue: "developing",
          description:
            "Published means the content is editorially ready — but that alone does not make it public; Website visibility must also be Listed. Developing: safe to edit here, but always hidden from every public surface no matter what else is set.",
        }),
        date: fields.date({
          label: "Added date",
          description:
            "Required before a Listed + Published work can appear publicly. This is the date it joined GetToKnow.You, not necessarily when it was first published elsewhere (see Published date). Leave blank only while Website visibility is Draft and Editorial state is Developing — do not guess.",
        }),
        publishedDate: fields.date({
          label: "Published date",
          description: "Optional original publication date. Leave blank when unknown — do not guess.",
        }),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Essay", value: "essay" },
            { label: "Story", value: "story" },
            { label: "Practice", value: "practice" },
            { label: "Project", value: "project" },
            { label: "Video", value: "video" },
            { label: "Article", value: "article" },
            { label: "Guide", value: "guide" },
            { label: "Resource", value: "resource" },
            { label: "Other", value: "other" },
          ],
          defaultValue: "essay",
        }),
        contentMode: fields.select({
          label: "Content mode",
          options: [
            { label: "Hosted — full material in the body below", value: "hosted" },
            { label: "Summary — a short summary is enough", value: "summary" },
            { label: "Reference — annotated external source", value: "reference" },
          ],
          defaultValue: "summary",
          description:
            "Decides what must be filled in for this record to count as publicly complete. Hosted: the full write-up must be in the document body — a Native video alone does NOT satisfy Hosted, even though the video still plays on the page; if the material is only a video, use Summary instead. Summary: the Summary field alone (20+ characters) is enough; attach a Native video below if there is one. Reference: needs a usable external source URL plus a short annotation or summary.",
        }),
        summary: fields.text({
          label: "Summary",
          description:
            "One or two sentences for library cards. Required for every record, and is itself the public content when Content mode is Summary. Do not paste the full article here.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        featured: fields.checkbox({
          label: "Featured",
          description:
            "Eligible for prominent placement (for example the homepage) once already publicly eligible. Does not place it in Start Here on its own — edit the Start Here singleton sequence for that.",
          defaultValue: false,
        }),

        // ============================================================
        // B. MAIN CONTENT
        // What visitors actually see on the work page.
        // ============================================================
        keyTakeaway: fields.text({
          label: "Key takeaway",
          description: "Optional one-sentence insight, shown on the page. Do not repeat the summary verbatim.",
          multiline: true,
          validation: { length: { max: 280 } },
        }),
        annotation: fields.text({
          label: "Annotation",
          description:
            "Why this work matters or was included — shown on the page. Especially useful for Reference and Summary records. Do not paste the full body here.",
          multiline: true,
          validation: { length: { max: 800 } },
        }),
        video: fields.text({
          label: "Native video",
          description:
            'Site path to an MP4 served from this site, for example "/media/posts/teenager.mp4". Plays on the work page whenever set, regardless of Content mode. Do not paste Xiaohongshu or Instagram embed codes; use exact filename casing.',
          validation: { length: { max: 500 } },
        }),
        coverImage: fields.text({
          label: "Cover image",
          description:
            'Site path for the library card and hero, for example "/media/posts/teenager.jpg". Prefer this over Thumbnail for new work.',
          validation: { length: { max: 500 } },
        }),
        thumbnail: fields.text({
          label: "Thumbnail (legacy)",
          description: "Optional fallback image path or URL, only used when Cover image is empty.",
          validation: { length: { max: 500 } },
        }),
        body: fields.markdoc({
          label: "Full document body",
          description:
            "Required when Content mode is Hosted — that is the only way a Hosted record becomes publicly complete. Leave empty for Summary or Reference records. Supports paragraphs, headings, emphasis, links, quotations, lists, dividers, and images.",
          extension: "mdoc",
          options: {
            bold: true,
            italic: true,
            strikethrough: false,
            code: false,
            heading: [2, 3],
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: false,
            link: true,
            image: true,
            divider: true,
            codeBlock: false,
          },
        }),

        // ============================================================
        // C. ORGANISATION AND DISCOVERY
        // ============================================================
        themes: fields.multiselect({
          label: "Themes (editorial rooms)",
          description:
            "Stable Theme identifiers. Display titles come from Theme records — renaming a theme does not require editing this work.",
          options: [...THEME_OPTIONS],
          defaultValue: [],
        }),
        topics: fields.multiselect({
          label: "Topics (collections)",
          description:
            "Which thematic collections should surface this item. A work may belong to several collections without being duplicated.",
          options: COLLECTIONS.map((c) => ({ label: c.name, value: c.slug })),
          defaultValue: [],
        }),
        series: fields.text({
          label: "Series",
          description:
            'Optional. For example "Conversations I Wish I\u2019d Had". Leave blank if not part of a series.',
          validation: { length: { max: 120 } },
        }),
        languages: fields.multiselect({
          label: "Languages",
          description: "Languages present in the body, transcript, or translation.",
          options: [
            { label: "English", value: "English" },
            { label: "Chinese", value: "Chinese" },
          ],
          defaultValue: [],
        }),
        project: fields.select({
          label: "Project",
          options: [
            { label: "GetToKnow.You", value: "gettoknow" },
            { label: "ConversationOS", value: "conversationos" },
            { label: "MandarinOS", value: "mandarinos" },
          ],
          defaultValue: "gettoknow",
          description: "Which project this library item primarily belongs to.",
        }),
        related: fields.array(fields.text({ label: "Related work slug" }), {
          label: "Related works",
          description:
            "Optional ordered slugs of other works to show under Related content. Leave empty to use series/topic matching instead.",
          itemLabel: (props) => props.value || "Related slug",
        }),

        // ============================================================
        // D. ORIGIN AND DISTRIBUTION
        // ============================================================
        origin: fields.select({
          label: "Origin (first published)",
          options: [{ label: "Not specified", value: "" }, ...ORIGIN_OPTIONS],
          defaultValue: "",
          description: "Where this item first appeared. Separate from the canonical source below.",
        }),
        canonicalPlatform: fields.select({
          label: "Canonical platform",
          options: [{ label: "Not specified", value: "" }, ...CANONICAL_PLATFORM_OPTIONS],
          defaultValue: "",
          description:
            "Where the authoritative current version lives. Choose GetToKnow.You when this site hosts the canonical version — the public URL is then derived as /library/[slug]; you do not type it.",
        }),
        canonicalUrl: fields.text({
          label: "Canonical URL (external or first-party path)",
          description:
            "For an external canonical source, use an absolute https URL. For a first-party page such as /charter, use the site path. Leave blank when Canonical platform is GetToKnow.You (the library URL is derived automatically), and leave blank for Developing works.",
          validation: { length: { max: 500 } },
        }),
        distributionLinks: fields.array(
          fields.object({
            platform: fields.select({
              label: "Platform",
              options: DISTRIBUTION_PLATFORM_OPTIONS,
              defaultValue: "other",
            }),
            label: fields.text({
              label: "Note (optional)",
              description:
                'Optional extra note, for example "Reel" or "Post 2", if the platform alone is not specific enough.',
              validation: { length: { max: 60 } },
            }),
            url: fields.url({
              label: "URL",
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Distribution links",
            description:
              "Cross-posts and promotions of this one work. Not separate library entries. Never use these as the only Start Here destination.",
            itemLabel: (props) =>
              props.fields.label.value ||
              DISTRIBUTION_PLATFORM_OPTIONS.find((o) => o.value === props.fields.platform.value)
                ?.label ||
              "Distribution link",
          }
        ),
        originalXiaohongshu: fields.url({
          label: "Originally on Xiaohongshu",
          description: "Optional discovery link. Never the only public destination.",
        }),
        originalInstagram: fields.url({
          label: "Originally on Instagram",
          description: "Optional discovery link. Never the only public destination.",
        }),
        originalSubstack: fields.url({
          label: "Originally on Substack",
          description: "Optional discovery link. Never the only public destination.",
        }),
        watchTime: fields.text({
          label: "Watch time",
          description: 'Optional, human-readable. For example "4 min" or "90 sec".',
          validation: { length: { max: 20 } },
        }),
        readTime: fields.text({
          label: "Read time",
          description: 'Optional, human-readable. For example "6 min read".',
          validation: { length: { max: 20 } },
        }),
        sourceTitle: fields.text({
          label: "Source title",
          description: "For references: the original work title, if different from this record.",
          validation: { length: { max: 200 } },
        }),
        sourceAuthor: fields.text({
          label: "Source author",
          description: "For references: author or creator of the original work.",
          validation: { length: { max: 120 } },
        }),
        sourcePublication: fields.text({
          label: "Source publication",
          description: 'For references: for example "Harvard Business Review" or "Substack".',
          validation: { length: { max: 120 } },
        }),

        // ============================================================
        // E. ADVANCED / RARELY USED
        // ============================================================
        seoCanonicalUrl: fields.url({
          label: "SEO canonical URL (advanced)",
          description:
            "Leave blank in almost all cases. Only set when this page substantially duplicates an external canonical work that must remain the SEO-canonical version.",
        }),
      },
    }),

    themes: collection({
      label: "Themes",
      path: "content/themes/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "form",
      columns: ["status", "order", "showInNavigation"],
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description:
              "Visible theme name. Freely editable — changing this does not change the URL slug unless you regenerate it.",
            validation: { isRequired: true, length: { min: 1, max: 120 } },
          },
          slug: {
            label: "URL slug",
            description:
              "Stable public URL segment and work-reference identifier. Do not change casually; title edits do not rewrite this unless you regenerate.",
          },
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Draft — not public", value: "draft" },
            { label: "Placeholder — public room in development", value: "placeholder" },
            { label: "Published — public with associated works", value: "published" },
          ],
          defaultValue: "placeholder",
          description:
            "Placeholder themes are public even with zero works. Draft themes are hidden.",
        }),
        summary: fields.text({
          label: "Summary",
          description: "Short description for theme cards and metadata.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
        }),
        placeholderMessage: fields.text({
          label: "Placeholder message",
          description:
            "Shown when the theme is a placeholder (or has no eligible works) instead of an empty work grid.",
          multiline: true,
          validation: { length: { max: 600 } },
        }),
        coverImage: fields.text({
          label: "Cover image",
          description: 'Optional site path, for example "/media/posts/theme-cover.jpg".',
          validation: { length: { max: 500 } },
        }),
        featuredWorks: fields.array(fields.text({ label: "Work slug" }), {
          label: "Featured works",
          description:
            "Optional ordered work slugs shown first. Only publicly eligible works appear.",
          itemLabel: (props) => props.value || "Work slug",
        }),
        order: fields.integer({
          label: "Order",
          description: "Editorial ordering on /themes. Lower appears first.",
          defaultValue: 100,
        }),
        showInNavigation: fields.checkbox({
          label: "Show in theme navigation",
          description: "Include on theme index / Explore theme surfaces when public.",
          defaultValue: true,
        }),
        seoTitle: fields.text({
          label: "SEO title",
          description: "Optional metadata title override.",
          validation: { length: { max: 120 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          description: "Optional metadata description override.",
          multiline: true,
          validation: { length: { max: 400 } },
        }),
        body: fields.markdoc({
          label: "Introduction",
          description:
            "Editorial framing for the theme page. Supports paragraphs, headings, emphasis, links, and lists.",
          extension: "mdoc",
          options: {
            bold: true,
            italic: true,
            strikethrough: false,
            code: false,
            heading: [2, 3],
            blockquote: true,
            orderedList: true,
            unorderedList: true,
            table: false,
            link: true,
            image: false,
            divider: true,
            codeBlock: false,
          },
        }),
      },
    }),
  },
});
