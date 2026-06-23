export function getURL(path: string = ''): string {
  let url =
    import.meta.env.PUBLIC_SITE_URL?.trim() ||
    import.meta.env.VERCEL_URL?.trim() ||
    'http://localhost:4321';
  url = url.replace(/\/+$/, '');
  url = url.includes('http') ? url : `https://${url}`;
  path = path.replace(/^\/+/, '');
  return path ? `${url}/${path}` : url;
}
