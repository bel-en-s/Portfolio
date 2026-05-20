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

// Accesso bloqueado — sitio en construcción
const links = document.querySelectorAll('.star-link');
