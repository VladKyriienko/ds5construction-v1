import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import ttf2woff2 from 'ttf2woff2';

const fontsDir = path.join(
  import.meta.dirname,
  '../src/fonts',
);
const files = [
  'gilroy-regular.ttf',
  'gilroy-medium.ttf',
  'gilroy-semibold.ttf',
  'gilroy-bold.ttf',
];

for (const file of files) {
  const input = path.join(fontsDir, file);
  const output = input.replace('.ttf', '.woff2');
  const woff2 = ttf2woff2(readFileSync(input));
  writeFileSync(output, woff2);
  console.log(
    `${file} → ${path.basename(output)} (${woff2.length} bytes)`,
  );
}
