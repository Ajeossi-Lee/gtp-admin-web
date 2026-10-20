import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
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
  history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH || '/'),
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
