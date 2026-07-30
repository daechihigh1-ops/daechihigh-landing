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
      const avatarEl = trigger.querySelector('.avatar');
      lightboxAvatar.textContent = avatarEl ? avatarEl.textContent : '';
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
  }
});
