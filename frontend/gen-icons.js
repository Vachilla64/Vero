import sharp from 'sharp';

const src = 'public/vero-icon.svg';

const sizes = [
  ['public/pwa-512x512.png', 512],
  ['public/pwa-192x192.png', 192],
  ['public/apple-touch-icon.png', 180],
  ['public/favicon.ico', 64],
];

for (const [dest, size] of sizes) {
  await sharp(src).resize(size, size).png().toFile(dest);
  console.log(`✅ ${dest} (${size}px)`);
}
console.log('All icons generated from SVG.');
