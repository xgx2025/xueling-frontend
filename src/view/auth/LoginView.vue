<template>
  <div class="login-container">
    <!-- 动态交互背景 -->
    <InteractiveBackground />
    
    <!-- 背景装饰元素 -->
    <div class="background-decorations">
      <div class="decor-circle decor-1"></div>
      <div class="decor-circle decor-2"></div>
      <div class="decor-icon decor-3">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="decor-icon decor-4">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>

    <div class="login-content">
      <!-- 左侧动画区域 -->
      <div class="animation-section">
        <!-- 装饰性 Lottie 背景 -->
        <div class="lottie-bg-pattern">
          <Vue3Lottie
            animationLink="https://lottie.host/4f8e8de7-eadb-4e0f-8e3f-4c3c8c6e5f5e/YrF7RqLJHN.json"
            :height="500"
            :width="500"
            :loop="true"
            :autoPlay="true"
            :speed="0.5"
          />
        </div>

        <!-- 装饰性几何图形 -->
        <div class="decoration-shapes">
          <div class="shape icon-book">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="shape icon-bulb">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18v-1.5m-4.5-1.5h9M9 10.5a3 3 0 116 0c0 1.657-1.343 3-3 3s-3-1.343-3-3zM12 3v1.5M5.636 5.636l1.06 1.06M18.364 18.364l1.06 1.06M5.636 18.364l1.06-1.06M18.364 5.636l1.06-1.06" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 15a3 3 0 016 0" stroke="currentColor" stroke-width="2"/></svg>
          </div>
          <div class="shape icon-pencil">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="shape circle-lg"></div>
        </div>

        <Vue3Lottie
          animationLink="https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json"
          height="auto"
          width="80%"
          :loop="true"
          :autoPlay="true"
          class="main-lottie"
        />
        <div class="animation-text">
          <h2>欢迎回来</h2>
          <p>开启智能学习新体验</p>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-card">
        <div class="login-header">
          <div class="brand-logo">
            <img src="/logo.svg" alt="Logo" class="logo-icon" />
          </div>
          <h1 class="brand-title">登录账号</h1>
          <p class="brand-subtitle">继续您的学习之旅</p>
        </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <div class="social-login">
          <div class="social-login-divider">
            <span>其他登录方式</span>
          </div>
          <div class="social-login-icons">
            <button class="social-icon phone-icon" @click="handlePhoneLogin" title="手机号登录">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.4 64H309.6C250.4 64 202 112.4 202 171.6v680.8c0 59.2 48.4 107.6 107.6 107.6h404.8c59.2 0 107.6-48.4 107.6-107.6V171.6c0-59.2-48.4-107.6-107.6-107.6zM512 896c-35.2 0-64-28.8-64-64s28.8-64 64-64 64 28.8 64 64-28.8 64-64 64z m246.4-192H265.6V192h492.8v512z" fill="currentColor"/>
              </svg>
            </button>
            <button class="social-icon wechat-icon" @click="handleWechatLogin" title="微信登录">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274068 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="currentColor"/>
              </svg>
            </button>
            <button class="social-icon qq-icon" @click="handleQQLogin" title="QQ登录">
              <QQ />
            </button>
          </div>
        </div>

        <div class="login-footer">
          <span>还没有账号？</span>
          <el-link type="primary" :underline="false" @click="navigateToRegister">
            立即注册
          </el-link>
        </div>
      </el-form>
    </div>
    </div>

    <footer class="auth-footer">
      <p>&copy; 2026 学灵智能学习平台. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Vue3Lottie } from 'vue3-lottie'
import InteractiveBackground from '@/components/InteractiveBackground.vue'
import { login } from '@/api/auth'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
import { validateEmail } from '@/utils/validators'
import type { LoginDTO } from '@/types/auth'
import { QQ } from '@/components/Icon.vue'

const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  email: '',
  password: ''
})

// 加载状态
const loading = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!validateEmail(value)) {
          callback(new Error('请输入有效的邮箱地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少为 8 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()

    loading.value = true

    // 准备登录数据
    const loginData: LoginDTO = {
      email: loginForm.email.trim(),
      password: loginForm.password
    }

    // 调用登录 API
    const response = await login(loginData)

    if (response.code === 0) {
      // 存储 token
      tokenStore.setToken(response.data)

      // 获取用户信息
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 即使获取用户信息失败，也继续登录流程
      }

      // 显示成功消息
      ElMessage.success(response.msg || '登录成功！')

      // 跳转到主页
      await router.push('/')
    } else {
      ElMessage.error(response.msg || '登录失败，请重试')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    
    // 处理验证错误
    if (error.msg && error.msg.includes('validation')) {
      return
    }

    // 处理 API 错误
    // HTTP 错误的响应数据在 error.response.data 中
    const errorData = error.response?.data
    const errorMessage = errorData?.msg || error.msg || error.message || '登录失败，请检查网络连接'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const navigateToRegister = () => {
  router.push('/register')
}

// 手机号登录
const handlePhoneLogin = () => {
  ElMessage.info('手机号登录功能开发中...')
}

// 微信登录
const handleWechatLogin = () => {
  ElMessage.info('微信登录功能开发中...')
}

// QQ登录
const handleQQLogin = () => {
  ElMessage.info('QQ登录功能开发中...')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
}

.login-container::after {
  content: '';
  position: absolute;
  bottom: -10%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(0, 242, 254, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(5px);
  animation: float 8s infinite ease-in-out;
}

.decor-icon {
  position: absolute;
  color: rgba(79, 172, 254, 0.15);
  animation: float 10s infinite ease-in-out;
}

.decor-icon svg {
  width: 100%;
  height: 100%;
}

.decor-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.decor-2 {
  width: 80px;
  height: 80px;
  bottom: 15%;
  right: 5%;
  animation-delay: 2s;
}

.decor-3 {
  width: 100px;
  height: 100px;
  top: 20%;
  right: 8%;
  transform: rotate(15deg);
  animation-delay: 1s;
}

.decor-4 {
  width: 80px;
  height: 80px;
  bottom: 10%;
  left: 8%;
  transform: rotate(-15deg);
  animation-delay: 3s;
}

.login-content {
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.6s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧动画区域 */
.animation-section {
  flex: 1;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  color: #333;
  position: relative;
  overflow: hidden;
}

.lottie-bg-pattern {
  position: absolute;
  top: -50px;
  right: -50px;
  opacity: 0.1;
  transform: rotate(15deg);
  pointer-events: none;
}

.decoration-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.shape {
  position: absolute;
  opacity: 0.6;
  color: white;
  animation: float 6s infinite ease-in-out;
}

.shape svg {
  width: 100%;
  height: 100%;
  stroke-width: 2px;
}

.icon-book {
  width: 32px;
  height: 32px;
  top: 15%;
  left: 10%;
  transform: rotate(-15deg);
  animation-delay: 0s;
}

.icon-bulb {
  width: 36px;
  height: 36px;
  top: 25%;
  right: 15%;
  transform: rotate(15deg);
  animation-delay: 1.5s;
}

.icon-pencil {
  width: 28px;
  height: 28px;
  bottom: 20%;
  left: 15%;
  transform: rotate(45deg);
  animation-delay: 3s;
}

.circle-lg {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  bottom: 15%;
  right: 10%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes spin-float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

.main-lottie {
  position: relative;
  z-index: 2;
}

.animation-text {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 20px;
}

.animation-text h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #333;
}

.animation-text p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* 右侧登录表单 */
.login-card {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.brand-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.login-form {
  margin-top: 32px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.15);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.25);
}

.login-button {
  width: 100%;
  margin-top: 12px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.social-login {
  margin-top: 32px;
}

.social-login-divider {
  position: relative;
  text-align: center;
  margin-bottom: 24px;
}

.social-login-divider::before,
.social-login-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background-color: #e0e0e0;
}

.social-login-divider::before {
  left: 0;
}

.social-login-divider::after {
  right: 0;
}

.social-login-divider span {
  display: inline-block;
  padding: 0 16px;
  background-color: white;
  color: #999;
  font-size: 13px;
}

.social-login-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-icon svg {
  width: 24px;
  height: 24px;
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.social-icon:active {
  transform: translateY(-1px);
}

.phone-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.wechat-icon {
  background: linear-gradient(135deg, #09bb07 0%, #00c800 100%);
  color: white;
}

.qq-icon {
  background: linear-gradient(135deg, #12b7f5 0%, #0e9fe5 100%);
  color: white;
  font-size: 28px;
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.login-footer span {
  margin-right: 8px;
}

.login-footer :deep(.el-link) {
  font-weight: 600;
  font-size: 14px;
}

.auth-footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: #666;
  font-size: 13px;
  z-index: 1;
}

.auth-footer p {
  margin: 0;
}

/* 响应式设计 - 平板 */
@media (max-width: 968px) {
  .animation-section {
    display: none;
  }
  
  .login-content {
    max-width: 500px;
  }
  
  .login-card {
    padding: 50px 40px;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-content {
    border-radius: 16px;
  }

  .login-card {
    padding: 40px 28px;
  }

  .brand-title {
    font-size: 22px;
  }

  .brand-subtitle {
    font-size: 13px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
  }

  .login-header {
    margin-bottom: 28px;
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .login-button {
    height: 44px;
    font-size: 15px;
  }

  .social-login-icons {
    gap: 20px;
  }

  .social-icon {
    width: 44px;
    height: 44px;
  }

  .auth-footer {
    position: static;
    margin-top: 24px;
  }
}

/* 响应式设计 - 小屏幕移动端 */
@media (max-width: 360px) {
  .login-card {
    padding: 32px 20px;
  }

  .brand-title {
    font-size: 20px;
  }

  .login-form :deep(.el-input__wrapper) {
    padding: 10px 14px;
  }
}
</style>
