const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const raw = jpeg.decode(fs.readFileSync('assets/logo-v2-original.jpg'), { useTArray: true });
const { width, height } = raw;

// Crop out the bottom wordmark/tagline block — keep just the diamond + sparkle rays.
const cropBottom = Math.round(height * 0.76);
const cw = width, ch = cropBottom;

function idx(x, y) { return (y * width + x) * 4; }

// Reference background color: average of the crop's own border pixels
// (guaranteed background, since the diamond never touches the image edge).
let rSum = 0, gSum = 0, bSum = 0, nSum = 0;
for (let x = 0; x < cw; x++) {
  for (const y of [0, ch - 1]) { const i = idx(x, y); rSum += raw.data[i]; gSum += raw.data[i+1]; bSum += raw.data[i+2]; nSum++; }
}
for (let y = 0; y < ch; y++) {
  for (const x of [0, cw - 1]) { const i = idx(x, y); rSum += raw.data[i]; gSum += raw.data[i+1]; bSum += raw.data[i+2]; nSum++; }
}
const ref = [rSum / nSum, gSum / nSum, bSum / nSum];
console.log('reference bg color', ref);

const distTo = (i, c) => {
  const dr = raw.data[i] - c[0], dg = raw.data[i + 1] - c[1], db = raw.data[i + 2] - c[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};
const distPx = (i, j) => {
  const dr = raw.data[i] - raw.data[j], dg = raw.data[i+1] - raw.data[j+1], db = raw.data[i+2] - raw.data[j+2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
};

// Flood fill from the border: a candidate joins the background region only if
// it's both close to the neighbor that reached it (follows the soft lighting
// gradient) AND still within a looser bound of the overall reference color
// (stops the fill from drifting all the way through the diamond's own smooth
// metallic shading gradient).
const LOCAL_THRESH = 20;
const GLOBAL_THRESH = 55;
const bg = new Uint8Array(cw * ch);
const qHead = [];
for (let x = 0; x < cw; x++) { qHead.push([x, 0]); qHead.push([x, ch - 1]); }
for (let y = 0; y < ch; y++) { qHead.push([0, y]); qHead.push([cw - 1, y]); }
for (const [x, y] of qHead) bg[y * cw + x] = 2;

let qi = 0;
while (qi < qHead.length) {
  const [x, y] = qHead[qi++];
  const p = y * cw + x;
  if (bg[p] === 1) continue;
  bg[p] = 1;
  const i = idx(x, y);
  const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  for (const [nx, ny] of neighbors) {
    if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
    const np = ny * cw + nx;
    if (bg[np]) continue;
    const j = idx(nx, ny);
    if (distPx(i, j) < LOCAL_THRESH && distTo(j, ref) < GLOBAL_THRESH) {
      bg[np] = 2;
      qHead.push([nx, ny]);
    }
  }
}

const out = new PNG({ width: cw, height: ch });
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const p = y * cw + x;
    const i = idx(x, y);
    const o = (y * cw + x) * 4;
    out.data[o] = raw.data[i];
    out.data[o + 1] = raw.data[i + 1];
    out.data[o + 2] = raw.data[i + 2];
    out.data[o + 3] = bg[p] ? 0 : 255;
  }
}

fs.writeFileSync('assets/logo-gold.png', PNG.sync.write(out));
console.log('wrote', cw, 'x', ch, 'bg px:', bg.reduce((a, b) => a + (b ? 1 : 0), 0), '/', cw * ch);
