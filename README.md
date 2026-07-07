# Portfolio

Static personal portfolio website for Daniele Raiola — Philosophy of Science, epistemology, and scientific collaboration.

## What to edit

- **Personal data**: `assets/js/site-config.js`
- **Section content**: `index.html`
- **Styles**: `assets/css/style.css`
- **Behavior**: `assets/js/main.js`
- **Profile image**: `assets/images/profile-placeholder.svg`
- **CV PDF**: `assets/cv/cv.pdf`

## Run locally

```bash
python -m http.server 8000
```

Open http://localhost:8000.

## Tooling

```bash
npm install
npm run lint        # Lint JS, CSS, and HTML
npm run format      # Format code with Prettier
```

## Linting and formatting

- **JS**: ESLint (recommended config)
- **CSS**: Stylelint (standard config)
- **HTML**: HTMLHint
- **Formatting**: Prettier
