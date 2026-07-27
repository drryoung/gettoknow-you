/**
 * Keystatic local content editor — GetToKnow.You.
 * Storage is local-only; production routes are disabled separately.
 *
 * Works are single Markdoc records: metadata in frontmatter, optional body
 * below. Record once; publish and curate everywhere from the same entry.
 */
import { config, fields, singleton, collection } from "@keystatic/core";
import { COLLECTIONS } from "./content/collections";
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
      Community: ["communityCharter"],
      Commons: ["works"],
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
  },
  collections: {
    works: collection({
      label: "Works (Content Library)",
      path: "content/works/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "form",
      columns: ["type", "contentMode", "publicationState", "status", "featured"],
      schema: {
        // — Identity —
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true, length: { min: 1, max: 160 } },
          },
        }),
        summary: fields.text({
          label: "Summary",
          description:
            "One or two sentences for library cards. Do not paste the full article here.",
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 400 } },
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
        topics: fields.multiselect({
          label: "Topics (collections)",
          description:
            "Which thematic collections should surface this item. An item may belong to several collections without being duplicated.",
          options: COLLECTIONS.map((c) => ({ label: c.name, value: c.slug })),
          defaultValue: [],
        }),
        series: fields.text({
          label: "Series",
          description:
            'Optional. For example "Conversations I Wish I\u2019d Had". Leave blank if not part of a series.',
          validation: { length: { max: 120 } },
        }),

        // — Publication —
        status: fields.select({
          label: "Website visibility (status)",
          options: [
            { label: "Draft — not publicly visible", value: "draft" },
            { label: "Listed — publicly visible", value: "listed" },
            { label: "Archived — kept in the archive only", value: "archived" },
          ],
          defaultValue: "listed",
          description:
            "Draft: never shown publicly. Listed: eligible for Explore, Start Here, collections, and archive. Archived: archive only.",
        }),
        publicationState: fields.select({
          label: "Editorial maturity (publication state)",
          options: [
            { label: "Published", value: "published" },
            { label: "Developing", value: "developing" },
          ],
          defaultValue: "developing",
          description:
            "Published: finished and safe for visitors. Developing: editable in Keystatic but hidden from every public surface until published.",
        }),
        contentMode: fields.select({
          label: "Content mode",
          options: [
            {
              label: "Hosted — full material on GetToKnow.You",
              value: "hosted",
            },
            {
              label: "Summary — standalone summary or adaptation",
              value: "summary",
            },
            {
              label: "Reference — external source with annotation",
              value: "reference",
            },
          ],
          defaultValue: "summary",
          description:
            "Hosted: fill the document body (required for public hosted works). Summary: visitors understand the idea on the work page; external links optional. Reference: catalogue an external source; do not reproduce copyrighted material.",
        }),
        date: fields.date({
          label: "Added date",
          description:
            "Date this record was added to the commons (not necessarily a publication date).",
          validation: { isRequired: true },
        }),
        publishedDate: fields.date({
          label: "Published date",
          description:
            "The actual publication date, if known. Leave blank if unknown — do not guess.",
        }),

        // — Hosted / summary material —
        keyTakeaway: fields.text({
          label: "Key takeaway",
          description:
            "Optional short insight for summary and hosted pages. One sentence. Do not repeat the summary verbatim.",
          multiline: true,
          validation: { length: { max: 280 } },
        }),
        annotation: fields.text({
          label: "Annotation",
          description:
            "Why this work matters or why it was included. Especially useful for references and summaries. Do not paste the full body here.",
          multiline: true,
          validation: { length: { max: 800 } },
        }),
        body: fields.markdoc({
          label: "Full document body",
          description:
            "Use when Content mode is Hosted (required for public hosted works). Leave empty for an external reference. Optional short adaptation for summaries. Supports paragraphs, headings, emphasis, links, quotations, lists, dividers, and images.",
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

        // — Source and provenance —
        origin: fields.select({
          label: "Origin (first published)",
          options: [{ label: "Not specified", value: "" }, ...ORIGIN_OPTIONS],
          defaultValue: "",
          description:
            "Where this item first appeared. Separate from the canonical source below.",
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
            "For an external canonical source, use an absolute https URL. For a first-party page such as /charter, use the site path. Leave blank when Canonical platform is GetToKnow.You (the library URL is derived automatically). Leave blank for developing works.",
          validation: { length: { max: 500 } },
        }),
        seoCanonicalUrl: fields.url({
          label: "SEO canonical URL (advanced)",
          description:
            "Optional. Emit an external HTML rel=canonical only when this page substantially duplicates an external canonical work and that external publication remains canonical. Leave blank in almost all cases — summary and reference pages keep their own internal canonical URL.",
        }),

        // — Distribution —
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

        // — Media (native library) —
        coverImage: fields.text({
          label: "Cover image",
          description:
            'Site path for the library card and hero, for example "/media/posts/teenager.jpg". Prefer this over Thumbnail for new work.',
          validation: { length: { max: 500 } },
        }),
        video: fields.text({
          label: "Native video",
          description:
            'Optional site path to an MP4 served from this site, for example "/media/posts/teenager.mp4". Do not paste Xiaohongshu or Instagram embed codes.',
          validation: { length: { max: 500 } },
        }),
        thumbnail: fields.text({
          label: "Thumbnail (legacy)",
          description:
            "Optional fallback image path or URL when Cover image is empty.",
          validation: { length: { max: 500 } },
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

        // — Original social discovery (optional) —
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

        // — Related (explicit) —
        related: fields.array(fields.text({ label: "Related work slug" }), {
          label: "Related works",
          description:
            "Optional ordered slugs of other works to show under Related content. Leave empty to use series/topic matching.",
          itemLabel: (props) => props.value || "Related slug",
        }),

        // — Curation —
        featured: fields.checkbox({
          label: "Featured",
          description:
            "Eligible for prominent placement. Featured alone does not place it in Start Here.",
          defaultValue: false,
        }),
        startHereOrder: fields.integer({
          label: "Start Here order",
          description:
            "Leave blank to exclude from /start-here. Unique positive numbers; lower appears first. Also requires Listed, Published, Content mode Hosted or Summary with usable internal content, and a working internal presentation. Reference works are excluded. Order alone is never enough.",
        }),
      },
    }),
  },
});
