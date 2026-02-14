<template>
  <div class="article-detail-page">
    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="20" animated />

    <!-- 使用新的ArticleReader组件 -->
    <ArticleReader v-if="article && !loading" :article="article" :readingStatus="readingStatus" @reading-complete="handleReadingComplete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import ArticleReader from '@/components/ArticleReader.vue'
import type { ArticleVO } from '@/types/article'
import { getArticlesByCategory, getArticleReadingStatus } from '@/api/article'

/**
 * 获取有效的图片URL
 * @param imageUrl 原始图片URL
 * @returns 有效的图片URL
 */
const getValidImageUrl = (imageUrl: string | null | undefined): string => {
  // 默认图片URL
  const defaultImageUrl = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  
  // 检查图片URL是否有效
  if (!imageUrl || imageUrl.trim() === '' || imageUrl === 'null' || imageUrl === 'undefined') {
    return defaultImageUrl
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
    return defaultImageUrl
  }
}

const route = useRoute()
const articleStore = useArticleStore()

// 状态
const loading = ref(false)
const readingStatus = ref<number | undefined>(undefined)

// 计算属性
const article = computed(() => articleStore.currentArticle)

// 获取文章ID
const articleId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : id
})

/**
 * 初始化页面 - 获取文章详情
 */
const initArticle = async () => {
  try {
    console.log('初始化文章详情页面, 文章ID:', articleId.value)
    loading.value = true

    // 从 API 获取文章列表
    const response = await getArticlesByCategory(1) // 获取分类1下的所有文章
    console.log('API响应状态码:', response.code)
    console.log('API响应数据:', response.data)
    
    if (response.code === 0 && response.data) {
      console.log('获取到的文章列表数量:', response.data.length)
      
      // 在文章列表中查找指定ID的文章
      const articleData = response.data.find((a: any) => a.id === articleId.value)
      console.log('找到的文章数据:', articleData)
      
      if (articleData) {
        console.log('原始图片URL:', articleData.imageUrl)
        console.log('处理后的图片URL:', getValidImageUrl(articleData.imageUrl))
        
        // 设置文章数据到store，保留 highlights 数据
        articleStore.currentArticle = {
          ...articleData,
          chineseMeaning: articleData.chineseMeaning || '',
          vocabularyPhrasesSummary: articleData.vocabularyPhrasesSummary || '',
          articleInsights: articleData.articleInsights || '',
          // 修复图片URL处理：确保使用有效的图片URL
          imageUrl: getValidImageUrl(articleData.imageUrl),
          // 解析 highlights 字段，因为它从 API 返回时是 JSON 字符串
          highlights: articleData.highlights && typeof articleData.highlights === 'string' 
            ? JSON.parse(articleData.highlights) 
            : articleData.highlights
        }
        
        console.log('最终存储的文章数据:', articleStore.currentArticle)
      } else {
        console.error('未找到文章ID:', articleId.value, '在文章列表中')
        console.error('可用的文章ID:', response.data.map((a: any) => a.id))
        throw new Error(`文章ID ${articleId.value} 不存在`)
      }
    } else {
      throw new Error('获取文章列表失败')
    }
  } catch (err) {
    console.error('加载文章失败:', err)
    ElMessage.error('加载文章失败，请检查网络或文章ID是否正确')
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
      console.warn('获取文章阅读状态失败:', response.message)
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
  // 获取文章阅读状态
  getReadingStatus()
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>