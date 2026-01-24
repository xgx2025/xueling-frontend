# 用户头像显示修复

## 问题描述
首页的用户头像没有正确展示，只显示了固定的文本 "User"，而不是用户的实际头像或用户名首字母。

## 根本原因
1. `el-avatar` 组件没有绑定 `src` 属性到用户头像 URL
2. 用户 Store 没有暴露 `avatar` 计算属性
3. 头像内容是硬编码的文本 "User"

## 修复内容

### 1. 用户 Store 修改 (`src/stores/user.ts`)
添加了 `avatar` 计算属性：

```typescript
// 计算属性：获取头像URL
const avatar = computed(() => userInfo.value?.avatar || '')
```

并在返回值中导出：

```typescript
return {
  userInfo,
  isLoggedIn,
  username,
  avatar,  // 新增
  setUserInfo,
  clearUserInfo,
  fetchUserInfo,
  logout
}
```

### 2. 首页视图修改 (`src/view/HomeView.vue`)
更新了头像组件的绑定：

```vue
<el-avatar 
  :size="40" 
  :src="userStore.avatar" 
  class="user-avatar"
>
  {{ userStore.username?.charAt(0)?.toUpperCase() || 'U' }}
</el-avatar>
```

**关键改进：**
- `:src="userStore.avatar"` - 绑定用户头像 URL
- 插槽内容改为用户名首字母大写 - 当头像 URL 不存在或加载失败时显示
- 如果用户名也不存在，显示默认字母 'U'

## 工作逻辑

1. **有头像 URL**：显示用户上传的头像图片
2. **无头像 URL**：显示用户名的首字母（大写）
3. **无用户名**：显示默认字母 'U'

## Element Plus Avatar 组件说明

`el-avatar` 组件的工作方式：
- `src` 属性：头像图片的 URL
- 插槽内容：当图片不存在或加载失败时显示的后备内容
- 自动处理图片加载失败的情况

## 示例效果

```
用户有头像：显示头像图片
用户名为 "张三"，无头像：显示 "张"
用户名为 "John"，无头像：显示 "J"
无用户名，无头像：显示 "U"
```

## 测试建议

1. 登录后检查首页头像是否正确显示
2. 如果后端返回了头像 URL，应该显示头像图片
3. 如果没有头像 URL，应该显示用户名首字母
4. 检查浏览器控制台，确认 `userStore.avatar` 的值
5. 可以在开发者工具中修改 localStorage 中的 `user_info`，测试不同情况
