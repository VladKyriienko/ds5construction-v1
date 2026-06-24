// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://ds5construction.com',
  output: 'static',
  adapter: vercel(),
  image: {
    layout: 'constrained',
  },
  redirects: {
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
