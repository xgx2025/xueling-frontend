<template>
  <div class="article-list-page">
    <el-page-header @back="router.back()" content="英语文章阅读" class="mb-4" />
    
    <div class="filter-bar">
      <el-radio-group v-model="levelFilter" size="large">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="entry">入门</el-radio-button>
        <el-radio-button label="intermediate">进阶</el-radio-button>
        <el-radio-button label="advanced">高级</el-radio-button>
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
                <el-tag :type="getLevelType(article.level)" size="small">{{ article.levelText }}</el-tag>
                <span class="date">{{ article.date }}</span>
              </div>
              <h3 class="title" @click="readArticle(article.id)">{{ article.title }}</h3>
              <p class="summary">{{ article.summary }}</p>
              <div class="meta">
                <span><el-icon><View /></el-icon> {{ article.views }}</span>
                <span><el-icon><Timer /></el-icon> {{ article.readTime }} min</span>
              </div>
           </div>
           <div class="article-image" :style="{ backgroundImage: `url(${article.image})` }"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { View, Timer } from '@element-plus/icons-vue'

const router = useRouter()
const levelFilter = ref('all')

// 模拟文章数据
const articles = ref([
 {
    id: 1,
    title: 'The Benefits of Learning a Second Language',
    summary: 'Learning a new language is not just about communication; it changes your brain structure...',
    level: 'entry',
    levelText: '入门',
    date: '2023-10-24',
    views: 1205,
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    title: 'Artificial Intelligence in Modern Society',
    summary: 'AI is reshaping industries from healthcare to finance. What does the future hold?',
    level: 'intermediate',
    levelText: '进阶',
    date: '2023-10-25',
    views: 890,
    readTime: 8,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    title: 'Climate Change: A Global Perspective',
    summary: 'An in-depth analysis of the latest IPCC report and its implications for policy makers.',
    level: 'advanced',
    levelText: '高级',
    date: '2023-10-20',
    views: 450,
    readTime: 12,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
])

const filteredArticles = computed(() => {
    if (levelFilter.value === 'all') return articles.value;
    return articles.value.filter(a => a.level === levelFilter.value);
})

const getLevelType = (level: string) => {
    const map: Record<string, string> = {
        'entry': 'success',
        'intermediate': 'warning',
        'advanced': 'danger'
    }
    return map[level] || 'info'
}

const readArticle = (id: number) => {
    router.push({ name: 'english-article-detail', params: { id } })
}
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
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  flex-shrink: 0;
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
