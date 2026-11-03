# Namuna One — namunaone.github.io

The public website of **namunaONE** — verified, offline-first open data and Dart tools for Nepal.
Live at **https://namunaone.github.io/**

> Sharing is Caring.

## What this is

A single-page, dependency-free static site. No build step, no framework, no webfonts — just hand-written HTML, CSS and a few lines of vanilla JS. Fresh umbrella identity (Stone + Deep Teal, terracotta accent), distinct from the nGeo/nMiti project brand systems.

```text
├── index.html            # The single page: hero · numbers · projects · workshop · about · links
├── 404.html              # Not-found page ("this page is not in the dataset")
├── assets/
│   ├── css/style.css     # Design system v1.1 — tokens, dark mode, a11y, print
│   ├── js/main.js        # Nav, scrollspy, copy + live region, footer year (~120 lines)
│   ├── favicon.svg       # न tile — used as icon and Organization logo
│   └── og.svg            # 1200×630 social card (hand-authored SVG)
├── STYLEGUIDE.md         # Token + component + voice rules (system of record)
├── llms.txt              # Machine-readable index for AI assistants (llms.txt convention)
├── robots.txt            # Allow all + sitemap pointer
├── sitemap.xml           # Single URL
├── LICENSE               # MIT (this repo). Data licenses live in the data repos.
└── .gitignore
```

## Preview locally

Any static file server works. With Node (already on your machine):

```powershell
npx serve .
# → http://localhost:3000
```

or with Python, if you install it later:

```powershell
python -m http.server 8000
```

Open the printed URL. Resize to mobile widths to check the hamburger menu and stacked cards.

## Deploy (GitHub Pages)

This repo is intended to be **`namunaONE/namunaONE.github.io`** — GitHub Pages serves a user/organisation site from the repository root on `main`:

1. `git init` → add → commit
2. `gh repo create namunaONE/namunaONE.github.io --public --source=. --push` (or create via the web UI and push)
3. Settings → Pages → Source: **Deploy from a branch** → `main` / `root` (user sites do this automatically)
4. Live at https://namunaone.github.io/ within a minute or two

No GitHub Actions required — there is nothing to build.

## Notes & decisions

- **Design system v1.1** — three token layers (primitives → semantics → components); see [STYLEGUIDE.md](STYLEGUIDE.md). Components never use raw hex.
- **System fonts only** — `Fraunces`/`Inter` are named in the stacks but no files are shipped; everyone gets a tasteful local serif/sans. No third-party requests, no FOUT.
- **Adaptive theme** — full `prefers-color-scheme: dark` support driven by OS settings, plus `prefers-contrast`, `forced-colors`, reduced-motion and a print stylesheet. No theme toggle by design (system-driven only).
- **Accessibility** — focus-visible rings, 44px targets, skip link, `aria-current` scrollspy, `aria-live` copy status, scoped "verified" labels (never color alone).
- **og:image** is the hand-authored `assets/og.svg`. Some scrapers prefer PNG — render `assets/og.svg` to a 1200×630 PNG and swap the two `og:image` tags when convenient (e.g. via browser screenshot).
- **No frameworks** — edit the HTML directly; there are no partials to sync. Asset URLs carry a `?v=` cache-buster — bump it in `index.html` and `404.html` whenever `style.css` or `main.js` changes.
- Figures on the page (7/77/753/6,743 · 109 BS years · 548+205) are hand-maintained snapshots from nGeo v2.10.0 and nMiti — update them when the data products version up.
- Contact is **GitHub-only** by decision. Add a mailto row to the Links section if that changes.
- **Not affiliated with the Government of Nepal.**

## License

MIT © 2026 Namuna One (namunaONE) — HyaMuji and Taire Bhai. See [LICENSE](LICENSE).
