<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getStudyStats } from '@/features/vocab/api'
import type { StudyStats } from '@/features/vocab/types'

const studyStats = ref<StudyStats | null>(null)
const statsError = ref(false)

onMounted(async () => {
  try {
    studyStats.value = (await getStudyStats()).data
  } catch (error) {
    statsError.value = true
    console.error('读取学习统计失败', error)
  }
})
</script>

<template>
  <main class="english-dashboard">
    <div class="dashboard-shell">
      <header class="dashboard-header">
        <router-link to="/" class="back-link">← 返回首页</router-link>
        <p class="eyebrow">YOUR ENGLISH SPACE</p>
        <h1>英语学习<span class="title-dot">.</span></h1>
        <p class="header-subtitle">先回忆，再理解。让单词和阅读一起成为每天的小习惯。</p>
      </header>

      <section class="today-strip" aria-label="今日单词学习数据">
        <div><span>今日已完成</span><strong>{{ studyStats?.todayReviewed ?? '—' }}</strong><small>次回忆</small></div>
        <div><span>今日新词</span><strong>{{ studyStats?.todayNew ?? '—' }}</strong><small>个单词</small></div>
        <div><span>当前待复习</span><strong>{{ studyStats?.dueCount ?? '—' }}</strong><small>张卡片</small></div>
      </section>
      <p v-if="statsError" class="stats-note" role="status">学习数据暂时无法读取，仍可继续学习。</p>

      <section class="learning-modules" aria-labelledby="modules-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">TWO WAYS TO GROW</p>
            <h2 id="modules-title">从哪里开始？</h2>
          </div>
          <p>选一个适合此刻的节奏。</p>
        </div>
        <div class="module-grid">
          <article class="module-card vocab-card">
            <div class="module-top"><span>01 / WORDS</span><span class="module-mark" aria-hidden="true">Aa</span></div>
            <div class="module-body">
              <h3>单词记忆</h3>
              <p>先完成到期复习，再认识今天的新词。每次回忆都为下次见面做好准备。</p>
            </div>
            <div class="module-actions">
              <router-link class="module-primary" to="/english/vocab/study">今日学习 <span aria-hidden="true">↗</span></router-link>
              <router-link class="module-secondary" to="/english/vocab">管理词书</router-link>
            </div>
          </article>
          <article class="module-card article-card">
            <div class="module-top"><span>02 / READING</span><span class="module-mark" aria-hidden="true">“</span></div>
            <div class="module-body">
              <h3>英语阅读</h3>
              <p>在完整语境里遇见词句。放慢一点，让阅读成为理解世界的另一种方式。</p>
            </div>
            <div class="module-actions">
              <router-link class="module-primary" to="/english/articles">浏览文章 <span aria-hidden="true">↗</span></router-link>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.english-dashboard { min-height: 100vh; background: var(--xl-bg); color: var(--xl-ink); }
.dashboard-shell { max-width: 1180px; margin: auto; padding: 24px 30px 88px; }
.dashboard-header { border-bottom: 1px solid var(--xl-border); padding-bottom: 38px; }
.back-link { display: inline-block; color: var(--xl-brand); text-decoration: none; font-size: 13px; font-weight: 700; padding: 9px 0; }
.back-link:hover { text-decoration: underline; }
.eyebrow { color: #66816a; font-size: 11px; font-weight: 800; letter-spacing: .18em; }
.dashboard-header .eyebrow { margin-top: 42px; }
.dashboard-header h1 { margin: 12px 0 15px; font: 700 clamp(44px, 6vw, 76px)/1.08 var(--xl-font-display); letter-spacing: -.04em; }
.title-dot { color: var(--xl-accent); }
.header-subtitle { color: var(--xl-ink-soft); font-size: 16px; line-height: 1.75; }
.today-strip { margin-top: 28px; display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); background: var(--xl-surface); }
.today-strip > div { min-height: 116px; padding: 23px 32px; display: flex; align-items: baseline; gap: 8px; border-right: 1px solid var(--xl-border); }
.today-strip > div:last-child { border-right: 0; }
.today-strip span { display: block; align-self: flex-start; color: var(--xl-ink-soft); font-size: 12px; margin-right: auto; }
.today-strip strong { font: 500 39px/1 var(--xl-font-display); }
.today-strip small { color: var(--xl-ink-soft); font-size: 12px; white-space: nowrap; }
.stats-note { margin-top: 10px; color: #8b6430; font-size: 12px; }
.learning-modules { margin-top: 66px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 24px; }
.section-heading h2 { margin-top: 8px; font: 650 34px/1.2 var(--xl-font-display); }
.section-heading > p { color: var(--xl-ink-soft); font-size: 13px; }
.module-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.module-card { min-height: 340px; display: flex; flex-direction: column; padding: 27px 30px 30px; border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); background: var(--xl-surface); transition: transform .2s, box-shadow .2s, border-color .2s; }
.module-card:hover { transform: translateY(-3px); border-color: #a9bda7; box-shadow: var(--xl-shadow-card); }
.module-top { display: flex; justify-content: space-between; align-items: start; color: #728d75; font-size: 10px; font-weight: 800; letter-spacing: .15em; }
.module-mark { color: #a2b9a0; font: italic 68px/.9 var(--xl-font-display); letter-spacing: 0; }
.article-card .module-mark { color: #c9af82; }
.module-body { margin-top: auto; max-width: 400px; }
.module-body h3 { margin: 0 0 12px; font: 650 30px/1.2 var(--xl-font-display); }
.module-body p { color: var(--xl-ink-soft); font-size: 14px; line-height: 1.8; }
.module-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 20px; margin-top: 26px; }
.module-primary { min-height: 44px; display: inline-flex; align-items: center; gap: 34px; padding: 0 17px; background: var(--xl-brand); color: #fff; border-radius: var(--xl-radius-sm); text-decoration: none; font-size: 13px; font-weight: 750; }
.module-primary:hover { background: var(--xl-brand-hover); }
.module-secondary { color: var(--xl-brand); font-size: 13px; font-weight: 700; text-decoration: none; }
.module-secondary:hover { text-decoration: underline; }
@media (max-width: 760px) {
  .dashboard-shell { padding: 16px 16px 60px; }
  .dashboard-header .eyebrow { margin-top: 30px; }
  .today-strip > div { min-height: 96px; padding: 17px 12px; flex-wrap: wrap; gap: 4px; }
  .today-strip span { flex-basis: 100%; }
  .today-strip strong { font-size: 30px; }
  .learning-modules { margin-top: 48px; }
  .section-heading { display: block; }
  .section-heading > p { margin-top: 9px; }
  .module-grid { grid-template-columns: 1fr; }
  .module-card { min-height: 300px; }
}
@media (prefers-reduced-motion: reduce) { .module-card:hover { transform: none; } }
</style>
