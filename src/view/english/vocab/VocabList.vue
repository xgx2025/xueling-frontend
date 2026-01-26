<template>
  <div class="vocab-list-page">
    <div class="vocab-content">
      <header class="page-header">
        <el-page-header @back="router.back()" content="我的单词本" />
        <el-button type="primary" @click="dialogVisible = true" size="large" round>
          <el-icon class="mr-1"><Plus /></el-icon> 新建单词本
        </el-button>
      </header>

      <!-- Hero Section with Lottie -->
      <div class="hero-section">
        <div class="hero-content">
          <h1>让记忆更轻松</h1>
          <p>科学记忆曲线，智能复习算法，助你高效攻克词汇难关。</p>
          <div class="stats-row">
            <div class="stat-item">
                <span class="stat-num">{{ wordBooks.reduce((acc, cur) => acc + cur.count, 0) }}</span>
                <span class="stat-label">总词汇量</span>
            </div>
            <div class="stat-item">
                <span class="stat-num">{{ wordBooks.length }}</span>
                <span class="stat-label">正在学习</span>
            </div>
          </div>
        </div>
        <div class="hero-animation">
          <Vue3Lottie
              :animationLink="animationLink"
              :height="280"
              :width="280"
            />
        </div>
      </div>

      <div class="section-title">
          <h2>正在学习</h2>
          <span class="subtitle">Keep going!</span>
      </div>

      <div class="book-grid">
        <div v-for="book in wordBooks" :key="book.id" class="book-card" @click="handleBookClick(book.id)">
          <div class="book-cover" :style="{ background: book.color }">
            <span class="book-icon">{{ book.icon }}</span>
            <div class="book-overlay">
                <el-button round size="small" class="start-btn">开始复习</el-button>
            </div>
          </div>
          <div class="book-info">
            <div class="info-header">
              <h3>{{ book.name }}</h3>
              <span class="word-count-badge">{{ book.count }} 词</span>
            </div>
            <div class="progress-container">
              <div class="progress-info">
                  <span>掌握度</span>
                  <span class="progress-val">{{ book.mastered }}%</span>
              </div>
              <el-progress 
                  :percentage="book.progress" 
                  :show-text="false" 
                  :stroke-width="6" 
                  color="#626aef" 
                  :duration="10"
                  indeterminate
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建单词本弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建单词本" width="30%">
      <el-form>
        <el-form-item label="名称">
          <el-input v-model="newBookName" placeholder="例如：四级核心词汇" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createBook" :loading="loading">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'
import { ElMessage } from 'element-plus'
import { createWordBook } from '@/api/wordbook'

const router = useRouter()
const dialogVisible = ref(false)
const newBookName = ref('')
const loading = ref(false)
// 这是一个学习场景的 Lottie 动画链接
const animationLink = 'https://assets5.lottiefiles.com/packages/lf20_1a8sx7oe.json' 

// 模拟数据
const wordBooks = ref([
  { id: 1, name: 'CET-4 核心词', count: 120, progress: 45, mastered: 45, color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: '📖' },
  { id: 2, name: '考研英语重点', count: 350, progress: 12, mastered: 12, color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', icon: '🎓' },
  { id: 3, name: '日常口语', count: 85, progress: 80, mastered: 80, color: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)', icon: '🗣️' },
])

const handleBookClick = (id: number) => {
  router.push(`/english/vocab/book/${id}`)
}

const createBook = async () => {
  if (!newBookName.value.trim()) {
    ElMessage.warning('请输入单词本名称')
    return
  }
  
  try {
    loading.value = true
    const response = await createWordBook(newBookName.value)
    
    if (response.code === 0) {
      ElMessage.success(response.msg || '单词本创建成功')
      
      // 添加到本地列表（使用随机颜色和图标）
      const colors = [
        'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      ]
      const icons = ['📘', '📖', '📚', '📕', '📗', '📙']
      
      wordBooks.value.push({
        id: Date.now(),
        name: newBookName.value,
        count: 0,
        progress: 0,
        mastered: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)]
      })
      
      dialogVisible.value = false
      newBookName.value = ''
    } else {
      ElMessage.error(response.msg || '创建失败')
    }
  } catch (error: any) {
    console.error('创建单词本失败:', error)
    ElMessage.error(error.message || '创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.vocab-list-page {
  min-height: 100vh;
  background-color: #f8fafc;
  width: 100%;
}

.vocab-content {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  /* background: white; */
  padding: 10px 0;
  /* border-radius: 8px; */
  /* box-shadow: 0 4px 12px rgba(0,0,0,0.05); */
}

/* Hero Section */
.hero-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 24px;
    padding: 40px 60px;
    margin-bottom: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
    position: relative;
    overflow: hidden;
}

.hero-content {
    flex: 1;
    z-index: 2;
}

.hero-content h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 15px;
    font-weight: 800;
    letter-spacing: -1px;
}

.hero-content p {
    font-size: 1.1rem;
    color: #7f8c8d;
    margin-bottom: 30px;
    max-width: 500px;
    line-height: 1.6;
}

.stats-row {
    display: flex;
    gap: 40px;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-num {
    font-size: 1.8rem;
    font-weight: 700;
    color: #626aef;
}

.stat-label {
    font-size: 0.9rem;
    color: #9aa8b9;
    margin-top: 5px;
}

.section-title {
    margin-bottom: 25px;
    display: flex;
    align-items: baseline;
    gap: 15px;
}
.section-title h2 {
    font-size: 1.5rem;
    color: #333;
    margin: 0;
}
.section-title .subtitle {
    color: #999;
    font-weight: 500;
    font-family: 'Comic Sans MS', cursive, sans-serif;
}


.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.book-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(0,0,0,0.02);
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.book-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: clip-path 0.4s;
}
/* 给封面加点纹理 */
.book-cover::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px);
    background-size: 20px 20px;
    opacity: 0.3;
}

.book-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s;
}

.book-card:hover .book-overlay {
    opacity: 1;
}

.start-btn {
    transform: translateY(20px);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-weight: 600;
    letter-spacing: 0.5px;
}

.book-card:hover .start-btn {
    transform: translateY(0);
}

.book-icon {
  font-size: 3.5rem;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
  transition: transform 0.4s;
}
.book-card:hover .book-icon {
    transform: scale(1.1) rotate(5deg);
}

.book-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.book-info h3 {
  margin: 0;
  font-size: 1.15rem;
  color: #2c3e50;
  font-weight: 700;
  line-height: 1.4;
}

.word-count-badge {
    background: #f0f2f5;
    color: #606266;
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #909399;
    font-weight: 500;
}
.progress-val {
    color: #2c3e50;
    font-weight: 700;
}
</style>
