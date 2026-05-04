# Oliver Käsermann Website CV

Static personal website for Oliver Käsermann, based on his executive CV and designed as a polished one-page profile for GitHub Pages or Cloudflare Pages.

## Files

- `index.html` - page content and semantic structure
- `styles.css` - responsive visual design
- `script.js` - small header interaction
- `_headers` - Cloudflare Pages security and cache headers
- `404.html` - branded not-found page
- `favicon.svg`, `og-image.svg`, `site.webmanifest` - browser and sharing assets

## Local Preview

Run a local static server from the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

After pushing to GitHub, enable Pages in the repository settings:

1. Go to Settings > Pages.
2. Set Source to `Deploy from a branch`.
3. Select `main` and `/ (root)`.
4. Save.

The page should publish from the repository root.

## Cloudflare Pages

This repository is ready for a no-build Cloudflare Pages deployment.

Use these settings:

```text
Framework preset: None
Build command: empty
Build output directory: .
Root directory: repository root
```

The `_headers` file is included for security headers and conservative cache rules. There is no SPA routing, so no `_redirects` file is needed.

After the final Cloudflare domain is known, update `index.html` with a production canonical URL and absolute social preview URLs:

```html
<link rel="canonical" href="https://your-domain.example/">
<meta property="og:url" content="https://your-domain.example/">
<meta property="og:image" content="https://your-domain.example/og-image.svg">
```
