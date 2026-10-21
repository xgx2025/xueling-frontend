<template>
  <main class="vocab-page">
    <div class="vocab-shell">
      <header class="page-header">
        <button class="back-link" type="button" @click="router.push('/english')">← 英语学习中心</button>
        <button class="header-create" type="button" @click="dialogVisible = true">＋ 新建单词本</button>
      </header>

      <section class="page-intro" aria-labelledby="vocab-title">
        <div>
          <p class="eyebrow">YOUR WORD COLLECTION / 单词学习</p>
          <h1 id="vocab-title">把每个单词，<br /><em>慢慢记牢。</em></h1>
          <p class="intro-copy">从今天该复习的词开始，再认识一点新词。每次学习都有清楚的下一步。</p>
        </div>
        <div class="intro-mark" aria-hidden="true"><span>W</span><small>WORDS<br />& MEMORY</small></div>
      </section>

      <section class="today-panel" aria-labelledby="today-title">
        <div class="today-main">
          <p class="panel-kicker">TODAY'S FOCUS · 今日计划</p>
          <h2 id="today-title">{{ todayHeading }}</h2>
          <p>{{ todayCopy }}</p>
          <button class="today-start" type="button" @click="router.push('/english/vocab/study')">
            进入今日学习 <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="today-metrics" aria-label="今日学习数据">
          <div><strong>{{ today?.dueCount ?? '—' }}</strong><span>待复习</span></div>
          <div><strong>{{ today?.newRemaining ?? '—' }}</strong><span>可学新词</span></div>
          <div><strong>{{ today?.todayReviewed ?? '—' }}</strong><span>今日已完成</span></div>
        </div>
      </section>

      <section class="collection" aria-labelledby="collection-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">YOUR LIBRARY</p>
            <h2 id="collection-title">我的词书 <span>{{ wordBooks.length }}</span></h2>
          </div>
          <p>选择词书管理单词，或将它加入每日学习计划。</p>
        </div>

        <div v-if="loadingBooks" class="book-grid" aria-label="正在加载词书">
          <div v-for="index in 3" :key="index" class="book-skeleton" aria-hidden="true"></div>
        </div>
        <div v-else-if="booksError" class="collection-state" role="alert">
          <span class="state-symbol" aria-hidden="true">↻</span>
          <h3>词书暂时没有加载出来</h3>
          <p>{{ booksError }}</p>
          <button type="button" @click="fetchWordBooks">重新加载</button>
        </div>
        <div v-else-if="wordBooks.length === 0" class="collection-state">
          <span class="state-symbol" aria-hidden="true">＋</span>
          <h3>从第一本词书开始</h3>
          <p>创建自己的词书，收集想记住的单词。</p>
          <button type="button" @click="dialogVisible = true">创建单词本</button>
        </div>
        <div v-else class="book-grid">
          <article v-for="(book, index) in wordBooks" :key="book.id" class="book-card">
            <div class="book-cover" :style="{ background: book.color }">
              <span class="cover-index">COLLECTION / {{ String(index + 1).padStart(2, '0') }}</span>
              <span class="book-icon" aria-hidden="true">{{ book.icon }}</span>
              <span class="cover-bottom">XUELING · VOCABULARY</span>
            </div>
            <div class="book-body">
              <div class="book-title-row">
                <h3>{{ book.name }}</h3>
                <span class="book-count">{{ book.wordCount }} 词</span>
              </div>
              <span v-if="book.studyEnabled" class="plan-status">✓ 已加入每日计划</span>
              <div class="progress-label">
                <span>学习覆盖率 · 已学习 {{ book.learnedCount ?? 0 }} / {{ book.wordCount }}</span>
                <strong :aria-label="'学习覆盖率 ' + book.learningCoverage + '%'">{{ book.learningCoverage }}%</strong>
              </div>
              <div class="progress-track" role="progressbar" :aria-valuenow="Math.min(100, Math.max(0, book.learningCoverage))" aria-valuemin="0" aria-valuemax="100" :aria-label="book.name + ' 学习覆盖率'">
                <span :style="{ width: Math.min(100, Math.max(0, book.learningCoverage)) + '%' }"></span>
              </div>
              <div class="book-actions">
                <button class="open-book" :class="{ quiet: !book.studyEnabled }" type="button" @click="handleBookClick(book.id)">查看词书 <span aria-hidden="true">↗</span></button>
                <button class="plan-toggle" :class="{ enabled: book.studyEnabled }" type="button" :disabled="busyBookId === book.id" :aria-pressed="!!book.studyEnabled" @click="toggleBook(book)">
                  {{ busyBookId === book.id ? '更新中…' : book.studyEnabled ? '✓ 已加入计划' : '＋ 加入计划' }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>

    <el-dialog v-model="dialogVisible" title="新建单词本" width="min(92vw, 480px)" align-center>
      <el-form label-position="top" @submit.prevent="createBook">
        <el-form-item label="词书名称">
          <el-input v-model="newBookForm.name" maxlength="30" show-word-limit placeholder="例如：四级核心词汇" />
        </el-form-item>
        <el-form-item label="封面颜色">
          <div class="color-options" role="group" aria-label="选择封面颜色">
            <button v-for="(color, index) in presetColors" :key="color" class="color-circle" :class="{ active: newBookForm.color === color }" :style="{ background: color }" type="button" :aria-label="'封面颜色 ' + (index + 1)" :aria-pressed="newBookForm.color === color" @click="newBookForm.color = color">
              <span v-if="newBookForm.color === color" aria-hidden="true">✓</span>
            </button>
          </div>
        </el-form-item>
        <el-form-item label="封面图标">
          <div class="icon-options" role="group" aria-label="选择封面图标">
            <button v-for="(icon, index) in presetIcons" :key="index" class="icon-item" :class="{ active: newBookForm.icon === icon }" type="button" :aria-label="'封面图标 ' + icon" :aria-pressed="newBookForm.icon === icon" @click="newBookForm.icon = icon">{{ icon }}</button>
          </div>
        </el-form-item>
        <div class="dialog-actions">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" native-type="submit" :loading="creatingBook" :disabled="!newBookForm.name.trim()" @click="createBook">创建词书</el-button>
        </div>
      </el-form>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createWordBook, getTodayStudy, getWordBooks, setStudyBookEnabled } from '@/features/vocab/api'
import type { TodayStudy, WordBookVo } from '@/features/vocab/types'

type DisplayBook = WordBookVo & { color: string; icon: string }

const router = useRouter()
const dialogVisible = ref(false)
const creatingBook = ref(false)
const loadingBooks = ref(true)
const booksError = ref('')
const today = ref<TodayStudy | null>(null)
const busyBookId = ref<string | null>(null)
const wordBooks = ref<DisplayBook[]>([])
const presetColors = [
  'linear-gradient(145deg, #355e49, #78917b)',
  'linear-gradient(145deg, #8b513f, #c98f71)',
  'linear-gradient(145deg, #555e75, #8d9bb0)',
  'linear-gradient(145deg, #937947, #c8ac70)',
  'linear-gradient(145deg, #775c72, #b494aa)',
  'linear-gradient(145deg, #536c71, #92aaab)'
]
const presetIcons = ['📘', '📖', '📚', '📕', '📗', '📙', '🎓', '🗣️', '📝', '🧠', '🌟', '🔥']
const newBookForm = ref({ name: '', color: presetColors[0]!, icon: presetIcons[0]! })

const todayHeading = computed(() => {
  if (!today.value) return '先从今天的单词开始'
  if (today.value.dueCount > 0) return '有单词等你再见一面'
  if (today.value.newRemaining > 0) return '今天可以认识一些新词'
  return '今天的学习已完成'
})
const todayCopy = computed(() => {
  if (!today.value) return '打开学习计划，看看今天有哪些任务。'
  if (today.value.dueCount > 0) return '先回忆到期单词，再学习新词，会记得更稳。'
  if (today.value.newRemaining > 0) return '到期复习已完成，接下来学习几个新单词。'
  return '做得好。可以查看计划，或整理你的词书。'
})

async function fetchWordBooks() {
  loadingBooks.value = true
  booksError.value = ''
  try {
    const response = await getWordBooks()
    if (response.code !== 0 || !response.data) throw new Error(response.msg || '请稍后重试。')
    wordBooks.value = response.data.map((book, index) => ({
      ...book,
      learningCoverage: book.learningCoverage ?? book.mastery ?? 0,
      color: book.color || presetColors[index % presetColors.length]!,
      icon: book.icon || presetIcons[index % presetIcons.length]!
    }))
  } catch (error: any) {
    booksError.value = error?.msg || error?.message || '请检查网络后重试。'
  } finally {
    loadingBooks.value = false
  }
}

async function fetchToday() {
  try { today.value = (await getTodayStudy()).data }
  catch { today.value = null }
}

async function toggleBook(book: DisplayBook) {
  if (busyBookId.value) return
  busyBookId.value = book.id
  try {
    await setStudyBookEnabled(book.id, !book.studyEnabled)
    book.studyEnabled = !book.studyEnabled
    await fetchToday()
    ElMessage.success(book.studyEnabled ? '已加入学习计划' : '已移出学习计划')
  } catch (error: any) {
    ElMessage.error(error?.msg || '更新学习计划失败')
  } finally {
    busyBookId.value = null
  }
}

function handleBookClick(id: string) { void router.push('/english/vocab/book/' + id) }

async function createBook() {
  const name = newBookForm.value.name.trim()
  if (!name || creatingBook.value) return
  creatingBook.value = true
  try {
    const response = await createWordBook({ ...newBookForm.value, name })
    if (response.code !== 0) throw new Error(response.msg || '创建失败')
    dialogVisible.value = false
    newBookForm.value = { name: '', color: presetColors[0]!, icon: presetIcons[0]! }
    await fetchWordBooks()
    ElMessage.success('词书已创建')
  } catch (error: any) {
    ElMessage.error(error?.msg || error?.message || '创建失败，请稍后重试')
  } finally {
    creatingBook.value = false
  }
}

onMounted(() => { void fetchToday(); void fetchWordBooks() })
</script>

<style scoped>
.vocab-page { --ink: #243b2d; --muted: #667469; --line: #dce2d7; min-height: 100vh; background: #f5f5ee; color: var(--ink); font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif; }
.vocab-shell { max-width: 1180px; margin: 0 auto; padding: 24px 30px 88px; }
button { font: inherit; cursor: pointer; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 18px; border-bottom: 1px solid var(--line); }
.back-link { border: 0; background: none; color: #4c6853; padding: 9px 0; font-weight: 650; }
.header-create { border: 1px solid #315b3f; color: #315b3f; background: transparent; border-radius: 9px; padding: 10px 16px; font-weight: 700; }
.header-create:hover, .header-create:focus-visible { background: #e8efe6; }
.page-intro { display: flex; justify-content: space-between; gap: 36px; align-items: end; padding: 55px 4px 45px; }
.eyebrow, .panel-kicker { font-size: 11px; letter-spacing: .19em; font-weight: 800; color: #66816a; }
.page-intro h1 { font-family: Georgia, 'Songti SC', serif; font-size: clamp(43px, 6vw, 76px); line-height: 1.14; letter-spacing: -.04em; margin: 15px 0 20px; }
.page-intro em { color: #69806a; font-style: normal; }
.intro-copy { max-width: 510px; color: var(--muted); font-size: 16px; line-height: 1.8; }
.intro-mark { width: 220px; height: 220px; flex: none; border: 1px solid #cbd8ca; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; transform: rotate(-9deg); color: #a2b29c; }
.intro-mark span { font: italic 112px/.9 Georgia, serif; }.intro-mark small { margin-top: 12px; text-align: center; font: 700 9px/1.5 Georgia, serif; letter-spacing: .22em; }
.today-panel { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); gap: 34px; background: #244b35; color: #f7f5e8; border-radius: 18px; padding: 38px 45px; overflow: hidden; position: relative; }
.today-panel::after { content: ''; position: absolute; width: 280px; height: 280px; border: 1px solid #ffffff20; border-radius: 50%; right: -100px; top: -130px; pointer-events: none; }
.panel-kicker { color: #bad0ac; margin-bottom: 12px; }.today-panel h2 { font: 600 clamp(25px, 3vw, 35px)/1.25 Georgia, 'Songti SC', serif; margin: 0 0 12px; }.today-panel p:not(.panel-kicker) { color: #d6e1d3; line-height: 1.7; }
.today-start { margin-top: 24px; background: #edc982; color: #26402c; border: 0; border-radius: 9px; padding: 13px 18px; font-weight: 800; min-height: 46px; }.today-start span { margin-left: 16px; }.today-start:hover { background: #f5dba6; }
.today-metrics { display: grid; grid-template-columns: repeat(3, 1fr); align-self: center; border-left: 1px solid #ffffff35; padding-left: 30px; }.today-metrics div { display: flex; flex-direction: column; gap: 8px; text-align: center; }.today-metrics strong { font: 500 clamp(29px, 3.5vw, 46px)/1 Georgia, serif; }.today-metrics span { font-size: 12px; color: #d3dfd0; white-space: nowrap; }
.collection { margin-top: 62px; }.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 23px; }.section-heading h2 { font: 600 31px/1.2 Georgia, 'Songti SC', serif; margin: 8px 0 0; }.section-heading h2 span { color: #91a58e; font: 500 17px Georgia, serif; vertical-align: top; margin-left: 6px; }.section-heading > p { color: var(--muted); font-size: 13px; }
.book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(265px, 1fr)); gap: 20px; }.book-card { background: #fffefa; border: 1px solid #e4e8dc; border-radius: 13px; overflow: hidden; transition: transform .2s, box-shadow .2s; }.book-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px #29463113; }
.book-cover { height: 155px; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 19px; color: white; position: relative; }.book-cover::after { content: ''; position: absolute; width: 185px; height: 185px; border: 1px solid #ffffff55; border-radius: 50%; right: -28px; top: -65px; }.cover-index, .cover-bottom { font: 700 9px Georgia, serif; letter-spacing: .16em; opacity: .85; }.book-icon { font-size: 46px; align-self: center; line-height: 1; filter: drop-shadow(0 5px 10px #0003); }
.book-body { padding: 19px; }.book-title-row { display: flex; align-items: start; justify-content: space-between; gap: 8px; min-height: 42px; }.book-title-row h3 { font-size: 17px; line-height: 1.45; overflow-wrap: anywhere; }.book-count { white-space: nowrap; font-size: 12px; color: #607360; background: #eaf0e8; border-radius: 5px; padding: 5px 7px; }.plan-status { display: inline-block; margin: 0 0 10px; color: #315b40; font-size: 12px; font-weight: 750; }.progress-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; margin: 4px 0 10px; }.progress-label strong { color: var(--ink); }.progress-track { background: #e8ede5; height: 6px; border-radius: 99px; overflow: hidden; }.progress-track span { display: block; background: #638c69; height: 100%; border-radius: inherit; }.book-actions { display: flex; gap: 8px; margin-top: 19px; }.book-actions button { min-height: 42px; border-radius: 7px; font-size: 12px; font-weight: 750; }.open-book { flex: 1; border: 0; background: #315b40; color: white; text-align: left; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; }.open-book:hover { background: #224a32; }.open-book.quiet { flex: 0 0 auto; border: 1px solid #c8d5c8; background: transparent; color: #315b40; gap: 8px; }.open-book.quiet:hover { background: #eaf1e8; }.plan-toggle { border: 1px solid #315b40; background: #315b40; color: white; padding: 0 12px; }.plan-toggle:not(.enabled) { order: -1; flex: 1; }.plan-toggle.enabled { background: #eaf1e8; border-color: #c8d5c8; color: #3a6346; }.plan-toggle:not(.enabled):hover { background: #224a32; }.plan-toggle.enabled:hover { background: #deebdc; }.plan-toggle:disabled { opacity: .55; cursor: wait; }
.collection-state { background: #fffefa; border: 1px dashed #c9d4c5; text-align: center; padding: 54px 18px; border-radius: 13px; }.state-symbol { display: inline-grid; place-items: center; width: 62px; height: 62px; border-radius: 50%; color: #497252; background: #eaf1e8; font-size: 30px; }.collection-state h3 { margin: 16px 0 7px; font: 600 23px Georgia, 'Songti SC', serif; }.collection-state p { color: var(--muted); margin-bottom: 20px; }.collection-state button { border: 0; color: white; background: #315b40; padding: 11px 19px; border-radius: 7px; }.book-skeleton { height: 345px; border-radius: 13px; background: linear-gradient(100deg, #e8ede5 20%, #f8faf5 40%, #e8ede5 60%); background-size: 200% 100%; animation: shimmer 1.5s linear infinite; }@keyframes shimmer { to { background-position-x: -200%; } }
.color-options, .icon-options { display: flex; flex-wrap: wrap; gap: 10px; }.color-circle, .icon-item { width: 43px; height: 43px; display: grid; place-items: center; border: 2px solid transparent; border-radius: 8px; }.color-circle.active, .icon-item.active { outline: 2px solid #345f43; outline-offset: 2px; }.color-circle span { color: white; font-weight: 900; }.icon-item { font-size: 23px; background: #eef2eb; }.dialog-actions { display: flex; justify-content: end; gap: 8px; margin-top: 20px; }
.header-create, .today-start, .book-actions button, .collection-state button { min-height: var(--xl-button-height); border-radius: var(--xl-button-radius); font-size: 13px; font-weight: 800; transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease, border-color .18s ease; }
.header-create, .open-book.quiet, .plan-toggle.enabled { background: var(--xl-surface); border-color: #b8cbb9; color: var(--xl-brand); box-shadow: var(--xl-outline-shadow); }
.header-create:hover, .open-book.quiet:hover, .plan-toggle.enabled:hover { background: #edf3e9; border-color: #8eae93; transform: translateY(-2px); box-shadow: 0 4px 0 #d7e2d5; }
.today-start { padding-inline: 21px; border: 1px solid #d7ae68; box-shadow: var(--xl-gold-shadow); }
.today-start:hover { transform: translateY(-2px); box-shadow: 0 4px 0 #b48543, 0 12px 20px rgba(20, 38, 27, .2); }
.open-book:not(.quiet), .plan-toggle:not(.enabled), .collection-state button { border: 1px solid #254c35; background: var(--xl-brand); box-shadow: var(--xl-button-shadow); }
.open-book:not(.quiet):hover, .plan-toggle:not(.enabled):hover, .collection-state button:hover { background: var(--xl-brand-hover); transform: translateY(-2px); box-shadow: var(--xl-button-shadow-hover); }
.today-start:active, .header-create:active, .book-actions button:active:not(:disabled), .collection-state button:active { transform: translateY(1px); box-shadow: none; }
.book-actions button:disabled { box-shadow: none; transform: none; }
button:focus-visible { outline: 3px solid #dbaa53; outline-offset: 3px; }
@media (max-width: 760px) { .vocab-shell { padding: 16px 16px 60px; }.page-intro { padding: 38px 0 32px; }.intro-mark { display: none; }.today-panel { grid-template-columns: 1fr; padding: 28px 25px; gap: 28px; }.today-metrics { padding: 20px 0 0; border-left: 0; border-top: 1px solid #ffffff35; }.section-heading { align-items: start; flex-direction: column; }.collection { margin-top: 44px; } }
@media (max-width: 440px) { .header-create { padding: 9px 10px; font-size: 12px; }.page-intro h1 { font-size: 43px; }.book-grid { grid-template-columns: 1fr; }.today-metrics strong { font-size: 29px; } }
@media (prefers-reduced-motion: reduce) { .book-card, .header-create, .today-start, .book-actions button, .collection-state button { transition: none; }.book-card:hover, .header-create:hover, .today-start:hover, .book-actions button:hover, .book-actions button:active, .collection-state button:hover { transform: none; }.book-skeleton { animation: none; } }
</style>
