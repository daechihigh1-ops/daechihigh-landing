const sharp = require('sharp');
const fs = require('fs');

const OUT_W = 800, OUT_H = 600; // 4:3, matches .facility-photo aspect-ratio

const jobs = [
  { src: 'C:/★ 대치 로고 및 사진/본관사진/0.jpg', out: 'facility-honggwan-1.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/1.jpg', out: 'facility-honggwan-2.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/2.jpg', out: 'facility-honggwan-3.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/고3수업.jpg', out: 'facility-honggwan-4.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/3.jpg', out: 'facility-honggwan-5.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/4.jpg', out: 'facility-honggwan-6.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/5.jpg', out: 'facility-honggwan-7.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/6.jpg', out: 'facility-honggwan-8.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/8.jpg', out: 'facility-honggwan-9.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/본관사진/KakaoTalk_20240930_130115797.jpg', out: 'facility-honggwan-10.jpg' },

  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793 (1).jpg', out: 'facility-premium-1.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_01 (1).jpg', out: 'facility-premium-2.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260402_210724474.jpg', out: 'facility-premium-3.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260402_210724474_01.jpg', out: 'facility-premium-4.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_02 (1).jpg', out: 'facility-premium-5.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_04 (1).jpg', out: 'facility-premium-6.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260402_210724474_02.jpg', out: 'facility-premium-7.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_05 (1).jpg', out: 'facility-premium-8.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_06 (1).jpg', out: 'facility-premium-9.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/프리미엄관 사진/KakaoTalk_20260205_154346793_07 (1).jpg', out: 'facility-premium-10.jpg' },

  { src: 'C:/★ 대치 로고 및 사진/목동관사진/111.jpg', out: 'facility-mokdong-1.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/222.jpg', out: 'facility-mokdong-2.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/333.jpg', out: 'facility-mokdong-3.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/444.jpg', out: 'facility-mokdong-4.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/KakaoTalk_20260210_203848438_03.jpg', out: 'facility-mokdong-5.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/KakaoTalk_20260210_203848438_04.jpg', out: 'facility-mokdong-6.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/KakaoTalk_20260210_203457163_08.jpg', out: 'facility-mokdong-7.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/KakaoTalk_20260210_203848438_07.jpg', out: 'facility-mokdong-8.jpg' },
  { src: 'C:/★ 대치 로고 및 사진/목동관사진/KakaoTalk_20260210_203848438_10.jpg', out: 'facility-mokdong-9.jpg' },
];

(async () => {
  for (const j of jobs) {
    if (!fs.existsSync(j.src)) { console.log('MISSING', j.src); continue; }
    await sharp(j.src)
      .resize(OUT_W, OUT_H, { fit: 'cover' })
      .jpeg({ quality: 82 })
      .toFile('assets/' + j.out);
    console.log('done', j.out);
  }
})();
