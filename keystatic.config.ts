/**
 * Keystatic local content editor — GetToKnow.You.
 * Storage is local-only; production routes are disabled separately.
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
      label: "Works",
      path: "content/works/*",
      slugField: "title",
      format: { data: "yaml" },
      entryLayout: "form",
      columns: ["type", "publicationState", "status", "featured"],
      schema: {
        // — Identity — what the item is.
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true, length: { min: 1, max: 160 } },
          },
        }),
        summary: fields.text({
          label: "Summary",
          description: "One or two sentences for library listings.",
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

        // — Editorial organisation — where it fits in the library.
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

        // — Publication — is it finished, and is it visible to visitors?
        status: fields.select({
          label: "Website visibility (status)",
          options: [
            { label: "Draft — not publicly visible", value: "draft" },
            { label: "Listed — publicly visible", value: "listed" },
            { label: "Archived — kept in the archive only", value: "archived" },
          ],
          defaultValue: "listed",
          description:
            "Controls where this record can appear on the site. Draft: never shown publicly, anywhere. Listed: appears on /explore, Start Here, collections, and the archive. Archived: stays visible only in the complete archive (hidden from Start Here and collections). Changing a work from Draft to Listed makes it eligible for public display, subject to the rules above — it does not bypass them (for example a Listed item still needs a real destination before it shows a working link).",
        }),
        publicationState: fields.select({
          label: "Editorial maturity (publication state)",
          options: [
            { label: "Published", value: "published" },
            { label: "Developing", value: "developing" },
          ],
          defaultValue: "developing",
          description:
            "A separate concept from website visibility above. Published: a finished piece with a verified canonical URL. Developing: an honest signpost for something still taking shape, shown with an \u201cIn development\u201d label and no link. A work can be Listed and Developing at the same time — visible on the site as a transparent work-in-progress.",
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

        // — Curation — prominence and the Start Here sequence.
        featured: fields.checkbox({
          label: "Featured",
          description:
            "Marks this item as eligible for prominent future placement (for example a homepage or Start Here highlight). Featured alone does not place it in Start Here — set Start Here order for that.",
          defaultValue: false,
        }),
        startHereOrder: fields.integer({
          label: "Start Here order",
          description:
            "Leave blank if this item should not appear in Start Here. Otherwise set a number — lower numbers appear earlier. Draft and Archived records are still excluded from Start Here even if a number is set here.",
        }),

        // — Media — what visitors see and how long it takes.
        thumbnail: fields.text({
          label: "Thumbnail",
          description:
            "Optional image path or URL to represent this item visually. Leave blank if unknown — missing thumbnails render safely.",
          validation: { length: { max: 500 } },
        }),
        watchTime: fields.text({
          label: "Watch time",
          description: 'Optional, human-readable. For example "4 min" or "90 sec". Leave blank if unknown.',
          validation: { length: { max: 20 } },
        }),
        readTime: fields.text({
          label: "Read time",
          description: 'Optional, human-readable. For example "6 min read". Leave blank if unknown.',
          validation: { length: { max: 20 } },
        }),

        // — Provenance — where it came from and where the authoritative copy lives.
        origin: fields.select({
          label: "Origin",
          options: [{ label: "Not specified", value: "" }, ...ORIGIN_OPTIONS],
          defaultValue: "",
          description:
            "Optional. Where this item was first published or created, before any later distribution. Recorded for history and future filtering only — it does not affect routing or the canonical URL.",
        }),
        canonicalPlatform: fields.select({
          label: "Canonical platform",
          options: [{ label: "Not specified", value: "" }, ...CANONICAL_PLATFORM_OPTIONS],
          defaultValue: "",
          description:
            "Select the platform hosting the authoritative version of this work. The actual destination remains the Canonical URL field below — this only records which platform that URL points to.",
        }),
        canonicalUrl: fields.text({
          label: "Canonical URL",
          description:
            "Required for published works. Use an absolute https URL, or a site path such as /charter. Leave blank for developing works. Do not invent URLs.",
          validation: { length: { max: 500 } },
        }),

        // — Distribution — every platform adaptation of this one work.
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
              "Every platform adaptation of this one canonical work — for example both an Instagram post and a Xiaohongshu post for the same video. Not separate library entries. Add one row per link; leave a link out entirely until its real URL exists rather than adding a placeholder.",
            itemLabel: (props) =>
              props.fields.label.value ||
              DISTRIBUTION_PLATFORM_OPTIONS.find((o) => o.value === props.fields.platform.value)
                ?.label ||
              "Distribution link",
          }
        ),
      },
    }),
  },
});
