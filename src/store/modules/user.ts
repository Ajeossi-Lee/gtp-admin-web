import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { localCache } from '@/utils/cache'
import {
  getUserInfo,
  loginRequest,
  logoutRequest,
  updateTokenRequest
} from '@/service/api/user'
import type { UserInfo } from '@/types/api'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

const useUserStore = defineStore('user', () => {
  const token = ref<string>(localCache.getCache(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(localCache.getCache(USER_INFO_KEY) || null)

  const isLogin = computed(() => !!token.value)
  const displayName = computed(
    () => userInfo.value?.nickname || userInfo.value?.username || 'Admin'
  )

  const setToken = (val: string) => {
    token.value = val
    if (val) {
      localCache.setCache(TOKEN_KEY, val)
    } else {
      localCache.removeCache(TOKEN_KEY)
    }
  }

  const setUserInfo = (val: UserInfo | null) => {
    userInfo.value = val
    if (val) {
      localCache.setCache(USER_INFO_KEY, val)
    } else {
      localCache.removeCache(USER_INFO_KEY)
    }
  }

  /**
   * Sign in and persist token plus user info
   */
  const login = async (account: { username: string; password: string }) => {
    const res = await loginRequest(account)
    setToken(res.data.token)
    setUserInfo(res.data.user)
    return res
  }

  /**
   * Fetch current user info
   */
  const fetchUserInfo = async () => {
    const res = await getUserInfo()
    setUserInfo(res.data)
    return res.data
  }

  /**
   * Renew token when it is about to expire
   */
  const refreshToken = async () => {
    const res = await updateTokenRequest()
    const renewed = res?.data
    if (renewed) {
      setToken(renewed)
    }
  }

  /**
   * Clear local auth state
   */
  const clearAuth = () => {
    setToken('')
    setUserInfo(null)
  }

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      if (token.value) {
        await logoutRequest()
      }
    } catch {
      // Still clear local state if the logout API fails
    }
    clearAuth()
  }

  return {
    token,
    userInfo,
    isLogin,
    displayName,
    setToken,
    setUserInfo,
    login,
    fetchUserInfo,
    refreshToken,
    clearAuth,
    logout
  }
})

export default useUserStore
