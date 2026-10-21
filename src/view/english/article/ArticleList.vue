<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getArticleCategories, getArticlesByCategory } from '@/api/article'
import type { ArticleCategory, ArticleVO } from '@/types/article'

const categories = ref<ArticleCategory[]>([])
const articles = ref<ArticleVO[]>([])
const selectedCategory = ref<number | null>(null)
const loading = ref(true)
const errorMessage = ref('')
const brokenImageIds = ref(new Set<number>())

function getSummary(content: string): string {
  if (!content) return ''
  let text = content
  try {
    const parsed = JSON.parse(content) as { blocks?: { sentences?: unknown[] }[] }
    const sentence = parsed.blocks?.[0]?.sentences?.[0]
    if (typeof sentence === 'string') text = sentence
  } catch {
    // 旧文章使用 ##、换行和 & 分隔内容。
  }
  const normalized = text.replace(/##/g, ' ').replace(/&/g, ' ').replace(/\s+/g, ' ').trim()
  return normalized.length > 76 ? `${normalized.slice(0, 76)}…` : normalized
}

function formatDate(value: string): string {
  return value?.split(/[ T]/)[0] || ''
}

async function loadArticles(categoryId: number | null = selectedCategory.value) {
  selectedCategory.value = categoryId
  loading.value = true
  errorMessage.value = ''
  try {
    const ids = categoryId === null ? categories.value.map((category) => category.id) : [categoryId]
    const responses = await Promise.all(ids.map((id) => getArticlesByCategory(id)))
    const failed = responses.find((response) => response.code !== 0)
    if (failed) throw new Error(failed.msg || '文章加载失败')
    const byId = new Map<number, ArticleVO>()
    for (const response of responses) {
      for (const article of response.data || []) byId.set(article.id, article)
    }
    articles.value = [...byId.values()]
  } catch (error) {
    console.error('加载文章失败:', error)
    articles.value = []
    errorMessage.value = error instanceof Error ? error.message : '文章暂时无法加载，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const response = await getArticleCategories()
    if (response.code !== 0) throw new Error(response.msg || '分类加载失败')
    categories.value = response.data || []
    await loadArticles(null)
  } catch (error) {
    console.error('加载文章分类失败:', error)
    loading.value = false
    errorMessage.value = error instanceof Error ? error.message : '文章暂时无法加载，请稍后重试。'
  }
})
</script>

<template>
  <main class="article-list-page">
    <div class="article-shell">
      <header class="page-header">
        <router-link to="/english" class="back-link">← 英语学习</router-link>
        <p class="eyebrow">英语 / 阅读</p>
        <h1>英语阅读</h1>
      </header>

      <section class="article-section" aria-label="文章列表">
        <div class="section-topline">
          <span v-if="!loading && !errorMessage">共 {{ articles.length }} 篇文章</span>
        </div>
        <div class="filters" role="group" aria-label="文章分类">
          <button type="button" :aria-pressed="selectedCategory === null" @click="loadArticles(null)">全部</button>
          <button v-for="category in categories" :key="category.id" type="button"
            :aria-pressed="selectedCategory === category.id" @click="loadArticles(category.id)">
            {{ category.name }}
          </button>
        </div>

        <div v-if="loading" class="list-state" role="status">正在整理文章…</div>
        <div v-else-if="errorMessage" class="list-state" role="alert">
          <h3>文章暂时没有加载出来</h3>
          <p>{{ errorMessage }}</p>
          <button type="button" @click="loadArticles()">重新加载</button>
        </div>
        <div v-else-if="articles.length === 0" class="list-state">
          <h3>这里还没有文章</h3>
          <p>换个分类看看，或稍后再来。</p>
        </div>
        <div v-else class="article-grid">
          <router-link v-for="article in articles" :key="article.id" class="article-card"
            :to="{ name: 'english-article-detail', params: { id: article.id }, query: { categoryId: article.categoryId } }">
            <div class="article-text">
              <p class="article-meta"><span>{{ formatDate(article.createTime) }}</span><span v-if="article.author">{{ article.author }}</span></p>
              <h3>{{ article.title }}</h3>
              <p v-if="article.chineseTitle" class="chinese-title">{{ article.chineseTitle }}</p>
              <p v-if="getSummary(article.content)" class="summary">{{ getSummary(article.content) }}</p>
              <span class="read-link">阅读 <span aria-hidden="true">↗</span></span>
            </div>
            <div class="article-image" aria-hidden="true">
              <img v-if="article.imageUrl && !brokenImageIds.has(article.id)" :src="article.imageUrl" alt="" @error="brokenImageIds.add(article.id)" />
              <span v-else>READ</span>
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.article-list-page { min-height: 100vh; background: var(--xl-bg); color: var(--xl-ink); }
.article-shell { max-width: 1100px; margin: auto; padding: 24px 30px 88px; }
.page-header { padding-bottom: 24px; border-bottom: 1px solid var(--xl-border); }
.back-link { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1px solid var(--xl-border); border-radius: 10px; background: var(--xl-surface); color: var(--xl-brand); text-decoration: none; font-size: 13px; font-weight: 750; }
.back-link:hover { background: #edf3e9; border-color: #a8bfa9; }
.eyebrow { margin-top: 22px; color: #66816a; font-size: 11px; font-weight: 800; letter-spacing: .12em; }
.page-header h1 { margin: 8px 0 0; font: 700 clamp(30px, 4vw, 40px)/1.2 var(--xl-font-display); }
.article-section { padding-top: 20px; }
.section-topline { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; }
.section-topline span { color: var(--xl-ink-soft); font-size: 12px; }
.filters { display: flex; gap: 9px; flex-wrap: wrap; margin: 14px 0 22px; }
.filters button { cursor: pointer; border: 1px solid var(--xl-border); background: var(--xl-surface); color: var(--xl-ink-soft); border-radius: 99px; min-height: 38px; padding: 0 16px; font-size: 13px; font-weight: 700; }
.filters button:hover { border-color: #9bb39e; color: var(--xl-brand); }
.filters button[aria-pressed='true'] { background: var(--xl-brand); color: white; border-color: var(--xl-brand); }
.article-grid { display: grid; gap: 16px; }
.article-card { display: grid; grid-template-columns: minmax(0, 1fr) 220px; gap: 26px; padding: 20px; background: var(--xl-surface); border: 1px solid var(--xl-border); border-radius: var(--xl-radius-md); color: inherit; text-decoration: none; transition: transform .2s, border-color .2s, box-shadow .2s; }
.article-card:hover { transform: translateY(-2px); border-color: #a9bda7; box-shadow: var(--xl-shadow-card); }
.article-text { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
.article-meta { display: flex; flex-wrap: wrap; gap: 15px; color: #718174; font-size: 11px; letter-spacing: .06em; }
.article-card h3 { margin: 17px 0 4px; font: 650 clamp(21px, 2.5vw, 29px)/1.3 var(--xl-font-display); overflow-wrap: anywhere; }
.chinese-title { color: #68806d; font-size: 13px; }
.summary { margin: 17px 0; color: var(--xl-ink-soft); font-size: 13px; line-height: 1.7; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.read-link { margin-top: auto; color: var(--xl-brand); font-size: 12px; font-weight: 800; }
.read-link span { padding-left: 11px; }
.article-image { min-height: 170px; display: grid; place-items: center; overflow: hidden; background: #e7ede3; border-radius: var(--xl-radius-sm); color: #829985; font: italic 53px var(--xl-font-display); }
.article-image img { width: 100%; height: 100%; object-fit: cover; }
.list-state { border: 1px dashed #c8d5c8; border-radius: var(--xl-radius-md); background: var(--xl-surface); text-align: center; padding: 55px 20px; color: var(--xl-ink-soft); }
.list-state h3 { color: var(--xl-ink); margin-bottom: 8px; font: 650 23px var(--xl-font-display); }
.list-state button { margin-top: 20px; border: 0; border-radius: var(--xl-radius-sm); background: var(--xl-brand); color: white; cursor: pointer; padding: 11px 18px; font-weight: 750; }
.filters button { min-height: 42px; padding-inline: 17px; border-radius: var(--xl-button-radius); font-weight: 750; transition: background-color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
.filters button:hover { background: #edf3e9; transform: translateY(-1px); }
.filters button[aria-pressed='true'] { box-shadow: 0 2px 0 #1f422d; }
.filters button[aria-pressed='true']:hover { background: var(--xl-brand-hover); }
.filters button:active { transform: translateY(1px); box-shadow: none; }
.list-state button { min-height: var(--xl-button-height); padding: 0 20px; border: 1px solid #254c35; border-radius: var(--xl-button-radius); box-shadow: var(--xl-button-shadow); transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease; }
.list-state button:hover { background: var(--xl-brand-hover); transform: translateY(-2px); box-shadow: var(--xl-button-shadow-hover); }
.list-state button:active { transform: translateY(1px); box-shadow: var(--xl-button-shadow-pressed); }
@media (max-width: 760px) {
  .article-shell { padding: 16px 16px 60px; }
  .eyebrow { margin-top: 18px; }
  .article-card { grid-template-columns: minmax(0, 1fr) 92px; gap: 16px; align-items: start; }
  .article-card h3 { margin-top: 10px; }
  .article-image { min-height: 92px; height: 92px; font-size: 28px; }
  .summary { margin: 12px 0; }
}
@media (max-width: 430px) { .article-card { grid-template-columns: minmax(0, 1fr) 72px; gap: 12px; padding: 16px; }.article-image { height: 72px; min-height: 72px; font-size: 23px; } }
@media (prefers-reduced-motion: reduce) { .article-card:hover, .filters button:hover, .filters button:active, .list-state button:hover, .list-state button:active { transform: none; } }
</style>
