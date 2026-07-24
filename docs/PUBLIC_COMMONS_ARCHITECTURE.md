# Public commons architecture

Authority document for the GetToKnow.You public-commons foundation established in the first curated-works increment.

> GetToKnow.You is the durable public commons. Social platforms are discovery and distribution channels. Attached community spaces may hold live interaction later, but they are not the permanent source of authority.

## 1. Purpose

Preserve and present a controlled collection of meaningful public work beside the Community Charter—without turning the site into a social network, CMS-driven magazine, or mirror of every platform post.

## 2. Architectural model

* **Charter-first public site** built with Next.js App Router.
* **Git-backed content** edited locally through Keystatic (`storage: local`).
* **Two content domains:** Community Charter (singleton Markdoc) and curated works (YAML collection).
* **Presentation pages** load content through approved server loaders; they do not own durable prose.
* **Production Keystatic** remains unavailable (404). Publish via Git.

## 3. Current implementation boundary

In scope now:

* Keystatic `works` collection under `content/works/*`
* `getListedWorks()` loader
* `/explore` editorial list
* One restrained homepage pathway to `/explore`
* Governance, design, and architecture documentation
* Tests protecting charter authority and works loading

Out of scope now (deferred): themes/pathways, work detail routes, native long-form work bodies, Raymond pages, accounts, auth, comments, forums, profiles, Circle, WeChat, analytics, multilingual mirrors, related-item graphs, featured logic, automated social ingestion, and new packages.

## 4. Content domains

| Domain | Source of truth | Public surface |
|---|---|---|
| Community Charter | `content/community-charter.mdoc` | `/` |
| Curated works | `content/works/*` via Keystatic `works` | `/explore` |

These domains must not be merged or duplicated.

## 5. Canonical works

A canonical work is a substantial idea or artefact worth keeping: essays, stories, ConversationOS practices, project explanations, selected videos, and similarly durable contributions.

Each listed work carries at least: title, summary, type, added date, publication state, status, and optional distribution links.

### Published and developing

The early commons may contain both:

* **Published** works — verified destinations (absolute URL or site path) with a working Explore link;
* **Developing** works — transparent descriptions of ideas or collections that are still taking shape, shown with an “In development” label and no fake link.

Developing entries support gradual growth without filler or fictional content. They are not substitutes for future substantive publications; when a real URL exists, convert the record to `published`.

## 6. Distribution adaptations

Platform versions that promote or adapt a canonical work (Xiaohongshu, Instagram, Facebook, Substack excerpts, and similar) are normally **distribution links** on the work record—not separate commons entries.

## 7. Ephemeral communications

Announcements, reminders, comments, minor variants, and temporary updates normally stay outside the permanent works collection. The commons grows with meaningful works, not posting frequency.

## 8. Route responsibilities

| Route | Responsibility |
|---|---|
| `/` | Community Charter homepage; optional secondary pathway to Explore |
| `/explore` | Listed curated works as an editorial list; empty state when none |
| `/keystatic` | Local content editor only (development); production 404 |
| `/api/keystatic` | Local Keystatic API only (development); production 404 |

No `/explore/[slug]` in this foundation. Published works are reached through `canonicalUrl`. Developing works have no destination link.

## 9. Founder editing workflow

1. Run `npm run dev`.
2. Open `/keystatic`.
3. Add or edit a work in **Works**.
4. Set publication state to `published` (with a verified URL) or `developing` (URL optional).
5. Attach optional distribution links.
6. Set status to `listed` or `archived`.
7. Preview `/explore`.
8. Review the Git diff under `content/works/`.
9. Run `npm run typecheck`, `npm test`, and `npm run build` as needed.
10. Commit and publish through the existing Git workflow.

Production Keystatic editing is not available.

## 10. Deferred capabilities

Deferred until explicitly approved: public email response (`mailto:`), work detail pages, native Markdoc bodies for works, themes/pathways, featured ordering, related works, multilingual mirrors, community interaction surfaces, analytics, authentication, and automated ingestion from social platforms.

## 11. Change-control rule

Any change that would:

* duplicate or relocate charter authority;
* treat social posts as default first-class commons entries;
* expose production Keystatic write surfaces;
* or expand into community-platform features

requires an explicit governance and architecture update before implementation.
