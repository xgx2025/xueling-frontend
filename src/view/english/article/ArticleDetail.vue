<template>
  <div class="article-detail-page">
    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="20" animated />

    <div v-else-if="errorMessage" class="article-error" role="alert">
      <p>{{ errorMessage }}</p>
      <router-link to="/english/articles">返回文章列表</router-link>
    </div>

    <!-- 使用新的ArticleReader组件 -->
    <ArticleReader v-if="article && !loading" :article="article" :readingStatus="readingStatus" @reading-complete="handleReadingComplete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import axios from 'axios'
import ArticleReader from '@/components/ArticleReader.vue'
import type { ArticleHighlights } from '@/types/article'
import { getArticleById, getArticleReadingStatus } from '@/api/article'

/**
 * 获取有效的图片URL
 * @param imageUrl 原始图片URL
 * @returns 有效的图片URL
 */
const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null' || imageUrl === 'undefined') {
    return ''
  }
  
  // 修复URL中的空格问题
  let processedUrl = imageUrl.trim()
  
  // 将空格编码为 %20
  processedUrl = processedUrl.replace(/ /g, '%20')
  
  // 检查是否是有效的URL格式
  try {
    new URL(processedUrl)
    return processedUrl
  } catch (error) {
    console.warn('无效的图片URL:', imageUrl, '处理后URL:', processedUrl, '使用默认图片')
    return ''
  }
}

const route = useRoute()
const articleStore = useArticleStore()

// 状态
const loading = ref(false)
const errorMessage = ref('')
const readingStatus = ref<number | undefined>(undefined)

// 计算属性
const article = computed(() => articleStore.currentArticle)

// 获取文章ID
const articleId = computed(() => {
  const id = route.params.id
  // route.params 的值可能是 string | string[] | undefined，统一收敛为 number
  const raw = Array.isArray(id) ? id[0] : id
  return raw ? parseInt(raw, 10) : 0
})

/**
 * 初始化页面 - 获取文章详情
 */
const initArticle = async () => {
  loading.value = true
  errorMessage.value = ''
  articleStore.clearCurrentArticle()
  try {
    if (!articleId.value) throw new Error('文章编号无效')
    const response = await getArticleById(articleId.value)
    const articleData = response.data
    if (!articleData) throw new Error('文章不存在或暂未发布')
    let highlights: ArticleHighlights = { highlights: [] }
    if (articleData.highlights) {
      try {
        highlights = typeof articleData.highlights === 'string'
          ? JSON.parse(articleData.highlights) as ArticleHighlights
          : articleData.highlights
      } catch { /* 无法解析的旧数据按无高亮展示 */ }
    }
    articleStore.currentArticle = {
      ...articleData,
      chineseMeaning: articleData.chineseMeaning || '',
      imageUrl: getValidImageUrl(articleData.imageUrl),
      highlights,
    }
    await getReadingStatus()
  } catch (err) {
    errorMessage.value = axios.isAxiosError(err)
      ? err.response?.data?.msg || '文章加载失败，请稍后重试'
      : err && typeof err === 'object' && 'msg' in err
        ? String(err.msg)
        : err instanceof Error ? err.message : '文章加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

/**
 * 获取文章阅读状态
 */
const getReadingStatus = async () => {
  try {
    console.log('获取文章阅读状态，文章ID:', articleId.value)
    const response = await getArticleReadingStatus(articleId.value)
    console.log('文章阅读状态响应:', response)
    
    if (response.code === 0 && response.data) {
      console.log('文章阅读状态:', response.data)
      // 保存阅读状态到变量中，传递给ArticleReader组件
      readingStatus.value = response.data.progressStatus
      console.log('设置阅读状态为:', readingStatus.value)
    } else {
      console.warn('获取文章阅读状态失败:', response.msg)
      readingStatus.value = undefined
    }
  } catch (err) {
    console.error('获取文章阅读状态出错:', err)
    readingStatus.value = undefined
  }
}

/**
 * 处理阅读完成事件
 */
const handleReadingComplete = async () => {
  console.log('收到阅读完成事件，重新获取阅读状态')
  // 延迟一小段时间，确保后端状态已经更新
  setTimeout(() => {
    getReadingStatus()
  }, 500)
}

// 生命周期
onMounted(() => {
  initArticle()
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>

<style scoped>
.article-error { max-width: 600px; margin: 80px auto; padding: 32px; text-align: center; }
.article-error p { margin-bottom: 20px; }
</style>
