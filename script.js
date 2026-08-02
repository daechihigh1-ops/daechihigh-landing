// Nav background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navLinks.style.display = navLinks.classList.contains('open') ? 'flex' : '';
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navLinks.style.display = '';
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// Side dot nav — highlight the section currently in view
const dotLinks = document.querySelectorAll('.dot-link');
const dotSections = document.querySelectorAll('section[id]');
const dotObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      dotLinks.forEach(d => d.classList.remove('active'));
      const active = document.querySelector(`.dot-link[data-section="${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
dotSections.forEach(s => dotObserver.observe(s));

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.faq-item').classList.toggle('open');
  });
});

// Hero "상담 신청" -> branch picker (fastest response is the Kakao channel)
const heroConsultBtn = document.getElementById('heroConsultBtn');
const branchPickerModal = document.getElementById('branchPickerModal');
const branchPickerClose = document.getElementById('branchPickerClose');
if (heroConsultBtn && branchPickerModal) {
  heroConsultBtn.addEventListener('click', (e) => {
    e.preventDefault();
    branchPickerModal.classList.add('open');
  });
  branchPickerClose.addEventListener('click', () => branchPickerModal.classList.remove('open'));
  branchPickerModal.addEventListener('click', (e) => { if (e.target === branchPickerModal) branchPickerModal.classList.remove('open'); });
}

// Results modal (성적향상 사례)
const resultCard = document.getElementById('resultCard');
const resultsModal = document.getElementById('resultsModal');
const resultsClose = document.getElementById('resultsClose');
if (resultCard && resultsModal) {
  resultCard.addEventListener('click', () => resultsModal.classList.add('open'));
  resultsClose.addEventListener('click', () => resultsModal.classList.remove('open'));
  resultsModal.addEventListener('click', (e) => { if (e.target === resultsModal) resultsModal.classList.remove('open'); });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxAvatar = document.getElementById('lightboxAvatar');
const lightboxName = document.getElementById('lightboxName');
const lightboxRole = document.getElementById('lightboxRole');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const name = trigger.dataset.name || '';
    const role = trigger.dataset.role || '';
    const photo = trigger.dataset.photo;
    if (photo) {
      lightboxAvatar.innerHTML = `<img src="${photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      const avatarEl = trigger.querySelector('.avatar, .tcard-initial');
      lightboxAvatar.textContent = avatarEl ? avatarEl.textContent : (name ? name.charAt(0) : '');
    }
    lightboxName.textContent = name;
    lightboxRole.textContent = role;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    if (resultsModal) resultsModal.classList.remove('open');
    if (branchPickerModal) branchPickerModal.classList.remove('open');
  }
});

// Carousels (facility photos per branch, teacher profiles)
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsWrap = carousel.querySelector('.carousel-dots');

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `${i + 1}번째로 이동`);
    dot.addEventListener('click', () => {
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function updateActive() {
    let closest = 0, closestDist = Infinity;
    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === closest));
  }
  track.addEventListener('scroll', () => window.requestAnimationFrame(updateActive));
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -(track.clientWidth * 0.8), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
  updateActive();
});
