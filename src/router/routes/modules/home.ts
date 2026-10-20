import type { AppRouteModule } from '../../types'

const LAYOUT = () => import('@/layout/index.vue')

/**
 * Home route module
 */
const home: AppRouteModule = {
  path: '/home',
  name: 'Home',
  component: LAYOUT,
  meta: {
    title: 'Home',
    icon: 'home',
    order: 1
  },
  children: [
    {
      path: '',
      name: 'HomeIndex',
      component: () => import('@/views/home/index.vue'),
      meta: {
        title: 'Home',
        hideMenu: false
      }
    }
  ]
}

export default home

