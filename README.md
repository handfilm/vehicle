# RAWX Motion Lab — combined site

One site, merged from `index-motionlab.html` (tab/brief engine) and
`INDEX__9_.html` (sidebar shell, routing, search/sort, pin board, B2B
inquiry form). All features from both are kept.

## How the auto-fetch works

Drop a file into `/assets` named like this:

```
<kind>-<slug>.<ext>
```

- `kind` — one of `signature`, `core`, `hook`, `elegance` (must match exactly)
- `slug` — anything, becomes the title (`core-ash.jpg` → "Ash", `elegance-back-view-02.mp4` → "Back View 02")
- `ext` — images: `jpg jpeg png webp gif` · videos: `mp4 webm mov m4v`

Examples already in `/assets` (placeholders — swap these for your real photography/video):

```
core-ash.jpg          -> Core tab, "Ash"
elegance-smoke.jpg     -> Elegance tab, "Smoke"
signature-back-01.jpg  -> Signature tab, "Back 01"
hook-flex-01.jpg       -> Hook tab, "Flex 01"
```

There's **no manual config, no per-item code edit**. The category and title are
derived entirely from the filename.

## Two ways to keep the registry in sync

**1. Automatic (recommended for GitHub Pages)**
The included GitHub Action (`.github/workflows/manifest.yml`) runs
`generate-manifest.js` on every push that touches `/assets`, and commits the
regenerated `assets/manifest.json` for you. Push new files → the site updates
on its own, no local step required.

**2. Manual / local**
```
node generate-manifest.js
```
Run this after adding/removing files in `/assets`, then commit
`assets/manifest.json` alongside your new media.

`app.js` also has a no-Node fallback: if `assets/manifest.json` is missing, it
looks for `assets/files.json` — a plain JSON array of filenames, e.g.
`["core-ash.jpg", "elegance-smoke.jpg"]` — and derives everything from those
names directly in the browser. Use this only if you can't run the script/Action.

## File map

- `index.html` — combined shell: hero, pillar strip, sidebar routing, protocol
  briefs, shared asset grid, lightbox, B2B board modal
- `style.css` — merged brutalist system (void/red, both source files' tokens)
- `app.js` — routing, manifest loading, search/sort, pin board (localStorage),
  lightbox with prev/next + pin, inquiry form (drafts a mailto:)
- `generate-manifest.js` — the filename → registry parser
- `assets/manifest.json` — generated registry (committed)
- `assets/*.jpg` — placeholder demo images; replace with real photography/video

## Features kept from both source files

- Tab bar + protocol brief copy (Signature / Core / Hook / Elegance) — from `index-motionlab.html`
- Sidebar shell, hash routing, hero, pillar strip, search, sort, pin/board, inquiry form — from `INDEX__9_.html`
- Lightbox merges both: hover-to-preview video in the grid, autoplay+controls in the lightbox, plus prev/next arrow-key navigation and pin toggle
