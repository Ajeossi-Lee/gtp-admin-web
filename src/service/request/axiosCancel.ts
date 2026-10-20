import type { AxiosRequestConfig } from 'axios'

// Store pending request keys and cancel functions
const pendingMap = new Map<string, AbortController>()

const getPendingUrl = (config: AxiosRequestConfig): string => {
  return [config.method, config.url].join('&')
}

export class AxiosCanceler {
  /**
   * Add a pending request
   * @param config request config
   */
  public addPending(config: AxiosRequestConfig): void {
    this.removePending(config)
    const url = getPendingUrl(config)
    const controller = new AbortController()
    config.signal = config.signal || controller.signal
    if (!pendingMap.has(url)) {
      pendingMap.set(url, controller)
    }
  }

  /**
   * Cancel all pending requests
   */
  public removeAllPending(): void {
    pendingMap.forEach((abortController) => {
      if (abortController) {
        abortController.abort()
      }
    })
    this.reset()
  }

  /**
   * Remove a pending request
   * @param config request config
   */
  public removePending(config: AxiosRequestConfig): void {
    const url = getPendingUrl(config)
    if (pendingMap.has(url)) {
      const abortController = pendingMap.get(url)
      if (abortController) {
        abortController.abort(url)
      }
      pendingMap.delete(url)
    }
  }

  /**
   * Reset
   */
  public reset(): void {
    pendingMap.clear()
  }
}
