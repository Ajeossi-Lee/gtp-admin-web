import { BASE_URL, TIME_OUT } from './config'
import LeeRequest from './request'
import { toast } from '@/utils/tools'
import { localCache } from '@/utils/cache'

let refreshing = false

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
          if (result?.data) {
            localCache.setCache('token', result.data)
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
      const isLoginPage = window.location.hash.includes('/login')
      if (isAuthError && !isLoginPage) {
        localCache.removeCache('token')
        localCache.removeCache('userInfo')
        window.location.hash = '#/login'
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
