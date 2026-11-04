import { BASE_URL, TIME_OUT } from './config'
import LeeRequest from './request'
import { toast } from '@/utils/tools'
import { localCache } from '@/utils/cache'

let refreshing = false

/** 续期结果可能在 data 中；旧接口曾把 Token 放在 message 里 */
function pickRenewedToken(result: unknown): string {
  if (typeof result === 'string') {
    return result
  }
  if (!result || typeof result !== 'object') {
    return ''
  }
  const body = result as { data?: unknown; message?: unknown }
  if (typeof body.data === 'string' && body.data) {
    return body.data
  }
  if (typeof body.message === 'string' && body.message.split('.').length === 3) {
    return body.message
  }
  return ''
}

const interceptors = {
  requestSuccessFn: (config: any) => {
    const token = localCache.getCache('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.token = token
    }
    return config
  },
  responseSuccessFn: (res: any) => {
    if (res.request?.responseType == 'blob') {
      return res
    }

    const updateTokenFlag = res.headers?.['update-token']
    if (updateTokenFlag === 'update' && !refreshing) {
      refreshing = true
      import('./api/user')
        .then(({ updateTokenRequest }) => updateTokenRequest())
        .then((result) => {
          const renewed = pickRenewedToken(result)
          if (renewed) {
            localCache.setCache('token', renewed)
          }
        })
        .catch(() => {
          // Keep the current token if renewal fails; the next request will retry
        })
        .finally(() => {
          refreshing = false
        })
    }

    const data = res.data
    if (data && typeof data.code === 'number' && data.code !== 0) {
      const msg = data.message || 'Request failed'
      toast(msg, 'error')
      const isAuthError = /未登录|Token|其他地方登录|not logged in|expired/i.test(msg)
      // history 模式下登录页是 /login，生产环境还要带上 /gtp/admin-system 前缀
      const loginPath = `${import.meta.env.BASE_URL}login`
      const isLoginPage =
        window.location.pathname === loginPath || window.location.pathname.startsWith(`${loginPath}/`)
      if (isAuthError && !isLoginPage) {
        localCache.removeCache('token')
        localCache.removeCache('userInfo')
        window.location.assign(loginPath)
      }
      return Promise.reject(data)
    }
    return data
  },
  responseFailureFn: (error: any) => {
    const msg =
      error?.response?.data?.message || error?.message || 'Request failed. Please refresh and try again'
    toast(msg, 'error')
    return Promise.reject(error)
  }
}

const leeRequest = new LeeRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
  interceptors
})

export { leeRequest }
