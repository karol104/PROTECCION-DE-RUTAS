import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: false
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src')
    }
  },

  // 👇 Render necesita que el servidor escuche en el puerto asignado
  server: {
    host: '0.0.0.0',                    // permite conexiones externas
    port: process.env.PORT || 5173,     // usa el puerto que Render asigna
    open: false,                        // no hace falta abrir el navegador
  },

  // 👇 asegura que los archivos de build se guarden en ./dist
  build: {
    outDir: './dist'
  }
})

