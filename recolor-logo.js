const fs = require('fs');
const { PNG } = require('pngjs');

const src = fs.readFileSync('assets/logo-original.png');
const png = PNG.sync.read(src);
const { width, height, data } = png;

const isWhite = (i) => data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250;

// Flood-fill the true background (white region connected to the image border)
// so internal white design elements (the "D" monogram, facet-gap lines, which
// are enclosed by color and never touch the border) are left alone.
const bg = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push([x, 0]); stack.push([x, height - 1]); }
for (let y = 0; y < height; y++) { stack.push([0, y]); stack.push([width - 1, y]); }

while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (bg[p]) continue;
  const i = p << 2;
  if (!isWhite(i)) continue;
  bg[p] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

// Soft edge: pixels bordering the flood-filled background get a
// whiteness-proportional alpha so the cutout isn't jagged.
const nearBg = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = y * width + x;
    if (!bg[p]) continue;
    if (x > 0) nearBg[p - 1] = 1;
    if (x < width - 1) nearBg[p + 1] = 1;
    if (y > 0) nearBg[p - width] = 1;
    if (y < height - 1) nearBg[p + width] = 1;
  }
}

const goldDark = [201, 162, 75];
const goldMid = [246, 226, 168];
const goldHi = [255, 248, 225];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = y * width + x;
    const i = p << 2;
    const r = data[i], g = data[i + 1], b = data[i + 2];

    if (bg[p]) {
      data[i + 3] = 0;
      continue;
    }
    if (nearBg[p] && !bg[p]) {
      const whiteness = Math.min(255, (r + g + b) / 3);
      const alpha = 255 - Math.max(0, whiteness - 200) * (255 / 55);
      data[i + 3] = Math.max(0, Math.min(255, alpha));
      if (data[i + 3] < 8) continue;
    }

    if (isWhite(i)) continue; // keep internal white (monogram, facet gaps) white

    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // three-stop metallic gradient for extra shine/luxury feel
    let c;
    if (lum > 0.6) {
      const t = (lum - 0.6) / 0.4;
      c = [
        goldMid[0] + (goldHi[0] - goldMid[0]) * t,
        goldMid[1] + (goldHi[1] - goldMid[1]) * t,
        goldMid[2] + (goldHi[2] - goldMid[2]) * t,
      ];
    } else {
      const t = lum / 0.6;
      c = [
        goldDark[0] + (goldMid[0] - goldDark[0]) * t,
        goldDark[1] + (goldMid[1] - goldDark[1]) * t,
        goldDark[2] + (goldMid[2] - goldDark[2]) * t,
      ];
    }
    data[i] = Math.round(c[0]);
    data[i + 1] = Math.round(c[1]);
    data[i + 2] = Math.round(c[2]);
  }
}

const out = PNG.sync.write(png);
fs.writeFileSync('assets/logo-gold.png', out);
console.log('wrote', out.length, 'bytes,', width, 'x', height);
