<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function handleCommand(command: string) {
  if (command === 'profile') {
    await router.push('/user/profile')
    return
  }
  if (command !== 'logout') return
  try {
    await userStore.logout()
    ElMessage.success('已退出登录')
    await router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
  }
}
</script>

<template>
  <div class="home-page">
    <header class="site-header">
      <div class="header-inner">
        <router-link to="/" class="brand" aria-label="学灵首页">
          <img src="/logo.svg" alt="" class="logo" />
          <span>学灵</span>
        </router-link>
        <el-dropdown trigger="click" @command="handleCommand">
          <button class="avatar-wrapper" type="button" aria-label="打开账户菜单">
            <el-avatar :size="34" :src="userStore.avatar" class="user-avatar">
              {{ userStore.username?.charAt(0)?.toUpperCase() || 'U' }}
            </el-avatar>
            <span class="username">{{ userStore.username || '学员' }}</span>
            <el-icon><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <main class="home-main">
      <header class="home-intro">
        <p class="eyebrow">学灵 / 学习首页</p>
        <h1>今天学什么？</h1>
      </header>
      <section class="subjects" aria-label="学习方向">
        <router-link to="/english" class="subject-card">
          <span class="subject-symbol" aria-hidden="true">Aa</span>
          <span class="subject-copy"><strong>英语学习</strong><small>单词记忆 · 文章阅读</small></span>
          <span class="card-arrow" aria-hidden="true">↗</span>
        </router-link>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: var(--xl-bg); }
.site-header { background: var(--xl-surface); border-bottom: 1px solid var(--xl-border); }
.header-inner { width: min(100% - 48px, 1060px); min-height: 76px; margin: auto; display: flex; align-items: center; gap: 42px; }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--xl-ink); text-decoration: none; font: 700 23px var(--xl-font-display); white-space: nowrap; }
.logo { width: 36px; height: 36px; object-fit: contain; }
.brand { margin-right: auto; }
.avatar-wrapper { display: flex; align-items: center; gap: 10px; border: 0; background: none; color: var(--xl-ink); cursor: pointer; padding: 6px; border-radius: var(--xl-radius-sm); }
.avatar-wrapper:hover { background: var(--xl-surface-muted); }
.user-avatar { background: var(--xl-brand); color: white; }
.username { font-size: 13px; font-weight: 700; }
.home-main { max-width: 1060px; margin: auto; padding: 76px 30px 90px; }
.eyebrow { color: #66816a; font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.home-intro h1 { margin: 10px 0 34px; font: 700 clamp(30px, 4vw, 43px)/1.2 var(--xl-font-display); }
.subject-card { width: min(100%, 620px); min-height: 175px; display: flex; align-items: center; gap: 24px; padding: 30px 36px; border: 1px solid #cbd9c9; border-radius: var(--xl-radius-lg); background: #eaf1e7; color: var(--xl-ink); text-decoration: none; transition: border-color .18s, background-color .18s, box-shadow .18s; }
.subject-card:hover { border-color: #95b096; background: #e3eddf; box-shadow: var(--xl-shadow-card); }
.subject-symbol { flex: none; width: 88px; height: 88px; display: grid; place-items: center; border-radius: 18px; background: var(--xl-surface); color: var(--xl-brand); font: italic 45px/1 var(--xl-font-display); }
.subject-copy { display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.subject-copy strong { font: 700 25px/1.2 var(--xl-font-display); }
.subject-copy small { color: var(--xl-ink-soft); font-size: 13px; }
.card-arrow { margin-left: auto; align-self: flex-end; color: var(--xl-brand); font-size: 25px; }
@media (max-width: 760px) {
  .header-inner { width: min(100% - 28px, 1060px); min-height: 66px; gap: 20px; }
  .username { display: none; }
  .home-main { padding: 50px 16px 60px; }
  .home-intro h1 { margin-bottom: 24px; }
  .subject-card { min-height: 145px; gap: 18px; padding: 22px; }
  .subject-symbol { width: 65px; height: 65px; border-radius: 13px; font-size: 34px; }
  .subject-copy strong { font-size: 21px; }
}
@media (max-width: 360px) {
  .subject-card { gap: 12px; padding: 18px; }
  .subject-symbol { width: 54px; height: 54px; font-size: 28px; }
  .subject-copy small { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) { .subject-card { transition: none; } }
</style>
