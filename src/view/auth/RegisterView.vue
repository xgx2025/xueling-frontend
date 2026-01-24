<template>
  <div class="register-container">
    <!-- 背景装饰元素 -->
    <div class="background-decorations">
      <div class="decor-circle decor-1"></div>
      <div class="decor-circle decor-2"></div>
      <div class="decor-icon decor-3">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 13.5L12 21l-7.5-7.5M12 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3l4 4-8 8 4 4" stroke="currentColor" stroke-width="2"/></svg>
      </div>
      <div class="decor-icon decor-4">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
      </div>
    </div>

    <div class="register-content">
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
          <div class="shape icon-rocket">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 13.5L12 21l-7.5-7.5M12 3v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 3l4 4-8 8 4 4" stroke="currentColor" stroke-width="2"/></svg>
          </div>
          <div class="shape icon-target">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
          </div>
          <div class="shape icon-star">
             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="shape circle-lg"></div>
        </div>

        <Vue3Lottie
          animationLink="https://assets4.lottiefiles.com/packages/lf20_j1adxtyb.json"
          height="auto"
          width="80%"
          :loop="true"
          :autoPlay="true"
          class="main-lottie"
        />
        <div class="animation-text">
          <h2>加入我们</h2>
          <p>开启智能学习新篇章</p>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="register-card">
        <div class="register-header">
          <div class="brand-logo">
            <img src="/logo.svg" alt="Logo" class="logo-icon" />
          </div>
          <h1 class="brand-title">创建账号</h1>
          <p class="brand-subtitle">开启智能学习之旅</p>
        </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少8位，包含数字和大小写字母）"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
          <div v-if="passwordStrengthInfo.message" class="password-strength">
            <span :class="['strength-indicator', passwordStrengthInfo.strength]">
              {{ passwordStrengthInfo.message }}
            </span>
          </div>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="verificationCode">
          <div class="verification-code-wrapper">
            <el-input
              v-model="registerForm.verificationCode"
              placeholder="请输入验证码"
              prefix-icon="Key"
              size="large"
              clearable
              class="code-input"
              @keyup.enter="handleRegister"
            />
            <el-button
              :disabled="countdown > 0 || sendingCode"
              :loading="sendingCode"
              class="code-button"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="register-button"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>

        <div class="register-footer">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="navigateToLogin">
            立即登录
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
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Vue3Lottie } from 'vue3-lottie'
import { register, sendVerificationCode as sendCode } from '@/api/auth'
import { validateEmail, validatePasswordStrength, validateVerificationCode } from '@/utils/validators'
import type { RegisterDTO } from '@/types/auth'

const router = useRouter()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 表单数据
const registerForm = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: ''
})

// 加载状态
const loading = ref(false)
const sendingCode = ref(false)

// 倒计时状态
const countdown = ref(0)
let countdownTimer: number | null = null

// 密码强度信息
const passwordStrengthInfo = computed(() => {
  if (!registerForm.password) {
    return { isValid: false, strength: 'weak', message: '' }
  }
  return validatePasswordStrength(registerForm.password)
})

// 监听密码变化，实时显示强度提示
watch(() => registerForm.password, () => {
  // 触发确认密码验证
  if (registerForm.confirmPassword) {
    registerFormRef.value?.validateField('confirmPassword')
  }
})

// 自定义密码验证器
const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
    return
  }
  
  const result = validatePasswordStrength(value)
  if (!result.isValid) {
    callback(new Error(result.message))
    return
  }
  
  callback()
}

// 自定义确认密码验证器
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  
  callback()
}

// 自定义验证码验证器
const validateCode = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入验证码'))
    return
  }
  
  if (!validateVerificationCode(value)) {
    callback(new Error('验证码格式不正确'))
    return
  }
  
  callback()
}

// 表单验证规则
const registerRules: FormRules = {
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
  verificationCode: [
    { required: true, validator: validateCode, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 发送验证码
const sendVerificationCode = async () => {
  // 验证邮箱
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  if (!validateEmail(registerForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  try {
    sendingCode.value = true

    // 调用发送验证码 API
    const response = await sendCode(registerForm.email.trim())

    if (response.code === 0) {
      ElMessage.success(response.msg || '验证码已发送，请查收邮箱')
      
      // 启动倒计时
      startCountdown()
    } else {
      ElMessage.error(response.msg || '验证码发送失败，请重试')
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    // HTTP 错误的响应数据在 error.response.data 中
    const errorData = error.response?.data
    const errorMessage = errorData?.msg || error.msg || '验证码发送失败，请检查网络连接'
    ElMessage.error(errorMessage)
  } finally {
    sendingCode.value = false
  }
}

// 启动倒计时
const startCountdown = () => {
  countdown.value = 60
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = window.setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    // 验证表单
    await registerFormRef.value.validate()

    loading.value = true

    // 准备注册数据
    const registerData: RegisterDTO = {
      email: registerForm.email.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword,
      verificationCode: registerForm.verificationCode.trim()
    }

    // 调用注册 API
    const response = await register(registerData)

    if (response.code === 0) {
      // 显示成功消息
      ElMessage.success(response.msg || '注册成功！即将跳转到登录页面')

      // 清理倒计时
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }

      // 延迟跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response.msg || '注册失败，请重试')
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    
    // 处理验证错误
    if (error.msg && error.msg.includes('validation')) {
      return
    }

    // 处理 API 错误
    // HTTP 错误的响应数据在 error.response.data 中
    const errorData = error.response?.data
    const errorMessage = errorData?.msg || error.msg || error.message || '注册失败，请检查网络连接'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const navigateToLogin = () => {
  // 清理倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  
  router.push('/login')
}

// 组件卸载时清理倒计时
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.register-container {
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

.register-container::before {
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

.register-container::after {
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

.register-content {
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

.icon-rocket {
  width: 36px;
  height: 36px;
  top: 15%;
  left: 10%;
  transform: rotate(-15deg);
  animation: float 5s infinite ease-in-out;
}

.icon-target {
  width: 32px;
  height: 32px;
  top: 25%;
  right: 15%;
  animation-delay: 1.5s;
}

.icon-star {
  width: 28px;
  height: 28px;
  bottom: 20%;
  left: 15%;
  transform: rotate(15deg);
  animation: spin-float 8s infinite linear;
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

/* 右侧注册表单 */
.register-card {
  flex: 1;
  padding: 50px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.brand-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.logo-icon {
  width: 52px;
  height: 52px;
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
  font-size: 24px;
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

.register-form {
  margin-top: 28px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input__wrapper) {
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.register-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.15);
}

.register-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(79, 172, 254, 0.25);
}

.verification-code-wrapper {
  display: flex;
  gap: 16px;
  width: 100%;
  align-items: stretch; /* 确保高度一致 */
}

.code-input {
  flex: 1;
}

/* 强制输入框和按钮高度一致 */
.register-form :deep(.code-input .el-input__wrapper),
.code-button {
  height: 48px;
  box-sizing: border-box;
}

.code-button {
  flex-shrink: 0;
  min-width: 140px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: rgba(79, 172, 254, 0.1);
  color: #4facfe;
  border: 1px solid rgba(79, 172, 254, 0.3);
}

.code-button:not(:disabled):hover {
  background: rgba(79, 172, 254, 0.18);
  color: #4facfe;
  border-color: #4facfe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.15);
}

.code-button:disabled {
  background: #f5f7fa;
  color: #909399;
  border-color: #e4e7ed;
}

.password-strength {
  margin-top: 8px;
  font-size: 13px;
  animation: fadeIn 0.3s ease-out;
}

.strength-indicator {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.strength-indicator.weak {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fde2e2;
}

.strength-indicator.medium {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.strength-indicator.strong {
  color: #67c23a;
  background-color: #f0f9ff;
  border: 1px solid #d9ecff;
}

.register-button {
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

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(79, 172, 254, 0.4);
}

.register-button:active {
  transform: translateY(0);
}

.register-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
}

.register-footer span {
  margin-right: 8px;
}

.register-footer :deep(.el-link) {
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
  
  .register-content {
    max-width: 500px;
  }
  
  .register-card {
    padding: 45px 40px;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }

  .register-content {
    border-radius: 16px;
  }

  .register-card {
    padding: 35px 28px;
  }

  .brand-title {
    font-size: 20px;
  }

  .brand-subtitle {
    font-size: 13px;
  }

  .logo-icon {
    width: 46px;
    height: 46px;
  }

  .register-header {
    margin-bottom: 24px;
  }

  .register-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .verification-code-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .code-button {
    width: 100%;
    min-width: auto;
  }

  .register-button {
    height: 44px;
    font-size: 15px;
  }

  .auth-footer {
    position: static;
    margin-top: 24px;
  }
}

/* 响应式设计 - 小屏幕移动端 */
@media (max-width: 360px) {
  .register-card {
    padding: 28px 20px;
  }

  .brand-title {
    font-size: 18px;
  }

  .register-form :deep(.el-input__wrapper) {
    padding: 10px 14px;
  }

  .password-strength {
    font-size: 12px;
  }

  .strength-indicator {
    padding: 3px 10px;
  }
}
</style>
