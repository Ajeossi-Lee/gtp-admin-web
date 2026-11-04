// Request config
// 生产环境页面在 /gtp/admin-system/ 下，接口走独立前缀，避免和数据库系统的 /api 冲突。
// 本地开发仍请求 /api，由 Vite 代理去掉前缀后转发到后台服务。
const appBase = import.meta.env.BASE_URL.replace(/\/$/, '')
export const BASE_URL = import.meta.env.PROD ? `${appBase}/api` : '/api'
export const TIME_OUT = 60000
