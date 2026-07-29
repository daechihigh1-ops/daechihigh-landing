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
    const avatarEl = trigger.querySelector('.avatar');
    lightboxAvatar.textContent = avatarEl ? avatarEl.textContent : '';
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
  if (e.key === 'Escape') closeLightbox();
});
