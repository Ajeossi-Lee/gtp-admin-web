import { leeRequest } from '..'
import type { CommonResult, UserInfo } from '@/types/api'

export interface PasswordProps {
  oldpassword: string
  password: string
  repassword: string
}

export interface LoginPayload {
  username: string
  password: string
  code?: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

/**
 * Sign in
 */
export function loginRequest(account: LoginPayload) {
  return leeRequest.post<CommonResult<LoginResult>>({
    url: '/login',
    data: account
  })
}

/**
 * Get current user info
 */
export function getUserInfo() {
  return leeRequest.get<CommonResult<UserInfo>>({
    url: '/login/user-info'
  })
}

/**
 * Refresh token
 */
export function updateTokenRequest() {
  return leeRequest.post<CommonResult<string>>({
    url: '/login/update-token'
  })
}

/**
 * Sign out
 */
export function logoutRequest() {
  return leeRequest.post<CommonResult<void>>({
    url: '/login/logout'
  })
}

export function updatepassword(id: number, passwords: PasswordProps) {
  return leeRequest.post({
    url: `/updatePassword/${id}/`,
    data: {
      new_password: passwords.password,
      confirm_password: passwords.repassword,
      old_password: passwords.oldpassword
    }
  })
}
