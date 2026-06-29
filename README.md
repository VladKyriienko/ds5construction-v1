# DS5 Construction — Astro

Static Astro site for DS5 Construction with TypeScript, Tailwind CSS, and minimal client-side JavaScript.

## Stack

- **Bun** — package manager and scripts
- **Astro 6** + TypeScript (strict)
- **Tailwind CSS 4**
- **JSON data** — `services`, `projects`, `teamMembers`
- **Astro Image** — optimized images via `sharp`
- **Minimal JS** — mobile menu, carousels, gallery, contact form

## Project structure

```txt
src/
├─ assets/images/       # Optimized image sources (e.g. home hero)
├─ components/
├─ data/                # services.json, projects.json, teamMembers.json
├─ layouts/
├─ pages/
├─ scripts/             # Vanilla TS (menu, carousel, form, etc.)
├─ styles/
└─ utils/
```

## Commands

```bash
bun install
bun run dev              # http://localhost:4321
bun run build            # static output in dist/
bun run preview
bun run compress-images  # resize/compress large photos in public/photo
bun run convert-fonts    # TTF → WOFF2 for Gilroy fonts
```

## Content

Edit JSON in `src/data/`:

- `services.json` — service pages (`/our-services/[slug]`)
- `projects.json` — project pages (`/projects/[slug]`)
- `teamMembers.json` — About page team section

Images live in `public/photo/`.

## Environment

Copy `.env.example` to `.env` and fill in values for contact form (Resend) and Google reviews.

## Deployment

### GitHub Pages

Workflow `deploy.yml` publishes to **GitHub Pages** on push to `production`:

- **URL:** https://vladkyriienko.github.io/ds5construction-v1/
- **Artifact:** `./dist` (Astro static output)

One-time setup in the repository:

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions
2. Push to `production` (or run the workflow manually via **Actions → Deploy to GitHub Pages → Run workflow**)

The GitHub Pages build sets `GITHUB_PAGES=true`, `ASTRO_BASE=/ds5construction-v1`, and skips the Vercel adapter. The contact form API does not work on GitHub Pages (static hosting only).

### Vercel (production site)

1. Import the repository in Vercel
2. Framework preset: **Astro**
3. Install command: `bun install`
4. Build command: `bun run build`
5. Output directory: `dist`

`vercel.json` is included. Do **not** commit `.vercel/` — Vercel builds from source. If `.vercel/output` is in git, Vercel skips the build and may serve broken assets (e.g. missing CSS).

### GitHub Actions

- **CI** (`ci.yml`) — runs `bun run build` on every push and pull request
- **Deploy** (`deploy.yml`) — builds and deploys to GitHub Pages on push to `production`

Set production environment variables (Resend, Google Places, etc.) in the Vercel project dashboard for the live site at ds5construction.com.
