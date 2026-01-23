/**
 * 表单验证工具函数
 */

import type { PasswordValidationResult } from '@/types/auth'

/**
 * 邮箱格式验证
 * 验证邮箱是否符合标准格式（包含 @ 符号，有域名部分）
 * 
 * @param email - 待验证的邮箱字符串
 * @returns 是否为有效邮箱格式
 * 
 * 验证需求: Requirements 1.1, 2.1, 3.1
 */
export const validateEmail = (email: string): boolean => {
  // 拒绝空字符串和纯空格
  if (!email || email.trim().length === 0) {
    return false
  }

  // 标准邮箱正则表达式
  // 格式: 用户名@域名.顶级域名
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * 密码强度验证
 * 验证密码是否符合安全要求，并评估密码强度
 * 要求：至少8位，必须包含数字、小写字母和大写字母
 * 
 * @param password - 待验证的密码字符串
 * @returns 密码验证结果，包含是否有效、强度等级和提示信息
 * 
 * 验证需求: Requirements 3.2, 4.1, 4.2
 */
export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  // 拒绝空字符串和纯空格
  if (!password || password.trim().length === 0) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码不能为空'
    }
  }

  const trimmedPassword = password.trim()

  // 最小长度验证（至少 8 个字符）
  if (trimmedPassword.length < 8) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码长度至少为 8 个字符'
    }
  }

  // 必须包含小写字母
  if (!/[a-z]/.test(trimmedPassword)) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码必须包含小写字母'
    }
  }

  // 必须包含大写字母
  if (!/[A-Z]/.test(trimmedPassword)) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码必须包含大写字母'
    }
  }

  // 必须包含数字
  if (!/[0-9]/.test(trimmedPassword)) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码必须包含数字'
    }
  }

  // 密码强度评估（满足基本要求后）
  let strength: 'weak' | 'medium' | 'strong' = 'medium'
  let score = 3 // 基础分（已满足数字、大小写字母）

  // 长度评分
  if (trimmedPassword.length >= 12) score++
  if (trimmedPassword.length >= 16) score++

  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(trimmedPassword)) score++

  // 根据评分确定强度
  if (score <= 3) {
    strength = 'medium'
  } else if (score <= 4) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  const messages = {
    weak: '密码强度较弱',
    medium: '密码强度中等',
    strong: '密码强度良好'
  }

  return {
    isValid: true,
    strength,
    message: messages[strength]
  }
}

/**
 * 验证码格式验证
 * 验证验证码是否符合格式要求（非空、符合长度要求）
 * 
 * @param code - 待验证的验证码字符串
 * @returns 是否为有效验证码格式
 * 
 * 验证需求: Requirements 1.3
 */
export const validateVerificationCode = (code: string): boolean => {
  // 拒绝空字符串和纯空格
  if (!code || code.trim().length === 0) {
    return false
  }

  const trimmedCode = code.trim()

  // 验证码应为 6 位数字
  const codeRegex = /^\d{6}$/
  return codeRegex.test(trimmedCode)
}

/**
 * 密码确认验证
 * 验证密码和确认密码是否完全一致
 * 
 * @param password - 原始密码
 * @param confirmPassword - 确认密码
 * @returns 是否一致
 * 
 * 验证需求: Requirements 1.2
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}
