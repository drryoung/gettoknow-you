import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";

const PULL_QUOTES = new Set([
  "Conversation is the mechanism.",
  "Relationship is the destination.",
]);

/** Stable nav ids for known charter section headings (presentation only). */
const SECTION_IDS: Record<string, string> = {
  Purpose: "purpose",
  Vision: "vision",
  "Five Principles": "principles",
  "The Ecosystem": "ecosystem",
  "Decision Test": "decision-test",
};

function textOf(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

const markdocComponents = {
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => {
    const Tag = `h${level}` as "h2" | "h3";
    const label = textOf(children).trim();
    const id = level === 2 ? SECTION_IDS[label] : undefined;
    return <Tag id={id}>{children}</Tag>;
  },
  Paragraph: ({ children }: { children: React.ReactNode }) => {
    const text = textOf(children).trim();
    if (text === "↓") {
      return (
        <p className="charter__flow-arrow" aria-hidden="true">
          ↓
        </p>
      );
    }
    if (PULL_QUOTES.has(text)) {
      return <p className="charter__pull">{children}</p>;
    }
    return <p>{children}</p>;
  },
  List: ({
    ordered,
    children,
  }: {
    ordered: boolean;
    children: React.ReactNode;
  }) => {
    const Tag = ordered ? "ol" : "ul";
    return <Tag>{children}</Tag>;
  },
  Item: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  Strong: ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>,
  Em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
};

export function CharterBody({ body }: { body: RenderableTreeNode }) {
  return (
    <div className="charter__body">
      {Markdoc.renderers.react(body, React, { components: markdocComponents })}
    </div>
  );
}
