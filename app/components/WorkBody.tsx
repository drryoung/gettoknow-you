import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";

/**
 * Markdoc's default transform emits lowercase HTML tag names (p, h2, a, …).
 * Map those directly so hosted/summary bodies render without a custom schema.
 */
const markdocComponents = {
  article: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  p: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  h2: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  h3: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  ul: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  ol: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  li: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>,
  em: ({ children }: { children: React.ReactNode }) => <em>{children}</em>,
  a: ({ href, children }: { href: string; children: React.ReactNode }) => {
    const external = /^https?:\/\//i.test(href);
    return (
      <a href={href} {...(external ? { rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote>{children}</blockquote>
  ),
  hr: () => <hr />,
  img: ({ src, alt }: { src: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Keystatic Markdoc image paths are plain URLs/paths
    <img src={src} alt={alt ?? ""} />
  ),
};

export function WorkBody({ body }: { body: RenderableTreeNode }) {
  return (
    <div className="work-body">
      {Markdoc.renderers.react(body, React, { components: markdocComponents })}
    </div>
  );
}
