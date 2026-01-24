# 用户头像上传功能对接指南

## 功能概述

已成功对接后端头像上传接口，用户可以在个人资料页面上传和更新头像。

## 后端接口信息

- **路径**: `/users/avatar`
- **方法**: `PUT`
- **参数**: `file` (MultipartFile)
- **返回**: 
  ```json
  {
    "code": 0,
    "msg": "用户头像更新成功",
    "data": "https://example.com/avatar/xxx.jpg"
  }
  ```

## 前端实现

### 1. API 层 (`src/api/auth.ts`)

新增 `updateAvatar` 方法：

```typescript
export const updateAvatar = (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.put('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
```

### 2. Store 层 (`src/stores/user.ts`)

新增 `updateAvatar` 方法，处理头像上传并更新本地状态：

```typescript
const updateAvatar = async (file: File): Promise<string> => {
  const response = await updateAvatarApi(file)
  
  if (response.code === 0 && response.data) {
    const newAvatarUrl = response.data
    
    // 更新本地用户信息
    if (userInfo.value) {
      userInfo.value.avatar = newAvatarUrl
      localStorage.setItem('user_info', JSON.stringify(userInfo.value))
    }
    
    return newAvatarUrl
  }
  throw new Error(response.msg || '头像上传失败')
}
```

### 3. UI 层 (`src/view/user/ProfileView.vue`)

在个人资料页面添加头像上传功能：

- 点击头像上的相机图标触发文件选择
- 支持的文件类型：所有图片格式
- 文件大小限制：5MB
- 上传时显示加载动画
- 上传成功后自动更新头像显示

## 使用方式

1. 用户登录后进入个人资料页面
2. 点击头像右下角的相机图标
3. 选择本地图片文件（支持 jpg, png, gif 等）
4. 系统自动上传并更新头像
5. 上传成功后显示新头像

## 文件验证

- **类型验证**: 只允许上传图片文件
- **大小验证**: 文件大小不超过 5MB
- **错误提示**: 验证失败时显示友好的错误信息

## 状态管理

头像更新后会同步更新以下位置：
- Pinia store 中的 `userInfo.avatar`
- localStorage 中的 `user_info`
- localStorage 中的 `user_vo`

这确保了页面刷新后头像仍然保持最新状态。

## 注意事项

1. 需要用户已登录（携带有效的 token）
2. 后端接口路径为 `/users/avatar`（注意不是 `/users/avtar`）
3. 上传使用 `multipart/form-data` 格式
4. 参数名为 `file`（与后端 `@RequestParam("file")` 对应）
5. 返回的 URL 会自动保存到用户信息中

## 测试建议

1. 测试正常图片上传
2. 测试超大文件（>5MB）的拒绝
3. 测试非图片文件的拒绝
4. 测试网络错误的处理
5. 测试上传后页面刷新头像是否保持
