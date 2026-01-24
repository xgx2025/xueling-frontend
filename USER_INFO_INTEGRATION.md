# 用户信息接口集成说明

## 当前状态

⚠️ **暂时禁用自动获取用户信息功能**

由于后端 `/users/info` 接口返回 403 错误，已在路由守卫中临时注释掉自动获取用户信息的逻辑。

**问题原因**：后端拦截器配置问题，详见 `BACKEND_CHECKLIST.md`

**恢复方法**：等后端修复后，在 `src/router/index.ts` 中取消注释相关代码即可。

---

## 功能概述

已完成用户信息获取接口的集成，登录成功后自动获取用户详细信息并存储到 localStorage。

## 实现内容

### 1. 类型定义 (`src/types/auth.ts`)

新增 `UserVO` 接口，对应后端返回的用户详细信息：

```typescript
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
```

### 2. API 方法 (`src/api/auth.ts`)

新增 `getUserInfo` 方法：

```typescript
export const getUserInfo = (): Promise<ApiResponse<UserVO>>
```

调用后端接口：`GET /users/info`（无需传递用户ID，后端从 token 中获取）

### 3. 用户状态管理 (`src/stores/user.ts`)

新增 `fetchUserInfo` 方法：

```typescript
const fetchUserInfo = async () => {
  // 获取当前登录用户信息并存储到 localStorage
  // 存储位置：
  // - user_info: 简化的用户信息（UserInfo 格式）
  // - user_vo: 完整的用户信息（UserVO 格式）
}
```

### 4. 路由守卫 (`src/router/index.ts`)

- 登录成功后，路由守卫自动调用 `/users/info` 接口
- 后端从 JWT token 中识别当前用户
- 获取用户详细信息并存储到 localStorage
- 页面刷新后自动恢复

## 数据存储

### localStorage 存储项

1. `access_token`: JWT 访问令牌
2. `user_info`: 简化的用户信息（用于快速访问）
3. `user_vo`: 完整的用户详细信息（包含 VIP 等级等）

## 使用方式

### 在组件中访问用户信息

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问用户信息
console.log(userStore.userInfo)

// 检查登录状态
console.log(userStore.isLoggedIn)

// 获取完整用户信息
const userVO = JSON.parse(localStorage.getItem('user_vo') || '{}')
console.log('VIP等级:', userVO.vipLevel)
</script>
```

### 手动刷新用户信息

```typescript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

await userStore.fetchUserInfo()
```

## 工作流程

1. 用户登录成功 → 获取 JWT token → 存储到 localStorage
2. 跳转到首页 → 路由守卫触发
3. 调用 `/users/info` 接口（后端从 token 中识别用户）
4. 获取用户详细信息
5. 存储到 localStorage（user_info 和 user_vo）
6. 页面可以访问用户信息

## 注意事项

- 后端需要从请求头的 Authorization token 中识别当前用户
- 如果获取用户信息失败，不会阻止页面跳转
- 用户登出时会自动清除所有用户信息和 token
