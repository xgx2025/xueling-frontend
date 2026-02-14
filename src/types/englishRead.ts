/**
 * 英语阅读模块相关的 TypeScript 类型定义
 */

// 文章分类
export interface ArticleCategory {
  id: number
  name: string
}

// 文章列表项
export interface ArticleListItem {
  id: number
  author: string
  title: string
  chineseTitle: string
  content: string
  articleInsights: string
}

// 阅读测试题请求参数
export interface GetTestQuestionsRequest {
  articleId: number
  difficulty: 1 | 2 | 3  // 1-简单，2-中等，3-困难
}

// 重新生成测试题请求参数
export interface RegenerateTestQuestionsRequest {
  articleId: number
  difficulty: 1 | 2 | 3  // 1-简单，2-中等，3-困难
}

// 增加阅读时间请求参数
export interface AddReadTimeRequest {
  articleId: number
  readTime: number  // 阅读时间（秒），必须≥150秒
}

// API 响应通用格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
