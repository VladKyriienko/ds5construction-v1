/**
 * Resize and re-compress large images in public/photo.
 * Run: bun scripts/compress-images.mjs
 */
import {
  readdir,
  stat,
  rename,
  unlink,
} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.join(
  import.meta.dirname,
  '../public/photo',
);
const MIN_BYTES = 300 * 1024;
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 76;

async function walk(dir) {
  const entries = await readdir(dir, {
    withFileTypes: true,
  });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.webp', '.jpg', '.jpeg'].includes(ext))
    return null;

  const before = (await stat(filePath)).size;
  if (before < MIN_BYTES) return null;

  const meta = await sharp(filePath, {
    failOn: 'none',
  }).metadata();
  const needsResize = (meta.width ?? 0) > MAX_WIDTH;

  const tmp = `${filePath}.tmp`;
  let pipeline = sharp(filePath, { failOn: 'none' });
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    });
  }

  if (ext === '.webp') {
    await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(tmp);
  } else {
    await pipeline
      .jpeg({ quality: WEBP_QUALITY, mozjpeg: true })
      .toFile(tmp);
  }

  const after = (await stat(tmp)).size;
  if (after >= before * 0.97) {
    await unlink(tmp);
    return null;
  }

  await rename(tmp, filePath);
  return { filePath, before, after, resized: needsResize };
}

const files = await walk(ROOT);
let saved = 0;
let count = 0;

for (const file of files) {
  const result = await compressFile(file);
  if (!result) continue;
  count += 1;
  saved += result.before - result.after;
  const rel = path.relative(ROOT, result.filePath);
  const tag = result.resized ? 'resize' : 'recompress';
  console.log(
    `[${tag}] ${rel}: ${Math.round(result.before / 1024)}KB → ${Math.round(result.after / 1024)}KB`,
  );
}

console.log(
  `\nCompressed ${count} files, saved ${Math.round(saved / 1024)}KB total.`,
);
