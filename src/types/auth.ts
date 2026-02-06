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
  username?: string    // 昵称（可选）
  avatar?: string      // 头像URL（可选）
  vipLevel?: number    // VIP等级（可选）
}

// 用户详细信息 VO（对应后端 UserVO）
export interface UserVO {
  id: number              // 用户ID
  username: string        // 用户名
  email: string           // 邮箱
  phone?: string          // 手机号
  avatarUrl?: string      // 头像URL
  gender?: number         // 性别
  birthday?: string       // 生日
  bio?: string            // 个人简介
  vipLevel?: number       // VIP等级
  vipStartTime?: string   // VIP开始时间
  vipExpireTime?: string  // VIP到期时间
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

// 用户信息更新 DTO
export interface UserDTO {
  id?: number           // 用户ID（由后端从token获取，前端不需要传）
  username?: string     // 用户名
  email?: string        // 邮箱
  phone?: string        // 手机号
  avatarUrl?: string    // 头像URL
  gender?: number       // 性别（0-未知，1-男，2-女）
  birthday?: string     // 生日
  bio?: string          // 个人简介
}
