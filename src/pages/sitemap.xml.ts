import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/metadata';
import { getPublishedProjectSlugs, getServices } from '../utils/data';

const STATIC_PATHS = ['', 'about', 'projects', 'our-services', 'contact', 'privacy'] as const;

export const GET: APIRoute = () => {
  const now = new Date().toISOString();

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: path ? absoluteUrl(path) : absoluteUrl(),
    lastmod: now,
    changefreq: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? '1.0' : '0.8',
  }));

  const projectEntries = getPublishedProjectSlugs().map((slug) => ({
    url: absoluteUrl(`projects/${slug}`),
    lastmod: now,
    changefreq: 'monthly',
    priority: '0.7',
  }));

  const serviceEntries = getServices().map((service) => ({
    url: absoluteUrl(`our-services/${service.slug}`),
    lastmod: now,
    changefreq: 'monthly',
    priority: '0.7',
  }));

  const urls = [...staticEntries, ...projectEntries, ...serviceEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
