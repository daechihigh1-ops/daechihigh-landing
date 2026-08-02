const sharp = require('sharp');
const fs = require('fs');

const SRC = 'C:/★ 대치 로고 및 사진/강사프로필모음/';
const OUT_W = 480, OUT_H = 600; // 4:5 portrait, consistent across all cards

// Per-photo crop box, estimated from visual inspection (fractions of original W/H):
// top/bottom mark the head-to-torso region to keep; left/right frame the subject horizontally.
const photos = [
  { file: '김금단 프로필.png', out: 'teacher-kimgeumdan.jpg', top: 0.18, bottom: 0.78, left: 0.15, right: 0.85 },
  { file: '김정민 프로필.png', out: 'teacher-kimjeongmin.jpg', top: 0.15, bottom: 0.80, left: 0.10, right: 0.90 },
  { file: '김진우 프로필.jpg', out: 'teacher-kimjinwoo.jpg', top: 0.03, bottom: 0.68, left: 0.15, right: 0.85 },
  { file: '배경호 프로필.jpg', out: 'teacher-baekyungho.jpg', top: 0.05, bottom: 0.75, left: 0.10, right: 0.90 },
  { file: '신병철프로필.png', out: 'teacher-shinbyungchul.jpg', top: 0.08, bottom: 0.72, left: 0.12, right: 0.85 },
  { file: '안소션 프로필.jpg', out: 'teacher-ansoseon.jpg', top: 0.10, bottom: 0.75, left: 0.15, right: 0.85 },
  { file: '장효진 프로필.jpg', out: 'teacher-jangHyojin.jpg', top: 0.10, bottom: 0.75, left: 0.15, right: 0.85 },
  { file: '조윤성 프로필.png', out: 'teacher-jhoyoonsung.jpg', top: 0.15, bottom: 0.78, left: 0.15, right: 0.85 },
  { file: '최윤후 프로필.jpg', out: 'teacher-choiyoonhoo.jpg', top: 0.03, bottom: 0.70, left: 0.05, right: 0.90 },
];

const targetRatio = OUT_W / OUT_H; // 0.8

(async () => {
  for (const p of photos) {
    const img = sharp(SRC + p.file);
    const meta = await img.metadata();
    let boxTop = Math.round(p.top * meta.height);
    let boxBottom = Math.round(p.bottom * meta.height);
    let boxLeft = Math.round(p.left * meta.width);
    let boxRight = Math.round(p.right * meta.width);
    let boxW = boxRight - boxLeft;
    let boxH = boxBottom - boxTop;

    // Adjust to exactly match target aspect ratio, centered on the estimated box.
    const currentRatio = boxW / boxH;
    if (currentRatio > targetRatio) {
      // too wide -> narrow it
      const newW = Math.round(boxH * targetRatio);
      boxLeft += Math.round((boxW - newW) / 2);
      boxW = newW;
    } else {
      // too tall -> shorten it (keep top, extend/trim from bottom mostly)
      const newH = Math.round(boxW / targetRatio);
      boxTop += Math.max(0, Math.round((boxH - newH) * 0.3)); // bias toward keeping top (head)
      boxH = newH;
    }
    boxLeft = Math.max(0, boxLeft);
    boxTop = Math.max(0, boxTop);
    boxW = Math.min(boxW, meta.width - boxLeft);
    boxH = Math.min(boxH, meta.height - boxTop);

    await sharp(SRC + p.file)
      .extract({ left: boxLeft, top: boxTop, width: boxW, height: boxH })
      .resize(OUT_W, OUT_H, { fit: 'cover' })
      .grayscale()
      .jpeg({ quality: 88 })
      .toFile('assets/' + p.out);
    console.log('done', p.out, boxLeft, boxTop, boxW, boxH);
  }
})();
