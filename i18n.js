const translations = {
  es: {
    // Navegación
    'nav.home': 'inicio',
    'nav.bio': 'bio',
    'nav.visualart': 'arte visual',
    'nav.music': 'música',
    'nav.treasures': 'tesoros',

    // Estrellas (home)
    'star.bio': 'Bio & Publicaciones',
    'star.music': 'Música',
    'star.visual': 'Arte visual',
    'star.treasures': 'Tesoros',
    'star.commercial': 'Trabajo comercial',

    // Home
    'home.subtitle': 'diseñadora web creativa y artista multimedial',

    // Títulos de página
    'title.home': 'Belén Seoane — Artista Multimedial y Diseñadora Web Creativa',
    'title.bio': 'Belén Seoane Palmieri — Bio',
    'title.music': 'Belén Seoane Palmieri — Música',
    'title.visual': 'Belén Seoane Palmieri — Arte Visual',
    'title.treasures': 'Belén Seoane Palmieri — Tesoros',

    // Bio
    'bio.p1': 'Belén es una artista visual multimedial. Se formó en la Universidad Nacional de las Artes, tanto en la Licenciatura en Artes Visuales como en la Licenciatura en Artes Multimediales.',
    'bio.p2': 'Fue becada para estudiar en la Universidad Politécnica de Valencia, en España, como parte de un programa de intercambio. Allí cursó un semestre de la carrera Diseño y Tecnologías Creativas y participó en diversos eventos culturales y exposiciones colectivas. Realizó talleres con Marcia Schvartz, Lucía Jazmín Tarela y Fabiana Barreda.',
    'bio.p3': 'Actualmente vive y trabaja en Buenos Aires, donde desarrolla su práctica artística y profesional de manera independiente. Su trabajo es una invitación a imaginar internet como un lugar que vale la pena volver a habitar: lúdico, mágico, lento y vivo.',
    'bio.publications': 'publicaciones',
    'bio.publications.item1': '★ “Can We Dream the Internet Again?” — AND/ORs, People, Planet, Digital Futures, UK (2026)',
    'bio.publications.item2': '★ “Alquimia Tecnológica — Proyecto de Tesis” — Universidad Nacional de las Artes, Buenos Aires (2026)',

    // Visual art
    'art.title': 'arte visual',
    'art.subtitle': 'las indecibles — 2025–2026',
    'art.exhibitions': 'muestras',
    'art.exh.sural': 'Festival Sur Aural',
    'art.exh.nodo': 'Curaduría de Daniela Mibashan, Centro Cultural Nodo',
    'art.exh.deoffi': 'Curaduría de Francesca Pandolfo, deOFFI',
    'art.exh.videobardo': 'Curaduría de Javier Robledo, Biblioteca Nacional Mariano Moreno',
    'art.exh.balcarce': 'Centro Cultural Balcarce',
    'art.exh.fragata': 'Nos en Vera',
    'art.buy': 'por interés en adquirir alguna obra comunicarse por mail belen.seoane.palmieri@gmail.com',

    // Música
    'music.coming': 'próximamente',

    // Tesoros
    'treasures.title': 'tesoros',

    // Selector de idioma
    'lang.switch': 'Cambiar idioma',
  },

  en: {
    'nav.home': 'home',
    'nav.bio': 'bio',
    'nav.visualart': 'visual art',
    'nav.music': 'music',
    'nav.treasures': 'treasures',

    'star.bio': 'Bio & Publications',
    'star.music': 'Music',
    'star.visual': 'Visual art',
    'star.treasures': 'Treasures',
    'star.commercial': 'Commercial work',

    'home.subtitle': 'creative web designer & multimedia artist',

    'title.home': 'Belén Seoane — Multimedia Artist & Creative Web Designer',
    'title.bio': 'Belén Seoane Palmieri — Bio',
    'title.music': 'Belén Seoane Palmieri — Music',
    'title.visual': 'Belén Seoane Palmieri — Visual Art',
    'title.treasures': 'Belén Seoane Palmieri — Treasures',

    'bio.p1': 'Belén is a multimedia visual artist. She studied at the National University of the Arts, earning both a degree in Visual Arts and a degree in Multimedia Arts.',
    'bio.p2': 'She was awarded a scholarship to study at the Universitat Politècnica de València, in Spain, as part of an exchange program. There she completed a semester of the Design and Creative Technologies program and took part in various cultural events and group exhibitions. She attended workshops with Marcia Schvartz, Lucía Jazmín Tarela, and Fabiana Barreda.',
    'bio.p3': 'She currently lives and works in Buenos Aires, where she develops her artistic and professional practice independently. Her work is an invitation to imagine the internet as a place worth inhabiting again: playful, magical, slow, and alive.',
    'bio.publications': 'publications',
    'bio.publications.item1': '★ “Can We Dream the Internet Again?” — AND/ORs, People, Planet, Digital Futures, UK (2026)',
    'bio.publications.item2': '★ “Technological Alchemy — Thesis Project” — National University of the Arts (UNA), Buenos Aires (2026)',

    'art.title': 'visual art',
    'art.subtitle': 'las indecibles — 2025–2026',
    'art.exhibitions': 'exhibitions',
    'art.exh.sural': 'Festival Sur Aural',
    'art.exh.nodo': 'Curated by Daniela Mibashan, Centro Cultural Nodo',
    'art.exh.deoffi': 'Curated by Francesca Pandolfo, deOFFI',
    'art.exh.videobardo': 'Curated by Javier Robledo, Biblioteca Nacional Mariano Moreno',
    'art.exh.balcarce': 'Centro Cultural Balcarce',
    'art.exh.fragata': 'Nos en Vera',
    'art.buy': 'for inquiries about acquiring a work, email belen.seoane.palmieri@gmail.com',

    'music.coming': 'coming soon',

    'treasures.title': 'treasures',

    'lang.switch': 'Switch language',
  },
};

const LANG_KEY = 'lang';
const DEFAULT_LANG = 'es';
const SUPPORTED = ['es', 'en'];

function currentLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch (e) {
    /* localStorage no disponible */
  }
  return DEFAULT_LANG;
}

export function t(lang, key) {
  return (
    translations[lang]?.[key] ??
    translations.en[key] ??
    translations.es[key] ??
    key
  );
}

function applyText(el, lang) {
  const key = el.getAttribute('data-i18n');
  if (!key) return;
  const attr = el.getAttribute('data-i18n-attr');
  const value = t(lang, key);

  if (attr) {
    if (attr === 'html') el.innerHTML = value;
    else el.setAttribute(attr, value);
  } else {
    el.textContent = value;
  }
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => applyText(el, lang));

  document.querySelectorAll('.lang-opt').forEach((opt) => {
    opt.classList.toggle('is-active', opt.dataset.lang === lang);
  });

  const toggle = document.querySelector('.lang-toggle');
  if (toggle) toggle.setAttribute('aria-label', t(lang, 'lang.switch'));

  window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang)) return;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* localStorage no disponible */
  }
  applyLanguage(lang);
}

function buildToggle() {
  const host =
    document.querySelector('.header-nav') || document.querySelector('.header');
  if (!host || document.querySelector('.lang-toggle')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lang-toggle';
  btn.setAttribute('aria-label', 'Idioma / Language');

  const es = document.createElement('span');
  es.className = 'lang-opt';
  es.dataset.lang = 'es';
  es.textContent = 'es';

  const sep = document.createElement('span');
  sep.className = 'lang-sep';
  sep.setAttribute('aria-hidden', 'true');
  sep.textContent = '/';

  const en = document.createElement('span');
  en.className = 'lang-opt';
  en.dataset.lang = 'en';
  en.textContent = 'en';

  btn.appendChild(es);
  btn.appendChild(sep);
  btn.appendChild(en);

  btn.addEventListener('click', () => {
    setLang(currentLang() === 'es' ? 'en' : 'es');
  });

  host.appendChild(btn);
}

buildToggle();
applyLanguage(currentLang());

export { currentLang };
