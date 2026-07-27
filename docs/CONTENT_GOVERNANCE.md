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
| Curated works (Content Library) | Keystatic `works` collection under `content/works/*.mdoc` | Hybrid library: hosted, summary, and reference works |

Curated works must never become a second charter. Charter wording must never be duplicated into work records, page components, or TypeScript constants.

## Curated works

**Record once. Publish appropriately. Curate everywhere.**

A work record is one Markdoc file: metadata in frontmatter, optional rich body below. The same record may appear in `/library`, `/start-here`, collections, feature pages, homepage selections, and related-work sections. Do not create parallel `libraryItems`, `content/library`, `startHereItems`, or body-only collections. The public Content Library is a presentation of `works`, not a second catalogue.

### Content mode

| Mode | Meaning | Public requirements |
|---|---|---|
| `hosted` | GetToKnow.You holds the complete or primary public version | Non-empty document body; internal `/library/[slug]` page; no external URL required |
| `summary` | Standalone summary or adaptation; visitors understand the idea on-site | Meaningful summary; preferably key takeaway or annotation; external links optional |
| `reference` | Catalogued external source with annotation | Usable source URL; annotation or meaningful summary; attribution where known |

Do not reproduce third-party copyrighted material beyond appropriate quotation and commentary.

**Distribution adaptations** (Xiaohongshu, Instagram, and similar) are optional **distribution links** on the same work — never separate records.

### Publication state and status

* **`status`**: `draft` (never public) · `listed` (public surfaces) · `archived` (archive only; `/works/[slug]` not found)
* **`publicationState`**: `published` (finished; public work page when listed and content-valid) · `developing` (honest signpost; no public work page)

### Public Start Here

Requires listed + published + positive `startHereOrder` + `hosted` or `summary` with accessible internal presentation. References are excluded by default. Cards link to `/library/[slug]` or a first-party page such as `/charter` — never directly to Instagram or Xiaohongshu.

### Provenance

* **Origin** — first appearance
* **Canonical platform** — authoritative current version. Choose `gettoknow-you` when this site hosts it; URL derives as `/library/[slug]` (or an explicit first-party path such as `/charter`)
* **Canonical URL** — external https or first-party path when needed
* **Distribution links** — cross-posts; supplementary on the library page
* **Native video / cover image** — optional site paths under `/media/posts/`; social embeds are not used
* **`seoCanonicalUrl`** — rare advanced override when a page substantially duplicates an external canonical work

Library cards use the internal `href` (`/library/[slug]` or first-party path). External links appear on the library item page. `/works/[slug]` and `/read` permanently redirect into the library.

### Publishing workflow

```text
Create work → metadata → content mode → body or annotation → canonical source → distribution links → publish → curate (Start Here / topics / featured)
```

1. Create or open the work in Keystatic **Works**.
2. Add title, summary, type, topics, series.
3. Choose content mode.
4. Add full body (hosted) or key takeaway / annotation (summary / reference).
5. Set origin and canonical platform.
6. Add external canonical URL only when the authoritative version is not the derived work page.
7. Add distribution links when real URLs exist.
8. Set `listed` + `published` when ready.
9. Optionally set Start Here order and featured.
10. Save, review Git diff, commit, push, verify production.

### Pathway placement and collections

Try / Meet use `content/sitePathways.ts` slug maps. The Library uses all publicly eligible works. Collection taxonomy lives in `content/collections.ts`. Feature and theme pages should reference work slugs and render cards pointing at `/library/[slug]`.

## Page framing copy

Short route-framing copy may live in page components. Substantial editable prose belongs in the Charter Markdoc file or work `.mdoc` bodies/frontmatter — not in TSX.

## How to edit

1. Edit Markdoc/YAML frontmatter in Cursor, or
2. Use local Keystatic at `/keystatic` (development only)

Saving in Keystatic updates repository files; Git + Vercel publish the live site. Production Keystatic remains disabled.

## What content files must not contain

* HTML markup for layout
* CSS or class names as content
* Application logic
* Environment variables or secrets
* Executable scripts

## Review and publish

```text
edit → save → preview locally → review Git diff → validate → commit → push → deploy
```

## Notion and other copies

Notion may hold discussion copies. The repository remains authoritative for the charter and works unless governance changes that.

## Deferred response channel

A public `mailto:` invitation is deferred until a durable public email address is published.
