import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { AppRouteModule } from './types'
import { allRoutes, basicRoutes } from './routes'
import { setupRouterGuard } from './guard'

/**
 * Whitelist route names that resetRouter will not remove
 */
const WHITE_NAME_LIST: string[] = []

/**
 * Recursively collect route names
 * @param routes route list
 */
const getRouteNames = (routes: AppRouteModule[]): void => {
  routes.forEach((route) => {
    if (route.name) {
      WHITE_NAME_LIST.push(route.name as string)
    }
    if (route.children && route.children.length > 0) {
      getRouteNames(route.children)
    }
  })
}

getRouteNames(basicRoutes)

/**
 * Router instance
 */
export const router = createRouter({
  // history 模式，地址中不带 #。base 与 Vite 构建前缀一致：生产为 /gtp/admin-system/，本地开发为 /
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes as unknown as RouteRecordRaw[],
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

/**
 * Reset routes by removing non-whitelist routes
 */
export function resetRouter(): void {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      if (router.hasRoute(name)) {
        router.removeRoute(name)
      }
    }
  })
}

/**
 * Install router
 * @param app Vue app
 */
export function setupRouter(app: App<Element>): void {
  app.use(router)
  setupRouterGuard(router)
}
