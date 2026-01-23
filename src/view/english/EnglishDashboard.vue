<template>
  <div class="english-dashboard">
    <header class="dashboard-header animate__animated animate__fadeInDown">
      <div class="header-content">
        <el-page-header @back="router.push('/')" title="返回首页">
          <template #content>
            <span class="text-large font-600 mr-3"> 英语学习中心 </span>
          </template>
        </el-page-header>
        <p class="header-subtitle">保持每天进步一点点，探索语言的无限可能</p>
      </div>
    </header>

    <div class="module-content animate__animated animate__fadeInUp">
      <el-row :gutter="24">
        <!-- 单词库模块 -->
        <el-col :xs="24" :sm="12" :lg="12">
          <el-card 
            class="module-card vocab-card" 
            shadow="hover" 
            @click="navigateTo('/english/vocab')"
          >
            <div class="card-inner">
              <div class="text-section">
                <div class="card-title">
                  <div class="icon-wrapper vocab-bg">
                    <el-icon :size="24" color="#409EFF"><Collection /></el-icon>
                  </div>
                  <h3>单词宝库</h3>
                </div>
                <p class="card-desc">创建专属单词本，使用科学记忆法高效复习。</p>
                
                <div class="tags-group">
                  <el-tag effect="plain" type="primary" round class="custom-tag">自定义词库</el-tag>
                  <el-tag effect="plain" type="success" round class="custom-tag">艾宾浩斯</el-tag>
                </div>
                
                <el-button type="primary" round class="action-btn">
                  开始记单词 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>
              <div class="visual-section">
                <!-- Word/Book Animation -->
                <Vue3Lottie
                  animationLink="https://assets9.lottiefiles.com/packages/lf20_DMgKk1.json"
                  :height="160"
                  :width="160"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 英语文章模块 -->
        <el-col :xs="24" :sm="12" :lg="12">
          <el-card 
            class="module-card article-card" 
            shadow="hover" 
            @click="navigateTo('/english/articles')"
          >
            <div class="card-inner">
              <div class="text-section">
                <div class="card-title">
                  <div class="icon-wrapper article-bg">
                    <el-icon :size="24" color="#E6A23C"><Reading /></el-icon>
                  </div>
                  <h3>英语悦读</h3>
                </div>
                <p class="card-desc">精选英语文章，沉浸式阅读体验，提升语感。</p>
                
                <div class="tags-group">
                  <el-tag effect="plain" type="warning" round class="custom-tag">分级阅读</el-tag>
                  <el-tag effect="plain" type="danger" round class="custom-tag">每日推荐</el-tag>
                </div>

                <el-button type="warning" round class="action-btn">
                  开始阅读 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>
              <div class="visual-section">
                <!-- Reading/News Animation -->
                <Vue3Lottie
                  animationLink="https://assets10.lottiefiles.com/packages/lf20_4XmSkB.json"
                  :height="160"
                  :width="160"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 底部统计区域 (示例) -->
      <div class="stats-section mt-4">
        <el-card shadow="never" class="stats-card">
          <el-row>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">0</div>
                <div class="stat-label">今日单词</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">0</div>
                <div class="stat-label">累计阅读篇数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">0h</div>
                <div class="stat-label">本周学习时长</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Collection, Reading, ArrowRight } from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.english-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.header-subtitle {
  color: #909399;
  margin-top: 10px;
  margin-left: 20px; /* Align with header title visual flow */
  font-size: 14px;
}

.module-content {
  /* Animation handled by animate.css classes if available, otherwise just layout */
}

/* Custom spacing utility since we might not have tailwind/bootstrap */
.mt-4 {
  margin-top: 24px;
}

.module-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f2f5;
  height: 100%;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
  background-color: #ffffff;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.03);
}

.module-card:hover {
  transform: translateY(-8px);
}

.module-card.vocab-card:hover {
  box-shadow: 0 16px 32px -12px rgba(64, 158, 255, 0.3);
  border-color: #c6e2ff;
}

.module-card.article-card:hover {
  box-shadow: 0 16px 32px -12px rgba(230, 162, 60, 0.3);
  border-color: #f5dab1;
}

.card-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-section {
  flex: 1;
  padding-right: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  transition: transform 0.3s ease;
}

.module-card:hover .icon-wrapper {
  transform: scale(1.1);
}

.vocab-bg {
  background-color: #ecf5ff;
}

.article-bg {
  background-color: #fdf6ec;
}

.card-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.card-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  min-height: 44px; /* Ensure alignment */
}

.tags-group {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.custom-tag {
  border: none;
  padding: 0 16px;
  height: 28px;
  line-height: 28px;
}

.action-btn {
  font-weight: 500;
}

.visual-section {
  width: 160px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-card {
  border-radius: 12px;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-inner {
    flex-direction: column-reverse;
    text-align: center;
  }
  
  .text-section {
    padding-right: 0;
  }
  
  .visual-section {
    margin-bottom: 20px;
  }
  
  .card-title {
    justify-content: center;
  }
  
  .tags-group {
    justify-content: center;
  }
}
</style>
