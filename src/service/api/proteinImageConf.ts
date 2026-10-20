import { leeRequest } from '..'
import type { CommonResult, PageResult, ProteinImageConf } from '@/types/api'

export interface ProteinImageConfQuery {
  page?: number
  pageSize?: number
  gene?: string
  protein?: string
  method?: string
  stage?: string
  status?: string
}

export type ProteinImageConfPayload = {
  protein: string
  gene: string
  ensembleId: string
  method: string
  location?: string
  detection?: boolean
  stage: string
  imageDir: string
}

/**
 * Paginate submit records
 */
export function getProteinImageConfPage(params: ProteinImageConfQuery) {
  return leeRequest.get<CommonResult<PageResult<ProteinImageConf>>>({
    url: '/protein-image-conf/page',
    params
  })
}

/**
 * Get one submit record
 */
export function getProteinImageConf(id: number) {
  return leeRequest.get<CommonResult<ProteinImageConf>>({
    url: `/protein-image-conf/${id}`
  })
}

/**
 * Generate a conf.csv-style record
 */
export function createProteinImageConf(data: ProteinImageConfPayload) {
  return leeRequest.post<CommonResult<number>>({
    url: '/protein-image-conf',
    data
  })
}

/**
 * Save OIR file to the configured directory
 */
export function uploadProteinImageOir(id: number, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return leeRequest.post<CommonResult<ProteinImageConf>>({
    url: `/protein-image-conf/${id}/oir`,
    data: formData,
    timeout: 30 * 60 * 1000
  })
}

/**
 * Submit processing with processOir.py
 */
export function submitProteinImageConf(id: number) {
  return leeRequest.post<CommonResult<void>>({
    url: `/protein-image-conf/${id}/submit`
  })
}

/**
 * Delete a submit record
 */
export function deleteProteinImageConf(id: number) {
  return leeRequest.delete<CommonResult<void>>({
    url: `/protein-image-conf/${id}`
  })
}
