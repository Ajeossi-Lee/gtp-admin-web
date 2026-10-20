import { leeRequest } from '..'
import type { CommonResult, PageResult, ProteinImages } from '@/types/api'

export interface ProteinImagesQuery {
  page?: number
  pageSize?: number
  gene?: string
  protein?: string
  ensembleId?: string
  method?: string
  stage?: string
  location?: string
}

export type ProteinImagesPayload = Omit<ProteinImages, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Paginate protein image records
 */
export function getProteinImagesPage(params: ProteinImagesQuery) {
  return leeRequest.get<CommonResult<PageResult<ProteinImages>>>({
    url: '/protein-images/page',
    params
  })
}

/**
 * Update protein image
 */
export function updateProteinImages(id: number, data: ProteinImagesPayload) {
  return leeRequest.put<CommonResult<void>>({
    url: `/protein-images/${id}`,
    data
  })
}

/**
 * Delete protein image and related image_slices records
 */
export function deleteProteinImages(id: number) {
  return leeRequest.delete<CommonResult<void>>({
    url: `/protein-images/${id}`
  })
}
