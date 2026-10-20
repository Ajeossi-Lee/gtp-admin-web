import type { AppRouteModule } from '../types'
import { basicRoutes } from './basic'

/**
 * Load route modules from the modules directory
 */
const modules = import.meta.glob<{ default: AppRouteModule }>('./modules/**/*.ts', {
  eager: true
})

/**
 * Route module list
 */
const routeModuleList: AppRouteModule[] = []

Object.keys(modules).forEach((key) => {
  const mod = modules[key]?.default || {}
  const modList = Array.isArray(mod) ? [...mod] : [mod]
  routeModuleList.push(...modList)
})

/**
 * All routes: basic routes plus loaded modules
 */
export const allRoutes: AppRouteModule[] = [...basicRoutes, ...routeModuleList]

/**
 * Basic routes used for the whitelist
 */
export { basicRoutes }
