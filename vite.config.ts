import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })]
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })] // On-demand styles
    }),
    tailwindcss(),
    createSvgIconsPlugin({
      // Cached SVG icon directory
      iconDirs: [path.resolve(process.cwd(), 'src/assets/svgIcons')],
      // Symbol ID format
      symbolId: 'icon-[name]',
      // Extra svgo options: https://github.com/svg/svgo
      svgoOptions: {
        plugins: [
          {
            name: 'removeAttrs',
            params: { attrs: ['class', 'data-name', 'fill', 'stroke'] }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Inject variable overrides into each on-demand SCSS file
        additionalData: `@use "@/styles/element-variables.scss" as *;`
      }
    }
  },
  server: {
    port: 3111,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
