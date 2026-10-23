/**
 * 文章 API 服务层
 * 提供文章相关的 API 接口
 */

import request from '@/utils/request'
import type {
  ArticleVO,
  ArticleListItem,
  ApiResponse,
  ArticleCategory,
  ArticleReadingStatusVO,
} from '@/types/article'

/**
 * 获取阅读文章分类列表
 */
export const getArticleCategories = (): Promise<ApiResponse<ArticleCategory[]>> => {
  return request.get('/read/categories')
}

/**
 * 根据分类ID获取文章列表
 * @param categoryId 文章分类ID
 */
export const getArticlesByCategory = (categoryId: number): Promise<ApiResponse<ArticleListItem[]>> => {
  return request.get('/read/article-summaries', { params: { categoryId } })
}

export const getArticleById = (articleId: number): Promise<ApiResponse<ArticleVO>> => {
  return request.get(`/read/articles/${articleId}`)
}

/**
 * 获取文章翻译
 * @param articleId 文章ID
 */
export const getArticleTranslation = (articleId: number): Promise<ApiResponse<string>> => {
  return request.get('/read/article/translation', { params: { articleId } })
}

/**
 * 句子分析
 * @param sentence 需要分析的英文句子
 */
export const analyzeSentence = (sentence: string): Promise<ApiResponse<string>> => {
  return request.get('/read/sentence', { params: { sentence } })
}

/**
 * 词汇短语汇总
 * @param articleId 文章ID
 */
export const getVocabularyPhrases = (articleId: number): Promise<ApiResponse<string>> => {
  return request.get('/read/phrases', { params: { articleId } })
}

/**
 * 获取阅读测试题
 * @param articleId 文章ID
 * @param difficulty 难度级别（1-简单，2-中等，3-困难）
 */
export const getTestQuestions = (
  articleId: number,
  difficulty: number,
): Promise<ApiResponse<string>> => {
  return request.post('/read/test', { articleId, difficulty })
}

/**
 * 重新生成阅读测试题
 * @param articleId 文章ID
 * @param difficulty 难度级别（1-简单，2-中等，3-困难）
 */
export const regenerateTestQuestions = (
  articleId: number,
  difficulty: number,
): Promise<ApiResponse<string>> => {
  return request.post('/read/retest', { articleId, difficulty })
}

/**
 * 增加文章阅读时间
 * @param articleId 文章ID
 * @param readTime 阅读时间（秒）
 */
export const addReadTime = (
  articleId: number,
  readTime: number,
): Promise<ApiResponse<string>> => {
  return request.post('/read/readTime', { articleId, readTime })
}

/**
 * 更新阅读状态为阅读中
 * @param articleId 文章ID
 */
export const updateReadingStatus = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/reading', null, { params: { articleId } })
}

/**
 * 获取文章阅读状态
 * @param articleId 文章ID
 * @returns 文章阅读状态
 */
export const getArticleReadingStatus = (articleId: number): Promise<ApiResponse<ArticleReadingStatusVO>> => {
  return request.get(`/read/status/${articleId}`)
}

/**
 * 完成文章阅读
 * @param articleId 文章ID
 */
export const completeArticleReading = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/complete', null, { params: { articleId } })
}

/**
 * 文章收藏
 * @param articleId 文章ID
 */
export const collectArticle = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/collect', null, { params: { articleId } })
}

/**
 * 取消文章收藏
 * @param articleId 文章ID
 */
export const cancelCollectArticle = (articleId: number): Promise<ApiResponse<string>> => {
  return request.delete('/read/cancelCollect', { params: { articleId } })
}
