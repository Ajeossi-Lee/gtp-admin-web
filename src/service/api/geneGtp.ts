import { leeRequest } from '..'
import type { CommonResult, GeneGtp, PageResult } from '@/types/api'

export interface GeneGtpQuery {
  page?: number
  pageSize?: number
  gene?: string
  mouseStrain?: string
}

export type GeneGtpPayload = Omit<GeneGtp, 'id'>

/**
 * Paginate GTP mouse strain records
 */
export function getGeneGtpPage(params: GeneGtpQuery) {
  return leeRequest.get<CommonResult<PageResult<GeneGtp>>>({
    url: '/gene-gtp/page',
    params
  })
}

/**
 * Create GTP mouse strain
 */
export function createGeneGtp(data: GeneGtpPayload) {
  return leeRequest.post<CommonResult<number>>({
    url: '/gene-gtp',
    data
  })
}

/**
 * Update GTP mouse strain
 */
export function updateGeneGtp(id: number, data: GeneGtpPayload) {
  return leeRequest.put<CommonResult<void>>({
    url: `/gene-gtp/${id}`,
    data
  })
}

/**
 * Delete GTP mouse strain
 */
export function deleteGeneGtp(id: number) {
  return leeRequest.delete<CommonResult<void>>({
    url: `/gene-gtp/${id}`
  })
}
