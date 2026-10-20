import { leeRequest } from '..'
import type { CommonResult, PageResult, ProteinInfo } from '@/types/api'

export interface ProteinInfoQuery {
  page?: number
  pageSize?: number
  gene?: string
  protein?: string
  uniprotEntry?: string
  ensembleId?: string
}

export type ProteinInfoPayload = Omit<ProteinInfo, 'id'>

/**
 * Paginate protein info
 */
export function getProteinInfoPage(params: ProteinInfoQuery) {
  return leeRequest.get<CommonResult<PageResult<ProteinInfo>>>({
    url: '/protein-info/page',
    params
  })
}

/**
 * Create protein info
 */
export function createProteinInfo(data: ProteinInfoPayload) {
  return leeRequest.post<CommonResult<number>>({
    url: '/protein-info',
    data
  })
}

/**
 * Update protein info
 */
export function updateProteinInfo(id: number, data: ProteinInfoPayload) {
  return leeRequest.put<CommonResult<void>>({
    url: `/protein-info/${id}`,
    data
  })
}

/**
 * Delete protein info
 */
export function deleteProteinInfo(id: number) {
  return leeRequest.delete<CommonResult<void>>({
    url: `/protein-info/${id}`
  })
}
