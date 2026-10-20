import type { AppRouteModule } from '../../types'

const LAYOUT = () => import('@/layout/index.vue')

/**
 * Protein image management
 */
const proteinImages: AppRouteModule = {
  path: '/protein-images',
  name: 'ProteinImages',
  component: LAYOUT,
  meta: {
    title: 'Protein Images',
    icon: 'Picture',
    order: 3
  },
  children: [
    {
      path: '',
      name: 'ProteinImagesIndex',
      component: () => import('@/views/protein-images/index.vue'),
      meta: {
        title: 'Protein Images',
        hideMenu: false
      }
    }
  ]
}

export default proteinImages
