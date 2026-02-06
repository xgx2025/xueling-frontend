/**
 * 文章 API 服务层
 * 提供文章相关的 API 接口
 */

import request from '@/utils/request'
import type {
  ArticleVO,
  ArticleListItem,
  ArticleReadingProgress,
  ArticleFavorite,
  TestQuestion,
  UpdateArticleProgressDTO,
  AddFavoriteDTO,
  RemoveFavoriteDTO,
  GetTestQuestionsDTO,
  ApiResponse,
} from '@/types/article'

/**
 * 获取文章列表
 */
export const getArticleList = (): Promise<ApiResponse<ArticleListItem[]>> => {
  return request.get('/api/articles')
}

/**
 * 获取文章详情
 * @param id 文章ID
 */
export const getArticleDetail = (id: number): Promise<ApiResponse<ArticleVO>> => {
  return request.get(`/api/articles/${id}`)
}

/**
 * 获取用户的阅读进度
 * @param articleId 文章ID
 */
export const getArticleReadingProgress = (
  articleId: number,
): Promise<ApiResponse<ArticleReadingProgress | null>> => {
  return request.get(`/api/articles/${articleId}/progress`)
}

/**
 * 更新阅读进度
 * @param articleId 文章ID
 * @param data 更新数据
 */
export const updateArticleReadingProgress = (
  articleId: number,
  data: UpdateArticleProgressDTO,
): Promise<ApiResponse<ArticleReadingProgress>> => {
  return request.put(`/api/articles/${articleId}/progress`, data)
}

/**
 * 检查是否已收藏
 * @param articleId 文章ID
 */
export const checkArticleFavorite = (articleId: number): Promise<ApiResponse<boolean>> => {
  return request.get(`/api/articles/${articleId}/favorite`)
}

/**
 * 添加收藏
 * @param data 收藏数据
 */
export const addArticleFavorite = (data: AddFavoriteDTO): Promise<ApiResponse<ArticleFavorite>> => {
  return request.post('/api/articles/favorite', data)
}

/**
 * 移除收藏
 * @param articleId 文章ID
 */
export const removeArticleFavorite = (articleId: number): Promise<ApiResponse<void>> => {
  return request.delete(`/api/articles/${articleId}/favorite`)
}

/**
 * 获取测试题
 * @param data 测试题请求数据
 */
export const getTestQuestions = (
  data: GetTestQuestionsDTO,
): Promise<ApiResponse<TestQuestion>> => {
  return request.post('/api/articles/test-questions', data)
}
