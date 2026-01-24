/**
 * 认证 API 服务层
 * 提供登录、注册、验证码发送等认证相关的 API 接口
 */

import request from '@/utils/request'
import type { LoginDTO, RegisterDTO, AuthResponse, ApiResponse, UserVO } from '@/types/auth'

/**
 * 用户登录
 * @param loginData 登录数据（邮箱、密码、IP）
 * @returns Promise<AuthResponse> 返回 AccessToken
 * 
 * 需求: 8.2 - 调用登录 API 发送包含 email、password、ip 的请求
 */
export const login = (loginData: LoginDTO): Promise<AuthResponse> => {
  return request.post('/auth/login', loginData)
}

/**
 * 用户注册
 * @param registerData 注册数据（邮箱、密码、确认密码、验证码）
 * @returns Promise<AuthResponse> 返回注册结果
 * 
 * 需求: 8.1 - 调用注册 API 发送包含 email、password、confirmPassword、verificationCode 的请求
 */
export const register = (registerData: RegisterDTO): Promise<AuthResponse> => {
  return request.post('/auth/register', registerData)
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns Promise<ApiResponse> 返回发送结果
 * 
 * 需求: 2.2 - 向邮箱发送验证码
 */
export const sendVerificationCode = (email: string): Promise<ApiResponse> => {
  return request.get('/auth/sendVerificationCode/email', {
    params: { email }
  })
}

/**
 * 获取当前登录用户信息
 * @returns Promise<ApiResponse<UserVO>> 返回用户详细信息
 */
export const getUserInfo = (): Promise<ApiResponse<UserVO>> => {
  console.log('API: 调用 getUserInfo 接口')
  return request.get('/users/info')
}

/**
 * 用户登出
 * @returns Promise<ApiResponse> 返回登出结果
 */
export const logout = (): Promise<ApiResponse> => {
  return request.post('/auth/logout')
}
