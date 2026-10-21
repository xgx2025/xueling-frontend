<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getStudyStats } from '@/features/vocab/api'
import type { StudyStats } from '@/features/vocab/types'

const studyStats = ref<StudyStats | null>(null)
const statsError = ref(false)
const focusTitle = computed(() => {
  if (!studyStats.value) return '从今天的学习开始'
  if (studyStats.value.dueCount > 0) return `${studyStats.value.dueCount} 张卡片等你复习`
  return studyStats.value.todayReviewed > 0 ? '到期复习已清空' : '看看今天的学习计划'
})
const focusCopy = computed(() => studyStats.value?.dueCount
  ? '先回忆到期单词，再认识新词。'
  : '进入今日学习，看看接下来可以学什么。')

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

      <section class="daily-focus" aria-labelledby="daily-focus-title">
        <div>
          <p class="focus-kicker">TODAY'S FOCUS · 今日重点</p>
          <h2 id="daily-focus-title">{{ focusTitle }}</h2>
          <p>{{ focusCopy }}</p>
        </div>
        <router-link to="/english/vocab/study" class="focus-action">进入今日学习 <span aria-hidden="true">↗</span></router-link>
      </section>

      <section class="today-strip" aria-label="今日单词学习数据">
        <div class="due-stat"><span>当前待复习</span><strong>{{ studyStats?.dueCount ?? '—' }}</strong><small>张卡片</small></div>
        <div><span>今日已完成</span><strong>{{ studyStats?.todayReviewed ?? '—' }}</strong><small>次回忆</small></div>
        <div><span>今日新词</span><strong>{{ studyStats?.todayNew ?? '—' }}</strong><small>个单词</small></div>
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
              <router-link class="module-secondary" to="/english/vocab">管理词书 <span aria-hidden="true">→</span></router-link>
            </div>
          </article>
          <article class="module-card article-card">
            <div class="module-top"><span>02 / READING</span><span class="module-mark" aria-hidden="true">“</span></div>
            <div class="module-body">
              <h3>英语阅读</h3>
              <p>在完整语境里遇见词句。放慢一点，让阅读成为理解世界的另一种方式。</p>
            </div>
            <div class="module-actions">
              <router-link class="module-secondary" to="/english/articles">浏览文章 <span aria-hidden="true">↗</span></router-link>
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
.daily-focus { display: flex; align-items: end; justify-content: space-between; gap: 30px; margin-top: 28px; padding: clamp(26px, 4vw, 42px); border-radius: var(--xl-radius-md); background: var(--xl-brand); color: #fffefa; }
.focus-kicker { color: #c8d9c4; font-size: 11px; font-weight: 800; letter-spacing: .14em; }
.daily-focus h2 { margin: 12px 0 8px; font: 650 clamp(27px, 3vw, 39px)/1.2 var(--xl-font-display); }
.daily-focus p:not(.focus-kicker) { color: #dfebdc; line-height: 1.6; }
.focus-action { flex: none; display: inline-flex; justify-content: space-between; align-items: center; gap: 22px; padding: 13px 18px; border-radius: var(--xl-radius-sm); background: #edc982; color: #263d2d; font-size: 14px; font-weight: 800; text-decoration: none; }
.focus-action:hover { background: #f7daa1; }
.today-strip { margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); background: var(--xl-surface); }
.today-strip > div { min-height: 92px; padding: 20px 24px; display: flex; align-items: baseline; gap: 8px; border-right: 1px solid var(--xl-border); }
.today-strip > div:last-child { border-right: 0; }
.today-strip span { display: block; align-self: flex-start; color: var(--xl-ink-soft); font-size: 12px; margin-right: auto; }
.today-strip strong { font: 600 31px/1 var(--xl-font-display); }
.today-strip .due-stat strong { color: var(--xl-brand); }
.today-strip small { color: var(--xl-ink-soft); font-size: 12px; white-space: nowrap; }
.stats-note { margin-top: 10px; color: #8b6430; font-size: 12px; }
.learning-modules { margin-top: 48px; }
.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 24px; }
.section-heading h2 { margin-top: 8px; font: 650 34px/1.2 var(--xl-font-display); }
.section-heading > p { color: var(--xl-ink-soft); font-size: 13px; }
.module-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.module-card { min-height: 260px; display: flex; flex-direction: column; padding: 27px 30px 30px; border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); background: var(--xl-surface); transition: transform .2s, box-shadow .2s, border-color .2s; }
.module-card:hover { transform: translateY(-3px); border-color: #a9bda7; box-shadow: var(--xl-shadow-card); }
.module-top { display: flex; justify-content: space-between; align-items: start; color: #728d75; font-size: 10px; font-weight: 800; letter-spacing: .15em; }
.module-mark { color: #a2b9a0; font: italic 68px/.9 var(--xl-font-display); letter-spacing: 0; }
.article-card .module-mark { color: #c9af82; }
.module-body { margin-top: auto; max-width: 400px; }
.module-body h3 { margin: 0 0 12px; font: 650 30px/1.2 var(--xl-font-display); }
.module-body p { color: var(--xl-ink-soft); font-size: 14px; line-height: 1.8; }
.module-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 20px; margin-top: 26px; }
.module-secondary { color: var(--xl-brand); font-size: 14px; font-weight: 800; text-decoration: none; }
.module-secondary:hover { text-decoration: underline; }
.focus-action, .module-secondary { min-height: var(--xl-button-height); display: inline-flex; align-items: center; justify-content: space-between; gap: 18px; border-radius: var(--xl-button-radius); font-size: 14px; font-weight: 800; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease, border-color .18s ease; }
.focus-action { padding: 0 20px; border: 1px solid #d7ae68; box-shadow: var(--xl-gold-shadow); }
.focus-action:hover { transform: translateY(-2px); box-shadow: 0 4px 0 #b48543, 0 12px 20px rgba(20, 38, 27, 0.2); }
.focus-action:active { transform: translateY(1px); box-shadow: 0 1px 0 #b48543; }
.module-secondary { padding: 0 17px; background: var(--xl-surface); border: 1px solid #b8cbb9; box-shadow: var(--xl-outline-shadow); }
.module-secondary:hover { background: #edf3e9; border-color: #8eae93; text-decoration: none; transform: translateY(-2px); box-shadow: 0 4px 0 #d7e2d5; }
.module-secondary:active { transform: translateY(1px); box-shadow: none; }
@media (max-width: 760px) {
  .dashboard-shell { padding: 16px 16px 60px; }
  .dashboard-header .eyebrow { margin-top: 30px; }
  .daily-focus { align-items: stretch; flex-direction: column; gap: 22px; }
  .focus-action { align-self: flex-start; }
  .today-strip > div { min-height: 96px; padding: 17px 12px; flex-wrap: wrap; gap: 4px; }
  .today-strip span { flex-basis: 100%; }
  .today-strip strong { font-size: 30px; }
  .learning-modules { margin-top: 48px; }
  .section-heading { display: block; }
  .section-heading > p { margin-top: 9px; }
  .module-grid { grid-template-columns: 1fr; }
  .module-card { min-height: 230px; }
}
@media (max-width: 430px) { .today-strip strong { font-size: 25px; }.today-strip small { white-space: normal; } }
@media (prefers-reduced-motion: reduce) { .module-card:hover, .focus-action:hover, .module-secondary:hover, .focus-action:active, .module-secondary:active { transform: none; } }
</style>
