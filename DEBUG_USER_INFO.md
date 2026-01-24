# 用户信息接口调试指南

## 问题：403 Forbidden

403 错误说明后端拒绝了请求，可能的原因：

### 1. 检查 Token 是否存在

打开浏览器控制台（F12），在 Console 中输入：

```javascript
localStorage.getItem('access_token')
```

- 如果返回 `null`，说明没有 token，需要重新登录
- 如果有值，复制这个 token 继续下一步

### 2. 检查 Token 格式

JWT token 应该是三段式，用 `.` 分隔，例如：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 3. 解析 Token 查看内容

在控制台输入：

```javascript
const token = localStorage.getItem('access_token')
if (token) {
  const parts = token.split('.')
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]))
    console.log('Token payload:', payload)
  }
}
```

**检查 payload 中是否包含 `userId` 字段**，因为后端需要从 token 中获取 `userId`。

### 4. 手动测试接口

在控制台输入：

```javascript
const token = localStorage.getItem('access_token')
fetch('/api/users/info', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.json())
.then(data => console.log('响应:', data))
.catch(err => console.error('错误:', err))
```

查看响应内容，可能会有更详细的错误信息。

### 5. 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network（网络）标签
3. 刷新页面
4. 找到 `/users/info` 请求
5. 查看：
   - Request Headers 中是否有 `Authorization: Bearer xxx`
   - Response 中的错误信息

### 6. 常见问题

#### 问题 A：后端拦截器配置问题

后端可能没有正确配置拦截器来处理 `/users/info` 路径。

**解决方案**：检查后端拦截器配置，确保 `/users/**` 路径需要认证。

#### 问题 B：Token 中没有 userId

后端从 `ThreadLocalUtils.get()` 获取 `userId`，这需要后端拦截器先解析 token 并存入 ThreadLocal。

**解决方案**：
1. 检查登录接口返回的 token 是否包含 `userId`
2. 检查后端拦截器是否正确解析了 token

#### 问题 C：Token 已过期

**解决方案**：重新登录获取新 token

#### 问题 D：跨域或 Cookie 问题

**解决方案**：检查后端 CORS 配置

### 7. 临时解决方案

如果问题出在后端，可以先注释掉自动获取用户信息的逻辑：

在 `src/router/index.ts` 中，临时注释掉：

```typescript
// 如果已登录但没有用户信息，尝试获取
// if (hasToken && !userStore.userInfo && to.meta.requiresAuth) {
//   try {
//     console.log('正在获取用户信息...')
//     await userStore.fetchUserInfo()
//     console.log('用户信息获取成功')
//   } catch (error: any) {
//     console.error('获取用户信息失败:', error)
//     if (error?.response?.status === 401 || error?.response?.status === 403) {
//       tokenStore.removeToken()
//       userStore.clearUserInfo()
//       next({ name: 'login' })
//       return
//     }
//   }
// }
```

等后端问题解决后再恢复。

### 8. 查看详细日志

现在代码中已经添加了详细的日志，刷新页面后在控制台查看：

- `正在获取用户信息...`
- `API: 调用 getUserInfo 接口`
- `请求拦截器：已添加 Authorization 头 /users/info`
- `fetchUserInfo: 开始获取用户信息`
- `fetchUserInfo: 收到响应`

根据日志输出可以判断问题出在哪一步。
