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

### Vercel (recommended)

1. Import the repository in Vercel
2. Framework preset: **Astro**
3. Install command: `bun install`
4. Build command: `bun run build`
5. Output directory: `dist`

`vercel.json` is included.
