# GetToKnow.You

Public website for the **GetToKnow.You Community Charter**.

This repository is separate from MandarinOS.app. It reuses design-language principles from that site without cloning the MandarinOS product website.

## Local setup

```bash
npm install
npm run dev
```

Then open:

* Website: [http://localhost:3000](http://localhost:3000)
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
