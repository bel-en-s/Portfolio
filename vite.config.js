import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        bio: fileURLToPath(new URL('./bio/index.html', import.meta.url)),
        musica: fileURLToPath(new URL('./musica/index.html', import.meta.url)),
        'visual-art': fileURLToPath(new URL('./visual-art/index.html', import.meta.url)),
        tesoros: fileURLToPath(new URL('./tesoros/index.html', import.meta.url)),
      },
    },
  },
});
