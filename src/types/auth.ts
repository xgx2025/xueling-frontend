/**
 * 认证相关的 TypeScript 类型定义
 */

// 登录表单数据
export interface LoginFormData {
  email: string        // 邮箱地址
  password: string     // 密码
}

// 注册表单数据
export interface RegisterFormData {
  email: string              // 邮箱地址
  password: string           // 密码
  confirmPassword: string    // 确认密码
  verificationCode: string   // 验证码
}

// 用户信息
export interface UserInfo {
  id: string           // 用户ID
  email: string        // 邮箱
  nickname?: string    // 昵称（可选）
  avatar?: string      // 头像URL（可选）
}

// API 响应通用格式
export interface ApiResponse<T = any> {
  code: number         // 状态码：0-成功，其他-失败
  msg: string          // 提示信息
  data: T             // 响应数据
}

// 登录 DTO
export interface LoginDTO {
  email: string
  password: string
  ip?: string     // 客户端IP（可选）
}

// 注册 DTO
export interface RegisterDTO {
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}

// 认证响应（登录/注册成功后返回）
export interface AuthResponse {
  code: number
  msg: string
  data: string  // AccessToken
}

// 密码强度等级
export type PasswordStrength = 'weak' | 'medium' | 'strong'

// 密码验证结果
export interface PasswordValidationResult {
  isValid: boolean
  strength: PasswordStrength
  message: string
}
