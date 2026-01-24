# 首页用户名显示修复

## 问题描述
首页无法正确显示用户名，显示为默认的"学员"或"同学"。

## 修复内容

### 1. 用户 Store 修改 (`src/stores/user.ts`)
- 添加了 `username` 计算属性，用于直接获取用户名
- 该属性从 `userInfo.value?.username` 获取值，如果不存在则返回空字符串

```typescript
// 计算属性：获取用户名
const username = computed(() => userInfo.value?.username || '')
```

- 在 store 的返回值中导出 `username` 属性

### 2. 登录流程修改 (`src/view/auth/LoginView.vue`)
- 在登录成功后，立即调用 `userStore.fetchUserInfo()` 获取用户信息
- 这确保了用户信息在跳转到首页前已经加载完成

```typescript
if (response.code === 0) {
  // 存储 token
  tokenStore.setToken(response.data)

  // 获取用户信息
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }

  // 显示成功消息并跳转
  ElMessage.success(response.msg || '登录成功！')
  await router.push('/')
}
```

### 3. 路由守卫保护 (`src/router/index.ts`)
- 已有的路由守卫会在用户访问需要认证的页面时自动获取用户信息
- 如果 token 有效但用户信息不存在，会自动调用 `fetchUserInfo()`
- 这提供了双重保障，确保用户信息始终可用

## 工作流程

1. **用户登录** → 调用登录 API → 存储 token → 获取用户信息 → 跳转首页
2. **刷新页面** → 路由守卫检查 → 如果有 token 但无用户信息 → 自动获取用户信息
3. **首页显示** → 使用 `userStore.username` 显示用户名

## 使用方式

在任何 Vue 组件中，可以直接使用：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div>欢迎，{{ userStore.username || '访客' }}</div>
</template>
```

## 测试建议

1. 清除浏览器缓存和 localStorage
2. 重新登录
3. 检查首页是否正确显示用户名
4. 刷新页面，确认用户名仍然显示
5. 检查浏览器控制台，确认没有错误信息
