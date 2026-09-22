# কবিতাঘর (Kobitaghar) — Kobita / Quote & PDF Studio

A poem & quote poster generator (Bengali "কবিতা"), plus Text→PDF and
Image→PDF tools, with a genuine, extensible template system.

## Live version
A bundled, ready-to-use version of this exact app is published here:
https://claude.ai/artifact/GyHkTYyDww2pkUjKACi1zY

## Running the source locally
Because the app is split into real files (as requested), open it
through a local server rather than double-clicking index.html —
some browsers block cross-file script loading over `file://`.

```bash
cd kobita-app
python3 -m http.server 8000
# then open http://localhost:8000
```

## How "1000+ templates" actually works
Hand-drawing 1000+ unique poster designs isn't realistic to do well.
Instead this app is built from three independent layers that combine:

- **576 structural templates** — decoration + frame + text alignment +
  padding, defined per style category in `js/templates/*.js`
  (সাহিত্য/Literary, গ্রাম্য পল্লী/Rural, শহর/Urban-City, প্রকৃতি/Nature,
  প্রেম/Romantic, অনুপ্রেরণা/Motivational, ধর্মীয়/Religious,
  ঐতিহাসিক/Historical — 72 structures each).
- **12 colour palettes** (`js/palettes.js`).
- **6 Bengali-capable fonts** (`js/fonts.js`).

576 × 12 × 6 = **41,472 distinct, genuinely different-looking results**
you can browse, pick, and then fine-tune live in the editor (palette
swatches, font dropdown, font size). This is the same trick real
design tools (Canva, PowerPoint themes, etc.) use — a design system
you multiply, not 1000 individually hand-drawn files.

## Project structure
```
kobita-app/
├── index.html                 # app shell, loads every module
├── css/style.css              # all styling
└── js/
    ├── template-builder.js    # shared factory: turns a decoration
    │                            list into the frame×align×padding grid
    ├── templates/
    │   ├── sahitya.js          # সাহিত্য / Literary   — ONE FILE PER CATEGORY
    │   ├── gram.js             # গ্রাম্য (পল্লী) / Rural
    │   ├── city.js             # শহর / Urban-City
    │   ├── nature.js           # প্রকৃতি / Nature
    │   ├── romantic.js         # প্রেম / Romantic
    │   ├── motivational.js     # অনুপ্রেরণা / Motivational
    │   ├── religious.js        # ধর্মীয় / Religious
    │   ├── historical.js       # ঐতিহাসিক / Historical
    │   └── index.js            # merges all categories into one list
    ├── palettes.js             # 12 colour palettes
    ├── fonts.js                # 6 Bengali Google Fonts
    ├── pdf-tools.js            # Text→PDF, Image→PDF, PNG/PDF poster export
    └── main.js                 # UI wiring: grid, editor, tools
```

## Adding a new template category (e.g. "শীতকাল / Winter")
1. Create `js/templates/winter.js`:
   ```js
   window.KobitaTemplates = window.KobitaTemplates || {};
   window.KobitaTemplates.winter = window.buildCategoryTemplates(
     'winter', 'শীতকাল', 'Winter',
     [
       { id: 'snowflake', name: 'তুষারকণা', glyph: '❄️' },
       { id: 'fog',       name: 'কুয়াশা',   glyph: '🌫️' }
     ]
   );
   ```
   This alone adds 2 decorations × 6 frames × 2 aligns × 2 paddings
   = **48 new structural templates** (× 12 palettes × 6 fonts =
   3,456 new style combos).
2. Add `<script src="js/templates/winter.js"></script>` in
   `index.html`, right before `js/templates/index.js`.
3. Done — it shows up automatically in the sidebar and grid.

## Adding a palette or font
Just add one object to the array in `js/palettes.js` or
`js/fonts.js` — every category multiplies against it automatically.
(For a new font, also add its family to the Google Fonts `<link>`
built in `main.js`.)

## Features
- **কবিতা/উক্তি (Poster) tool** — browse by category, pick a
  structure, live-edit palette/font/size, edit the poem text and
  author name directly on the poster (click to type), download as
  PNG or PDF.
- **Text → PDF** — styled, themed document with title + body,
  auto-paginated for long text.
- **Image → PDF** — upload multiple images, reorder, choose page
  size/orientation, export as one combined PDF.

## Tech notes
- No build step, no framework — plain HTML/CSS/JS, one script per
  template category, loaded via ordinary `<script>` tags (not ES
  modules), specifically so it works from a simple static file
  server without any bundler.
- PDF/PNG export uses `html2canvas` + `jsPDF` (loaded from cdnjs) to
  rasterize the actual styled DOM — this is what lets Bengali fonts,
  gradients, and decorations export pixel-perfect without needing to
  embed a Bengali font file into the PDF engine itself.
