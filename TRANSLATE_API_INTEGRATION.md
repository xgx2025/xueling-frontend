# 翻译API对接文档

## 后端接口

### 接口地址
```
GET /translate
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| word   | string | 是 | 要翻译的单词 |

### 响应格式
```json
{
  "code": 0,
  "msg": "",
  "data": {
    "id": 1,
    "word": "apple",
    "meaning": "n. 苹果；水果",
    "phonetic": "ˈæpl"
  }
}
```

## 前端实现

### 1. API层 (`src/api/translate.ts`)

已实现 `translateText` 函数，功能包括：
- 调用后端 `/translate` 接口
- 将 `WordDictionary` 转换为 `TranslateResult` 格式
- 智能解析释义中的词性（支持 n. v. adj. 等）
- 错误处理和日志记录

### 2. 类型定义 (`src/types/translate.ts`)

定义了以下类型：
- `TranslateResult`: 翻译结果
- `Translation`: 单个翻译（词性+释义）
- `Example`: 例句
- `TranslateHistory`: 翻译历史记录

### 3. Composable (`src/composables/useTranslate.ts`)

提供翻译功能的状态管理：
- `translate()`: 执行翻译
- `isTranslating`: 翻译状态
- `currentResult`: 当前翻译结果
- `error`: 错误信息
- `recentHistory`: 最近翻译历史
- `clearHistory()`: 清空历史
- `removeFromHistory()`: 删除单条历史

### 4. UI组件 (`src/components/TranslateDrawer.vue`)

翻译抽屉组件，已集成：
- 输入框和翻译按钮
- 翻译结果展示（单词、音标、释义）
- 发音功能
- 复制功能
- 添加到单词本
- 翻译历史记录

## 使用示例

### 在组件中使用

```vue
<script setup lang="ts">
import { useTranslate } from '@/composables/useTranslate'

const {
  isTranslating,
  currentResult,
  error,
  translate
} = useTranslate()

// 翻译单词
const handleTranslate = async () => {
  await translate('apple')
}
</script>

<template>
  <div>
    <button @click="handleTranslate" :disabled="isTranslating">
      翻译
    </button>
    
    <div v-if="error">{{ error }}</div>
    
    <div v-if="currentResult">
      <h2>{{ currentResult.word }}</h2>
      <p>{{ currentResult.phonetic }}</p>
      <div v-for="trans in currentResult.translations" :key="trans.pos">
        <strong>{{ trans.pos }}</strong>
        {{ trans.meanings.join('；') }}
      </div>
    </div>
  </div>
</template>
```

### 直接调用API

```typescript
import { translateText } from '@/api/translate'

const result = await translateText('hello')
if (result.code === 0 && result.data) {
  console.log('翻译结果:', result.data)
}
```

## 释义格式解析

API支持以下释义格式：

1. **带词性**: `"n. 苹果；水果"`
   - 解析为: `{ pos: "n.", meanings: ["苹果", "水果"] }`

2. **多词性**: `"v. 跑步；奔跑"`
   - 解析为: `{ pos: "v.", meanings: ["跑步", "奔跑"] }`

3. **无词性**: `"苹果；水果"`
   - 解析为: `{ pos: "n.", meanings: ["苹果", "水果"] }` (默认为名词)

## 注意事项

1. 后端接口路径为 `/translate`，确保后端已正确配置
2. 响应格式必须符合 `{ code: 0, msg: "", data: WordDictionary }` 结构
3. `WordDictionary` 包含 `id`, `word`, `meaning`, `phonetic` 字段
4. 前端会自动解析 `meaning` 字段中的词性和释义
5. 翻译历史保存在 localStorage 中，最多保存50条

## 测试建议

1. 测试正常翻译：输入 "apple"
2. 测试不存在的单词：输入 "asdfghjkl"
3. 测试网络错误：断网后尝试翻译
4. 测试历史记录：翻译多个单词后查看历史
5. 测试添加到单词本功能
