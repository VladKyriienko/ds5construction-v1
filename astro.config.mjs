// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site:
    process.env.PUBLIC_SITE_URL?.trim() ||
    'https://ds5construction.com',
  base: process.env.ASTRO_BASE?.trim() || '/',
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
