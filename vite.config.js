import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { '@instinct/files': path.resolve(__dirname, 'src/shim-files.ts') } },
  build: { target: 'es2019', rollupOptions: { input: 'entry.html' } },
});
