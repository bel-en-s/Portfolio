import gsap from 'gsap';

const BLUR_START = 'blur(0.35em)';
const BLUR_END = 'blur(0em)';

const INLINE_ATOMIC = new Set([
  'A', 'SPAN', 'STRONG', 'EM', 'I', 'B', 'SMALL', 'SUB', 'SUP', 'LABEL', 'BUTTON',
]);

const TEXT_SELECTOR =
  '.header h1, .header h2, .header h3, .intro-about-col p, .work-name, .footer-cta, .footer-email';

function injectGooeyFilter() {
  if (document.getElementById('blur-matrix')) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  filter.setAttribute('id', 'blur-matrix');
  filter.setAttribute('x', '-50%');
  filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%');
  filter.setAttribute('height', '200%');

  const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
  feColorMatrix.setAttribute('in', 'SourceGraphic');
  feColorMatrix.setAttribute('type', 'matrix');
  feColorMatrix.setAttribute(
    'values',
    '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140',
  );

  filter.appendChild(feColorMatrix);
  defs.appendChild(filter);
  svg.appendChild(defs);
  document.body.appendChild(svg);
}

function trimInner(inner) {
  const first = inner.firstChild;
  const last = inner.lastChild;
  if (first && first.nodeType === 3) {
    first.textContent = first.textContent.replace(/^\s+/, '');
  }
  if (last && last.nodeType === 3) {
    last.textContent = last.textContent.replace(/\s+$/, '');
  }
}

function wrapLineInto(container) {
  const line = document.createElement('div');
  line.className = 'line';
  const inner = document.createElement('span');
  inner.className = 'line-inner';
  while (container.firstChild) inner.appendChild(container.firstChild);
  trimInner(inner);
  line.appendChild(inner);
  container.appendChild(line);
  return inner;
}

function splitByBr(el) {
  const segments = [];
  let current = [];

  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === 1 && node.tagName === 'BR') {
      segments.push(current);
      current = [];
      return;
    }
    current.push(node);
  });
  segments.push(current);

  el.innerHTML = '';
  const inners = [];
  segments.forEach((nodes) => {
    const line = document.createElement('div');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    nodes.forEach((n) => inner.appendChild(n));
    trimInner(inner);
    line.appendChild(inner);
    el.appendChild(line);
    inners.push(inner);
  });
  return inners;
}

function splitPlainTextLines(el) {
  const text = (el.textContent || '').trim();
  const words = text.split(/\s+/);
  if (!words.length) return [];

  el.innerHTML = '';
  words.forEach((w, i) => {
    if (i) el.appendChild(document.createTextNode(' '));
    const s = document.createElement('span');
    s.textContent = w;
    el.appendChild(s);
  });

  const spans = Array.from(el.children);
  const groups = [];
  let group = [];
  let lastTop = null;

  spans.forEach((span) => {
    const top = span.getBoundingClientRect().top;
    if (lastTop !== null && Math.abs(top - lastTop) > 1) {
      groups.push(group);
      group = [];
    }
    lastTop = top;
    group.push(span.textContent);
  });
  if (group.length) groups.push(group);

  el.innerHTML = '';
  const inners = [];
  groups.forEach((ws) => {
    const line = document.createElement('div');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.textContent = ws.join(' ');
    line.appendChild(inner);
    el.appendChild(line);
    inners.push(inner);
  });
  return inners;
}

function gooeyize(el) {
  if (el.querySelector('br')) return splitByBr(el);

  const hasInlineChild = Array.from(el.children).some((c) =>
    INLINE_ATOMIC.has(c.tagName),
  );
  if (hasInlineChild) return [wrapLineInto(el)];

  return splitPlainTextLines(el);
}

function initGooey() {
  injectGooeyFilter();

  const els = Array.from(document.querySelectorAll(TEXT_SELECTOR));
  const blurLayers = [];
  els.forEach((el) => {
    blurLayers.push(...gooeyize(el));
  });

  if (!blurLayers.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(blurLayers, { filter: BLUR_END });
    return;
  }

  gsap.set(blurLayers, { filter: BLUR_START });
  gsap.to(blurLayers, {
    filter: BLUR_END,
    duration: 1.8,
    ease: 'power3.out',
    stagger: 0.1,
    delay: 0.5,
  });
}

function onReady(cb) {
  const fontsReady = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();

  if (document.readyState === 'complete') {
    fontsReady.then(cb);
  } else {
    window.addEventListener('load', () => fontsReady.then(cb));
  }
}

onReady(initGooey);

const bgAudio = document.getElementById('bg-audio');
const audioToggle = document.getElementById('audio-toggle');

if (bgAudio && audioToggle) {
  bgAudio.volume = 0.3;

  audioToggle.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {});
    } else {
      bgAudio.pause();
    }
  });
}

function navigateTo(url) {
  const curtain = document.getElementById('curtain');
  gsap.set(curtain, { transformOrigin: 'bottom', scaleY: 0 });
  gsap.to(curtain, {
    scaleY: 1,
    duration: 0.75,
    ease: 'power3.inOut',
    onComplete: function () {
      window.location.href = url;
    },
  });
}

const links = document.querySelectorAll('.star-link');

links.forEach((link) => {
  const star = link.querySelector('.star');
  if (!star) return;

  link.addEventListener('mouseenter', () => {
    if (star.classList.contains('star-3d')) return;
    gsap.to(star, {
      scale: 1.15,
      rotation: 5,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  link.addEventListener('mouseleave', () => {
    if (star.classList.contains('star-3d')) return;
    gsap.to(star, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (star.classList.contains('star-3d')) {
      if (link.dataset.dragging === '1') {
        delete link.dataset.dragging;
        return;
      }
      if (link.dataset.href) navigateTo(link.dataset.href);
      return;
    }
    gsap.to(star, {
      scale: 1.3,
      rotation: 0,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        if (link.dataset.href) navigateTo(link.dataset.href);
      },
    });
  });
});

function initCarousel(trackId) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const slides = track.querySelectorAll('.ocarousel-slide');
  const page = track.closest('.obras-page');
  const nav = page.querySelector(`.ocarousel-nav [data-carousel="${trackId}"]`).closest('.ocarousel-nav');
  const prevBtn = nav.querySelector('.ocarousel-prev');
  const nextBtn = nav.querySelector('.ocarousel-next');
  const counter = nav.querySelector('.ocarousel-counter');
  let current = 0;
  let autoInterval;
  let isPaused = false;

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    counter.textContent = `${current + 1} / ${slides.length}`;
  }

  function next() { if (!isPaused) goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  function startAuto() { if (autoInterval) return; autoInterval = setInterval(() => goTo(current + 1), 4000); }
  function stopAuto() { clearInterval(autoInterval); autoInterval = null; }

  startAuto();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  slides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      if (e.target.closest('.obra-link-btn') || e.target.closest('.ocarousel-nav')) return;
      const media = slide.querySelector('.ocarousel-media img, .ocarousel-media video');
      if (!media) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;-webkit-overflow-scrolling:touch;';
      const el = media.cloneNode();
      el.style.cssText = 'max-width:90%;max-height:90%;object-fit:contain;';
      if (el.tagName === 'VIDEO') {
        el.muted = false;
        el.controls = true;
        el.playsInline = true;
        el.play().catch(function(){});
      }
      overlay.appendChild(el);
      overlay.addEventListener('click', function() { overlay.remove(); if (el.tagName === 'VIDEO') el.pause(); });
      document.body.appendChild(overlay);
    });
  });
}

if (document.querySelector('.obras-page')) {
  setTimeout(function() {
    initCarousel('ocarouselDigital');
    initCarousel('ocarouselPinturas');
  }, 100);
}
