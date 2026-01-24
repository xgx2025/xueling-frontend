# 退出登录功能实现

## 实现内容

### 1. API 层 (`src/api/auth.ts`)
添加了退出登录 API 接口：

```typescript
/**
 * 用户登出
 * @returns Promise<ApiResponse> 返回登出结果
 */
export const logout = (): Promise<ApiResponse> => {
  return request.post('/auth/logout')
}
```

### 2. Store 层 (`src/stores/user.ts`)
更新了 `logout` 方法，使其调用后端 API：

```typescript
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
```

**关键特性：**
- 异步调用后端登出接口
- 使用 try-catch-finally 确保即使 API 失败也会清除本地数据
- 清除用户信息、用户详情和访问令牌

### 3. 视图层 (`src/view/HomeView.vue`)
更新了首页的退出登录处理函数：

```typescript
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await handleLogout()
  } else if (command === 'profile') {
    ElMessage.info('个人中心开发中...')
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
  }
}
```

## 工作流程

1. 用户点击"退出登录"按钮
2. 调用 `userStore.logout()`
3. Store 调用后端 API `POST /auth/logout`
4. 无论 API 成功与否，都清除本地数据：
   - 用户信息 (userInfo)
   - 用户详情 (user_vo)
   - 访问令牌 (accessToken)
5. 显示成功消息
6. 跳转到登录页面

## 错误处理

- **API 调用失败**：记录错误日志，但仍然清除本地数据
- **整体失败**：显示错误提示，但不影响本地数据清除

## 安全性

- 调用后端 API 确保服务器端 session/token 失效
- 清除所有本地存储的敏感信息
- 即使网络失败，也会清除本地数据，防止信息泄露

## 测试建议

1. 正常退出登录，检查是否跳转到登录页
2. 检查 localStorage 是否已清空
3. 尝试访问受保护页面，应该被重定向到登录页
4. 模拟网络错误，确认本地数据仍然被清除
5. 检查浏览器控制台，确认 API 调用正常
