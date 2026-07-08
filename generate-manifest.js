/* ============================================================
   generate-manifest.js
   Scans /assets and writes assets/manifest.json.

   Naming convention for every file you drop into /assets:
     <kind>-<slug>.<ext>
     <kind>-<slug>-2.<ext>   (numbered variants are fine)

   kind  must be one of: signature, core, hook, elegance
   ext   image: jpg jpeg png webp gif
         video: mp4 webm mov m4v

   Examples:
     core-ash.jpg           -> Core tab, titled "Ash"
     elegance-smoke.jpg     -> Elegance tab, titled "Smoke"
     signature-back-01.mp4  -> Signature tab, titled "Back 01"

   Run:  node generate-manifest.js
   (or wire it into the included GitHub Action so it runs on every
   push automatically — see .github/workflows/manifest.yml)
============================================================ */
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');
const OUT_FILE = path.join(ASSETS_DIR, 'manifest.json');
const KINDS = ['signature', 'core', 'hook', 'elegance'];
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v'];

function titleFromSlug(slug) {
  return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('No /assets directory found at ' + ASSETS_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR).filter((f) => {
    const ext = path.extname(f).slice(1).toLowerCase();
    return IMAGE_EXT.includes(ext) || VIDEO_EXT.includes(ext);
  });

  const manifest = [];
  const skipped = [];

  files.forEach((filename) => {
    const ext = path.extname(filename).slice(1).toLowerCase();
    const base = path.basename(filename, path.extname(filename));
    const dashIdx = base.indexOf('-');

    if (dashIdx === -1) { skipped.push(filename); return; }

    const kind = base.slice(0, dashIdx).toLowerCase();
    const slug = base.slice(dashIdx + 1);

    if (!KINDS.includes(kind) || !slug) { skipped.push(filename); return; }

    manifest.push({
      kind,
      slug,
      title: titleFromSlug(slug),
      src: 'assets/' + filename,
      isVideo: VIDEO_EXT.includes(ext)
    });
  });

  // Stable order: by kind (in pillar order), then filename.
  manifest.sort((a, b) => {
    const ka = KINDS.indexOf(a.kind), kb = KINDS.indexOf(b.kind);
    if (ka !== kb) return ka - kb;
    return a.slug.localeCompare(b.slug);
  });

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Wrote ${manifest.length} assets to ${path.relative(__dirname, OUT_FILE)}`);
  KINDS.forEach((k) => {
    console.log(`  ${k}: ${manifest.filter((m) => m.kind === k).length}`);
  });
  if (skipped.length) {
    console.warn('\nSkipped (name does not match "<kind>-<slug>.<ext>"):');
    skipped.forEach((f) => console.warn('  - ' + f));
  }
}

main();
