const carousel = document.querySelector('.bio-carousel');
if (!carousel) throw new Error('bio-carousel not found');

const slides = Array.from(carousel.querySelectorAll('.bio-carousel-slide'));
const dotsHost = carousel.querySelector('.bio-carousel-dots');

let current = 0;
let lastAdvance = 0;
const THROTTLE_MS = 280;

function buildDots() {
  if (!dotsHost) return;
  dotsHost.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'bio-carousel-dot' + (i === 0 ? ' is-active' : '');
    dotsHost.appendChild(dot);
  });
}

function goTo(i) {
  const next = ((i % slides.length) + slides.length) % slides.length;
  if (next === current) return;
  slides[current].classList.remove('is-active');
  current = next;
  slides[current].classList.add('is-active');
  if (dotsHost) {
    Array.from(dotsHost.children).forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === current);
    });
  }
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function allowed() {
  const now = performance.now();
  if (now - lastAdvance < THROTTLE_MS) return false;
  lastAdvance = now;
  return true;
}

carousel.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (!allowed()) return;
  if (e.deltaY > 0) next();
  else if (e.deltaY < 0) prev();
}, { passive: false });

let startY = null;
let startX = null;

carousel.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
}, { passive: true });

carousel.addEventListener('touchmove', (e) => {
  e.preventDefault();
}, { passive: false });

carousel.addEventListener('touchend', (e) => {
  if (startY === null) return;
  const dy = e.changedTouches[0].clientY - startY;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
    if (dy < 0) next();
    else prev();
  }
  startY = null;
  startX = null;
});

carousel.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    next();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    prev();
  }
});

buildDots();
