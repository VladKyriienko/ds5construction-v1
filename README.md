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

### GitHub Actions

Workflows in `.github/workflows/`:

- **CI** (`ci.yml`) — runs `bun run build` on every push and pull request
- **Deploy** (`deploy.yml`) — deploys to Vercel production on push to `production`

Add these **repository** secrets in GitHub (**Settings → Secrets and variables → Actions → New repository secret**):

| Secret              | Value                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Create at [vercel.com/account/tokens](https://vercel.com/account/tokens) (scope: full account or team access) |
| `VERCEL_ORG_ID`     | `team_ys6d9h9x6JgPvZZ6lJwoKTgA`                                                                               |
| `VERCEL_PROJECT_ID` | `prj_jK5lYW7JxI9MpXxnrmd6SxMlbOEG`                                                                            |

`VERCEL_TOKEN` must be set — without it the deploy job fails with `missing a value` for `--token`.

Set production environment variables (Resend, Google Places, etc.) in the Vercel project dashboard — `vercel pull` in the deploy workflow loads them at build time.

Optional: create a GitHub **production** environment for deployment approvals or branch protection.
