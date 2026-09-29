import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = (env.VITE_APP_URL || process.env.VITE_APP_URL || 'https://your-clinic.vercel.app').replace(/\/$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-env-transform',
        transformIndexHtml(html) {
          return html.replace(/%VITE_APP_URL%/g, appUrl);
        },
      },
    ],
    define: {
      'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
