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
        <nav class="site-nav" aria-label="主导航">
          <router-link to="/" aria-current="page">首页</router-link>
          <router-link to="/english">英语学习</router-link>
        </nav>
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
      <section class="hero" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="eyebrow">XUELING · A PLACE TO LEARN</p>
          <h1 id="home-title">每天学一点，<br /><em>慢慢积蓄力量。</em></h1>
          <p class="hero-description">你好，{{ userStore.username || '同学' }}。从今天的单词开始，或找一篇文章安静地读完。</p>
          <div class="hero-actions">
            <router-link class="primary-link" to="/english/vocab/study">开始今日学习 <span aria-hidden="true">↗</span></router-link>
            <router-link class="secondary-link" to="/english/articles">浏览英语文章 <span aria-hidden="true">→</span></router-link>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <span class="art-ring ring-one"></span>
          <span class="art-ring ring-two"></span>
          <span class="art-letter">学</span>
          <span class="art-caption">LEARN WITH INTENTION<br />GROW WITH TIME</span>
        </div>
      </section>

      <section class="subjects" aria-labelledby="subjects-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">LEARNING SPACES</p>
            <h2 id="subjects-title">选择你的学习方向</h2>
          </div>
          <p>循序渐进，把每一次学习落到实处。</p>
        </div>
        <div class="subject-grid">
          <router-link to="/english" class="subject-card active-card">
            <span class="subject-index">01 / LANGUAGE</span>
            <span class="subject-symbol" aria-hidden="true">Aa</span>
            <span class="subject-bottom"><span><strong>英语学习</strong><small>单词记忆 · 文章阅读</small></span><span class="card-arrow" aria-hidden="true">↗</span></span>
          </router-link>
          <div class="subject-card upcoming-card" aria-label="数学思维，敬请期待">
            <span class="subject-index">02 / THINKING</span>
            <span class="subject-symbol" aria-hidden="true">∑</span>
            <span class="subject-bottom"><span><strong>数学思维</strong><small>敬请期待</small></span></span>
          </div>
          <div class="subject-card upcoming-card" aria-label="语文素养，敬请期待">
            <span class="subject-index">03 / LITERATURE</span>
            <span class="subject-symbol" aria-hidden="true">文</span>
            <span class="subject-bottom"><span><strong>语文素养</strong><small>敬请期待</small></span></span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: var(--xl-bg); }
.site-header { background: var(--xl-surface); border-bottom: 1px solid var(--xl-border); }
.header-inner { width: min(100% - 48px, 1180px); min-height: 76px; margin: auto; display: flex; align-items: center; gap: 48px; }
.brand { display: inline-flex; align-items: center; gap: 11px; color: var(--xl-ink); text-decoration: none; font: 700 23px var(--xl-font-display); white-space: nowrap; }
.logo { width: 36px; height: 36px; object-fit: contain; }
.site-nav { display: flex; align-items: center; gap: 28px; margin-right: auto; }
.site-nav a { text-decoration: none; color: var(--xl-ink-soft); font-size: 14px; font-weight: 650; padding: 27px 0 24px; border-bottom: 3px solid transparent; }
.site-nav a[aria-current='page'] { color: var(--xl-brand); border-color: var(--xl-brand); }
.site-nav a:hover { color: var(--xl-brand); }
.avatar-wrapper { display: flex; align-items: center; gap: 10px; border: 0; background: none; color: var(--xl-ink); cursor: pointer; padding: 6px; border-radius: var(--xl-radius-sm); }
.avatar-wrapper:hover { background: var(--xl-surface-muted); }
.user-avatar { background: var(--xl-brand); color: white; }
.username { font-size: 13px; font-weight: 700; }
.home-main { max-width: 1180px; margin: auto; padding: 38px 24px 88px; }
.hero { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(220px, .6fr); min-height: 390px; background: var(--xl-surface); border: 1px solid var(--xl-border); border-radius: var(--xl-radius-lg); overflow: hidden; }
.hero-copy { padding: clamp(38px, 5vw, 76px); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.eyebrow { color: #628168; font: 800 11px var(--xl-font-body); letter-spacing: .18em; }
.hero h1 { margin: 20px 0 22px; font: 700 clamp(38px, 4.2vw, 62px)/1.24 var(--xl-font-display); letter-spacing: -.035em; }
.hero h1 em { color: #66876c; font-style: normal; }
.hero-description { max-width: 460px; color: var(--xl-ink-soft); font-size: 15px; line-height: 1.85; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 22px; margin-top: 34px; }
.primary-link, .secondary-link { display: inline-flex; align-items: center; justify-content: space-between; gap: 28px; min-height: 48px; text-decoration: none; font-size: 14px; font-weight: 750; border-radius: var(--xl-radius-sm); }
.primary-link { padding: 0 22px; min-height: 54px; background: var(--xl-brand); color: #fff; box-shadow: 0 8px 18px #315b4024; }
.primary-link:hover { background: var(--xl-brand-hover); }
.secondary-link { color: var(--xl-brand); border-bottom: 1px solid #9caf9e; border-radius: 0; }
.secondary-link:hover { color: var(--xl-brand-hover); border-color: var(--xl-brand-hover); }
.hero-art { position: relative; min-height: 300px; display: grid; place-items: center; overflow: hidden; background: #e9eee4; border-left: 1px solid var(--xl-border); }
.art-ring { position: absolute; width: 360px; height: 360px; border: 1px solid #bccdbb; border-radius: 50%; }
.ring-one { transform: translate(30px, -25px); }
.ring-two { transform: translate(70px, 27px) scale(.75); }
.art-letter { z-index: 1; color: #345d42; font: 400 clamp(138px, 18vw, 220px)/1 'Songti SC', var(--xl-font-display); }
.art-caption { position: absolute; right: 26px; bottom: 25px; color: #59755e; font: 700 10px/1.6 var(--xl-font-body); letter-spacing: .15em; text-align: right; }
.subjects { margin-top: 66px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 24px; }
.section-heading h2 { margin-top: 8px; font: 650 clamp(27px, 3vw, 35px)/1.2 var(--xl-font-display); }
.section-heading > p { color: var(--xl-ink-soft); font-size: 13px; }
.subject-grid { display: grid; grid-template-columns: 1.35fr .8fr .8fr; gap: 18px; }
.subject-card { min-height: 260px; padding: 22px; display: flex; flex-direction: column; text-decoration: none; border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); background: var(--xl-surface); color: var(--xl-ink); }
.active-card { transition: transform .2s, box-shadow .2s, border-color .2s; }
.active-card:hover { transform: translateY(-3px); border-color: #a9bda7; box-shadow: var(--xl-shadow-card); }
.subject-index { color: #6e8b72; font-size: 10px; font-weight: 800; letter-spacing: .16em; }
.subject-symbol { flex: 1; display: grid; place-items: center; color: #789a7e; font: italic 90px var(--xl-font-display); }
.subject-bottom { display: flex; justify-content: space-between; align-items: end; gap: 10px; }
.subject-bottom span:first-child { display: flex; flex-direction: column; gap: 6px; }
.subject-bottom strong { font-size: 18px; }
.subject-bottom small { color: var(--xl-ink-soft); font-size: 12px; }
.card-arrow { color: var(--xl-brand); font-size: 25px; }
.upcoming-card { background: #f3f3ec; color: #657269; min-height: 210px; }
.upcoming-card .subject-symbol { color: #b2bdb0; }
.upcoming-card .subject-bottom strong { font-size: 16px; font-weight: 600; }
.primary-link, .secondary-link { min-height: var(--xl-button-height); padding: 0 20px; border-radius: var(--xl-button-radius); border: 1px solid transparent; font-weight: 800; letter-spacing: .01em; transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease, border-color .18s ease; }
.primary-link { min-height: 52px; border-color: #254c35; box-shadow: var(--xl-button-shadow); }
.primary-link:hover { transform: translateY(-2px); box-shadow: var(--xl-button-shadow-hover); }
.primary-link:active { transform: translateY(1px); box-shadow: var(--xl-button-shadow-pressed); }
.secondary-link { background: var(--xl-surface); border-color: #b8cbb9; box-shadow: var(--xl-outline-shadow); }
.secondary-link:hover { background: #edf3e9; border-color: #8eae93; transform: translateY(-2px); box-shadow: 0 4px 0 #d7e2d5; }
.secondary-link:active { transform: translateY(1px); box-shadow: none; }
@media (max-width: 760px) {
  .header-inner { width: min(100% - 28px, 1180px); gap: 20px; min-height: 66px; }
  .site-nav { gap: 14px; }
  .site-nav a { font-size: 12px; padding: 23px 0 20px; }
  .username { display: none; }
  .home-main { padding: 18px 14px 60px; }
  .hero { grid-template-columns: 1fr; }
  .hero-copy { padding: 36px 28px; }
  .hero-art { display: none; }
  .art-ring { width: 250px; height: 250px; }
  .art-letter { font-size: 130px; }
  .subject-grid { grid-template-columns: 1fr; }
  .subject-card { min-height: 175px; }
  .upcoming-card { min-height: 130px; }
  .subject-symbol { font-size: 58px; }
  .section-heading { display: block; }
  .section-heading > p { margin-top: 10px; }
}
@media (prefers-reduced-motion: reduce) { .active-card:hover, .primary-link:hover, .secondary-link:hover, .primary-link:active, .secondary-link:active { transform: none; } }
</style>
