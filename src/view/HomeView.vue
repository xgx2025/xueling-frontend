<template>
  <div class="home-container">
    <h1>欢迎来到学灵智能学习平台</h1>
    <p>您已成功登录！</p>
    <el-button @click="handleLogout" type="danger">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const tokenStore = useTokenStore()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #409eff;
}

p {
  margin-bottom: 30px;
  font-size: 16px;
  color: #606266;
}
</style>
