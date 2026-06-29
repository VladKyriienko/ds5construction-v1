// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const site = isGitHubPages
  ? process.env.PUBLIC_SITE_URL?.trim() ||
    'https://vladkyriienko.github.io/ds5construction-v1'
  : 'https://ds5construction.com';
const base = isGitHubPages
  ? process.env.ASTRO_BASE?.trim() || '/ds5construction-v1'
  : '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  ...(isGitHubPages ? {} : { adapter: vercel() }),
  image: {
    layout: 'constrained',
  },
  redirects: isGitHubPages
    ? {}
    : {
        '/services': '/our-services',
      },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          '**/.vercel/**',
          '**/dist/**',
          '**/.astro/**',
          '**/node_modules/.vite/**',
        ],
      },
    },
  },
});
