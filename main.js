const splitHeader = (selector) => {
  document.querySelectorAll(selector).forEach((el) => {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        const text = node.textContent;
        text.split('').forEach((c) => {
          const span = document.createElement('span');
          span.textContent = c === ' ' ? '\u00A0' : c;
          el.appendChild(span);
        });
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });
  });
};

splitHeader('.header-1 h1');
splitHeader('.header-2 h2');

gsap.set('p', { y: 50, opacity: 0 });

window.addEventListener('load', () => {
  setTimeout(() => {
    gsap.to('.header-1 h1 span, .header-2 h2 span', {
      top: 0,
      opacity: 1,
      stagger: 0.025,
      duration: 0.6,
      ease: 'power3.out',
    });

    gsap.to('p', {
      y: 0,
      opacity: 1,
      stagger: 0.05,
      duration: 1,
      ease: 'power3.out',
    });
  }, 600);
});

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
    gsap.to(star, {
      scale: 1.15,
      rotation: 5,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  link.addEventListener('mouseleave', () => {
    gsap.to(star, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  });

  link.addEventListener('click', (e) => {
    e.preventDefault();
    gsap.to(star, {
      scale: 1.3,
      rotation: 0,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => navigateTo(link.dataset.href),
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
