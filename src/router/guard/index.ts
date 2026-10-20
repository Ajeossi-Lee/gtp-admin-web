import type { Router, RouteLocationNormalized } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { warn } from '@/utils/log'
import nProgress from 'nprogress'
import useConfigStore from '@/store/modules/config'
import { AxiosCanceler } from '@/service/request/axiosCancel'
import { localCache } from '@/utils/cache'

type Nullable<T> = T | null

/** Route names that can be accessed without login */
const WHITE_LIST = ['Login']

export function setupRouterGuard(router: Router) {
  createAuthGuard(router)
  createPageGuard(router)
  createPageLoadingGuard(router)
  createHttpGuard(router)
  createScrollGuard(router)
  createMessageGuard(router)
  createProgressGuard(router)
}

/**
 * Auth guard
 */
function createAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    const token = localCache.getCache('token')
    if (WHITE_LIST.includes(to.name as string)) {
      if (token && to.name === 'Login') {
        return '/home'
      }
      return true
    }
    if (!token) {
      return {
        name: 'Login',
        query: { redirect: to.fullPath }
      }
    }
    return true
  })
}

/**
 * Hooks for handling page state
 */
function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>()

  router.beforeEach(async (to) => {
    // The page has already been loaded, it will be faster to open it again, you don’t need to do loading and other processing
    to.meta.loaded = !!loadedPageMap.get(to.path)
    // Notify routing changes
    // setRouteChange(to)
    return true
  })

  router.afterEach((to) => {
    loadedPageMap.set(to.path, true)
  })
}

// Used to handle page loading status
function createPageLoadingGuard(router: Router) {
  // Toggle page loading on route change
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true
    }

    useConfigStore().handlePageLoading(true)
    return true
  })
  router.afterEach(async () => {
    // TODO Looking for a better way
    // The timer simulates the loading time to prevent flashing too fast,
    setTimeout(() => {
      useConfigStore().handlePageLoading(false)
    }, 220)

    return true
  })
}

/**
 * Cancel pending requests when the route changes
 * @param router
 */
function createHttpGuard(router: Router) {
  const axiosCanceler: Nullable<AxiosCanceler> = new AxiosCanceler()
  router.beforeEach(async () => {
    // Switching the route will delete the previous request
    axiosCanceler?.removeAllPending()
    return true
  })
}

// Scroll back to top
function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return /^#/.test(href)
  }

  router.afterEach(async (to) => {
    // scroll top
    // Scroll the content area to the top
    if (isHash((to as RouteLocationNormalized & { href: string })?.href)) {
      document.querySelector('.lee-layout-content')?.scrollTo(0, 0)
    }
    return true
  })
}

/**
 * Close leftover messages when the route changes
 * @param router
 */
export function createMessageGuard(router: Router) {
  router.beforeEach(async () => {
    try {
      ElMessage.closeAll()
      ElNotification.closeAll()
    } catch (error) {
      warn('message guard error:' + error)
    }
    return true
  })
}

// Progress bar guard
export function createProgressGuard(router: Router) {
  router.beforeEach(async (to) => {
    // Skip if the page has already been loaded
    if (to.meta.loaded) {
      return true
    }
    nProgress.start()
    return true
  })

  router.afterEach(async () => {
    nProgress.done()
    return true
  })
}
