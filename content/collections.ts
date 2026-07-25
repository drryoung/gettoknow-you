/**
 * Collection taxonomy for the GetToKnow.You content library (Layer 2).
 *
 * This is the single source of truth for collection identity — slug, display
 * name, and short description. keystatic.config.ts imports COLLECTIONS to
 * build the `topics` field options, so the taxonomy is defined once and
 * reused by both the editor schema and the presentation routes.
 *
 * Extend the taxonomy by adding an entry here; no route or schema rewrite
 * is required.
 */
export type CollectionDef = {
  slug: string;
  name: string;
  description: string;
};

export const COLLECTIONS: readonly CollectionDef[] = [
  {
    slug: "stories",
    name: "Stories",
    description: "Real and illustrative moments of conversation, told plainly.",
  },
  {
    slug: "conversation",
    name: "Conversation",
    description: "The mechanics of better conversation—curiosity, questions, and follow-up.",
  },
  {
    slug: "relationships",
    name: "Relationships",
    description: "How conversation turns into trust, friendship, and lasting connection.",
  },
  {
    slug: "emotional-intelligence",
    name: "Emotional Intelligence",
    description: "Noticing, naming, and responding well to what people are feeling.",
  },
  {
    slug: "workplace",
    name: "Workplace",
    description: "Applying these principles at work, across teams and hierarchies.",
  },
  {
    slug: "china",
    name: "China",
    description: "Conversation, culture, and connection in a Chinese context.",
  },
  {
    slug: "language-learning",
    name: "Language Learning",
    description: "Using conversation practice to learn a language, not just a phrasebook.",
  },
] as const;

export function isCollectionSlug(slug: string): boolean {
  return COLLECTIONS.some((c) => c.slug === slug);
}

export function getCollection(slug: string): CollectionDef | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
