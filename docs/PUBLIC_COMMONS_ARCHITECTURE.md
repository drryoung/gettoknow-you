# Public commons architecture

Authority document for the GetToKnow.You public commons and visitor-facing site structure.

> GetToKnow.You is the durable public commons. Social platforms are discovery and distribution channels. Attached community spaces may hold live interaction later, but they are not the permanent source of authority.

## 1. Purpose

Welcome people into a careful public commons for meaningful conversation and relationship—preserving curated works beside the Community Charter without turning the site into a social network, magazine CMS, or mirror of every platform post.

## 2. Architectural model

* **Visitor-centred public site** built with Next.js App Router.
* **Five pathways:** Explore, Read, Try, Meet, About.
* **Git-backed content** edited locally through Keystatic (`storage: local`).
* **Two content domains:** Community Charter (singleton Markdoc) and curated works (Markdoc collection with frontmatter + optional body).
* **Presentation pages** load durable content through approved server loaders; short route-framing copy may live in page components.
* **Production Keystatic** remains unavailable (404). Publish via Git.

## 3. Current implementation boundary

In scope now:

* Visitor homepage at `/`
* Pathways: `/explore`, `/read`, `/try`, `/meet`, `/about`
* Community Charter at `/charter` from the sole Markdoc source
* Keystatic `works` collection under `content/works/*.mdoc` (hybrid hosted / summary / reference)
* Public work detail pages at `/works/[slug]`
* A three-layer content library surfaced through `/explore`: **Start Here**,
  **Collections** (`/explore/[collection]`), and **Archive**
  (`/explore/archive`), plus `/start-here`
* `getListedWorks()`, `getStartHereWorks()`, `getFeaturedWorks()`,
  `getCollectionWorks()`, `getArchiveWorks()`, `getRelatedWorks()`,
  `getPublicWorkDetail()`, and presentation-level pathway slug mapping
* Published, developing, and draft work states with content-mode validation
* Governance, design, and architecture documentation
* Tests protecting charter authority, works loading, and library layering

Out of scope now (deferred): accounts, auth, comments, forums, profiles, Circle, WeChat, analytics, multilingual mirrors, search/filtering UI, automated social ingestion, newsletter, forms, and new packages.

## 4. Content domains

| Domain | Source of truth | Public surface |
|---|---|---|
| Community Charter | `content/community-charter.mdoc` | `/charter` |
| Curated works | `content/works/*.mdoc` via Keystatic `works` | `/works/[slug]`, `/explore`, `/start-here`, `/read`, `/try`, `/meet`, homepage featured |

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

A canonical work is a substantial idea or artefact worth keeping. Each work is **one** Markdoc record that may be:

* **Hosted** — full body on GetToKnow.You
* **Summary** — meaningful on-site summary/adaptation
* **Reference** — annotated external source

Library cards and Start Here link to `/works/[slug]` (or a first-party page such as `/charter`). External platforms are provenance and distribution, not the default card destination.

### Published and developing

* **Published** works — content-mode validation passed; public `/works/[slug]` when listed
* **Developing** works — transparent signposts with an “In development” label; no public work page

### Pathway selection

Read / Try / Meet surfaces select works through `content/sitePathways.ts`. Work titles and summaries always come from the loader.

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

`origin`, `canonicalPlatform`, and `distributionLinks[].platform` use `content/platforms.ts`, including `gettoknow-you` (label: GetToKnow.You).

Each work may carry a Markdoc body. Hosted public works require a non-empty body. Summary and reference bodies are optional.

Collection taxonomy (`content/collections.ts`) defines: Stories, Conversation, Relationships, Emotional Intelligence, Workplace, China, and Language Learning.

* **Start Here** — listed + published + positive order + hosted/summary with internal presentation. References excluded. Cards link internally.
* **Collections** — listed items by `topics`
* **Archive** — non-draft items, reverse-chronological
* **Related content** — shared series then topics; rendered on `/works/[slug]`
* **Work pages** — `/works/[slug]` for listed + published + content-valid works

Future pattern for collections and feature pages:

```text
Collection or feature page
  → ordered references to work slugs
  → work records remain authoritative
  → cards point to /works/[slug]
```


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
| `/works/[slug]` | Individual work page (hosted / summary / reference) |
| `/charter` | Full authoritative Community Charter |
| `/keystatic` | Local content editor only (development); production 404 |
| `/api/keystatic` | Local Keystatic API only (development); production 404 |

Published listed works are reached through `/works/[slug]` (or first-party pages such as `/charter`). Developing works have no destination link. `/explore/[collection]` and `/explore/archive` are library index views.

## 10. Founder editing workflow

1. Run `npm run dev`.
2. Open `/keystatic`.
3. Add or edit a work in **Works**.
4. Choose content mode; add body or annotation as appropriate.
5. Set canonical platform (`gettoknow-you` when this site is authoritative).
6. Attach distribution links when real URLs exist.
7. Set status and publication state.
8. Set topics, series, featured, and Start Here order as needed.
9. Preview `/works/[slug]`, `/start-here`, `/explore`, and pathway pages.
10. Review the Git diff, validate, commit, and push.

## 11. Deferred capabilities

Deferred until explicitly approved: public email response (`mailto:`), search/filtering UI on the Archive, multilingual mirrors, community interaction surfaces, analytics, authentication, newsletter, automated ingestion from social platforms, and a dedicated collection-order editor beyond topics/series.


## 12. Change-control rule

Any change that would:

* duplicate or relocate charter authority away from `content/community-charter.mdoc`;
* treat social posts as default first-class commons entries;
* expose production Keystatic write surfaces;
* or expand into community-platform features

requires an explicit governance and architecture update before implementation.
