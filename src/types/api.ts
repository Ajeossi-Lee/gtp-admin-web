/**
 * Unified API response
 */
export interface CommonResult<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * Paginated result
 */
export interface PageResult<T = any> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

/**
 * Logged-in user info
 */
export interface UserInfo {
  id: number
  username: string
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  status?: number
}

/**
 * Protein basic info
 */
export interface ProteinInfo {
  id: number
  gene: string
  protein: string
  uniprotEntry: string
  geneSynonym?: string
  proteinName?: string
  cellularComponent?: string
  molecularFunction?: string
  biologicalProcess?: string
  organism?: string
  ensembleId?: string
  chromosomeName?: string
}

/**
 * GTP mouse strain
 */
export interface GeneGtp {
  id: number
  gene: string
  mouseStrain: string
  gtp: string
}

/**
 * Protein image data
 */
export interface ProteinImages {
  id: number
  protein: string
  gene: string
  ensembleId: string
  method: string
  location?: string
  detection?: boolean
  stage: string
  imageDir?: string
  channel1MaxName?: string
  channel2MaxName?: string
  mergedMaxName?: string
  channel1VideoName?: string
  channel2VideoName?: string
  mergedVideoName?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Protein image submit config (conf.csv)
 */
export interface ProteinImageConf {
  id: number
  protein: string
  gene: string
  ensembleId: string
  method: string
  location?: string
  detection?: boolean
  stage: string
  imageDir?: string
  oirFile?: string
  status: string
  errorMessage?: string
  createdAt?: string
  updatedAt?: string
}
