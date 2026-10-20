<template>
  <main class="study-page">
    <div class="study-shell">
      <header class="study-header">
        <button class="back-link" type="button" @click="router.push('/english/vocab')">← 返回词书</button>
        <span class="eyebrow">XUELING · DAILY STUDY</span>
        <button class="settings-link" type="button" @click="openSettings">学习设置</button>
      </header>

      <section class="intro">
        <div>
          <p class="section-kicker">每日一点，记得更久</p>
          <h1>今日学习<span class="title-dot">.</span></h1>
          <p class="intro-copy">先回忆，再看答案。每一次回答都会决定下次见面的时间。</p>
        </div>
        <div class="today-date">{{ dateLabel }}</div>
      </section>

      <section class="metrics" aria-label="今日学习概览">
        <div class="metric"><span>待复习</span><strong>{{ today?.dueCount ?? '—' }}</strong></div>
        <div class="metric"><span>可学新词</span><strong>{{ today?.newRemaining ?? '—' }}</strong></div>
        <div class="metric"><span>今日已完成</span><strong>{{ today?.todayReviewed ?? '—' }}</strong></div>
      </section>

      <div v-if="loading" class="state-panel">正在整理今天的单词…</div>
      <div v-else-if="loadError" class="state-panel">
        <h2>暂时无法读取学习计划</h2>
        <p>{{ loadError }}</p>
        <button class="primary-button" type="button" @click="loadToday">重新加载</button>
      </div>

      <section v-else-if="currentCard" class="session" aria-label="学习卡片">
        <div class="session-meta">
          <span class="pill">{{ currentCard.newCard ? '新词' : '到期复习' }}</span>
          <span>完成一张，保存一张</span>
        </div>
        <div class="flashcard" :class="{ revealed }">
          <div class="card-topline"><span>ENGLISH → 中文</span><span>NO. {{ today!.todayReviewed + 1 }}</span></div>
          <div class="word-content">
            <h2>{{ currentCard.word }}</h2>
            <p v-if="currentCard.phonetic" class="phonetic">/{{ currentCard.phonetic }}/</p>
            <button class="audio-button" type="button" aria-label="播放读音" @click="playAudio(currentCard.word)">♫ 听发音</button>
          </div>
          <div v-if="revealed" class="answer">
            <span class="answer-label">答案</span>
            <p class="meaning">{{ currentCard.meaning }}</p>
            <div v-if="currentCard.example" class="example">
              <p>{{ currentCard.example }}</p>
              <p v-if="currentCard.exampleTranslation">{{ currentCard.exampleTranslation }}</p>
            </div>
          </div>
          <div v-else class="recall-hint">先在心里说出释义，再揭晓答案。</div>
        </div>

        <div class="study-actions">
          <button v-if="!revealed" class="reveal-button" type="button" @click="reveal">显示答案 <span>↗</span></button>
          <template v-else-if="pendingReview">
            <p class="save-error">{{ saveError }}</p>
            <button class="primary-button" type="button" :disabled="saving" @click="sendReview(pendingReview)">
              {{ saving ? '正在保存…' : '重试保存本次评分' }}
            </button>
            <button class="text-button" type="button" :disabled="saving" @click="refreshAfterConflict">刷新学习计划</button>
          </template>
          <template v-else>
            <p class="rate-prompt">刚才回忆得怎么样？</p>
            <div class="rating-grid">
              <button v-for="option in ratingOptions" :key="option.value" type="button" :disabled="saving"
                :class="['rating-button', option.className]" @click="rate(option.value)">
                <strong>{{ option.label }}</strong><span>{{ option.hint }}</span>
              </button>
            </div>
            <p class="rating-note">没有想起来请选“忘记了”；“困难”表示最终想起来了。</p>
          </template>
        </div>
      </section>

      <section v-else class="state-panel complete-panel">
        <div class="complete-mark">✓</div>
        <p class="section-kicker">STUDY SESSION</p>
        <h2>当前任务完成</h2>
        <p v-if="today?.nextDueAt">下一张卡片预计在 {{ formatDue(today.nextDueAt) }} 到期。</p>
        <p v-else-if="today?.newRemaining && today.newRemaining > 0">当前启用的词书没有更多未学单词。</p>
        <p v-else>今天已完成 {{ today?.todayReviewed ?? 0 }} 次回忆，稍后回来看看新的到期卡片。</p>
        <div class="complete-actions">
          <button class="primary-button" type="button" @click="loadToday">检查新任务</button>
          <button class="text-button" type="button" @click="router.push('/english/vocab')">管理词书</button>
        </div>
      </section>
    </div>

    <el-dialog v-model="settingsOpen" title="学习设置" width="min(92vw, 440px)">
      <el-form v-if="settingsDraft" label-position="top">
        <el-form-item label="每天最多学习新词"><el-input-number v-model="settingsDraft.dailyNewLimit" :min="0" :max="100" /></el-form-item>
        <el-form-item label="目标记忆率"><el-slider v-model="retentionPercent" :min="80" :max="97" :step="1" show-input /></el-form-item>
        <el-form-item label="时区"><el-input v-model="settingsDraft.timeZone" placeholder="Asia/Shanghai" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="settingsOpen = false">取消</el-button>
        <el-button type="primary" :loading="savingSettings" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudySettings, getTodayStudy, submitStudyReview, updateStudySettings } from '@/features/vocab/api'
import type { StudyQueueCard, StudySettings, SubmitStudyReview, TodayStudy } from '@/features/vocab/types'

const router = useRouter()
const today = ref<TodayStudy | null>(null)
const loading = ref(true)
const loadError = ref('')
const revealed = ref(false)
const saving = ref(false)
const saveError = ref('')
const pendingReview = ref<SubmitStudyReview | null>(null)
const shownAt = ref(Date.now())
const settingsOpen = ref(false)
const savingSettings = ref(false)
const settingsDraft = ref<StudySettings | null>(null)
const timeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai')
const retentionPercent = computed({
  get: () => Math.round((settingsDraft.value?.desiredRetention ?? 0.9) * 100),
  set: value => { if (settingsDraft.value) settingsDraft.value.desiredRetention = value / 100 }
})
const currentCard = computed<StudyQueueCard | null>(() => today.value?.cards[0] ?? null)
const dateLabel = computed(() => new Intl.DateTimeFormat('zh-CN', {
  timeZone: timeZone.value, month: 'long', day: 'numeric', weekday: 'long'
}).format(new Date()))
const ratingOptions = [
  { value: 1, label: '忘记了', hint: '完全没想起', className: 'again' },
  { value: 2, label: '很困难', hint: '费力想起来', className: 'hard' },
  { value: 3, label: '记得', hint: '稍想就记得', className: 'good' },
  { value: 4, label: '很容易', hint: '立刻想起来', className: 'easy' }
] as const

async function loadToday() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await getTodayStudy()
    today.value = response.data
    revealed.value = false
    pendingReview.value = null
    saveError.value = ''
    shownAt.value = Date.now()
  } catch (error: any) {
    loadError.value = error?.msg || '请检查网络后重试。'
  } finally {
    loading.value = false
  }
}

function reveal() { revealed.value = true }

function playAudio(word: string) {
  if (!('speechSynthesis' in window)) return ElMessage.warning('当前浏览器不支持语音播放')
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(word)
  utterance.lang = 'en-US'
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}

function rate(rating: 1 | 2 | 3 | 4) {
  if (!revealed.value || !currentCard.value || saving.value) return
  const review: SubmitStudyReview = {
    wordId: currentCard.value.wordId,
    rating,
    expectedVersion: currentCard.value.version,
    requestId: crypto.randomUUID(),
    elapsedMs: Math.min(600_000, Date.now() - shownAt.value)
  }
  pendingReview.value = review
  void sendReview(review)
}

async function sendReview(review: SubmitStudyReview) {
  if (saving.value) return
  saving.value = true
  saveError.value = ''
  try {
    await submitStudyReview(review)
    pendingReview.value = null
    await loadToday()
  } catch (error: any) {
    saveError.value = error?.msg || '评分未确认保存，请使用同一个请求重试。'
  } finally {
    saving.value = false
  }
}

function refreshAfterConflict() { void loadToday() }

async function openSettings() {
  try {
    const response = await getStudySettings()
    settingsDraft.value = { ...response.data }
    timeZone.value = response.data.timeZone
    settingsOpen.value = true
  } catch (error: any) {
    ElMessage.error(error?.msg || '无法读取学习设置')
  }
}

async function saveSettings() {
  if (!settingsDraft.value) return
  savingSettings.value = true
  try {
    await updateStudySettings(settingsDraft.value)
    timeZone.value = settingsDraft.value.timeZone
    settingsOpen.value = false
    await loadToday()
    ElMessage.success('学习设置已保存')
  } catch (error: any) {
    ElMessage.error(error?.msg || '保存失败')
  } finally {
    savingSettings.value = false
  }
}

function formatDue(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: timeZone.value, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

onMounted(() => {
  void loadToday()
  void getStudySettings().then(response => { timeZone.value = response.data.timeZone }).catch(() => {})
})
onUnmounted(() => { window.speechSynthesis?.cancel() })
</script>

<style scoped>
.study-page { min-height: 100vh; color: #20372b; background: #f4f3ea; font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif; padding: 30px 24px 80px; }
.study-shell { max-width: 1020px; margin: auto; }
.study-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; border-bottom: 1px solid #d9dfd5; padding-bottom: 18px; }
button { cursor: pointer; font: inherit; }
.back-link, .settings-link, .text-button { border: 0; background: transparent; color: #315c49; font-weight: 700; }
.back-link:hover, .settings-link:hover, .text-button:hover { text-decoration: underline; }
.eyebrow, .section-kicker { letter-spacing: .19em; font-size: 12px; font-weight: 800; color: #6d8f75; }
.intro { display: flex; justify-content: space-between; align-items: end; padding: 38px 0 30px; }
.intro h1 { font-family: Georgia, 'Songti SC', serif; font-size: clamp(42px, 7vw, 72px); line-height: 1.05; margin: 8px 0 15px; font-weight: 700; }
.title-dot { color: #e0a646; }
.intro-copy { color: #66766a; margin: 0; }
.today-date { color: #7b8b7e; font-size: 14px; white-space: nowrap; }
.metrics { display: grid; grid-template-columns: repeat(3, 1fr); background: #e7ebe0; border: 1px solid #dce3d6; border-radius: 20px; margin-bottom: 26px; overflow: hidden; }
.metric { display: flex; flex-direction: column; gap: 6px; padding: 19px 30px; border-right: 1px solid #d2dcce; }
.metric:last-child { border-right: 0; }
.metric span { color: #617263; font-size: 13px; }.metric strong { font-size: 31px; line-height: 1; font-family: Georgia, serif; }
.session { max-width: 800px; margin: 0 auto; }.session-meta { display: flex; justify-content: space-between; align-items: center; color: #7c8d7f; font-size: 13px; margin-bottom: 13px; }
.pill { background: #dbe7da; color: #326348; border-radius: 99px; padding: 6px 12px; font-weight: 800; }
.flashcard { background: #fffef9; min-height: 350px; border-radius: 26px; border: 1px solid #e2e5d9; box-shadow: 0 22px 48px rgba(50, 74, 47, .08); padding: 28px 34px; display: flex; flex-direction: column; transition: border-color .25s, transform .25s; }
.flashcard.revealed { border-color: #a6c0a7; }.card-topline { display: flex; justify-content: space-between; color: #9aab97; letter-spacing: .14em; font-size: 11px; font-weight: 800; }
.word-content { text-align: center; margin: auto 0 20px; }.word-content h2 { font-family: Georgia, 'Times New Roman', serif; font-size: clamp(48px, 9vw, 84px); font-weight: 500; letter-spacing: -.035em; margin: 18px 0 3px; color: #1d3e2e; overflow-wrap: anywhere; }.phonetic { color: #829486; margin: 0 0 16px; }
.audio-button { border: 1px solid #d9e3d8; background: #f1f6ef; color: #3f6a4f; border-radius: 99px; padding: 8px 14px; font-size: 13px; }
.recall-hint { text-align: center; color: #a2afa1; border-top: 1px solid #e8eee5; padding-top: 20px; }
.answer { border-top: 1px solid #e5ebe1; padding-top: 20px; animation: reveal-in .25s ease both; }.answer-label { color: #759477; font-size: 12px; font-weight: 800; letter-spacing: .14em; }.meaning { font-size: 22px; line-height: 1.6; margin: 8px 0; white-space: pre-line; }.example { color: #6c7b70; border-left: 3px solid #d5e5d2; padding-left: 14px; line-height: 1.5; }.example p { margin: 5px 0; }
.study-actions { text-align: center; padding: 24px 0; }.reveal-button, .primary-button { border: 0; color: #fff; background: #285a3e; border-radius: 14px; padding: 14px 27px; font-weight: 800; transition: transform .15s, background .15s; }.reveal-button { min-width: 235px; display: inline-flex; justify-content: space-between; }.reveal-button:hover, .primary-button:hover { transform: translateY(-2px); background: #1d492f; }.primary-button:disabled { opacity: .6; cursor: wait; }.rate-prompt { margin: 0 0 13px; font-weight: 700; }.rating-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }.rating-button { display: flex; flex-direction: column; gap: 4px; border: 1px solid #dce3d6; background: #fffef9; border-radius: 14px; padding: 14px 6px; color: #244330; transition: transform .15s, box-shadow .15s; }.rating-button:hover { transform: translateY(-3px); box-shadow: 0 10px 20px #37543d20; }.rating-button span { font-size: 12px; color: #869488; }.rating-button.again { border-color: #e8c7b9; background: #fff6f1; }.rating-button.easy { border-color: #bddbc7; background: #f3faf3; }.rating-note { font-size: 12px; color: #91a092; margin-top: 15px; }.save-error { color: #b34f36; }.state-panel { max-width: 800px; margin: 0 auto; text-align: center; background: #fffef9; border-radius: 26px; padding: 70px 25px; border: 1px solid #e2e5d9; }.state-panel h2 { font-family: Georgia, 'Songti SC', serif; font-size: 32px; margin: 10px 0; }.state-panel p { color: #738477; }.complete-mark { width: 64px; height: 64px; border-radius: 50%; background: #dbead9; color: #336c43; display: grid; place-items: center; font-size: 32px; margin: auto; }.complete-actions { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 26px; }
@keyframes reveal-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) { .study-page { padding: 18px 14px 60px; }.eyebrow { display: none; }.intro { align-items: start; flex-direction: column; gap: 12px; }.metrics { margin-bottom: 18px; }.metric { padding: 16px 10px; text-align: center; }.metric strong { font-size: 27px; }.flashcard { min-height: 330px; padding: 22px 18px; }.rating-grid { grid-template-columns: repeat(2, 1fr); }.meaning { font-size: 19px; } }
</style>
