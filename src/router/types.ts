import type { RouteRecordRaw } from 'vue-router'

/**
 * Route meta
 */
export interface RouteMeta {
  // Title
  title?: string
  // Hide from menu
  hideMenu?: boolean
  // Hide children in menu
  hideChildrenInMenu?: boolean
  // Hide from tabs
  hideTab?: boolean
  // Keep alive
  keepAlive?: boolean
  // Icon
  icon?: string
  // Order
  order?: number
  // Loaded
  loaded?: boolean
  // Permission
  permission?: string | string[]
  // Affix tab
  affixTab?: boolean
  // Hide breadcrumb
  hideBreadcrumb?: boolean
  // Hide in menu
  hideInMenu?: boolean
}

/**
 * Route module
 */
export type AppRouteModule = RouteRecordRaw & {
  meta?: RouteMeta
  children?: AppRouteModule[]
}

/**
 * Route record
 */
export type AppRouteRecordRaw = AppRouteModule
