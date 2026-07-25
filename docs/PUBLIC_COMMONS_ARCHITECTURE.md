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
* Keystatic `works` collection under `content/works/*`
* `getListedWorks()` and presentation-level pathway slug mapping
* Published and developing work states
* Governance, design, and architecture documentation
* Tests protecting charter authority and works loading

Out of scope now (deferred): work detail routes, native long-form work bodies, accounts, auth, comments, forums, profiles, Circle, WeChat, analytics, multilingual mirrors, related-item graphs, automated social ingestion, newsletter, forms, and new packages.

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

## 7. Distribution adaptations

Platform versions that promote or adapt a canonical work (Xiaohongshu, Instagram, Facebook, Substack excerpts, and similar) are normally **distribution links** on the work record—not separate commons entries and not separate routes.

Future Substack essays may use an external canonical URL when a verified publication exists. Developing content may omit a URL.

## 8. Ephemeral communications

Announcements, reminders, comments, minor variants, and temporary updates normally stay outside the permanent works collection. The commons grows with meaningful works, not posting frequency.

## 9. Route responsibilities

| Route | Responsibility |
|---|---|
| `/` | Welcoming homepage; pathways; featured works preview; founder preview; Charter note |
| `/explore` | Gateway overview plus full listed works editorial list |
| `/read` | Editorial list of reading-oriented works |
| `/try` | Practical projects and practices (MandarinOS clearest active action) |
| `/meet` | Emerging community framing and Charter pathway |
| `/about` | Founder and ecosystem context |
| `/charter` | Full authoritative Community Charter |
| `/keystatic` | Local content editor only (development); production 404 |
| `/api/keystatic` | Local Keystatic API only (development); production 404 |

No `/explore/[slug]` in this increment. Published works are reached through `canonicalUrl`. Developing works have no destination link.

## 10. Founder editing workflow

1. Run `npm run dev`.
2. Open `/keystatic`.
3. Add or edit a work in **Works**.
4. Set publication state to `published` (with a verified URL) or `developing` (URL optional).
5. Attach optional distribution links (for example Xiaohongshu or Instagram).
6. Set status to `listed` or `archived`.
7. If the work should appear on Read / Try / Meet, update the approved slug mapping in `content/sitePathways.ts`.
8. Preview `/explore` and the relevant pathway page.
9. Review the Git diff under `content/works/`.
10. Run `npm run typecheck`, `npm test`, and `npm run build` as needed.
11. Commit and publish through the existing Git workflow.

Production Keystatic editing is not available.

## 11. Deferred capabilities

Deferred until explicitly approved: public email response (`mailto:`), work detail pages, native Markdoc bodies for works, featured ordering beyond the slug map, related works, multilingual mirrors, community interaction surfaces, analytics, authentication, newsletter, and automated ingestion from social platforms.

## 12. Change-control rule

Any change that would:

* duplicate or relocate charter authority away from `content/community-charter.mdoc`;
* treat social posts as default first-class commons entries;
* expose production Keystatic write surfaces;
* or expand into community-platform features

requires an explicit governance and architecture update before implementation.
