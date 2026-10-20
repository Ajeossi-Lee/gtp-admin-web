import type { AppRouteModule } from '../../types'

const LAYOUT = () => import('@/layout/index.vue')

/**
 * Protein info management
 */
const proteinInfo: AppRouteModule = {
  path: '/protein-info',
  name: 'ProteinInfo',
  component: LAYOUT,
  meta: {
    title: 'Protein Info',
    icon: 'FirstAidKit',
    order: 2
  },
  children: [
    {
      path: '',
      name: 'ProteinInfoIndex',
      component: () => import('@/views/protein-info/index.vue'),
      meta: {
        title: 'Protein Info',
        hideMenu: false
      }
    }
  ]
}

export default proteinInfo
