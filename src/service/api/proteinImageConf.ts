import { leeRequest } from '..'
import type { CommonResult, PageResult, ProteinImageConf } from '@/types/api'

export interface ProteinImageConfQuery {
  page?: number
  pageSize?: number
  gene?: string
  protein?: string
  ensembleId?: string
  location?: string
  method?: string
  stage?: string
  status?: string
  /** 创建时间起，yyyy-MM-dd，含当天 */
  createdAtStart?: string
  /** 创建时间止，yyyy-MM-dd，含当天 */
  createdAtEnd?: string
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

export interface ProteinImageConfImportError {
  row: number
  field: string
  message: string
}

export interface ProteinImageConfImportResult {
  success: boolean
  inserted: number
  errors: ProteinImageConfImportError[]
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
 * 按 conf.csv 批量导入，校验失败时不写入
 */
export function importProteinImageConfCsv(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return leeRequest.post<CommonResult<ProteinImageConfImportResult>>({
    url: '/protein-image-conf/import',
    data: formData,
    timeout: 5 * 60 * 1000
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
