<template>
  <div class="login-container">
    <div class="login-content">
      <!-- 左侧动画区域 -->
      <div class="animation-section">
        <div class="auth-symbol" aria-hidden="true">学</div>
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
import { login } from '@/api/auth'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
import { validateEmail } from '@/utils/validators'
import type { LoginDTO } from '@/types/auth'

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

/* 与学习空间共用的认证页视觉语言 */
.login-container { background: var(--xl-bg); overflow: visible; }
.login-container::before, .login-container::after { display: none; }
.login-content { background: var(--xl-surface); border: 1px solid var(--xl-border); box-shadow: var(--xl-shadow-card); backdrop-filter: none; animation: none; }
.animation-section { background: #e9eee4; color: var(--xl-ink); gap: 24px; }
.auth-symbol { width: 250px; height: 250px; display: grid; place-items: center; border: 1px solid #bed0bd; border-radius: 50%; color: var(--xl-brand); font: 180px/1 'Songti SC', var(--xl-font-display); }
.animation-text h2 { color: var(--xl-ink); font: 650 35px/1.2 var(--xl-font-display); }
.animation-text p { color: var(--xl-ink-soft); }
.login-card { background: var(--xl-surface); }
.brand-title { color: var(--xl-ink); font: 650 31px/1.2 var(--xl-font-display); }
.brand-subtitle { color: var(--xl-ink-soft); }
.login-form :deep(.el-input__wrapper), .login-form :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px var(--xl-border) inset; }
.login-form :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px var(--xl-brand) inset; }
.login-button { background: var(--xl-brand); box-shadow: none; }
.login-button:hover { background: var(--xl-brand-hover); box-shadow: var(--xl-shadow-card); }
.login-button { min-height: 50px; border: 1px solid #254c35; border-radius: var(--xl-button-radius); font-weight: 800; box-shadow: var(--xl-button-shadow); transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease; }
.login-button:hover:not(.is-disabled) { transform: translateY(-2px); box-shadow: var(--xl-button-shadow-hover); }
.login-button:active:not(.is-disabled) { transform: translateY(1px); box-shadow: var(--xl-button-shadow-pressed); }
.login-button.is-disabled { box-shadow: none; }
.login-footer { border-color: var(--xl-border); }
.auth-footer { color: var(--xl-ink-soft); }
</style>
