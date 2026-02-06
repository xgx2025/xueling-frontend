import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, UserVO } from '@/types/auth'
import { useTokenStore } from './token'
import { getUserInfo, logout as logoutApi, updateAvatar as updateAvatarApi, updateProfile as updateProfileApi } from '@/api/auth'
import type { UserDTO } from '@/types/auth'

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

    // 计算属性：获取头像URL
    const avatar = computed(() => userInfo.value?.avatar || '')

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
            avatar: userVO.avatarUrl,
            vipLevel: userVO.vipLevel,
          }
          setUserInfo(info)
          // 同时存储完整的用户信息
          localStorage.setItem('user_vo', JSON.stringify(userVO))
          console.log('fetchUserInfo: 用户信息已存储', userVO)
          return userVO
        }
        throw new Error(response.msg || '获取用户信息失败')
      } catch (error: any) {
        console.error('获取用户信息失败:', error)
        // 如果 error 是后端返回的响应对象（包含 msg 字段）
        if (error.msg) {
          throw new Error(error.msg)
        }
        // 如果是其他类型的错误
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

    /**
     * 更新用户头像
     * @param file 头像文件
     * @returns Promise<string> 返回新的头像URL
     */
    const updateAvatar = async (file: File): Promise<string> => {
      try {
        console.log('updateAvatar: 开始上传头像')
        const response = await updateAvatarApi(file)
        console.log('updateAvatar: 收到响应', response)
        
        if (response.code === 0 && response.data) {
          const newAvatarUrl = response.data
          
          // 更新本地用户信息中的头像
          if (userInfo.value) {
            userInfo.value.avatar = newAvatarUrl
            localStorage.setItem('user_info', JSON.stringify(userInfo.value))
          }
          
          // 更新 user_vo 中的头像
          const storedUserVO = localStorage.getItem('user_vo')
          if (storedUserVO) {
            const userVO = JSON.parse(storedUserVO)
            userVO.avatarUrl = newAvatarUrl
            localStorage.setItem('user_vo', JSON.stringify(userVO))
          }
          
          console.log('updateAvatar: 头像更新成功', newAvatarUrl)
          return newAvatarUrl
        }
        throw new Error(response.msg || '头像上传失败')
      } catch (error: any) {
        console.error('头像上传失败:', error)
        // 如果 error 是后端返回的响应对象（包含 msg 字段）
        if (error.msg) {
          throw new Error(error.msg)
        }
        // 如果是其他类型的错误
        throw error
      }
    }

    /**
     * 更新用户个人信息
     * @param userDTO 用户信息（只需填写要修改的字段）
     * @returns Promise<void>
     */
    const updateProfile = async (userDTO: UserDTO): Promise<void> => {
      try {
        console.log('updateProfile: 开始更新用户信息', userDTO)
        const response = await updateProfileApi(userDTO)
        console.log('updateProfile: 收到响应', response)
        
        if (response.code === 0) {
          // 更新成功后重新获取用户信息
          await fetchUserInfo()
          console.log('updateProfile: 用户信息更新成功')
        } else {
          throw new Error(response.msg || '用户信息更新失败')
        }
      } catch (error: any) {
        console.error('用户信息更新失败:', error)
        // 如果 error 是后端返回的响应对象（包含 msg 字段）
        if (error.msg) {
          throw new Error(error.msg)
        }
        // 如果是其他类型的错误
        throw error
      }
    }

    return {
      userInfo,
      isLoggedIn,
      username,
      avatar,
      setUserInfo,
      clearUserInfo,
      fetchUserInfo,
      logout,
      updateAvatar,
      updateProfile
    }
  }
)
