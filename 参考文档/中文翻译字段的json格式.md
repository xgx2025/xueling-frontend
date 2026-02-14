## JSON 格式示例
### 示例 1：简单文章结构
```json
{
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "人工智能的未来"
    },
    {
      "type": "paragraph",
      "sentences": [
        "人工智能正在改变我们的生活方式。",
        "从自动驾驶到智能家居，AI技术的应用越来越广泛。"
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "机器学习的突破"
    },
    {
      "type": "paragraph",
      "sentences": [
        "机器学习是人工智能的核心技术之一。",
        "它使计算机能够从数据中自动学习和改进。"
      ]
    }
  ]
}
```
---
### 示例 2：复杂文章结构（多层级）
```json
{
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "深度学习技术概述"
    },
    {
      "type": "paragraph",
      "sentences": [
        "深度学习是机器学习的一个重要分支。",
        "它通过多层神经网络模拟人脑的学习过程。",
        "近年来，深度学习在图像识别、自然语言处理等领域取得了显著成果。"
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "text": "神经网络基础"
    },
    {
      "type": "paragraph",
      "sentences": [
        "神经网络由输入层、隐藏层和输出层组成。"
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "卷积神经网络"
    },
    {
      "type": "paragraph",
      "sentences": [
        "卷积神经网络特别适合处理图像数据。",
        "它通过卷积操作提取图像的局部特征。"
      ]
    },
    {
      "type": "heading",
      "level": 3,
      "text": "循环神经网络"
    },
    {
      "type": "paragraph",
      "sentences": [
        "循环神经网络擅长处理序列数据。",
        "它在自然语言处理和语音识别中表现出色。"
      ]
    }
  ]
}
```
---
## TypeScript 类型定义
```typescript
// 内容块联合类型
type ContentBlock = HeadingBlock | ParagraphBlock;
// 标题块
interface HeadingBlock {
  type: "heading";
  level: number;  // 1, 2, 3... 表示标题层级
  text: string;   // 翻译后的标题文本
}
// 段落块
interface ParagraphBlock {
  type: "paragraph";
  sentences: string[];  // 翻译后的句子数组
}
// 根对象
interface ArticleTranslation {
  blocks: ContentBlock[];
}
```
---
## 数据结构说明
| 字段        | 类型       | 说明                                               |
| ----------- | ---------- | -------------------------------------------------- |
| `blocks`    | `Array`    | 内容块数组，按阅读顺序排列                         |
| `type`      | `string`   | 块类型，枚举值：`"heading"` 或 `"paragraph"`       |
| `level`     | `number`   | 仅标题块，表示层级（1=主标题，2=副标题，以此类推） |
| `text`      | `string`   | 仅标题块，翻译后的标题文本                         |
| `sentences` | `string[]` | 仅段落块，翻译后的句子数组                         |
---
## 前端渲染建议
```javascript
function renderArticle(articleData) {
  return articleData.blocks.map(block => {
    if (block.type === "heading") {
      // 根据 level 渲染不同级别的 h 标签
      const HeadingTag = `h${block.level}`;
      return `<${HeadingTag}>${block.text}</${HeadingTag}>`;
    } else if (block.type === "paragraph") {
      // 将句子数组拼接为段落
      return `<p>${block.sentences.join("")}</p>`;
    }
  }).join("");
}
```