# Content governance

## Sole authoritative source

`content/community-charter.mdoc` is the **only** authoritative source for Community Charter wording.

Do not maintain a second copy in TypeScript, JSON, YAML, JSX, a database, or another CMS as a competing source of truth.

## How to edit ordinary wording

Preferred options:

1. Edit `content/community-charter.mdoc` directly in Cursor, or
2. Edit through the local Keystatic Admin UI at `/keystatic` (development only)

Page components control visual presentation (layout, typography, motion). They must not become a place to revise charter prose.

## What content files must not contain

Charter content files must not include:

* HTML markup for layout
* CSS or class names as content
* Application logic
* Environment variables or secrets
* Executable scripts

## Review and publish

All wording changes remain reviewable through Git.

Typical flow:

```text
edit → save → preview locally → review Git diff → validate → commit → push → deploy
```

## Notion and other copies

Notion (or similar tools) may later hold a published or collaborative copy for discussion.

They must **not** silently become a competing authoritative source. If a Notion page exists, treat the repository Markdoc file as canonical unless an explicit governance decision changes that.
