import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/auth'
import { useTokenStore } from './token'

/**
 * 用户状态管理 Store
 * 管理用户信息和登录状态
 */
export const useUserStore = defineStore(
  'user',
  () => {
    // 从 localStorage 恢复用户信息
    const storedUserInfo = localStorage.getItem('user_info')
    const userInfo = ref<UserInfo | null>(
      storedUserInfo ? JSON.parse(storedUserInfo) : null
    )

    // 计算属性：判断用户是否已登录
    const isLoggedIn = computed(() => userInfo.value !== null)

    /**
     * 设置用户信息
     * @param info 用户信息对象
     */
    const setUserInfo = (info: UserInfo) => {
      userInfo.value = info
      // 持久化到 localStorage
      localStorage.setItem('user_info', JSON.stringify(info))
    }

    /**
     * 清除用户信息
     */
    const clearUserInfo = () => {
      userInfo.value = null
      localStorage.removeItem('user_info')
    }

    /**
     * 用户登出
     * 清除用户信息和令牌
     */
    const logout = () => {
      const tokenStore = useTokenStore()
      
      // 清除用户信息
      clearUserInfo()
      
      // 清除令牌
      tokenStore.removeToken()
    }

    return {
      userInfo,
      isLoggedIn,
      setUserInfo,
      clearUserInfo,
      logout
    }
  }
)
