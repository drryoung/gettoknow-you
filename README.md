# GetToKnow.You

Public website for **GetToKnow.You**—a visitor-centred public commons for meaningful conversation and relationship, with the Community Charter as constitutional foundation.

This repository is separate from MandarinOS.app. It reuses design-language principles from that site without cloning the MandarinOS product website.

## Local setup

```bash
npm install
npm run dev
```

Then open:

* Home: [http://localhost:3000](http://localhost:3000)
* Explore: [http://localhost:3000/explore](http://localhost:3000/explore)
* Read: [http://localhost:3000/read](http://localhost:3000/read)
* Try: [http://localhost:3000/try](http://localhost:3000/try)
* Meet: [http://localhost:3000/meet](http://localhost:3000/meet)
* About: [http://localhost:3000/about](http://localhost:3000/about)
* Community Charter: [http://localhost:3000/charter](http://localhost:3000/charter)
* Keystatic editor: [http://localhost:3000/keystatic](http://localhost:3000/keystatic)

## Routes

| Route | Purpose |
|---|---|
| `/` | Welcoming homepage and pathway gateway |
| `/explore` | Broad overview of the public commons |
| `/read` | Essays, stories, and future article references |
| `/try` | Practical projects and practices |
| `/meet` | Emerging community and Charter pathway |
| `/about` | Founder and ecosystem |
| `/charter` | Full authoritative Community Charter |

Primary navigation: Explore · Read · Try · Meet · About. The site name links home. The Charter is linked from Meet, About, and the footer—not as a primary nav item.

## Charter content

Authoritative charter text lives only at:

```text
content/community-charter.mdoc
```

It is rendered at `/charter`. Do not duplicate charter prose into page components.

### Edit in Cursor

Open that file, change wording, save, and refresh `/charter`.

### Edit in Keystatic

1. Run `npm run dev`
2. Open `/keystatic`
3. Choose **Community Charter**
4. Edit fields and save
5. Review the Git diff for `content/community-charter.mdoc`

Saving in Keystatic updates repository files. It does **not** publish the live site. Commit and push when you are ready to deploy.

## Curated works (public commons)

Canonical works live in the Keystatic **Works** collection:

```text
content/works/*
```

Social adaptations belong as **distribution links** on a work, not as separate entries. Ephemeral posts normally stay out of this collection.

Works may be **published** (verified URL required) or **developing** (honest signpost; URL optional). The date field is when the record was added to the commons.

Read / Try / Meet placement uses a small approved slug map in `content/sitePathways.ts` so titles and summaries stay loader-driven.

### Founder workflow for works

1. Run the local site (`npm run dev`).
2. Open `/keystatic`.
3. Add or edit a work under **Works**.
4. Choose publication state:
   * **Published** — add a verified canonical URL (https link or site path such as `/charter`).
   * **Developing** — leave the URL blank; the site will show “In development”.
5. Attach optional distribution links (for example Xiaohongshu or Instagram).
6. Set status to `listed` (shows publicly) or `archived` (hidden, kept in Git).
7. To convert developing → published later: add a verified URL and set publication state to `published`.
8. If the work should appear on Read / Try / Meet, update `content/sitePathways.ts`.
9. Review the Git changes under `content/works/`.
10. Run validation (`npm run typecheck`, `npm test`, `npm run build`).
11. Commit and publish through the existing Git workflow.

Production Keystatic editing is **not** available. The editor and its API return 404 in production.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Documentation

* [Design system](docs/DESIGN_SYSTEM.md)
* [Content governance](docs/CONTENT_GOVERNANCE.md)
* [Public commons architecture](docs/PUBLIC_COMMONS_ARCHITECTURE.md)
