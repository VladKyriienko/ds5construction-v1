import fsPromises from 'node:fs/promises';
import path from 'node:path';

const GALLERY_IMAGE_EXT = new Set([
  '.webp',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
]);

function normalizeFolderPath(folderPath: string): string {
  return folderPath.replace(/^\/+/, '');
}

export async function getGalleryFromPathAsync(
  folderPath: string,
): Promise<string[]> {
  const normalized = normalizeFolderPath(folderPath);
  const dir = path.join(
    process.cwd(),
    'public',
    normalized,
  );

  try {
    const stat = await fsPromises.stat(dir);
    if (!stat.isDirectory()) return [];

    const files = await fsPromises.readdir(dir);
    const filtered = files.filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return GALLERY_IMAGE_EXT.has(ext);
    });

    filtered.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );

    const urlBase = '/' + normalized.replace(/\\/g, '/');
    return filtered.map((name) => `${urlBase}/${name}`);
  } catch {
    return [];
  }
}
