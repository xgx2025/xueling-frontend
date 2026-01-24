# 个人信息编辑功能对接指南

## 功能概述

已成功对接后端个人信息编辑接口，用户可以在个人资料页面编辑和更新个人信息。

## 后端接口信息

- **路径**: `/users/profile`
- **方法**: `POST`
- **请求体**: `UserDTO` (JSON格式)
- **特点**: 只需填写要修改的字段，其他字段可为空
- **返回**: 
  ```json
  {
    "code": 0,
    "msg": "用户信息更新成功",
    "data": "用户信息更新成功"
  }
  ```

## UserDTO 字段说明

```typescript
interface UserDTO {
  id?: number           // 用户ID（后端从token获取，前端不需要传）
  username?: string     // 用户名
  email?: string        // 邮箱
  phone?: string        // 手机号
  avatarUrl?: string    // 头像URL
  gender?: number       // 性别（0-未知，1-男，2-女）
  birthday?: string     // 生日（格式：YYYY-MM-DD）
  bio?: string          // 个人简介
}
```

## 前端实现

### 1. 类型定义 (`src/types/auth.ts`)

新增 `UserDTO` 接口定义，包含所有可编辑的用户字段。

### 2. API 层 (`src/api/auth.ts`)

新增 `updateProfile` 方法：

```typescript
export const updateProfile = (userDTO: UserDTO): Promise<ApiResponse<string>> => {
  return request.post('/users/profile', userDTO)
}
```

### 3. Store 层 (`src/stores/user.ts`)

新增 `updateProfile` 方法：

```typescript
const updateProfile = async (userDTO: UserDTO): Promise<void> => {
  const response = await updateProfileApi(userDTO)
  
  if (response.code === 0) {
    // 更新成功后重新获取用户信息
    await fetchUserInfo()
  } else {
    throw new Error(response.msg || '用户信息更新失败')
  }
}
```

### 4. UI 层 (`src/view/user/ProfileView.vue`)

完整的个人信息编辑表单，包含：

- **用户名**: 文本输入
- **邮箱**: 只读显示（不可修改）
- **手机号**: 文本输入
- **性别**: 下拉选择（未知/男/女）
- **生日**: 日期选择器
- **个人简介**: 多行文本输入

## 使用流程

1. 用户进入个人资料页面
2. 点击"修改资料"按钮进入编辑模式
3. 修改需要更新的字段
4. 点击"保存修改"提交更新
5. 系统自动刷新用户信息并显示最新数据

## 核心功能特性

### 1. 增量更新

只提交用户实际修改的字段，未修改的字段不会发送到后端：

```typescript
const updateData: any = {}
if (form.username && form.username !== userStore.username) {
  updateData.username = form.username
}
if (form.phone) {
  updateData.phone = form.phone
}
// ... 其他字段
```

### 2. 数据加载

从 `localStorage` 的 `user_vo` 中加载完整的用户信息：

```typescript
const loadUserProfile = () => {
  const storedUserVO = localStorage.getItem('user_vo')
  if (storedUserVO) {
    const userVO = JSON.parse(storedUserVO)
    form.username = userVO.username || ''
    form.phone = userVO.phone || ''
    // ... 其他字段
  }
}
```

### 3. 自动刷新

更新成功后自动调用 `fetchUserInfo()` 重新获取最新的用户信息，确保数据同步。

### 4. 取消编辑

点击"取消"按钮会重新加载原始数据，放弃所有未保存的修改。

## 表单验证

当前实现的验证：

- 检查是否有字段被修改
- 如果没有任何修改，提示用户并不发送请求

可扩展的验证：

- 手机号格式验证
- 用户名长度限制
- 生日合理性检查

## 状态管理

更新流程：

1. 提交 `UserDTO` 到后端
2. 后端更新数据库
3. 前端调用 `fetchUserInfo()` 获取最新数据
4. 更新 Pinia store 中的 `userInfo`
5. 更新 `localStorage` 中的 `user_info` 和 `user_vo`
6. UI 自动响应式更新

## 字段说明

### 性别字段

- `0`: 未知
- `1`: 男
- `2`: 女

### 生日字段

- 格式: `YYYY-MM-DD`
- 使用 Element Plus 的 DatePicker 组件
- 自动格式化为后端需要的格式

## 错误处理

- 网络错误：显示友好的错误提示
- 后端返回错误：显示后端返回的错误信息
- 验证失败：在提交前阻止并提示用户

## 注意事项

1. 邮箱字段不可修改（后端限制）
2. 用户ID由后端从token中获取，前端不需要传递
3. 所有字段都是可选的，只传递需要更新的字段
4. 更新成功后会自动刷新用户信息
5. 取消编辑会恢复到原始数据

## 扩展建议

1. 添加手机号格式验证
2. 添加用户名唯一性检查
3. 添加头像裁剪功能
4. 添加修改历史记录
5. 添加敏感信息修改的二次确认

## 测试建议

1. 测试单个字段更新
2. 测试多个字段同时更新
3. 测试不修改任何字段直接保存
4. 测试取消编辑功能
5. 测试网络错误情况
6. 测试后端返回错误的处理
7. 测试页面刷新后数据是否保持
