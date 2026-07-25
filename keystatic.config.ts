/**
 * Keystatic local content editor — GetToKnow.You.
 * Storage is local-only; production routes are disabled separately.
 */
import { config, fields, singleton, collection } from "@keystatic/core";
import { COLLECTIONS } from "./content/collections";

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
        publicationState: fields.select({
          label: "Publication state",
          options: [
            { label: "Published", value: "published" },
            { label: "Developing", value: "developing" },
          ],
          defaultValue: "developing",
          description:
            "Published works need a canonical URL. Developing works are honest signposts and may omit the URL.",
        }),
        canonicalUrl: fields.text({
          label: "Canonical URL",
          description:
            "Required for published works. Use an absolute https URL, or a site path such as /charter. Leave blank for developing works. Do not invent URLs.",
          validation: { length: { max: 500 } },
        }),
        distributionLinks: fields.array(
          fields.object({
            label: fields.text({
              label: "Label",
              description: 'For example "Xiaohongshu" or "Instagram".',
              validation: { isRequired: true, length: { min: 1, max: 60 } },
            }),
            url: fields.url({
              label: "URL",
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Distribution links / platforms",
            description:
              "Optional social or platform adaptations of this canonical work (for example Xiaohongshu or YouTube). Not separate entries.",
            itemLabel: (props) => props.fields.label.value || "Distribution link",
          }
        ),
        topics: fields.multiselect({
          label: "Topics (collections)",
          description:
            "Which thematic collections should surface this item. An item may belong to several collections without being duplicated.",
          options: COLLECTIONS.map((c) => ({ label: c.name, value: c.slug })),
          defaultValue: [],
        }),
        series: fields.text({
          label: "Series",
          description: 'Optional. For example "Conversations I Wish I\u2019d Had". Leave blank if not part of a series.',
          validation: { length: { max: 120 } },
        }),
        watchTime: fields.text({
          label: "Watch time",
          description: 'Optional. For example "4 min". Leave blank if unknown.',
          validation: { length: { max: 20 } },
        }),
        readTime: fields.text({
          label: "Read time",
          description: 'Optional. For example "3 min read". Leave blank if unknown.',
          validation: { length: { max: 20 } },
        }),
        thumbnail: fields.text({
          label: "Thumbnail",
          description: "Optional image path or URL. Leave blank if unknown.",
          validation: { length: { max: 500 } },
        }),
        featured: fields.checkbox({
          label: "Featured",
          description: "Eligible for prominent display (for example homepage or Start Here highlights).",
          defaultValue: false,
        }),
        startHereOrder: fields.integer({
          label: "Start Here order",
          description:
            "Optional. Set a number to include this item in the curated Start Here sequence, lowest first. Leave blank to exclude it.",
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Listed", value: "listed" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "listed",
          description:
            "Draft items never appear publicly. Listed works appear on /explore and its collections. Archived works stay in the archive but are hidden from Start Here and collections.",
        }),
      },
    }),
  },
});
