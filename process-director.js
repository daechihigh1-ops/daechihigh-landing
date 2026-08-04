const sharp = require('sharp');

const SRC = 'assets/director-photo.png';
const OUT = 'assets/director-photo-v2.jpg';

// Bust-level crop (fractions of original 2079x2350), centered on face/shoulders,
// excludes the rail/papers/black pants visible in the full-body original.
const box = { top: 0.055, bottom: 0.555, left: 0.234, right: 0.714 };

const OUT_W = 900, OUT_H = 1098; // ~0.82 ratio, matches the crop box

(async () => {
  const meta = await sharp(SRC).metadata();
  const left = Math.round(box.left * meta.width);
  const top = Math.round(box.top * meta.height);
  const width = Math.round((box.right - box.left) * meta.width);
  const height = Math.round((box.bottom - box.top) * meta.height);

  const vignette = Buffer.from(
    `<svg width="${OUT_W}" height="${OUT_H}">
      <defs>
        <radialGradient id="v" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="55%" stop-color="#000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000" stop-opacity="0.82"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v)"/>
    </svg>`
  );

  await sharp(SRC)
    .extract({ left, top, width, height })
    .resize(OUT_W, OUT_H, { fit: 'cover' })
    .modulate({ brightness: 0.78, saturation: 0.72 })
    .linear(1.22, -38)
    .composite([{ input: vignette, blend: 'multiply' }])
    .jpeg({ quality: 92 })
    .toFile(OUT);

  console.log('done', OUT, left, top, width, height);
})();
