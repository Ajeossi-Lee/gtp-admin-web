/*
  Axios wrapper
  - Per-request interceptors
  - Independent instances
  - GET / POST helpers
*/
import axios from 'axios'
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from 'axios'

// Extend AxiosRequestConfig
export interface LeeInterceptors<T = AxiosResponse> {
  requestSuccessFn?: (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig
  requestFailureFn?: (err: any) => any
  responseSuccessFn?: (res: T) => T
  responseFailureFn?: (err: any) => any
}

export interface LeeRequestConfig<T = AxiosResponse>
  extends AxiosRequestConfig {
  interceptors?: LeeInterceptors<T>
}

class LeeRequest {
  instance: AxiosInstance

  constructor(config: LeeRequestConfig) {
    this.instance = axios.create(config)

    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (err) => {
        return err
      }
    )
    this.instance.interceptors.response.use(
      (res) => {
        return res
      },
      (err) => {
        return Promise.reject(err)
      }
    )

    this.instance.interceptors.request.use(
      config.interceptors?.requestSuccessFn,
      config.interceptors?.requestFailureFn
    )
    this.instance.interceptors.response.use(
      config.interceptors?.responseSuccessFn,
      config.interceptors?.responseFailureFn
    )
  }

  request<T = any>(config: LeeRequestConfig<T>) {
    if (config.interceptors?.requestSuccessFn) {
      config = config.interceptors.requestSuccessFn(
        config as InternalAxiosRequestConfig
      )
    }

    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          if (config.interceptors?.responseSuccessFn) {
            res = config.interceptors.responseSuccessFn(res)
          }
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(config: LeeRequestConfig<T>) {
    return this.request({ ...config, method: 'GET' })
  }
  post<T = any>(config: LeeRequestConfig<T>) {
    return this.request({ ...config, method: 'POST' })
  }
  delete<T = any>(config: LeeRequestConfig<T>) {
    return this.request({ ...config, method: 'DELETE' })
  }
  patch<T = any>(config: LeeRequestConfig<T>) {
    return this.request({ ...config, method: 'PATCH' })
  }
  put<T = any>(config: LeeRequestConfig<T>) {
    return this.request({ ...config, method: 'PUT' })
  }
}

export default LeeRequest
