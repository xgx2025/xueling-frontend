<template>
  <el-container class="home-container">
    <el-header class="header">
      <div class="brand">
        <img src="/logo.svg" alt="学灵" class="logo" />
        <h1>学灵智能学习平台</h1>
      </div>
      <div class="user-info">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="avatar-wrapper">
            <el-avatar 
              :size="40" 
              :src="userStore.avatar" 
              class="user-avatar"
            >
              {{ userStore.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <span class="username">{{ userStore.username || '学员' }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="welcome-section">
        <el-row :gutter="40" align="middle">
          <el-col :xs="24" :sm="16">
            <h2 class="welcome-title">
              你好，<span class="highlight">{{ userStore.username || '同学' }}</span> !
            </h2>
            <p class="welcome-subtitle">
              开启今天的学习之旅，积跬步以至千里。
            </p>
          </el-col>
          <el-col :xs="24" :sm="8" class="welcome-lottie">
             <!-- Welcome Animation -->
            <Vue3Lottie
              animationLink="https://assets10.lottiefiles.com/packages/lf20_glqfp50o.json"
              :height="150"
              :width="150"
            />
          </el-col>
        </el-row>
      </div>

      <el-divider content-position="left">学科模块</el-divider>

      <el-row :gutter="24" class="subjects-grid">
        <!-- 英语模块 -->
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card 
            class="subject-card english-card" 
            shadow="hover" 
            @click="router.push('/english')"
          >
            <div class="card-content">
              <div class="lottie-wrapper">
                <Vue3Lottie
                  animationLink="https://assets2.lottiefiles.com/packages/lf20_u4jjb9bd.json"
                  :height="120"
                  :width="120"
                />
              </div>
              <h3>英语学习</h3>
              <p>单词库复习 / 英语文章阅读</p>
              <el-button type="primary" round class="start-btn">
                开始学习 <el-icon class="el-icon--right"><Right /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 数学模块 (占位) -->
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="subject-card disabled-card" shadow="never">
            <div class="card-content">
              <div class="lottie-wrapper grayscale">
                <Vue3Lottie
                  animationLink="https://assets5.lottiefiles.com/packages/lf20_06a6pf9i.json"
                  :height="120"
                  :width="120"
                  :loop="false"
                />
              </div>
              <h3>数学思维</h3>
              <p>逻辑训练 / 几何几何</p>
              <el-tag type="info" effect="plain" class="status-tag">敬请期待</el-tag>
            </div>
          </el-card>
        </el-col>

        <!-- 语文模块 (占位) -->
        <el-col :xs="24" :sm="12" :md="8" :lg="8">
          <el-card class="subject-card disabled-card" shadow="never">
            <div class="card-content">
              <div class="lottie-wrapper grayscale">
                <Vue3Lottie
                   animationLink="https://assets3.lottiefiles.com/packages/lf20_49rdyYSjUA.json"
                  :height="120"
                  :width="120"
                  :loop="false"
                />
              </div>
              <h3>语文素养</h3>
              <p>古诗词 / 阅读理解</p>
               <el-tag type="info" effect="plain" class="status-tag">敬请期待</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowDown, Right } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await handleLogout()
  } else if (command === 'profile') {
    ElMessage.info('个人中心开发中...')
  }
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;
  padding: 0 40px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  height: 36px;
}

.brand h1 {
  font-size: 22px;
  font-weight: 600;
  color: #1f2f3d;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.3s;
}

.avatar-wrapper:hover {
  background: rgba(0, 0, 0, 0.025);
}

.user-avatar {
  background-color: #409eff;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

.welcome-section {
  background: linear-gradient(135deg, #fff 0%, #f0f9ff 100%);
  border-radius: 16px;
  padding: 30px 50px;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.welcome-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 12px;
}

.highlight {
  color: #409eff;
}

.welcome-subtitle {
  font-size: 16px;
  color: #909399;
}

.welcome-lottie {
  display: flex;
  justify-content: flex-end;
}

.subjects-grid {
  margin-top: 20px;
}

.subject-card {
  border-radius: 16px;
  border: none;
  transition: all 0.3s;
  height: 320px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.english-card {
  cursor: pointer;
  background: linear-gradient(180deg, #ffffff 0%, #f9fcff 100%);
}

.english-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.12);
}

.english-card:hover .lottie-wrapper {
  transform: scale(1.05);
}

.disabled-card {
  background: #f9f9f9;
  cursor: not-allowed;
  opacity: 0.8;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  padding: 20px 0;
  justify-content: center;
}

.lottie-wrapper {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.lottie-wrapper.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
}

.subject-card h3 {
  font-size: 22px;
  color: #303133;
  margin: 10px 0;
}

.subject-card p {
  color: #909399;
  margin-bottom: 24px;
  font-size: 14px;
}

.start-btn {
  padding: 10px 24px;
}

.status-tag {
  margin-top: 10px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-section {
    padding: 20px;
    text-align: center;
  }
  
  .welcome-lottie {
    justify-content: center;
    margin-top: 20px;
  }
  
  .header {
    padding: 0 20px;
  }
}
</style>
