// Tesoros: contenido de respaldo (se usa si Are.na no responde o estás offline).
// El contenido principal se carga desde tu canal de Are.na (ver tesoros.js).
//   image:   URL de la foto (o ruta local tipo "../assets/..."). Se carga directo, no hace falta subirla.
//   url:     a dónde lleva la tarjeta al hacer clic (opcional; si está vacío, la tarjeta no es un link).
//   comment: { es: texto en español, en: texto en inglés } o una cadena simple.

export const entries = [
  {
    image: "",
    url: "https://a-dark.horse/",
    comment: {
      es: "a dark horse — me encantó este sitio",
      en: "a dark horse — I loved this site",
    },
  },
  {
    image: "../assets/tesoros-rolypoly.gif",
    url: "",
    comment: {
      es: "screensaver del más allá",
      en: "screensaver from beyond",
    },
  },
  {
    image: "",
    url: "https://archive.org/details/satoArtOfComputerDesigning/mode/2up",
    comment: {
      es: "Osamu Sato — Art of Computer Design",
      en: "Osamu Sato — Art of Computer Design",
    },
  },
];
