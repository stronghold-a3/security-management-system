import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getViteHTTPSConfig } from './src/middleware/httpsRedirect';

export default defineConfig(({ mode }) => {
  const useHTTPS = mode === 'production' || process.env.USE_HTTPS === 'true';
  
  return {
    plugins: [react()],
    server: getViteHTTPSConfig(useHTTPS),
    preview: getViteHTTPSConfig(useHTTPS),
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
    },
  };
});
