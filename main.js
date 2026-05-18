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
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.href);
  });
});

/* Drag deshabilitado
links.forEach((link) => {
  let dragged = false;
  let offsetX, offsetY;

  const moveLink = (e) => {
    dragged = true;
    link.style.left = (e.clientX - offsetX) + 'px';
    link.style.top = (e.clientY - offsetY) + 'px';
  };

  const stopDrag = () => {
    link.classList.remove('dragging');
    window.removeEventListener('pointermove', moveLink);
    window.removeEventListener('pointerup', stopDrag);
  };

  link.addEventListener('pointerdown', (e) => {
    dragged = false;
    e.preventDefault();
    link.classList.add('dragging');
    const rect = link.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    Object.assign(link.style, {
      position: 'fixed',
      left: rect.left + 'px',
      top: rect.top + 'px',
      margin: '0',
      bottom: 'auto',
      right: 'auto',
    });

    window.addEventListener('pointermove', moveLink);
    window.addEventListener('pointerup', stopDrag);
  });

  link.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    navigateTo(link.dataset.href);
  });
});
*/
