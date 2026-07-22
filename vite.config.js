import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/everyday-acts/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        dreamInterview: resolve(process.cwd(), 'dream-interview.html'),
      },
    },
  },
});
