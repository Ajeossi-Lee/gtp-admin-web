import type { AppRouteModule } from '../../types'

const LAYOUT = () => import('@/layout/index.vue')

/**
 * GTP mouse strain management
 */
const geneGtp: AppRouteModule = {
  path: '/gene-gtp',
  name: 'GeneGtp',
  component: LAYOUT,
  meta: {
    title: 'GTP Mouse Strain',
    icon: 'Connection',
    order: 3
  },
  children: [
    {
      path: '',
      name: 'GeneGtpIndex',
      component: () => import('@/views/gene-gtp/index.vue'),
      meta: {
        title: 'GTP Mouse Strain',
        hideMenu: false
      }
    }
  ]
}

export default geneGtp
