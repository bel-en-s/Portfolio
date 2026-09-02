import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        bio: fileURLToPath(new URL('./bio.html', import.meta.url)),
        musica: fileURLToPath(new URL('./musica.html', import.meta.url)),
        'visual-art': fileURLToPath(new URL('./visual-art.html', import.meta.url)),
      },
    },
  },
});
