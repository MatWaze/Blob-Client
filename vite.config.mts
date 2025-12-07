import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        login: './login.html',
        register: './register.html',
      }
    }
  },
  server: {
    port: 3065
  }
});
