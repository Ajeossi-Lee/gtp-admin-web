import type { App } from 'vue'
import { createI18n } from 'vue-i18n'

let zhCn = {}
let en = {}

const enModules = import.meta.glob('@/locales/lang/*/en.ts', { eager: true })
const zhModules = import.meta.glob('@/locales/lang/*/zh.ts', { eager: true })

for (const path in enModules) {
  const module: any = enModules[path]
  en = { ...en, ...module.default }
}

for (const path in zhModules) {
  const module: any = zhModules[path]
  zhCn = { ...zhCn, ...module.default }
}

export const i18n = createI18n({
  // Use Composition API mode
  legacy: false,
  // Inject $t globally
  globalInjection: true,
  locale: 'en',
  messages: {
    zhCn,
    en
  }
})

// setup i18n instance with glob
export function setupI18n(app: App) {
  app.use(i18n)
}
