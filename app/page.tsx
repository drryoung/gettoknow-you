import React from "react";
import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import { getCommunityCharter } from "../content/loadCharter";

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

function Thread({ className = "" }: { className?: string }) {
  return (
    <svg className={`thread ${className}`} viewBox="0 0 1200 360" aria-hidden="true">
      <path className="thread-path--soup" d="M20 80 C220 10, 300 220, 500 145 S780 40, 1180 130" />
      <path className="thread-path--rice" d="M40 240 C260 320, 350 100, 560 215 S850 330, 1160 210" />
      <path className="thread-path--stew" d="M420 145 C520 160, 600 90, 705 120" />
      <path className="thread-path--dessert" d="M560 215 C650 230, 730 170, 840 185" />
      <path className="thread-path--fruit" d="M180 120 C320 80, 480 200, 640 160 S920 280, 1100 200" />
    </svg>
  );
}

function CharterBody({ body }: { body: RenderableTreeNode }) {
  return (
    <div className="charter__body">
      {Markdoc.renderers.react(body, React, { components: markdocComponents })}
    </div>
  );
}

export default async function Home() {
  const charter = await getCommunityCharter();

  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="GetToKnow.You home">
          GetToKnow.You
        </a>
        <nav aria-label="Primary">
          <a href="#purpose">Purpose</a>
          <a href="#principles">Principles</a>
          <a href="#ecosystem">Ecosystem</a>
          <a href="#decision-test">Decision test</a>
        </nav>
      </header>

      <section id="top" className="screen shell charter-hero" aria-labelledby="charter-title">
        <Thread className="hero-thread" />
        <div className="charter-hero__copy">
          <p className="eyebrow">GetToKnow.You</p>
          <h1 id="charter-title">Community Charter</h1>
          <p className="charter-hero__meta">
            Version {charter.version} — {charter.status}
          </p>
          <p className="charter-hero__description">{charter.description}</p>
        </div>
      </section>

      <article
        className="screen shell charter"
        aria-label={charter.title}
        data-document-title={charter.title}
      >
        <CharterBody body={charter.body} />
      </article>

      <section className="screen shell explore-pathway" aria-label="Explore the public commons">
        <p className="eyebrow">Public commons</p>
        <p className="explore-pathway__text">
          <a href="/explore">Explore selected ideas, stories and projects</a>
        </p>
      </section>

      <footer className="footer shell">
        <div>
          <b>GetToKnow.You</b>
          <p>{charter.description}</p>
        </div>
        <small>
          © {new Date().getFullYear()} GetToKnow.You. Community Charter v{charter.version} —{" "}
          {charter.status}.
        </small>
      </footer>
    </main>
  );
}
