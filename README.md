# GetToKnow.You

Public website for the **GetToKnow.You Community Charter**, with the first foundation of a **public commons** at `/explore`.

This repository is separate from MandarinOS.app. It reuses design-language principles from that site without cloning the MandarinOS product website.

## Local setup

```bash
npm install
npm run dev
```

Then open:

* Website: [http://localhost:3000](http://localhost:3000)
* Explore: [http://localhost:3000/explore](http://localhost:3000/explore)
* Keystatic editor: [http://localhost:3000/keystatic](http://localhost:3000/keystatic)

## Charter content

Authoritative charter text lives only at:

```text
content/community-charter.mdoc
```

### Edit in Cursor

Open that file, change wording, save, and refresh the homepage.

### Edit in Keystatic

1. Run `npm run dev`
2. Open `/keystatic`
3. Choose **Community Charter**
4. Edit fields and save
5. Review the Git diff for `content/community-charter.mdoc`

Saving in Keystatic updates repository files. It does **not** publish the live site. Commit and push when you are ready to deploy.

## Curated works (public commons)

Canonical works for `/explore` live in the Keystatic **Works** collection:

```text
content/works/*
```

Social adaptations belong as **distribution links** on a work, not as separate entries. Ephemeral posts normally stay out of this collection.

### Founder workflow for works

1. Run the local site (`npm run dev`).
2. Open `/keystatic`.
3. Add or edit a work under **Works**.
4. Attach optional distribution links (for example Xiaohongshu or Instagram).
5. Set status to `listed` (shows on `/explore`) or `archived` (hidden, kept in Git).
6. Review the Git changes under `content/works/`.
7. Run validation (`npm run typecheck`, `npm test`, `npm run build`).
8. Commit and publish through the existing Git workflow.

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
