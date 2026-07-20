import sharp from './node_modules/sharp/lib/index.js';
import { resolve } from 'path';

const src = resolve('public/vero-icon.svg');
const out = resolve('public');

const sizes = [
  ['pwa-512x512.png', 512],
  ['pwa-192x192.png', 192],
  ['apple-touch-icon.png', 180],
  ['favicon.ico', 64],
];

for (const [name, size] of sizes) {
  await sharp(src).resize(size, size).png().toFile(`${out}/${name}`);
  console.log(`done: ${name}`);
}
