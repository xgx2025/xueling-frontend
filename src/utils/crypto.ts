/**
 * 加密工具函数
 * 
 * 注意：前端加密主要用于防止密码在传输过程中被明文拦截
 * 真正的安全加密应该在后端使用 bcrypt 或 argon2 等强加密算法
 */

/**
 * 密码加密函数
 * 使用简单的 Base64 编码作为前端加密（可选功能）
 * 
 * 注意：这不是真正的加密，只是简单的编码
 * 实际项目中可以使用 crypto-js 等库进行更强的加密
 * 或者直接传输明文密码，依赖 HTTPS 保护传输安全
 * 
 * @param password - 原始密码
 * @returns 加密后的密码字符串
 * 
 * 验证需求: Requirements 4.4
 */
export const encryptPassword = (password: string): string => {
  // 如果密码为空，直接返回空字符串
  if (!password) {
    return ''
  }

  try {
    // 使用 Base64 编码
    // 在浏览器环境中使用 btoa 进行 Base64 编码
    return btoa(password)
  } catch (error) {
    // 如果编码失败（例如包含非 Latin1 字符），返回原始密码
    console.error('密码编码失败:', error)
    return password
  }
}

/**
 * 密码解密函数（仅用于测试，实际不应在前端解密）
 * 
 * @param encryptedPassword - 加密后的密码
 * @returns 解密后的密码
 */
export const decryptPassword = (encryptedPassword: string): string => {
  if (!encryptedPassword) {
    return ''
  }

  try {
    return atob(encryptedPassword)
  } catch (error) {
    console.error('密码解码失败:', error)
    return encryptedPassword
  }
}
