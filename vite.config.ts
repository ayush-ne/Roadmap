import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Minimal ambient declaration so this config type-checks without needing
// @types/node as a dependency (this file runs under Node at build time,
// where the real `process` global is always present).
declare const process: { env: Record<string, string | undefined> };

// Set base to your GitHub repo name for GitHub Pages deployment
// e.g. https://username.github.io/Roadmap/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/Roadmap/' : '/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
