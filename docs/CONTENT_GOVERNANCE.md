# Content governance

## Sole authoritative source

`content/community-charter.mdoc` is the **only** authoritative source for Community Charter wording.

Do not maintain a second copy in TypeScript, JSON, YAML, JSX, a database, or another CMS as a competing source of truth.

## Content domains

GetToKnow.You keeps two separate content domains:

| Domain | Authority | Purpose |
|---|---|---|
| Community Charter | `content/community-charter.mdoc` only | Constitutional foundation of the community |
| Curated works | Keystatic `works` collection under `content/works/*` | Canonical public-commons entries shown on `/explore` |

Curated works must never become a second charter. Charter wording must never be duplicated into work records, page components, or TypeScript constants.

## Curated works

A work record represents a **canonical work**—a substantial idea or artefact worth preserving in the public commons—for example a foundational essay, important story, ConversationOS practice, project explanation, or selected video.

**Distribution adaptations** (Xiaohongshu, Instagram, Facebook, Substack excerpts, and similar) should normally be optional **distribution links** on the canonical work, not separate first-class entries.

**Ephemeral communications** (announcements, reminders, comments, minor variants, temporary updates) should normally remain outside the permanent works collection.

### Lifecycle

* `listed` — appears on `/explore` through `getListedWorks()`
* `archived` — remains in the repository for history, but is excluded from `/explore`

Explore content must come through the approved loader (`content/loadWorks.ts`). Do not hard-code work titles, summaries, or URLs in page components.

## How to edit ordinary wording

Preferred options:

1. Edit `content/community-charter.mdoc` directly in Cursor, or
2. Edit through the local Keystatic Admin UI at `/keystatic` (development only)

For curated works, prefer the local Keystatic **Works** collection form. Saving updates repository files under `content/works/`; it does not publish the live site.

Page components control visual presentation (layout, typography, motion). They must not become a place to revise charter prose or curated-work copy.

## What content files must not contain

Charter and works content files must not include:

* HTML markup for layout
* CSS or class names as content
* Application logic
* Environment variables or secrets
* Executable scripts

## Review and publish

All wording and works changes remain reviewable through Git.

Typical flow:

```text
edit → save → preview locally → review Git diff → validate → commit → push → deploy
```

Keystatic is the local editing interface only. Production Keystatic routes remain disabled. Git remains the publishing and audit path.

## Notion and other copies

Notion (or similar tools) may later hold a published or collaborative copy for discussion.

They must **not** silently become a competing authoritative source. If a Notion page exists, treat the repository Markdoc file as canonical for the charter, and the repository works collection as canonical for curated works, unless an explicit governance decision changes that.

## Deferred response channel

A public `mailto:` response invitation is deferred until a durable public email address is published in repository configuration or documentation. Do not invent or hard-code an address.
