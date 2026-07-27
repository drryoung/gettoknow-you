# Design system

GetToKnow.You reuses the **design language** of MandarinOS.app, not the MandarinOS product page structure.

## Adopted from MandarinOS.app

* Colour tokens: ink, muted, paper, white, pale, warm, accent, line
* Soft thread / relationship motif (multi-colour stroke paths)
* Display + body typography pairing with large editorial headings
* Page measures (`reading` / `editorial` / `layout`) and generous gutters
* Sticky translucent navigation and calm footer framing
* Section screens with hairline borders and spacious vertical rhythm
* Eyebrow labels, restrained motion (`prefers-reduced-motion` respected)
* Responsive primary navigation that wraps rather than disappearing on smaller viewports
* Local-only Keystatic Admin UI with production 404 guards

## Visitor-centred hierarchy

1. The human proposition comes first on the homepage
2. Five action-based pathways (Explore, Read, Try, Meet, About) are immediately understandable
3. Current curated material is visible without pretending the commons is finished
4. Governance (Community Charter) is available but visually secondary—linked from Meet, About, and the footer, and fully presented at `/charter`

The site should feel warm, thoughtful, spacious, human, editorial, and quietly optimistic. It should not feel like a constitution landing page, a SaaS product site, a language-learning app, a corporate consultancy, or an empty forum.

## Adapted for this site

* Welcome homepage (hero + pathways + featured previews) instead of product storytelling or constitution-first arrival
* Editorial pathway lists, not software feature cards
* Charter document flow retained on `/charter` with pull treatment for the two Vision statements
* Source Serif 4 / Source Sans 3 as the GetToKnow.You type pairing

## Explore and public commons

* `/explore`, `/read`, and `/try` use an **editorial list**, not a product-card grid
* Pathway presentation on the homepage is sequential editorial links, not a SaaS-card grid
* On work lists, **title and summary** dominate; type and added date stay subordinate metadata
* The **canonical link** is primary for published works; distribution links are secondary
* Developing, draft, and archived works are **hidden from public listings** and return not found at `/works/[slug]`; they remain editable in Keystatic
* Preserve responsive readability and hierarchy on mobile and desktop
* Empty states should feel calm and unfinished-on-purpose, not promotional

## Homepage warmth and accessibility

* First viewport: brand, one clear invitation, short supporting sentence, primary Explore CTA, optional MandarinOS secondary link, thread atmosphere
* Keyboard focus remains visible; do not suppress outlines
* Avoid horizontal overflow; navigation wraps on narrow widths
* External links that open off-site use safe `rel` behaviour where appropriate

## Deliberately excluded

* MandarinOS product sections (meals, staples, personas, testimonials, beta challenge)
* MandarinOS screenshots, persona art, and meal photography
* Beta registration, Supabase, and application APIs
* Product CTAs and “Join the Beta” patterns
* Language-learning UI motifs and Chinese/pinyin dialogue layouts
* Production CMS editing, authentication, analytics, and databases
* MandarinOS-style feature/product card grids on Explore or pathway pages
