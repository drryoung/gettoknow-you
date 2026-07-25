# Content governance

## Sole authoritative source

`content/community-charter.mdoc` is the **only** authoritative source for Community Charter wording.

The Charter is presented at `/charter`. Moving its presentation off the homepage does **not** alter content authority.

Do not maintain a second copy in TypeScript, JSON, YAML, JSX, a database, or another CMS as a competing source of truth.

## Content domains

GetToKnow.You keeps two separate content domains:

| Domain | Authority | Purpose |
|---|---|---|
| Community Charter | `content/community-charter.mdoc` only | Constitutional foundation of the community |
| Curated works | Keystatic `works` collection under `content/works/*` | Canonical public-commons entries for Explore / Read / Try / Meet |

Curated works must never become a second charter. Charter wording must never be duplicated into work records, page components, or TypeScript constants.

## Curated works

A work record represents a **canonical work**—a substantial idea or artefact worth preserving in the public commons—for example a foundational essay, important story, ConversationOS practice, project explanation, or selected video.

**Distribution adaptations** (Xiaohongshu, Instagram, Facebook, Substack excerpts, and similar) should normally be optional **distribution links** on the canonical work, not separate first-class entries.

**Ephemeral communications** (announcements, reminders, comments, minor variants, temporary updates) should normally remain outside the permanent works collection.

### Publication state

| State | Meaning | Canonical URL |
|---|---|---|
| `published` | A verified work or signpost with a real destination | Required (absolute https URL or a site path such as `/charter`) |
| `developing` | An honest description of work still taking shape | Optional; omit rather than invent |

Developing entries are **signposts**, not claims that a finished publication already exists. They may later be revised, given a verified URL and marked `published`, replaced, or `archived`.

Do not invent external URLs. Published works without a usable URL are excluded by the loader rather than shown as broken links.

### Lifecycle

* `draft` — never shown publicly, anywhere (not Start Here, not a collection, not the archive)
* `listed` — available through `getListedWorks()` for Explore, Start Here, collections, and pathway pages
* `archived` — remains visible in `/explore/archive` for history, but excluded from Start Here and collections

The `date` field is the date the record was **added** to the commons, not necessarily a publication date. `publishedDate` is the true publication date when known; leave it blank rather than guessing.

Work titles, summaries, and URLs must come through the approved loader (`content/loadWorks.ts`). Do not hard-code work copy in page components.

### Content library metadata

Optional fields that make an item findable across the three visitor layers (Start Here, Collections, Archive) without duplicating the record:

* `topics` — collection slugs from `content/collections.ts`. An item may carry several; it still exists once in `content/works/*`.
* `series` — optional grouping of related items (used for the related-content foundation in `selectRelatedWorks`).
* `watchTime` / `readTime` — optional plain-text duration.
* `featured` — eligibility for prominent display.
* `startHereOrder` — position in the curated Start Here sequence. Leave blank to exclude an item from Start Here.
* `thumbnail` — optional image path/URL.

All of these are optional. Missing values must never break rendering — the loader falls back to `null`/`[]`/`false` defaults.

### Pathway placement

Read / Try / Meet select approved works through a presentation-level slug map (`content/sitePathways.ts`). This keeps editing simple while the taxonomy is still young. Do not invent multiple theme systems in content files for this increment.

### Collection taxonomy

`content/collections.ts` is the single source of truth for collection slug, display name, and description. `keystatic.config.ts` imports it to build the `topics` field options, so the taxonomy is defined once. Extend the taxonomy by adding an entry there — do not hard-code a second list of collection names anywhere else.

## Page framing copy

Short interface and route-framing copy (hero lines, pathway blurbs, empty states) may live in page components.

Substantial editable prose belongs in:

* the Charter Markdoc file; or
* curated work YAML entries.

Do not bury long durable essays in TSX.

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
