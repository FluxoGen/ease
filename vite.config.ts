import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
// Short commit id of this build (Vercel provides it; locally ask git), so a screenshot says exactly what it is.
const buildId = (() => {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return 'local' }
})()

// https://vite.dev/config/
// `vite build --mode native` builds for the Android app: the APK already holds every file, so no
// service worker (it would only add a second cache that can serve stale files after an update).
export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(pkg.version), __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: mode === 'native',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg,woff2}'],
      },
      manifest: {
        name: 'ease — Self-Acupressure',
        short_name: 'ease',
        description: 'Offline guide to self-acupressure points for common symptoms.',
        theme_color: '#f6f3ec',
        background_color: '#f6f3ec',
        display: 'standalone',
        icons: [
          { src: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
}))
