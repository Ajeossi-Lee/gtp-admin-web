import { ElNotification, NotificationParams } from 'element-plus'
import nprogress from 'nprogress'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { i18n } from '@/locales'

dayjs.extend(utc)

/*
  UTC: timezone 0
  Beijing time: UTC + 8 hours
*/

export function formatUTC(utcString: string, format = 'YYYY/MM/DD HH:mm:ss') {
  const resultTime = dayjs.utc(utcString).utcOffset(8).format(format)
  return resultTime
}

// Show fullscreen loading
export function showFullLoading() {
  nprogress.start()
}

// Hide fullscreen loading
export function hideFullLoading() {
  nprogress.done()
}

// Toast message
export function toast(
  message,
  type = 'success',
  dangerouslyUseHTMLString = true
) {
  const options = {
    message,
    type,
    dangerouslyUseHTMLString,
    duration: 3000
  }
  ElNotification(options as NotificationParams)
}

export function showModal(content = 'Tips', type = 'warning', title = '') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ElMessageBox.confirm(content, title, {
    confirmButtonText: i18n.global.t('operation.confirm'),
    cancelButtonText: i18n.global.t('operation.cancel'),
    type
  })
}

/**
 * @description Recursively collect breadcrumb data
 * @param {Array} menuList menu list
 * @param {Object} result output
 * @param {Array} parent parent menus
 * @returns object
 */
export const getAllBreadcrumbList = (menuList, result = {}, parent = []) => {
  for (const item of menuList) {
    const { path, icon, name, children } = item
    result[item.path] = [...parent, { path, icon, name, children }]
    if (item.children)
      getAllBreadcrumbList(item.children, result, result[item.path])
  }
  return result
}

/**
 * Extract a field from a nested object array
 * @param arr array
 * @param extractItem field name
 * @returns extracted values
 */

export function extractArrMsg<T>(arr: any[], extractItem: T) {
  const extractedIds: T[] = []
  arr.forEach((item) => {
    extractedIds.push(item[extractItem])
    if (item.children) {
      extractedIds.push(...extractArrMsg(item.children, extractItem))
    }
  })
  return extractedIds
}

export function generateSelectOptions(arr: any[]) {
  const optionsRes: any[] = []
  arr.forEach((item) => {
    optionsRes.push({ label: item.name, value: item.id })
    if (item.children) {
      optionsRes.push(...generateSelectOptions(item.children))
    }
  })
  return optionsRes
}

// i18n helper for route and breadcrumb titles
export function generateTitle(title: string) {
  const hasKey = i18n.global.te('navbar.' + title)
  if (hasKey) {
    const translatedTitle = i18n.global.t('navbar.' + title)
    return translatedTitle
  }
  return title
}

export function downloadFile(url: string, filename: string) {
  // const baseURL = import.meta.env.VITE_URL
  const link = document.createElement('a')
  link.style.display = 'none'
  // const request_url = baseURL + url
  const request_url = url
  fetch(request_url)
    .then((res) => res.blob())
    .then((blob) => {
      link.href = URL.createObjectURL(blob)
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}
