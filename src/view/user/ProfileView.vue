<template>
  <div class="profile-view">
    <div class="profile-header-bg"></div>
    
    <div class="content-wrapper">
      <el-row :gutter="24">
        <!-- 左侧个人信息卡片 -->
        <el-col :span="24" :md="8" :lg="7">
          <el-card class="user-card glass-effect animate__animated animate__fadeInLeft" shadow="hover">
            <div class="user-info-section">
              <div class="avatar-wrapper">
                <el-avatar 
                  :size="100" 
                  :src="userStore.avatar || defaultAvatar" 
                  class="user-avatar"
                  :class="{ 'pulse-animation': isLoading }"
                />
                <div class="avatar-upload-hint glass-btn" @click="triggerFileInput">
                  <el-icon><Camera /></el-icon>
                </div>
                <input 
                  ref="fileInputRef" 
                  type="file" 
                  accept="image/*" 
                  style="display: none" 
                  @change="handleAvatarChange"
                />
              </div>
              <h2 class="username">{{ userStore.username || '未设置昵称' }}</h2>
              <p class="email">{{ userStore.userInfo?.email }}</p>
              
              <div class="user-tags">
                <el-tag type="success" effect="dark" round size="small" class="shadow-sm">正式学员</el-tag>
                <el-tag type="warning" effect="plain" round size="small" class="shadow-sm">Level 3</el-tag>
              </div>

              <div class="action-buttons">
                <el-button type="primary" round class="w-100 mb-3 gradient-btn" @click="handleEditProfile">
                  <el-icon class="mr-1"><Edit /></el-icon> 编辑资料
                </el-button>
                <el-button color="#f56c6c" plain round class="w-100" @click="handleLogout">
                  <el-icon class="mr-1"><SwitchButton /></el-icon> 退出登录
                </el-button>
              </div>
            </div>

            <el-divider class="my-divider" />

            <div class="user-stats-list">
              <div class="stat-item">
                <span class="label">注册时间</span>
                <span class="value">2023-10-24</span>
              </div>
              <div class="stat-item">
                <span class="label">最近活跃</span>
                <span class="value">刚刚</span>
              </div>
            </div>
            
            <div class="daily-quote mt-4">
              <p class="quote-text">"The limits of my language mean the limits of my world."</p>
              <p class="quote-author">— Ludwig Wittgenstein</p>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧主要内容区 -->
        <el-col :span="24" :md="16" :lg="17">
          <!-- 欢迎与统计横幅 -->
          <el-card class="stats-card glass-panel mb-4 animate__animated animate__fadeInDown" shadow="always">
            <el-row align="middle">
              <el-col :span="14" class="pl-4">
                <h3 class="welcome-title">
                  Welcome back, <span class="highlight-name">{{ userStore.username }}</span>! 👋
                </h3>
                <p class="welcome-subtitle">
                  今天的学习目标还没完成，继续加油哦！
                </p>
                <div class="nav-shortcuts mt-4">
                  <el-button type="primary" class="glass-btn-primary" round @click="$router.push('/english')">前往英语学习看板 ➔</el-button>
                </div>
              </el-col>
              <el-col :span="10" class="lottie-col">
                <!-- Lottie 动画展示区 -->
                <div class="lottie-container">
                   <Vue3Lottie 
                    animationLink="https://assets10.lottiefiles.com/packages/lf20_w51pcehl.json"
                    :height="160" 
                    :width="160" 
                   />
                </div>
              </el-col>
            </el-row>
          </el-card>

          <!-- 学习数据概览 -->
          <el-row :gutter="20" class="mb-4">
            <el-col :span="8">
              <el-card shadow="hover" class="data-card animate__animated animate__fadeInUp" style="animation-delay: 0.1s">
                <div class="data-icon-bg">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="card-header-simple">
                   <span>学习时长</span>
                </div>
                <div class="data-value">128 <span class="unit">h</span></div>
                <div class="data-trend up">
                   <el-icon><Top /></el-icon> 12% vs 上月
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="data-card animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
                 <div class="data-icon-bg color-purple">
                  <el-icon><Collection /></el-icon>
                </div>
                <div class="card-header-simple">
                    <span>掌握词汇</span>
                </div>
                <div class="data-value">1,240 <span class="unit">词</span></div>
                <div class="data-trend up">
                   <el-icon><Top /></el-icon> 85 本周
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="data-card animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
                <div class="data-icon-bg color-orange">
                  <el-icon><Reading /></el-icon>
                </div>
                <div class="card-header-simple">
                   <span>阅读文章</span>
                </div>
                <div class="data-value">42 <span class="unit">篇</span></div>
                <div class="data-trend">
                   <el-icon><Minus /></el-icon> 保持平稳
                </div>
              </el-card>
            </el-col>
          </el-row>


          <!-- 设置/功能列表 -->
          <el-card class="settings-card animate__animated animate__fadeInUp" style="animation-delay: 0.4s" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3><el-icon class="mr-1"><Setting /></el-icon> 账户设置</h3>
              </div>
            </template>
            <el-tabs v-model="activeTab" class="custom-tabs">
              <el-tab-pane label="基本设置" name="basic">
                 <el-form label-position="top" class="mt-2 setting-form">
                    <el-row :gutter="20">
                      <el-col :span="12">
                         <el-form-item label="用户名">
                            <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!isEditing" />
                         </el-form-item>
                      </el-col>
                      <el-col :span="12">
                         <el-form-item label="联系邮箱">
                            <el-input v-model="form.email" disabled placeholder="邮箱不可修改" />
                         </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                         <el-form-item label="手机号">
                            <el-input v-model="form.phone" placeholder="请输入手机号" :disabled="!isEditing" />
                         </el-form-item>
                      </el-col>
                      <el-col :span="12">
                         <el-form-item label="性别">
                            <el-select v-model="form.gender" placeholder="请选择性别" :disabled="!isEditing" style="width: 100%">
                              <el-option label="未知" :value="0" />
                              <el-option label="男" :value="1" />
                              <el-option label="女" :value="2" />
                            </el-select>
                         </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                         <el-form-item label="生日">
                            <el-date-picker 
                              v-model="form.birthday" 
                              type="date" 
                              placeholder="选择生日" 
                              :disabled="!isEditing"
                              style="width: 100%"
                              format="YYYY-MM-DD"
                              value-format="YYYY-MM-DD"
                            />
                         </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="个人简介">
                      <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="写一句座右铭吧..." :disabled="!isEditing" />
                    </el-form-item>
                    
                    <div class="form-actions">
                       <el-button v-if="!isEditing" type="primary" plain @click="isEditing = true">
                         <el-icon class="mr-1"><Edit /></el-icon> 修改资料
                       </el-button>
                       <template v-else>
                          <el-button type="primary" :loading="isSaving" @click="saveProfile" class="gradient-btn-save">保存修改</el-button>
                          <el-button @click="cancelEdit">取消</el-button>
                       </template>
                    </div>
                 </el-form>
              </el-tab-pane>
              <el-tab-pane label="安全设置" name="security">
                <div class="security-item">
                  <div class="info">
                    <h4>登录密码</h4>
                    <p>建议定期修改密码以保护账户安全</p>
                  </div>
                  <el-button link type="primary">修改密码</el-button>
                </div>
              </el-tab-pane>
              <el-tab-pane label="偏好设置" name="preference">
                <div class="preference-item">
                  <span>暗黑模式</span>
                  <el-switch v-model="darkMode" />
                </div>
                <div class="preference-item mt-3">
                   <span>每日学习提醒</span>
                   <el-switch v-model="notification" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>

        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Camera, Edit, SwitchButton, Timer, Collection, Reading, Top, Minus, Setting } from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const isSaving = ref(false)
const isEditing = ref(false)
const activeTab = ref('basic')
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const darkMode = ref(false)
const notification = ref(true)
const fileInputRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  username: userStore.username,
  email: userStore.userInfo?.email || '',
  phone: '',
  gender: undefined as number | undefined,
  birthday: '',
  bio: ''
})

// 从 localStorage 加载完整的用户信息
const loadUserProfile = () => {
  const storedUserVO = localStorage.getItem('user_vo')
  if (storedUserVO) {
    const userVO = JSON.parse(storedUserVO)
    form.username = userVO.username || ''
    form.email = userVO.email || ''
    form.phone = userVO.phone || ''
    form.gender = userVO.gender
    form.birthday = userVO.birthday || ''
    form.bio = userVO.bio || ''
  }
}

const handleEditProfile = () => {
    activeTab.value = 'basic'
    isEditing.value = true
    ElMessage.info('现在可以编辑您的资料了')
    // 滚动到设置区域
    document.querySelector('.settings-card')?.scrollIntoView({ behavior: 'smooth' })
}

const cancelEdit = () => {
    isEditing.value = false
    // 重置表单数据
    loadUserProfile()
    ElMessage.info('已取消编辑')
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    // 只提交有值的字段
    const updateData: any = {}
    if (form.username && form.username !== userStore.username) {
      updateData.username = form.username
    }
    if (form.phone) {
      updateData.phone = form.phone
    }
    if (form.gender !== undefined) {
      updateData.gender = form.gender
    }
    if (form.birthday) {
      updateData.birthday = form.birthday
    }
    if (form.bio) {
      updateData.bio = form.bio
    }
    
    // 如果没有任何修改
    if (Object.keys(updateData).length === 0) {
      ElMessage.warning('没有修改任何信息')
      isEditing.value = false
      isSaving.value = false
      return
    }
    
    await userStore.updateProfile(updateData)
    isEditing.value = false
    ElMessage.success('个人资料已更新')
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      await userStore.logout()
      router.push('/login')
      ElMessage.success('已安全退出')
    })
    .catch(() => {})
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理头像文件选择
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制为 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  
  try {
    isLoading.value = true
    ElMessage.info('正在上传头像...')
    
    // 调用 store 中的上传方法
    const newAvatarUrl = await userStore.updateAvatar(file)
    
    ElMessage.success('头像更新成功')
    console.log('新头像URL:', newAvatarUrl)
  } catch (error: any) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败，请重试')
  } finally {
    isLoading.value = false
    // 清空 input，允许重复选择同一文件
    if (target) {
      target.value = ''
    }
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  overflow-x: hidden;
}

/* 顶部背景装饰 */
.profile-header-bg {
  height: 200px;
  background: linear-gradient(135deg, #409EFF 0%, #36d1dc 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 0;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
}

/* Glassmorphism Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-btn {
  background: rgba(64, 158, 255, 0.9);
  backdrop-filter: blur(4px);
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
}

.gradient-btn {
  background: linear-gradient(90deg, #409EFF 0%, #36d1dc 100%);
  border: none;
  transition: all 0.3s ease;
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.gradient-btn-save {
   background: linear-gradient(90deg, #67C23A 0%, #409EFF 100%);
   border: none;
   width: 150px;
   transition: all 0.3s ease;
}

.gradient-btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

/* 左侧用户卡片 */
.user-card {
  border-radius: 24px;
  border: 1px solid #edeff2;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  text-align: center;
  margin-bottom: 24px;
  position: sticky;
  top: 100px;
  z-index: 5;
  background-color: #fff;
}

.user-info-section {
  padding: 30px 20px 20px;
}

.avatar-wrapper {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 16px;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-avatar:hover {
  transform: scale(1.08) rotate(3deg);
}

.avatar-upload-hint {
  position: absolute;
  bottom: 5px;
  right: 0;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.avatar-upload-hint:hover {
  transform: scale(1.1);
}

.username {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.email {
  color: #909399;
  font-size: 14px;
  margin-bottom: 18px;
}

.user-tags {
  margin-bottom: 28px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.shadow-sm {
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.my-divider {
  margin: 0 20px;
  width: auto;
  opacity: 0.6;
}

.user-stats-list {
  padding: 10px 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f2f5;
  font-size: 14px;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: #606266;
  font-weight: 500;
}

.stat-item .value {
  color: #303133;
  font-weight: 600;
}

.daily-quote {
  background: #fafafa;
  padding: 20px;
  margin: 0;
  border-top: 1px solid #eee;
}

.quote-text {
  font-style: italic;
  font-family: "Georgia", serif;
  color: #555;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.quote-author {
  text-align: right;
  font-size: 12px;
  color: #999;
  font-weight: bold;
}

/* 右侧欢迎与统计 */
.welcome-title {
  font-size: 26px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 700;
}

.highlight-name {
  background: linear-gradient(120deg, #409EFF 0%, #36d1dc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-subtitle {
  color: #606266;
  line-height: 1.6;
}

.stats-card {
  border-radius: 24px;
  border: 1px solid #edeff2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  /* background: #fff; */
  position: relative;
  overflow: hidden;
}

/* 给 stats-card 加一点装饰 */
.stats-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(64,158,255,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.glass-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  font-weight: 500;
  transition: all 0.3s;
}

.glass-btn-primary:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
}

/* 数据概览卡片 */
.data-card {
  border-radius: 24px;
  border: 1px solid #edeff2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: visible;
  padding-top: 15px;
  background: rgba(255, 255, 255, 0.95); /* 微微透一点，保持统一感 */
}

.data-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.06);
}

.data-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.1);
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 10px;
}

.data-icon-bg.color-purple {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.data-icon-bg.color-orange {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
}

.card-header-simple {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.data-value {
  font-size: 32px;
  font-weight: 800;
  color: #2c3e50;
  margin: 5px 0 10px;
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
}

.data-value .unit {
  font-size: 13px;
  font-weight: normal;
  color: #909399;
  margin-left: 2px;
}

.data-trend {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.data-trend.up {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-flex;
}

/* 设置卡片 */
.settings-card {
  border-radius: 24px;
  border: 1px solid #edeff2;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  background: rgba(255, 255, 255, 0.95);
}

.settings-card .card-header h3 {
    font-size: 18px;
    margin: 0;
    color: #303133;
}

/* 入场动画 */
@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translate3d(-30px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate__fadeInLeft {
  animation-name: fadeInLeft;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate__fadeInDown {
  animation-name: fadeInDown;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate__fadeInUp {
  animation-name: fadeInUp;
}

/* 头像上传加载动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.pulse-animation {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
