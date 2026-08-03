const sharp = require('sharp');
const fs = require('fs');

const SRC = 'C:/★ 대치 로고 및 사진/강사프로필모음/';
const OUT_W = 480, OUT_H = 600; // 4:5 portrait, consistent across all cards

// Per-photo crop box, re-tuned so headroom above the hair and the
// head-to-frame ratio stay consistent across every card (fractions of
// original W/H). Boxes are pre-shaped close to the 4:5 target ratio so
// the auto-fit step below only needs to make small adjustments.
const photos = [
  { file: '디쌤 원장 프로필.jpg', out: 'teacher-disaem.jpg', top: 0.07, bottom: 0.88, left: 0.1635, right: 0.8115, normalize: true },
  { file: '김진우 프로필.jpg', out: 'teacher-kimjinwoo.jpg', top: 0.02, bottom: 0.85, left: 0.09, right: 0.92 },
  { file: '김금단 프로필.png', out: 'teacher-kimgeumdan.jpg', top: 0.12, bottom: 0.70, left: 0.17, right: 0.82 },
  { file: '배경호 프로필.jpg', out: 'teacher-baekyungho.jpg', top: 0.015, bottom: 0.87, left: 0.11, right: 0.92 },
  { file: '신병철프로필.png', out: 'teacher-shinbyungchul.jpg', top: 0.02, bottom: 0.804, left: 0.05, right: 0.93 },
  { file: '안소현 프로필.jpg', out: 'teacher-ansoseon.jpg', top: 0.05, bottom: 0.64, left: 0.17, right: 0.82 },
  { file: '최윤후 프로필.jpg', out: 'teacher-choiyoonhoo.jpg', top: 0.015, bottom: 0.777, left: 0.08, right: 0.89 },
  { file: '조윤성 프로필.png', out: 'teacher-jhoyoonsung.jpg', top: 0.12, bottom: 0.76, left: 0.13, right: 0.85 },
  { file: '장효진 프로필.jpg', out: 'teacher-jangHyojin.jpg', top: 0.04, bottom: 0.75, left: 0.05, right: 0.90 },
  { file: '김정민 프로필.png', out: 'teacher-kimjeongmin.jpg', top: 0.045, bottom: 0.86, left: 0.2115, right: 0.8635 },
  { file: '박한미 프로필.jpeg', out: 'teacher-parkhanmi.jpg', top: 0.03, bottom: 0.81, left: 0.10, right: 0.90 },
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
      // too tall -> shorten it, trimming evenly from top and bottom
      // since boxes are already pre-shaped close to target, this only
      // makes a small correction and won't eat into headroom.
      const newH = Math.round(boxW / targetRatio);
      boxTop += Math.round((boxH - newH) / 2);
      boxH = newH;
    }
    boxLeft = Math.max(0, boxLeft);
    boxTop = Math.max(0, boxTop);
    boxW = Math.min(boxW, meta.width - boxLeft);
    boxH = Math.min(boxH, meta.height - boxTop);

    let pipeline = sharp(SRC + p.file)
      .extract({ left: boxLeft, top: boxTop, width: boxW, height: boxH })
      .resize(OUT_W, OUT_H, { fit: 'cover' })
      .grayscale();
    if (p.normalize) pipeline = pipeline.normalize();
    await pipeline.jpeg({ quality: 88 }).toFile('assets/' + p.out);
    console.log('done', p.out, boxLeft, boxTop, boxW, boxH);
  }
})();
