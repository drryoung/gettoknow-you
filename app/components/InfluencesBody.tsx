import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";

const DISCLAIMER_PREFIX = "GetToKnow.You is an independent initiative";

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
  Document: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Heading: ({
    level,
    children,
  }: {
    level: number;
    children: React.ReactNode;
  }) => {
    const Tag = `h${level}` as "h2" | "h3";
    const id = level === 2 ? "influences" : undefined;
    return <Tag id={id}>{children}</Tag>;
  },
  Paragraph: ({ children }: { children: React.ReactNode }) => {
    const text = textOf(children).trim();
    if (text.startsWith(DISCLAIMER_PREFIX)) {
      return <p className="about-influences__disclaimer">{children}</p>;
    }
    return <p>{children}</p>;
  },
  Strong: ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>,
  Em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
};

export function InfluencesBody({ body }: { body: RenderableTreeNode }) {
  return (
    <div className="about-influences__body">
      {Markdoc.renderers.react(body, React, { components: markdocComponents })}
    </div>
  );
}
