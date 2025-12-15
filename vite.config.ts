import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Fix for "process is not defined" error in browser
      // Fix for "process is not defined" error in browser
      'process.env': JSON.stringify({
        API_KEY: env.GEMINI_API_KEY,
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        OPENAI_API_KEY: env.OPENAI_API_KEY,
        ...env
      }),
      'process': JSON.stringify({
        env: {
          API_KEY: env.GEMINI_API_KEY,
          GEMINI_API_KEY: env.GEMINI_API_KEY,
          OPENAI_API_KEY: env.OPENAI_API_KEY,
          ...env
        }
      })
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
