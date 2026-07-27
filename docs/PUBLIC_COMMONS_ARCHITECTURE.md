# Public commons architecture

Authority document for the GetToKnow.You public commons and visitor-facing site structure.

> GetToKnow.You is the durable public commons. Social platforms are discovery and distribution channels. Attached community spaces may hold live interaction later, but they are not the permanent source of authority.

## 1. Purpose

Welcome people into a careful public commons for meaningful conversation and relationship—preserving curated works beside the Community Charter without turning the site into a social network, magazine CMS, or mirror of every platform post.

## 2. Architectural model

* **Visitor-centred public site** built with Next.js App Router.
* **Five pathways:** Explore, Read, Try, Meet, About.
* **Git-backed content** edited locally through Keystatic (`storage: local`).
* **Two content domains:** Community Charter (singleton Markdoc) and curated works (YAML collection).
* **Presentation pages** load durable content through approved server loaders; short route-framing copy may live in page components.
* **Production Keystatic** remains unavailable (404). Publish via Git.

## 3. Current implementation boundary

In scope now:

* Visitor homepage at `/`
* Pathways: `/explore`, `/read`, `/try`, `/meet`, `/about`
* Community Charter at `/charter` from the sole Markdoc source
* Keystatic `works` collection under `content/works/*`, extended with a
  content-library metadata model (topics, series, timing, featured, Start
  Here ordering — see §6a)
* A three-layer content library surfaced through `/explore`: **Start Here**,
  **Collections** (`/explore/[collection]`), and **Archive**
  (`/explore/archive`)
* `getListedWorks()`, `getStartHereWorks()`, `getFeaturedWorks()`,
  `getCollectionWorks()`, `getArchiveWorks()`, `getRelatedWorks()`, and
  presentation-level pathway slug mapping
* Published, developing, and draft work states
* Governance, design, and architecture documentation
* Tests protecting charter authority, works loading, and library layering

Out of scope now (deferred): per-item work detail routes, native long-form work bodies, accounts, auth, comments, forums, profiles, Circle, WeChat, analytics, multilingual mirrors, search/filtering UI, automated social ingestion, newsletter, forms, and new packages.

## 4. Content domains

| Domain | Source of truth | Public surface |
|---|---|---|
| Community Charter | `content/community-charter.mdoc` | `/charter` |
| Curated works | `content/works/*` via Keystatic `works` | `/explore`, `/read`, `/try`, `/meet`, homepage featured previews |

These domains must not be merged or duplicated. Moving the Charter from the homepage to `/charter` does not change content authority.

## 5. Visitor pathways

| Pathway | Intent |
|---|---|
| Explore | Broad guided overview of the commons and links into other pathways |
| Read | Ideas, essays, stories, future Xiaohongshu / Substack / video references |
| Try | Practical projects, tools, practices, and experiments |
| Meet | Emerging community, future gatherings, and the Charter |
| About | Raymond, GetToKnow.You, ConversationOS, and MandarinOS |

The homepage is a welcoming gateway. The Charter is the constitutional foundation—available and linked, but not the first dominant experience.

## 6. Canonical works

A canonical work is a substantial idea or artefact worth keeping: essays, stories, ConversationOS practices, project explanations, selected videos, and similarly durable contributions.

Each listed work carries at least: title, summary, type, added date, publication state, status, and optional distribution links.

### Published and developing

* **Published** works — verified destinations (absolute URL or site path) with a working link
* **Developing** works — transparent descriptions of ideas still taking shape, shown with an “In development” label and no fake link

### Pathway selection

Read / Try / Meet surfaces select works through a small presentation mapping of approved slugs (`content/sitePathways.ts`), not by permanently encoding an immature taxonomy onto every work record. Work titles and summaries always come from the loader.

## 6a. Content library model (Start Here / Collections / Archive)

The content library is **the same `works` collection**, not a second content
system. Every item exists once in `content/works/*`; the three visitor layers
below are derived views over that one source of truth.

| Field | Purpose |
|---|---|
| `topics` | Collection slugs this item belongs to. An item may carry several topics and so appear in several collections without duplication. |
| `series` | Optional grouping of related items (for example a video series). |
| `publishedDate` | The true publication date, when known. Falls back to the added `date` when absent. |
| `watchTime` / `readTime` | Optional, plain-text duration shown in listings. |
| `featured` | Eligibility for prominent display. |
| `startHereOrder` | Position in the curated Start Here sequence (ascending). Absent = not included. |
| `thumbnail` | Optional image path/URL. |
| `status: draft` | Never shown publicly, anywhere (a third value alongside `listed` and `archived`). |
| `origin` | Optional. Where the item was first published (editorial record only; does not affect routing). |
| `canonicalPlatform` | Optional. Which platform hosts the authoritative `canonicalUrl` (records provenance; does not change the destination). |
| `distributionLinks[].platform` | Machine-readable platform per link (Instagram, Xiaohongshu, YouTube, Substack, LinkedIn, Facebook, TikTok, Website, Podcast, Other), from `content/platforms.ts`. A missing/unrecognised value normalises to `other` rather than dropping the link. |

`origin`, `canonicalPlatform`, and `distributionLinks[].platform` are edited in Keystatic but not yet surfaced anywhere in the public UI beyond the existing distribution-link labels — they exist for editorial recording and future filtering (see `docs/CONTENT_GOVERNANCE.md`).

No per-item detail page, body, or transcript architecture exists for works. This metadata pass records the content item and external/platform links only; it does not add a place to host long-form prose (see §11 for the one exception, the Community Charter, which is a separate content domain).

Collection taxonomy (`content/collections.ts`) is the single source for
collection slug, name, and description. It currently defines: Stories,
Conversation, Relationships, Emotional Intelligence, Workplace, China, and
Language Learning. Extend it by adding one entry — no schema or route
rewrite is required.

* **Start Here** (`getStartHereWorks` / `selectPublicStartHereWorks`, routed at `/start-here`) — listed **and** published items with a positive `startHereOrder` and a usable destination, ascending. Developing works are never included. `/explore` shows a three-item preview of the same sequence.
* **Collections** (`getCollectionWorks(slug)`, routed at `/explore/[collection]`) — listed items whose `topics` include the collection slug. Unknown slugs 404 via the standard Next.js not-found behaviour.
* **Archive** (`getArchiveWorks`, routed at `/explore/archive`) — every non-draft item (listed or archived), reverse-chronological by `publishedDate` (falling back to `date`), deterministic via a slug tie-break.
* **Related content** (`getRelatedWorks`) — a small, non-ranked set of other listed items sharing the same `series`, then the same `topics`. A pure data-layer foundation; no per-item route currently exists to render a "Continue exploring" block (see §11).

Archived items remain visible in the Archive but never in Start Here or
collection views, per the metadata rules above.

To bring a draft item (for example an unreleased video) into public view once
it is ready: add its verified `canonicalUrl` and set `publicationState` to
`published` (or leave it `developing` if it is still an honest signpost),
then change `status` from `draft` to `listed`. No other field needs to
change; the item's `topics`/`series` already determine where it will appear.

## 7. Distribution adaptations

Platform versions that promote or adapt a canonical work (Xiaohongshu, Instagram, Facebook, Substack excerpts, and similar) are normally **distribution links** on the work record—not separate commons entries and not separate routes. A single work record can carry several platform links at once (for example both an Instagram and a Xiaohongshu link for the same video); the platform versions remain distribution channels, and the work record remains the single source of truth.

Future Substack essays may use an external canonical URL when a verified publication exists. Developing content may omit a URL.

## 8. Ephemeral communications

Announcements, reminders, comments, minor variants, and temporary updates normally stay outside the permanent works collection. The commons grows with meaningful works, not posting frequency.

## 9. Route responsibilities

| Route | Responsibility |
|---|---|
| `/` | Welcoming homepage; pathways; featured works preview; founder preview; Charter note |
| `/start-here` | Canonical public introductory sequence for first-time / social-media visitors |
| `/explore` | Gateway overview: Start Here preview, Collections grid, and a link into the Archive |
| `/explore/[collection]` | One reusable template rendering any collection from `content/collections.ts`; unknown slugs 404 |
| `/explore/archive` | Complete reverse-chronological index of non-draft works |
| `/read` | Editorial list of reading-oriented works |
| `/try` | Practical projects and practices (MandarinOS clearest active action) |
| `/meet` | Emerging community framing and Charter pathway |
| `/about` | Founder and ecosystem context |
| `/charter` | Full authoritative Community Charter |
| `/keystatic` | Local content editor only (development); production 404 |
| `/api/keystatic` | Local Keystatic API only (development); production 404 |

No `/explore/[slug]` per-item detail routes in this increment. Published works are reached through `canonicalUrl`. Developing works have no destination link. `/explore/[collection]` and `/explore/archive` are library index/filter views, not individual work pages.

## 10. Founder editing workflow

1. Run `npm run dev`.
2. Open `/keystatic`.
3. Add or edit a work in **Works**.
4. Set publication state to `published` (with a verified URL) or `developing` (URL optional).
5. Attach optional distribution links (for example Xiaohongshu or Instagram).
6. Set status to `draft`, `listed`, or `archived`. Drafts never appear publicly.
7. If the work belongs in one or more thematic collections, set `topics`. Optionally set `series`, `watchTime`/`readTime`, `featured`, and `startHereOrder`.
8. If the work should appear on Read / Try / Meet, update the approved slug mapping in `content/sitePathways.ts`.
9. Preview `/explore`, the relevant collection, `/explore/archive`, and the relevant pathway page.
10. Review the Git diff under `content/works/`.
11. Run `npm run typecheck`, `npm test`, and `npm run build` as needed.
12. Commit and publish through the existing Git workflow.

Production Keystatic editing is not available.

## 11. Deferred capabilities

Deferred until explicitly approved: public email response (`mailto:`), per-item work detail pages (and therefore an on-page "Continue exploring" related-content block), native Markdoc bodies for works, search/filtering UI on the Archive, multilingual mirrors, community interaction surfaces, analytics, authentication, newsletter, and automated ingestion from social platforms.

## 12. Change-control rule

Any change that would:

* duplicate or relocate charter authority away from `content/community-charter.mdoc`;
* treat social posts as default first-class commons entries;
* expose production Keystatic write surfaces;
* or expand into community-platform features

requires an explicit governance and architecture update before implementation.
