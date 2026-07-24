/**
 * Server-side Community Charter loader.
 *
 * Reads content/community-charter.mdoc via the Keystatic reader and returns
 * frontmatter plus a transformed Markdoc render tree for the presentation page.
 */
import { createReader } from "@keystatic/core/reader";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import path from "path";
import keystaticConfig from "../keystatic.config";

const reader = createReader(path.join(process.cwd()), keystaticConfig);

export type CharterMeta = {
  title: string;
  version: string;
  status: string;
  description: string;
};

export type CharterContent = CharterMeta & {
  /** Markdoc render tree for the charter body (not frontmatter). */
  body: RenderableTreeNode;
};

export async function getCommunityCharter(): Promise<CharterContent> {
  const data = await reader.singletons.communityCharter.read();
  if (!data) {
    throw new Error(
      "Community Charter is missing. Expected content/community-charter.mdoc (Keystatic singleton)."
    );
  }

  const title = data.title?.trim();
  const version = data.version?.trim();
  const status = data.status?.trim();
  const description = data.description?.trim();

  if (!title || !version || !status || !description) {
    throw new Error("Community Charter frontmatter is incomplete.");
  }

  const bodyEntry = await data.body();
  if (!bodyEntry?.node) {
    throw new Error("Community Charter body is missing.");
  }

  const body = Markdoc.transform(bodyEntry.node);

  return {
    title,
    version,
    status,
    description,
    body,
  };
}
