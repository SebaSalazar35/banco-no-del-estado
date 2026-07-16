/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./testing/setup.js'],
    include: ['testing/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'text-summary'],
      include: [
        'src/utils/**',
        'src/components/TransferForm.jsx',
        'src/components/LoginForm.jsx',
        'src/components/MovementHistory.jsx',
        'src/hooks/useMovements.js',
      ],
      exclude: [
        'src/utils/formatters.js',
        'src/utils/rut.js',
      ],
    },
  },
})
