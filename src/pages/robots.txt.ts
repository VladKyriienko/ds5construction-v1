import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/metadata';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl()}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
