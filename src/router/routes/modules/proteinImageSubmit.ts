import type { AppRouteModule } from '../../types'

const LAYOUT = () => import('@/layout/index.vue')

/**
 * Submit OIR data and generate protein_images / image_slices
 */
const proteinImageSubmit: AppRouteModule = {
  path: '/protein-image-submit',
  name: 'ProteinImageSubmit',
  component: LAYOUT,
  meta: {
    title: 'Submit Images',
    icon: 'Upload',
    order: 4
  },
  children: [
    {
      path: '',
      name: 'ProteinImageSubmitIndex',
      component: () => import('@/views/protein-image-submit/index.vue'),
      meta: {
        title: 'Submit Images',
        hideMenu: false
      }
    }
  ]
}

export default proteinImageSubmit
