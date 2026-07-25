/**
 * Loads the About-page “Our Influences” acknowledgment from Markdoc.
 * Editable prose lives in content/about-influences.mdoc — not in page TSX.
 */
import { readFile } from "fs/promises";
import path from "path";
import Markdoc, { type Config, type Node, type RenderableTreeNode } from "@markdoc/markdoc";

const SOURCE = path.join(process.cwd(), "content/about-influences.mdoc");

/**
 * Map built-in nodes to PascalCase tags so React components can intercept them.
 * (Markdoc’s React renderer only looks up components for PascalCase names.)
 */
const transformConfig: Config = {
  nodes: {
    document: {
      ...Markdoc.nodes.document,
      render: "Document",
    },
    heading: {
      children: Markdoc.nodes.heading.children,
      attributes: Markdoc.nodes.heading.attributes,
      transform(node: Node, config: Config) {
        return new Markdoc.Tag(
          "Heading",
          { level: node.attributes.level },
          node.transformChildren(config)
        );
      },
    },
    paragraph: {
      ...Markdoc.nodes.paragraph,
      render: "Paragraph",
    },
    strong: {
      ...Markdoc.nodes.strong,
      render: "Strong",
    },
    em: {
      ...Markdoc.nodes.em,
      render: "Em",
    },
  },
};

export type AboutInfluences = {
  body: RenderableTreeNode;
};

export async function getAboutInfluences(): Promise<AboutInfluences> {
  const raw = await readFile(SOURCE, "utf8");
  const ast = Markdoc.parse(raw);
  const body = Markdoc.transform(ast, transformConfig);
  return { body };
}
