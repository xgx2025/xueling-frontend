/**
 * 英语阅读模块 API 服务层
 * 提供英语阅读相关的 API 接口
 */

import request from '@/utils/request'
import type {
  ArticleCategory,
  ArticleListItem,
  GetTestQuestionsRequest,
  RegenerateTestQuestionsRequest,
  AddReadTimeRequest,
  ApiResponse,
} from '@/types/englishRead'

/**
 * 获取阅读文章分类列表
 * @returns 文章分类列表
 */
export const getArticleCategories = (): Promise<ApiResponse<ArticleCategory[]>> => {
  return request.get('/read/categories')
}

/**
 * 根据分类ID获取文章列表
 * @param categoryId 文章分类ID
 * @returns 文章列表
 */
export const getArticlesByCategory = (categoryId: number): Promise<ApiResponse<ArticleListItem[]>> => {
  return request.get('/read/articles', { params: { categoryId } })
}

/**
 * 获取文章翻译
 * @param articleId 文章ID
 * @returns 文章翻译内容
 */
export const getArticleTranslation = (articleId: number): Promise<ApiResponse<string>> => {
  return request.get('/read/article/translation', { params: { articleId } })
}

/**
 * 句子分析
 * @param sentence 需要分析的英文句子
 * @returns 分析结果
 */
export const analyzeSentence = (sentence: string): Promise<ApiResponse<string>> => {
  return request.get('/read/sentence', { params: { sentence } })
}

/**
 * 词汇短语汇总
 * @param articleId 文章ID
 * @returns 汇总结果
 */
export const getVocabularyPhrasesSummary = (articleId: number): Promise<ApiResponse<string>> => {
  return request.get('/read/phrases', { params: { articleId } })
}

/**
 * 获取阅读测试题
 * @param data 测试题请求参数
 * @returns 测试题内容
 */
export const getTestQuestions = (data: GetTestQuestionsRequest): Promise<ApiResponse<string>> => {
  return request.post('/read/test', data)
}

/**
 * 重新生成阅读测试题
 * @param data 测试题请求参数
 * @returns 新的测试题内容
 */
export const regenerateTestQuestions = (data: RegenerateTestQuestionsRequest): Promise<ApiResponse<string>> => {
  return request.post('/read/retest', data)
}

/**
 * 增加文章阅读时间
 * @param data 阅读时间数据
 * @returns 操作结果
 */
export const addReadTime = (data: AddReadTimeRequest): Promise<ApiResponse<string>> => {
  return request.post('/read/readTime', data)
}

/**
 * 更新阅读状态为阅读中
 * @param articleId 文章ID
 * @returns 操作结果
 */
export const updateReadingStatus = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/reading', null, { params: { articleId } })
}

/**
 * 完成文章阅读
 * @param articleId 文章ID
 * @returns 操作结果
 */
export const completeArticleReading = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/complete', null, { params: { articleId } })
}

/**
 * 文章收藏
 * @param articleId 文章ID
 * @returns 操作结果
 */
export const collectArticle = (articleId: number): Promise<ApiResponse<string>> => {
  return request.post('/read/collect', null, { params: { articleId } })
}

/**
 * 取消文章收藏
 * @param articleId 文章ID
 * @returns 操作结果
 */
export const cancelCollectArticle = (articleId: number): Promise<ApiResponse<string>> => {
  return request.delete('/read/cancelCollect', { params: { articleId } })
}
