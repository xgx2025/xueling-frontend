/**
 * 文章 Store
 * 管理文章相关的全局状态
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getArticleCategories,
  getArticlesByCategory,
  getArticleTranslation,
  analyzeSentence,
  getVocabularyPhrases,
  getTestQuestions,
  regenerateTestQuestions,
  addReadTime,
  updateReadingStatus,
  completeArticleReading,
  collectArticle,
  cancelCollectArticle,
} from '@/api/article'
import type {
  ArticleVO,
} from '@/types/article'

export const useArticleStore = defineStore('article', () => {
  // 状态
  const currentArticle = ref<ArticleVO | null>(null)
  const isFavorited = ref(false)
  const loading = ref(false)
  const error = ref<string>('')

  /**
   * 获取收藏状态
   * @param articleId 文章ID
   */
  const fetchFavoriteStatus = async (articleId: number) => {
    try {
      // 后端没有提供检查收藏状态的接口，暂时返回false
      isFavorited.value = false
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
        await cancelCollect(articleId)
      } else {
        await collect(articleId)
      }
    } catch (err) {
      console.error('切换收藏状态失败:', err)
      throw err
    }
  }

  /**
   * 获取测试题
   * @param articleId 文章ID
   * @param difficulty 难度等级（1-简单，2-中等，3-困难）
   */
  const fetchTestQuestions = async (articleId: number, difficulty: number) => {
    try {
      const response = await getTestQuestions(articleId, difficulty)
      if (response.code === 0 && response.data) {
        return response.data
      }
    } catch (err) {
      console.error('获取测试题失败:', err)
      throw err
    }
  }

  /**
   * 重新生成测试题
   * @param articleId 文章ID
   * @param difficulty 难度等级（1-简单，2-中等，3-困难）
   */
  const regenerateQuiz = async (articleId: number, difficulty: number) => {
    try {
      const response = await regenerateTestQuestions(articleId, difficulty)
      if (response.code === 0 && response.data) {
        return response.data
      }
    } catch (err) {
      console.error('重新生成测试题失败:', err)
      throw err
    }
  }

  /**
   * 增加阅读时间
   * @param articleId 文章ID
   * @param readTime 阅读时间（秒）
   */
  const addReadingTime = async (articleId: number, readTime: number) => {
    try {
      const response = await addReadTime(articleId, readTime)
      if (response.code === 0) {
        return response.data
      }
    } catch (err) {
      console.error('增加阅读时间失败:', err)
      throw err
    }
  }

  /**
   * 更新阅读状态为阅读中
   * @param articleId 文章ID
   */
  const updateReadingInProgress = async (articleId: number) => {
    try {
      const response = await updateReadingStatus(articleId)
      if (response.code === 0) {
        return response.data
      }
    } catch (err) {
      console.error('更新阅读状态失败:', err)
      throw err
    }
  }

  /**
   * 完成文章阅读
   * @param articleId 文章ID
   */
  const completeReading = async (articleId: number) => {
    try {
      const response = await completeArticleReading(articleId)
      if (response.code === 0) {
        return response.data
      }
    } catch (err) {
      console.error('完成阅读失败:', err)
      throw err
    }
  }

  /**
   * 收藏文章
   * @param articleId 文章ID
   */
  const collect = async (articleId: number) => {
    try {
      const response = await collectArticle(articleId)
      if (response.code === 0) {
        isFavorited.value = true
        return response.data
      }
    } catch (err) {
      console.error('收藏文章失败:', err)
      throw err
    }
  }

  /**
   * 取消收藏文章
   * @param articleId 文章ID
   */
  const cancelCollect = async (articleId: number) => {
    try {
      const response = await cancelCollectArticle(articleId)
      if (response.code === 0) {
        isFavorited.value = false
        return response.data
      }
    } catch (err) {
      console.error('取消收藏失败:', err)
      throw err
    }
  }

  /**
   * 清空当前文章
   */
  const clearCurrentArticle = () => {
    currentArticle.value = null
    isFavorited.value = false
  }

  return {
    // 状态
    currentArticle,
    isFavorited,
    loading,
    error,

    // 方法
    fetchFavoriteStatus,
    toggleFavorite,
    fetchTestQuestions,
    regenerateQuiz,
    addReadingTime,
    updateReadingInProgress,
    completeReading,
    collect,
    cancelCollect,
    clearCurrentArticle,
  }
})
