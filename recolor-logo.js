const fs = require('fs');
const { PNG } = require('pngjs');

const src = fs.readFileSync('assets/logo-original.png');
const png = PNG.sync.read(src);

const goldDark = [201, 162, 75];
const goldLight = [246, 226, 168];

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];
    if (a === 0) continue;
    if (r > 225 && g > 225 && b > 225) continue; // keep white "D" + facet gaps white
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    png.data[idx] = Math.round(goldDark[0] + (goldLight[0] - goldDark[0]) * lum);
    png.data[idx + 1] = Math.round(goldDark[1] + (goldLight[1] - goldDark[1]) * lum);
    png.data[idx + 2] = Math.round(goldDark[2] + (goldLight[2] - goldDark[2]) * lum);
  }
}

const out = PNG.sync.write(png);
fs.writeFileSync('assets/logo-gold.png', out);
console.log('wrote', out.length, 'bytes,', png.width, 'x', png.height);
