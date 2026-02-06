/**
 * 文章 Store
 * 管理文章相关的全局状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getArticleList,
  getArticleDetail,
  getArticleReadingProgress,
  updateArticleReadingProgress,
  checkArticleFavorite,
  addArticleFavorite,
  removeArticleFavorite,
  getTestQuestions,
} from '@/api/article'
import type {
  ArticleVO,
  ArticleListItem,
  ArticleReadingProgress,
  UpdateArticleProgressDTO,
} from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const articleList = ref<ArticleListItem[]>([])
  const currentArticle = ref<ArticleVO | null>(null)
  const currentArticleProgress = ref<ArticleReadingProgress | null>(null)
  const isFavorited = ref(false)
  const loading = ref(false)
  const error = ref<string>('')

  // 计算属性
  const isArticleReadComplete = computed(() => {
    return currentArticleProgress.value?.progressStatus === 2
  })

  /**
   * 获取文章列表
   */
  const fetchArticleList = async () => {
    try {
      loading.value = true
      error.value = ''
      const response = await getArticleList()
      if (response.code === 0 && response.data) {
        articleList.value = response.data
      } else {
        error.value = response.msg || '获取文章列表失败'
      }
    } catch (err) {
      console.error('获取文章列表失败:', err)
      error.value = '获取文章列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取文章详情
   * @param id 文章ID
   */
  const fetchArticleDetail = async (id: number) => {
    try {
      loading.value = true
      error.value = ''
      const response = await getArticleDetail(id)
      if (response.code === 0 && response.data) {
        currentArticle.value = response.data
      } else {
        error.value = response.msg || '获取文章详情失败'
      }
    } catch (err) {
      console.error('获取文章详情失败:', err)
      error.value = '获取文章详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取阅读进度
   * @param articleId 文章ID
   */
  const fetchArticleProgress = async (articleId: number) => {
    try {
      const response = await getArticleReadingProgress(articleId)
      if (response.code === 0) {
        currentArticleProgress.value = response.data
      }
    } catch (err) {
      console.error('获取阅读进度失败:', err)
    }
  }

  /**
   * 更新阅读进度
   * @param articleId 文章ID
   * @param data 更新数据
   */
  const updateProgress = async (articleId: number, data: UpdateArticleProgressDTO) => {
    try {
      const response = await updateArticleReadingProgress(articleId, data)
      if (response.code === 0 && response.data) {
        currentArticleProgress.value = response.data
      }
    } catch (err) {
      console.error('更新阅读进度失败:', err)
      throw err
    }
  }

  /**
   * 标记为已读完
   * @param articleId 文章ID
   */
  const markAsRead = async (articleId: number) => {
    try {
      const response = await updateArticleReadingProgress(articleId, {
        articleId,
        progressStatus: 2,
      })
      if (response.code === 0 && response.data) {
        currentArticleProgress.value = response.data
      }
    } catch (err) {
      console.error('标记为已读失败:', err)
      throw err
    }
  }

  /**
   * 获取收藏状态
   * @param articleId 文章ID
   */
  const fetchFavoriteStatus = async (articleId: number) => {
    try {
      const response = await checkArticleFavorite(articleId)
      if (response.code === 0) {
        isFavorited.value = response.data ?? false
      }
    } catch (err) {
      console.error('获取收藏状态失败:', err)
    }
  }

  /**
   * 切换收藏状态
   * @param articleId 文章ID
   */
  const toggleFavorite = async (articleId: number) => {
    try {
      if (isFavorited.value) {
        await removeArticleFavorite(articleId)
        isFavorited.value = false
      } else {
        await addArticleFavorite({ articleId })
        isFavorited.value = true
      }
    } catch (err) {
      console.error('切换收藏状态失败:', err)
      throw err
    }
  }

  /**
   * 获取测试题
   * @param articleId 文章ID
   * @param difficulty 难度等级
   */
  const fetchTestQuestions = async (articleId: number, difficulty: 0 | 1 | 2) => {
    try {
      const response = await getTestQuestions({ articleId, difficulty })
      if (response.code === 0 && response.data) {
        return response.data
      }
    } catch (err) {
      console.error('获取测试题失败:', err)
      throw err
    }
  }

  /**
   * 清空当前文章
   */
  const clearCurrentArticle = () => {
    currentArticle.value = null
    currentArticleProgress.value = null
    isFavorited.value = false
  }

  return {
    // 状态
    articleList,
    currentArticle,
    currentArticleProgress,
    isFavorited,
    loading,
    error,

    // 计算属性
    isArticleReadComplete,

    // 方法
    fetchArticleList,
    fetchArticleDetail,
    fetchArticleProgress,
    updateProgress,
    markAsRead,
    fetchFavoriteStatus,
    toggleFavorite,
    fetchTestQuestions,
    clearCurrentArticle,
  }
})
