/**
 * Keystatic local content editor — GetToKnow.You.
 * Storage is local-only; production routes are disabled separately.
 */
import { config, fields, singleton, collection } from "@keystatic/core";

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
      columns: ["type", "date", "status"],
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: { isRequired: true, length: { min: 1, max: 160 } },
          },
        }),
        summary: fields.text({
          label: "Summary",
          description: "One or two sentences for the Explore list.",
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
            { label: "Other", value: "other" },
          ],
          defaultValue: "essay",
        }),
        date: fields.date({
          label: "Date",
          validation: { isRequired: true },
        }),
        canonicalUrl: fields.url({
          label: "Canonical URL",
          description: "Primary location of this work.",
          validation: { isRequired: true },
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
            label: "Distribution links",
            description:
              "Optional social or platform adaptations of this canonical work. Not separate entries.",
            itemLabel: (props) => props.fields.label.value || "Distribution link",
          }
        ),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Listed", value: "listed" },
            { label: "Archived", value: "archived" },
          ],
          defaultValue: "listed",
          description: "Listed works appear on /explore. Archived works stay in the repo but are hidden.",
        }),
      },
    }),
  },
});
