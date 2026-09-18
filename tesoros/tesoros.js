import { entries as staticEntries } from './entries.js';
import { currentLang } from '../i18n.js';

// Slug de tu canal de Are.na (lo que aparece en la URL: are.na/tu-slug).
const ARENA_CHANNEL = 'tesoros-psli8dfgz8k';

const grid = document.querySelector('.insp-grid');
if (!grid) throw new Error('No se encontró .insp-grid');

function commentText(comment) {
  if (!comment) return '';
  if (typeof comment === 'string') return comment;
  return comment[currentLang()] || comment.es || comment.en || '';
}

// Convierte un "block" de Are.na en la estructura { image, url, comment, date }.
function extractUrl(text) {
  if (!text) return '';
  const match = String(text).match(/https?:\/\/[^\s"'<>)]+/i);
  return match ? match[0].replace(/[.,;:]+$/, '') : '';
}

function blockToEntry(block) {
  const entry = { image: '', url: '', comment: '', date: '' };

  if (block.image) {
    entry.image =
      (block.image.display && block.image.display.url) ||
      (block.image.original && block.image.original.url) ||
      '';
  }

  entry.url =
    (block.source && block.source.url) ||
    extractUrl(block.description) ||
    extractUrl(block.content) ||
    '';

  entry.comment =
    block.title ||
    block.generated_title ||
    (block.class === 'Text' ? block.content : '') ||
    '';

  entry.date = block.connected_at || block.created_at || '';

  return entry;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const locale = currentLang() === 'es' ? 'es-AR' : 'en-US';
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function createMedia(entry) {
  const media = document.createElement('div');
  media.className = 'insp-card-media';

  if (entry.image) {
    const img = document.createElement('img');
    img.src = entry.image;
    img.alt = commentText(entry.comment);
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => media.classList.add('is-fallback'));
    media.appendChild(img);
  } else {
    media.classList.add('is-fallback');
  }

  return media;
}

function createCard(entry) {
  const hasUrl = entry.url && entry.url.trim() !== '';
  const card = document.createElement(hasUrl ? 'a' : 'article');
  card.className = 'insp-card';

  if (hasUrl) {
    card.href = entry.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
  }

  card.appendChild(createMedia(entry));

  const comment = commentText(entry.comment);
  if (comment) {
    const p = document.createElement('p');
    p.className = 'insp-card-comment';
    p.textContent = comment;
    card.appendChild(p);
  }

  if (entry.date) {
    const time = document.createElement('time');
    time.className = 'insp-card-date';
    time.dateTime = entry.date;
    time.textContent = formatDate(entry.date);
    card.appendChild(time);
  }

  return card;
}

function render(entries) {
  grid.innerHTML = '';
  entries.forEach((entry) => grid.appendChild(createCard(entry)));
}

let currentEntries = staticEntries;

// 1) Muestra el contenido local al instante (sirve de respaldo/offline).
render(currentEntries);

// 2) Intenta traer el canal de Are.na y lo reemplaza si responde.
if (ARENA_CHANNEL && ARENA_CHANNEL !== 'tu-slug-aqui') {
  const url = `https://api.are.na/v2/channels/${encodeURIComponent(ARENA_CHANNEL)}/contents?per=100&page=1`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const entries = (data.contents || [])
        .map(blockToEntry)
        .filter((e) => e.image || e.url || e.comment);
      if (entries.length) {
        currentEntries = entries;
        render(currentEntries);
      }
    })
    .catch(() => {
      // Are.na no respondió: se mantiene el contenido local.
    });
}

window.addEventListener('languagechange', () => render(currentEntries));
