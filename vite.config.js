import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // The main 3D scene
        main: resolve(__dirname, 'index.html'),
        // The new resume page
        resume: resolve(__dirname, 'resume.html'),
      },
    },
  },
});