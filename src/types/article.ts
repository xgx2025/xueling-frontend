/**
 * 文章相关的 TypeScript 类型定义
 */

// 单词高亮类型
export interface HighlightItem {
  text: string                    // 需要标记的单词或短语
  type: 'core_vocabulary' | 'collocation' | 'logical_connector' | 'grammar_focus'  // 高亮类型
  color_code: string             // 颜色代码
  reason: string                 // 标记理由
}

// 文章高亮信息
export interface ArticleHighlights {
  highlights: HighlightItem[]
}

// 文章分类
export interface ArticleCategory {
  id: number
  name: string
}

// 文章详情 VO
export interface ArticleVO {
  id: number                      // 文章ID
  title: string                   // 英文标题
  chineseTitle: string            // 中文标题
  categoryId: number              // 分类ID
  tag?: string                    // 标签
  author: string                  // 作者
  content: string                 // 英文内容（## 标题，\n 段落，& 句子分隔）
  highlights: ArticleHighlights   // 高亮信息
  chineseMeaning: string          // 中文翻译
  vocabularyPhrasesSummary?: string  // 词汇短语总结
  articleInsights?: string        // 文章感悟（金句）
  imageUrl?: string               // 图片URL
  isFree: number                  // 是否免费（0：否，1：是）
  createTime: string
  updateTime: string
}

// 文章列表项（用于列表展示）
export interface ArticleListItem {
  id: number
  title: string
  chineseTitle: string
  author: string
  imageUrl?: string
  tag?: string
  isFree: number
  createTime: string
}

// 阅读进度
export interface ArticleReadingProgress {
  id: number
  userId: number
  articleId: number
  progressStatus: 0 | 1 | 2   // 0：未开始，1：阅读中，2：已读完
  readingDuration: number      // 阅读时长（秒）
  createTime: string
  updateTime: string
}

// 文章收藏
export interface ArticleFavorite {
  id: number
  userId: number
  articleId: number
  createTime: string
}

// 获取阅读进度 DTO
export interface GetArticleProgressDTO {
  articleId: number
}

// 更新阅读进度 DTO
export interface UpdateArticleProgressDTO {
  articleId: number
  progressStatus: 0 | 1 | 2
  readingDuration?: number
}

// 添加收藏 DTO
export interface AddFavoriteDTO {
  articleId: number
}

// 删除收藏 DTO
export interface RemoveFavoriteDTO {
  articleId: number
}

// 获取测试题 DTO
export interface GetTestQuestionsDTO {
  articleId: number
  difficulty: 1 | 2 | 3    // 1：简单，2：中等，3：困难
}

// 文章阅读状态 VO
export interface ArticleReadingStatusVO {
  articleId: number        // 文章 ID
  progressStatus: number   // 文章阅读状态（0：未开始，1：阅读中，2：已读完）
}

// 测试题项
export interface TestQuestion {
  id: number
  userId: number
  articleId: number
  difficulty: 1 | 2 | 3
  content: string
  createTime: string
  updateTime: string
}

// 增加阅读时间 DTO
export interface AddReadTimeDTO {
  /**
   * 文章ID
   */
  articleId: number
  /**
   * 阅读时间（秒）
   */
  readTime: number
}

// API 响应通用格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}