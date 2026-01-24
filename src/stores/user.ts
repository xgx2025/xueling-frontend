import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, UserVO } from '@/types/auth'
import { useTokenStore } from './token'
import { getUserInfo, logout as logoutApi } from '@/api/auth'

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

    // 计算属性：获取用户名
    const username = computed(() => userInfo.value?.username || '')

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
     * 获取并存储当前登录用户信息
     */
    const fetchUserInfo = async () => {
      try {
        console.log('fetchUserInfo: 开始获取用户信息')
        const response = await getUserInfo()
        console.log('fetchUserInfo: 收到响应', response)
        if (response.code === 0 && response.data) {
          const userVO: UserVO = response.data
          // 转换为 UserInfo 格式并存储
          const info: UserInfo = {
            id: userVO.id.toString(),
            email: userVO.email,
            username: userVO.username,
            avatar: userVO.avatarUrl
          }
          setUserInfo(info)
          // 同时存储完整的用户信息
          localStorage.setItem('user_vo', JSON.stringify(userVO))
          console.log('fetchUserInfo: 用户信息已存储', userVO)
          return userVO
        }
        throw new Error(response.msg || '获取用户信息失败')
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    }

    /**
     * 用户登出
     * 调用登出 API 并清除本地数据
     */
    const logout = async () => {
      const tokenStore = useTokenStore()
      
      try {
        // 调用登出 API
        await logoutApi()
        console.log('登出 API 调用成功')
      } catch (error) {
        console.error('登出 API 调用失败:', error)
        // 即使 API 调用失败，也继续清除本地数据
      } finally {
        // 清除用户信息
        clearUserInfo()
        localStorage.removeItem('user_vo')
        
        // 清除令牌
        tokenStore.removeToken()
      }
    }

    return {
      userInfo,
      isLoggedIn,
      username,
      setUserInfo,
      clearUserInfo,
      fetchUserInfo,
      logout
    }
  }
)
