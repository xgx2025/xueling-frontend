<template>
  <div class="article-list-page">
    <el-page-header @back="router.back()" content="英语文章阅读" class="mb-4" />
    
    <div class="filter-bar">
      <el-radio-group v-model="selectedCategory" size="large" @change="handleCategoryChange">
        <el-radio-button :label="null">全部</el-radio-button>
        <el-radio-button 
          v-for="category in categories" 
          :key="category.id" 
          :label="category.id"
        >
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="article-grid">
      <el-card 
        v-for="article in filteredArticles" 
        :key="article.id" 
        class="article-card" 
        shadow="hover"
      >
        <div class="article-content">
           <div class="article-text">
              <div class="tags">
                <span class="date">{{ article.date }}</span>
              </div>
              <h3 class="title" @click="readArticle(article.id)">{{ article.title }}</h3>
              <p class="summary">{{ article.summary }}</p>
              <div class="meta">
                <span><el-icon><View /></el-icon> {{ article.views }}</span>
                <span><el-icon><Timer /></el-icon> {{ article.readTime }} min</span>
              </div>
           </div>
           <div class="article-image">
             <img :src="article.image || fallbackImage" :alt="article.title" class="article-img">
           </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { View, Timer } from '@element-plus/icons-vue'
import { getArticleCategories, getArticlesByCategory } from '@/api/article'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

// 文章列表和分类
const articles = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref<number | null>(null)

// 备用图片URL
const fallbackImage = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' 

/**
 * 加载文章分类
 */
const loadCategories = async () => {
  try {
    const response = await getArticleCategories()
    console.log('分类响应:', response)
    if (response.code === 0 && response.data) {
      categories.value = response.data
      console.log('分类数据已加载:', categories.value)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  }
}

/**
 * 加载文章列表
 */
const loadArticles = async (categoryId?: number) => {
  try {
    loading.value = true
    const response = await getArticlesByCategory(categoryId || 1) // 默认加载第一个分类
    console.log('文章列表响应:', response)
    if (response.code === 0 && response.data) {
      // 转换API返回的数据为组件需要的格式
      articles.value = response.data.map((article: any) => {
        console.log('处理文章数据:', article)
        console.log('文章imageUrl:', article.imageUrl)

        // 解析JSON格式的content字段
        let summary = ''
        try {
          if (article.content) {
            const contentObj = JSON.parse(article.content)
            if (contentObj.blocks && contentObj.blocks.length > 0) {
              // 获取第一个段落的第一句话作为摘要
              const firstBlock = contentObj.blocks[0]
              if (firstBlock.sentences && firstBlock.sentences.length > 0) {
                summary = firstBlock.sentences[0].substring(0, 100) + '...'
              }
            }
          }
        } catch (e) {
          console.error('解析content失败:', e)
          summary = article.content?.substring(0, 100) + '...' || ''
        }

        // 处理图片URL，确保使用有效的图片
        let imageUrl = article.imageUrl
        // 修复URL中的空格问题
        if (imageUrl && imageUrl.trim() !== '') {
          // 将空格编码为 %20
          imageUrl = imageUrl.trim().replace(/ /g, '%20')
        } else {
          imageUrl = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }

        return {
          id: article.id,
          title: article.title,
          summary: summary,
          date: article.createTime?.split(' ')[0] || '',
          views: 0, // API未提供此字段
          readTime: 5, // 固定显示5分钟
          image: imageUrl
        }
      })
      console.log('文章列表已加载:', articles.value)
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

const filteredArticles = computed(() => {
  return articles.value
})

/**
 * 处理分类变更
 */
const handleCategoryChange = async (categoryId: number | null) => {
  selectedCategory.value = categoryId
  if (categoryId !== null) {
    await loadArticles(categoryId)
  } else {
    // 加载所有分类的文章
    if (categories.value.length > 0) {
      await loadArticles(categories.value[0].id)
    }
  }
}

const readArticle = (id: number) => {
    console.log('点击了文章ID:', id)
    console.log('即将导航到:', { name: 'english-article-detail', params: { id } })
    try {
      router.push({ name: 'english-article-detail', params: { id } })
      console.log('导航成功')
    } catch (err) {
      console.error('导航失败:', err)
    }
}

// 初始化
onMounted(async () => {
  await loadCategories()
  if (categories.value.length > 0) {
    // 默认加载第一个分类的文章
    await loadArticles(categories.value[0].id)
  }
})
</script>

<style scoped>
.article-list-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.filter-bar {
  margin-bottom: 25px;
  display: flex;
  justify-content: center;
}

.article-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: transform 0.2s;
}

.article-card:hover {
  transform: translateY(-2px);
}

.article-content {
  display: flex;
  gap: 20px;
}

.article-text {
  flex: 1;
}

.article-image {
  width: 150px;
  height: 120px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
}

.article-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.tags {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.date {
  font-size: 12px;
  color: #999;
}

.title {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
}

.title:hover {
  color: #409EFF;
}

.summary {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 0.85rem;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>