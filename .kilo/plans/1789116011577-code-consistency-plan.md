# Code Consistency & Maintenance Plan

## Identified Inconsistencies

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `.htmlhintrc` | Duplicate JSON key `id-class-value` (line 10: `"dash"`, line 17: `false`). Last value wins, so dash-case enforcement is silently disabled. | **High** |
| 2 | `site-config.js` | Missing `publications` array. HTML section + JS renderer + tests exist but no backing data. | **High** |
| 3 | `index.html` | Hardcoded SEO meta tags (`og:title`, `og:description`, `twitter:*`) never sync with `siteConfig`. | **Medium** |
| 4 | `index.html` | `RAiOLA_CV.pdf` path hardcoded in 2 places (lines 123, 201). Renaming requires multiple edits. | **Medium** |
| 5 | `main.js` | 3 silent `catch (e) {}` blocks (lines 34, 305, 338) swallow errors without explanation. | **Medium** |
| 6 | `index.html` + `main.js` | Duplicate theme-detection logic: inline `<script>` (lines 27-35) and `getStoredTheme()` (lines 301-307) are identical. | **Medium** |
| 7 | `main.js` | `renderAbout()` (line 198) falls back to `summary` when `about` is empty. `about` is markdown; `summary` is plain text. Rendering raw markdown as text looks broken. | **Medium** |
| 8 | `site-config.js` | All `experience` items hardcoded to `category: 'other'`. Rendering only supports this one category, blocking future academic experience entries. | **Medium** |
| 9 | `index.html` | Generic `alt="Profile photo"` (line 114) — not descriptive for accessibility. | **Low** |
| 10 | `README.md` | Missing documentation for `experience` array and `publications` array in "Data conventions". | **Low** |
| 11 | `site-config.js` | Conferences date formats are inconsistent (`Nov 9, 2025`, `Scheduled Nov 20, 2026`, `Dec 9–11, 2025`). | **Low** |
| 12 | Root | Missing `.editorconfig` for consistent editor settings across contributors/IDEs. | **Low** |

---

## Implementation Plan (Step-by-Step)

### Step 1: Fix `.htmlhintrc` duplicate key
- Remove the duplicate `"id-class-value"` entry at line 17.
- Keep the first occurrence (`"dash"`) so HTMLHint enforces dash-case naming.

### Step 2: Add missing `publications` array to `site-config.js`
- Add a `publications: []` array (can be empty or with sample entries) so the existing rendering code and tests have backing data.
- Add documentation in README under "Data conventions" explaining the expected shape: `{ title, authors, venue, year, link, type }`.

### Step 3: Remove duplicate theme-detection logic
- Delete the inline `<script>` block from `index.html` (lines 26-36).
- Move its logic into `initThemeToggle()` or `getStoredTheme()` so theme initialization happens in one place.
- Ensure the theme is applied before DOMContentLoaded to prevent flash-of-wrong-theme.

### Step 4: Make CV path configurable
- Add `cvPath: 'RAiOLA_CV.pdf'` to `site-config.js`.
- Replace both hardcoded `RAiOLA_CV.pdf` references in `index.html` with `data-field="cvPath"` or similar, and populate them in `populateFields()`.
- This ensures a single source of truth for the CV filename.

### Step 5: Sync SEO meta tags with `siteConfig`
- In `renderSEO()`, update `og:title`, `og:description`, `twitter:title`, `twitter:description` from `siteConfig` values.
- This prevents stale meta tags when content changes.

### Step 6: Fix `about` fallback and document fields
- Change `renderAbout()` fallback from `summary` to a safe empty state or a dedicated `aboutFallback` string.
- Alternatively, ensure `summary` is never used as markdown by wrapping it in `safeText()` instead of `markdownInline()` when used as fallback.
- Document the difference between `about` (markdown) and `summary` (plain text) in README.

### Step 7: Improve error handling in `main.js`
- Add comments to the 3 empty `catch` blocks explaining why errors are intentionally swallowed (e.g., `// localStorage may be unavailable in private mode`).
- This prevents future developers from thinking the blocks are incomplete.

### Step 8: Generalize `experience` category handling
- Add a `category` filter map or default behavior in `renderExperience()` so it doesn't hardcode `'other'`.
- Allow the HTML to conditionally show/hide the "Other professional experience" section based on whether filtered items exist.

### Step 9: Improve accessibility and minor fixes
- Update `alt="Profile photo"` to `alt="Profile photo of Daniele Raiola"` in `index.html`.
- Add `.editorconfig` to root with standard settings (UTF-8, LF, 2 spaces, trim trailing whitespace).

### Step 10: Enforce conference date format convention
- Add a `dateFormat` note in `site-config.js` or README (e.g., "Use `Month D, YYYY` or `Month D–DD, YYYY` for ranges; avoid `Scheduled` prefix").
- Optionally normalize dates in `renderConferences()` if a standard format is desired.

---

## Validation

After each step, run:
- `npm run lint`
- `npm run test:run`
- `npm run format:check`

After all steps: verify the site renders correctly with `npm run preview`.
