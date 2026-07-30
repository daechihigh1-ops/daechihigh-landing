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

// Clean up thin "leak" channels (where a bright highlight on the diamond was
// close enough in color to get mistaken for background, biting a notch into
// the shape): morphological opening (erode then dilate) the background mask,
// then keep only the component still connected to the border. Anything that
// gets severed by the erosion — like a leak's narrow connecting channel — is
// reclassified back to foreground.
// Out-of-bounds neighbors count as background (mask=1) rather than
// automatically failing the erosion — the crop's own edge is guaranteed
// background (the diamond never touches it), so treating "off the edge of
// the image" as "not background" would otherwise erode a false moat all the
// way around the border and cut the interior off from any border-seeded fill.
function erode(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w && !mask[y * w + nx]) { v = 0; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 1;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h && !tmp[ny * w + x]) { v = 0; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}
function dilate(mask, w, h, r) {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w && mask[y * w + nx]) { v = 1; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h && tmp[ny * w + x]) { v = 1; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

const bgBool = new Uint8Array(cw * ch);
for (let i = 0; i < bgBool.length; i++) bgBool[i] = bg[i] ? 1 : 0;
// First close (dilate-then-erode) with a small radius to fill in the tiny
// non-background specks the scattered gold sparkle dots leave in the mask —
// otherwise the later opening amplifies each into a visible blob.
const closed = erode(dilate(bgBool, cw, ch, 2), cw, ch, 2);
const R = 5;
const opened = dilate(erode(closed, cw, ch, R), cw, ch, R);

// Connected-component fill from the border on the opened mask; anything not
// reached (severed islands, i.e. former leaks) becomes foreground.
const finalBg = new Uint8Array(cw * ch);
const cQueue = [];
const seedIfOpen = (x, y) => {
  const p = y * cw + x;
  if (opened[p] && !finalBg[p]) { finalBg[p] = 1; cQueue.push(p); }
};
for (let x = 0; x < cw; x++) { seedIfOpen(x, 0); seedIfOpen(x, ch - 1); }
for (let y = 0; y < ch; y++) { seedIfOpen(0, y); seedIfOpen(cw - 1, y); }
let ci = 0;
while (ci < cQueue.length) {
  const p = cQueue[ci++];
  const x = p % cw, y = (p / cw) | 0;
  const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
  for (const [nx, ny] of nb) {
    if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
    const np = ny * cw + nx;
    if (finalBg[np] || !opened[np]) continue;
    finalBg[np] = 1;
    cQueue.push(np);
  }
}
for (let i = 0; i < bg.length; i++) bg[i] = finalBg[i] ? 1 : 0;

// The diamond's bright highlight on its upper-left facet is, by design, close
// enough to the background's own light glow that no color threshold can tell
// them apart — the two are literally the same connected region by color, which
// is why no amount of threshold/morphology tuning can separate them: they're
// one contiguous blob. But the diamond itself is left/right mirror-symmetric
// and the right facet has no such highlight, so borrow its (correct) shape to
// repair the left side instead of fighting the color ambiguity directly.
// True center measured from unaffected lower rows (min/max foreground x),
// not assumed as the crop's midpoint — the logo isn't perfectly centered.
const centerX = 504.0;
const mirrorBox = { x0: 230, y0: 190, x1: Math.round(centerX), y1: 430 };
let mirrorFixed = 0;
for (let y = mirrorBox.y0; y < mirrorBox.y1; y++) {
  for (let x = mirrorBox.x0; x < mirrorBox.x1; x++) {
    const mx = Math.round(2 * centerX - x);
    if (mx < 0 || mx >= cw) continue;
    const p = y * cw + x, mp = y * cw + mx;
    if (bg[p] === 1 && bg[mp] === 0) { bg[p] = 0; mirrorFixed++; }
  }
}
console.log('mirror-repaired', mirrorFixed, 'px');

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
