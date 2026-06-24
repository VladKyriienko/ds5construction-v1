export function getURL(path: string = ''): string {
  const vercelHost = import.meta.env.VERCEL_URL?.trim();
  let url =
    import.meta.env.PUBLIC_SITE_URL?.trim() ||
    import.meta.env.SITE?.trim() ||
    (vercelHost ? `https://${vercelHost}` : '') ||
    'http://localhost:4321';
  url = url.replace(/\/+$/, '');
  url = url.includes('http') ? url : `https://${url}`;
  path = path.replace(/^\/+/, '');
  return path ? `${url}/${path}` : url;
}
