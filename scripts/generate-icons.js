/**
 * Generates PNG icons for PWA from SVG source.
 * Run: node scripts/generate-icons.js
 * Requires: npm install -D sharp
 */
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.12; // border radius

  // Background
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Briefcase icon (simplified)
  const pad = size * 0.22;
  const bw = size - pad * 2;
  const bh = bw * 0.72;
  const by = (size - bh) / 2 + size * 0.04;
  const bx = pad;
  const br = size * 0.06;

  ctx.fillStyle = '#ffffff';

  // Handle
  const hw = bw * 0.38;
  const hh = size * 0.12;
  const hx = bx + (bw - hw) / 2;
  const hy = by - hh * 0.7;
  ctx.beginPath();
  ctx.roundRect(hx, hy, hw, hh, [size * 0.04, size * 0.04, 0, 0]);
  ctx.fill();

  // Body
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, br);
  ctx.fill();

  // Center line
  ctx.fillStyle = '#1D4ED8';
  const lh = bh * 0.28;
  const lw = bw * 0.12;
  ctx.fillRect(bx + (bw - lw) / 2, by + (bh - lh) / 2, lw, lh);

  return canvas.toBuffer('image/png');
}

[192, 512].forEach((size) => {
  const buf = drawIcon(size);
  writeFileSync(resolve(outDir, `icon-${size}.png`), buf);
  console.log(`✓ icons/icon-${size}.png`);
});

console.log('Done. Icons saved to public/icons/');
