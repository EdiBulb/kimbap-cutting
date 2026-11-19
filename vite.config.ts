import { defineConfig } from 'vite';

// base: './' 로 두면 GitHub Pages 하위 경로(/kimbap/)나 커스텀 도메인 어디서든 동작해요.
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
