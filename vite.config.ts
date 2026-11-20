import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        noteMap: fileURLToPath(new URL('./note-map.html', import.meta.url)),
        pianoTest: fileURLToPath(new URL('./piano_test2.html', import.meta.url))
      }
    }
  }
});
