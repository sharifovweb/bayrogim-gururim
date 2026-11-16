import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// index.html ichidagi __SITE_URL__ belgisini VITE_SITE_URL qiymatiga almashtiradi
// (Open Graph rasmlari uchun to‘liq manzil kerak). Qiymat berilmasa nisbiy yo‘l qoladi.
function siteUrl(env) {
  const url = (env.VITE_SITE_URL || '').replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', url),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: env.VITE_PREVIEW === '1' ? './' : '/',
    plugins: [react(), siteUrl(env)],
    build: {
      target: 'es2020',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
