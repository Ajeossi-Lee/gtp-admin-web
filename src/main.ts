import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/style.css'
import '@/styles/global.scss'
import '@/styles/admin-theme.scss'
import 'nprogress/nprogress.css'
import { setupStore } from '@/store'
import { setupI18n } from '@/locales/index'
import { registerGlobComp } from '@/components'
import { setupRouter } from '@/router'

async function bootstrap() {
  const app = createApp(App)
  setupI18n(app)
  setupStore(app)
  setupRouter(app)
  registerGlobComp(app)

  app.mount('#app')
}

bootstrap()
