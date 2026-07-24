/**
 * Keystatic local content editor — GetToKnow.You Community Charter.
 * Storage is local-only; production routes are disabled separately.
 */
import { config, fields, singleton } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "GetToKnow.You Content" },
    navigation: {
      Community: ["communityCharter"],
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
});
