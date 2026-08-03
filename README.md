# Portfolio

Static, zero-build personal portfolio.
One HTML file, one stylesheet, and a small ES-module JavaScript layer — no
framework, no bundler, deployable on any static host.

## Tech stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Markup    | HTML5 (semantic, accessible)                  |
| Styling   | Plain CSS with custom-property design tokens  |
| Scripting | Vanilla JS (ES modules, no framework)         |
| Tooling   | ESLint, Stylelint, HTMLHint, Prettier, Vitest |

## Project structure

```
portfolio/
├── index.html                      # Page shell: markup + SEO meta + <noscript>
├── RAiOLA_CV.pdf                   # Downloadable CV
├── assets/
│   ├── css/
│   │   └── style.css               # Design tokens + all component styles
│   ├── images/
│   │   ├── favicon.svg
│   │   └── profile-photo.jpg
│   └── js/
│       ├── site-config.js          # Content data (source of truth)
│       ├── site-strings.js         # UI label / i18n strings + conventions
│       └── main.js                 # Behavior: rendering, theme, nav, SEO
└── tests/
    ├── setup.js                    # jsdom + matchMedia mock
    ├── pure.test.js                # Unit tests for pure helpers
    └── integration.test.js         # Smoke test wiring index.html -> main.js
```

## What to edit

- **Personal data & content** — `assets/js/site-config.js`
- **UI labels and conventions** — `assets/js/site-strings.js`
- **Page markup / sections** — `index.html`
- **Styles** — `assets/css/style.css`
- **Behavior** — `assets/js/main.js`
- **Profile image** — `assets/images/profile-photo.jpg`
- **CV** — `RAiOLA_CV.pdf`

## Data conventions

- `siteConfig.profiles[]` drives the **Academic profiles** links rendered in
  both the hero and the contact card (each item: `label`, `url`).
- `siteConfig.about` is parsed with a tiny inline Markdown subset: `**bold**`
  and `[text](url)`. Everything is HTML-escaped first, so no raw markup from
  the data reaches the DOM.
- `siteStrings.details.itemDelimiter` (a middot `·`) separates bullet items
  inside a `details` field.

## Development

```bash
npm run preview      # serve on http://localhost:8000
npm run lint         # eslint + stylelint + htmlhint
npm run format       # prettier --write
npm run test         # vitest (watch mode)
npm run test:run     # vitest (single run, for CI)
```
