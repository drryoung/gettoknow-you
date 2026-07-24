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
* Responsive collapse of secondary nav on smaller viewports
* Local-only Keystatic Admin UI with production 404 guards

## Adapted for this site

* Charter-first homepage (hero + document flow) instead of product storytelling
* Principle blocks as sequential headings, not product feature cards
* Ecosystem downward flow using the charter’s own `↓` markers
* Pull treatment for the two Vision statements without inventing new copy
* Source Serif 4 / Source Sans 3 as the GetToKnow.You type pairing

## Explore and public commons (this increment)

* `/explore` uses an **editorial list**, not a product-card grid
* Homepage Explore pathway stays **secondary** (after the charter document or in the closing area)—never a hero CTA
* The charter remains visually dominant on `/`
* Reuse current typography, spacing, colour tokens, and thread motifs; do not invent a second visual system
* On Explore, **title and summary** dominate; type and added date stay subordinate metadata
* The **canonical link** is primary for published works; distribution links are secondary
* Developing works use a restrained italic **“In development”** label—clear, secondary, not disabled-looking—and never an empty or fake link
* Preserve responsive readability and hierarchy on mobile and desktop
* Empty Explore state should feel calm and unfinished-on-purpose, not promotional

## Deliberately excluded

* MandarinOS product sections (meals, staples, personas, testimonials, beta challenge)
* MandarinOS screenshots, persona art, and meal photography
* Beta registration, Supabase, and application APIs
* Product CTAs and “Join the Beta” patterns
* Language-learning UI motifs and Chinese/pinyin dialogue layouts
* Production CMS editing, authentication, analytics, and databases
* MandarinOS-style feature/product card grids on Explore
