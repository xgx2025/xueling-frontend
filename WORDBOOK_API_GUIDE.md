# 单词本 API 对接指南

## 概述

本文档说明如何使用单词本相关的 API 接口。

## 接口文件

- **API 文件**: `src/api/wordbook.ts`
- **类型定义**: `src/types/wordbook.ts`
- **使用示例**: `src/examples/CreateWordBookExample.vue`

## 创建单词本接口

### 后端接口

```java
/**
 * Controller 路径: @RequestMapping("/wordbooks")
 * 创建一个单词本
 * @param name 单词本名称
 */
@PostMapping
public Result<String> createWordBook(@RequestParam("name") String name) {
    Claims claims = ThreadLocalUtils.get();
    Long userId = claims.get("userId", Long.class);
    wordBookService.createWordBook(name, userId);
    return Result.success("单词本创建成功");
}
```

**完整路径**: `POST /wordbooks?name=单词本名称`

### 前端调用

#### 1. 导入 API 函数

```typescript
import { createWordBook } from '@/api/wordbook'
```

#### 2. 调用接口

```typescript
// 方式一：直接传入名称
const response = await createWordBook('我的单词本')

// 方式二：使用 DTO（推荐）
import { createWordBookWithDTO } from '@/api/wordbook'
const response = await createWordBookWithDTO({ name: '我的单词本' })
```

#### 3. 处理响应

```typescript
if (response.code === 0) {
  ElMessage.success(response.msg || '单词本创建成功')
  // 执行后续操作
} else {
  ElMessage.error(response.msg || '创建失败')
}
```

## 完整示例

### 在 Vue 组件中使用

```vue
<template>
  <div>
    <el-input v-model="bookName" placeholder="请输入单词本名称" />
    <el-button @click="handleCreate" :loading="loading">创建</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createWordBook } from '@/api/wordbook'

const bookName = ref('')
const loading = ref(false)

const handleCreate = async () => {
  if (!bookName.value.trim()) {
    ElMessage.warning('请输入单词本名称')
    return
  }
  
  try {
    loading.value = true
    const response = await createWordBook(bookName.value)
    
    if (response.code === 0) {
      ElMessage.success('创建成功')
      bookName.value = ''
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>
```

## 类型定义

### WordBook 类型

```typescript
export interface WordBook {
  id: number           // 单词本ID
  name: string         // 单词本名称
  wordCount?: number   // 单词数量
  createTime?: string  // 创建时间
  updateTime?: string  // 更新时间
}
```

### CreateWordBookDTO 类型

```typescript
export interface CreateWordBookDTO {
  name: string         // 单词本名称
}
```

## 注意事项

1. **请求方式**: POST
2. **请求路径**: `/wordbooks`（注意：Controller 上有 `@RequestMapping("/wordbooks")`）
3. **参数格式**: Query 参数 `?name=单词本名称`
4. **认证要求**: 需要在请求头中携带 `Authorization: Bearer <token>`，后端会从 ThreadLocal 中获取 userId
5. **响应格式**: 
   ```typescript
   {
     code: 0,           // 0 表示成功
     msg: "单词本创建成功",
     data: "单词本创建成功"
   }
   ```

## 错误处理

建议使用 try-catch 包裹 API 调用，并提供友好的错误提示：

```typescript
try {
  const response = await createWordBook(name)
  // 处理成功响应
} catch (error: any) {
  console.error('创建单词本失败:', error)
  ElMessage.error(error.message || '创建失败，请稍后重试')
}
```

## 后续扩展

可以在 `src/api/wordbook.ts` 中继续添加其他单词本相关接口，例如：

- 获取单词本列表
- 删除单词本
- 更新单词本
- 获取单词本详情
- 添加单词到单词本
- 从单词本删除单词

示例：

```typescript
// 获取单词本列表
export const getWordBookList = (): Promise<ApiResponse<WordBook[]>> => {
  return request.get('/wordbooks')
}

// 删除单词本
export const deleteWordBook = (id: number): Promise<ApiResponse<string>> => {
  return request.delete(`/wordbooks/${id}`)
}
```
