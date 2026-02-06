<template>
  <div class="article-detail-page">
    <!-- 返回按钮 -->
    <el-page-header @back="router.back()" class="mb-4">
      <template #content>
        <div class="page-header-content">
          <h1 v-if="article" class="article-title">{{ article.title }}</h1>
          <div v-if="article" class="article-meta">
            <span class="author">
              <el-icon><User /></el-icon>
              {{ article.author }}
            </span>
            <span class="date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createTime) }}
            </span>
          </div>
        </div>
      </template>
    </el-page-header>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="20" animated />

    <!-- 文章内容 -->
    <div v-if="article && !loading" class="article-container">
      <!-- 文章图片 -->
      <div v-if="article.imageUrl" class="article-image-container">
        <img :src="article.imageUrl" :alt="article.title" class="article-image" />
      </div>

      <!-- 工具栏 -->
      <div class="article-toolbar">
        <!-- 左侧工具 -->
        <div class="toolbar-left">
          <!-- 会员功能：高亮开关 -->
          <div v-if="userStore.userInfo?.vipLevel" class="highlight-toggle">
            <el-checkbox v-model="showHighlights">
              <span class="toggle-label">显示重点单词</span>
            </el-checkbox>
            <el-popover :width="250" placement="bottom" trigger="hover">
              <template #reference>
                <el-icon class="icon-info"><QuestionFilled /></el-icon>
              </template>
              <div class="color-legend">
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #E63946"></span>
                  <span>核心词汇</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #2A9D8F"></span>
                  <span>搭配用法</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #457B9D"></span>
                  <span>逻辑连接词</span>
                </div>
                <div class="legend-item">
                  <span class="legend-color" style="background-color: #E9C46A"></span>
                  <span>语法重点</span>
                </div>
              </div>
            </el-popover>
          </div>
        </div>

        <!-- 右侧工具 -->
        <div class="toolbar-right">
          <el-button type="primary" @click="handleMarkAsRead" v-if="!isArticleReadComplete">
            <el-icon><Check /></el-icon>
            完成阅读
          </el-button>
          <el-button
            :type="isFavorited ? 'danger' : 'default'"
            @click="handleToggleFavorite"
          >
            <el-icon><Star /></el-icon>
            {{ isFavorited ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div
          v-for="(paragraph, index) in parsedParagraphs"
          :key="index"
          class="paragraph"
          @mouseover="hoveredParagraphIndex = index"
          @mouseleave="hoveredParagraphIndex = -1"
        >
          <!-- 段落标题 -->
          <div v-if="paragraph.isTitle" class="paragraph-title">
            {{ paragraph.text }}
          </div>

          <!-- 段落内容 -->
          <div v-else class="paragraph-text">
            <span
              v-for="(sentence, sentenceIndex) in paragraph.sentences"
              :key="`${index}-${sentenceIndex}`"
              class="sentence-wrapper"
            >
              <span
                class="sentence"
                :class="{ hovered: hoveredParagraphIndex === index }"
              >
                <!-- 绘制包含高亮的句子 -->
                <span
                  v-for="(part, partIndex) in highlightSentence(sentence)"
                  :key="`${index}-${sentenceIndex}-${partIndex}`"
                  :class="[
                    'sentence-part',
                    {
                      highlighted: part.isHighlighted && showHighlights && userStore.userInfo?.vipLevel,
                    },
                  ]"
                  :style="{
                    backgroundColor: part.isHighlighted && showHighlights && userStore.userInfo?.vipLevel ? part.color : 'transparent',
                  }"
                  :title="part.reason || ''"
                >
                  {{ part.text }}
                </span>
              </span>

              <!-- 悬停时显示工具栏 -->
              <div
                v-if="hoveredParagraphIndex === index"
                class="sentence-toolbar"
              >
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleAnalyzeSentence(sentence)"
                >
                  分析句子
                </el-button>
                <el-divider direction="vertical" />
                <el-button
                  text
                  type="primary"
                  size="small"
                  @click="handleAIChat(sentence)"
                >
                  AI对话
                </el-button>
              </div>
            </span>
          </div>
        </div>
      </div>

      <!-- 文章翻译 -->
      <div class="article-translation">
        <h3 class="translation-title">中文翻译</h3>
        <div class="translation-content">
          {{ article.chineseMeaning }}
        </div>
      </div>

      <!-- 词汇短语总结（会员功能） -->
      <div v-if="userStore.userInfo?.vipLevel && article.vocabularyPhrasesSummary" class="vocabulary-summary">
        <h3 class="summary-title">
          <el-icon><BookmarkCircle /></el-icon>
          词汇短语总结
        </h3>
        <div class="summary-content">
          {{ article.vocabularyPhrasesSummary }}
        </div>
      </div>

      <!-- 文章感悟 - 仅在已读完后显示 -->
      <div v-if="isArticleReadComplete && article.articleInsights" class="article-insights">
        <h3 class="insights-title">
          <el-icon><Sparkles /></el-icon>
          金句
        </h3>
        <div class="insights-content">
          {{ article.articleInsights }}
        </div>
      </div>

      <!-- 测试题功能（会员功能） -->
      <div v-if="userStore.userInfo?.vipLevel" class="test-section">
        <h3 class="test-title">
          <el-icon><DocumentCopy /></el-icon>
          测试题
        </h3>
        <div class="test-controls">
          <span class="difficulty-label">选择难度：</span>
          <el-radio-group v-model="selectedDifficulty" size="small">
            <el-radio-button :label="0">简单</el-radio-button>
            <el-radio-button :label="1">中等</el-radio-button>
            <el-radio-button :label="2">困难</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="handleGetTestQuestions" :loading="testLoading">
            生成测试题
          </el-button>
        </div>

        <!-- 测试题显示 -->
        <div v-if="testQuestion" class="test-question-display">
          <div class="test-question-header">
            <span class="difficulty-badge" :class="`difficulty-${testQuestion.difficulty}`">
              {{ getDifficultyText(testQuestion.difficulty) }}
            </span>
          </div>
          <div class="test-question-content">
            {{ testQuestion.content }}
          </div>
        </div>
      </div>

      <!-- 分隔符 -->
      <el-divider />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  Calendar,
  Check,
  Star,
  QuestionFilled,
  BookmarkCircle,
  Sparkles,
  DocumentCopy,
} from '@element-plus/icons-vue'
import type { ArticleVO, HighlightItem, TestQuestion } from '@/types/article'

const router = useRouter()
const route = useRoute()
const articleStore = useArticleStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const testLoading = ref(false)
const showHighlights = ref(false)
const selectedDifficulty = ref<0 | 1 | 2>(0)
const hoveredParagraphIndex = ref(-1)
const testQuestion = ref<TestQuestion | null>(null)

// 计算属性
const article = computed(() => articleStore.currentArticle)
const isFavorited = computed(() => articleStore.isFavorited)
const isArticleReadComplete = computed(() => articleStore.isArticleReadComplete)

// 获取文章ID
const articleId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : id
})

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 获取难度文本
 */
const getDifficultyText = (difficulty: 0 | 1 | 2): string => {
  const map = { 0: '简单', 1: '中等', 2: '困难' }
  return map[difficulty]
}

/**
 * 解析文章段落
 * 格式：## 标题，\n 分隔段落，& 分隔句子
 */
const parsedParagraphs = computed(() => {
  if (!article.value?.content) return []

  const paragraphs: Array<{
    isTitle: boolean
    text: string
    sentences?: string[]
  }> = []

  const lines = article.value.content.split('\n')

  for (const line of lines) {
    if (!line.trim()) continue

    if (line.trim().startsWith('##')) {
      paragraphs.push({
        isTitle: true,
        text: line.trim().substring(2).trim(),
      })
    } else {
      const sentences = line.split('&').map(s => s.trim()).filter(s => s)
      paragraphs.push({
        isTitle: false,
        text: line,
        sentences,
      })
    }
  }

  return paragraphs
})

/**
 * 获取高亮映射表
 */
const getHighlightMap = computed(() => {
  if (!article.value?.highlights?.highlights) return new Map()

  const map = new Map<string, HighlightItem>()
  for (const highlight of article.value.highlights.highlights) {
    map.set(highlight.text, highlight)
  }
  return map
})

/**
 * 高亮句子
 */
const highlightSentence = (sentence: string) => {
  const parts: Array<{
    text: string
    isHighlighted: boolean
    color: string
    reason: string
  }> = []

  const highlightMap = getHighlightMap.value
  let currentPos = 0

  // 找出所有高亮词汇的位置
  const highlights: Array<{
    start: number
    end: number
    item: HighlightItem
  }> = []

  for (const [text, item] of highlightMap) {
    let index = sentence.indexOf(text, currentPos)
    while (index !== -1) {
      highlights.push({
        start: index,
        end: index + text.length,
        item,
      })
      index = sentence.indexOf(text, index + 1)
    }
  }

  // 按开始位置排序
  highlights.sort((a, b) => a.start - b.start)

  // 合并重叠的高亮
  const mergedHighlights: Array<{
    start: number
    end: number
    item: HighlightItem
  }> = []

  for (const hl of highlights) {
    if (mergedHighlights.length === 0) {
      mergedHighlights.push(hl)
    } else {
      const last = mergedHighlights[mergedHighlights.length - 1]
      if (hl.start <= last.end) {
        last.end = Math.max(last.end, hl.end)
      } else {
        mergedHighlights.push(hl)
      }
    }
  }

  // 生成部分
  currentPos = 0
  for (const hl of mergedHighlights) {
    if (currentPos < hl.start) {
      parts.push({
        text: sentence.substring(currentPos, hl.start),
        isHighlighted: false,
        color: '',
        reason: '',
      })
    }

    parts.push({
      text: sentence.substring(hl.start, hl.end),
      isHighlighted: true,
      color: hl.item.color_code,
      reason: hl.item.reason,
    })

    currentPos = hl.end
  }

  if (currentPos < sentence.length) {
    parts.push({
      text: sentence.substring(currentPos),
      isHighlighted: false,
      color: '',
      reason: '',
    })
  }

  return parts
}

/**
 * 标记为已读
 */
const handleMarkAsRead = async () => {
  try {
    await articleStore.markAsRead(articleId.value)
    ElMessage.success('已标记为阅读完成')
  } catch (err) {
    ElMessage.error('标记失败，请重试')
  }
}

/**
 * 切换收藏
 */
const handleToggleFavorite = async () => {
  try {
    await articleStore.toggleFavorite(articleId.value)
    const message = isFavorited.value ? '收藏成功' : '已取消收藏'
    ElMessage.success(message)
  } catch (err) {
    ElMessage.error('操作失败，请重试')
  }
}

/**
 * 分析句子
 */
const handleAnalyzeSentence = (sentence: string) => {
  // TODO: 实现句子分析功能
  console.log('分析句子:', sentence)
  ElMessage.info('句子分析功能开发中...')
}

/**
 * AI对话
 */
const handleAIChat = (sentence: string) => {
  // TODO: 实现AI对话功能
  console.log('AI对话:', sentence)
  ElMessage.info('AI对话功能开发中...')
}

/**
 * 获取测试题
 */
const handleGetTestQuestions = async () => {
  try {
    testLoading.value = true
    const result = await articleStore.fetchTestQuestions(articleId.value, selectedDifficulty.value)
    if (result) {
      testQuestion.value = result
      ElMessage.success('测试题已生成')
    }
  } catch (err) {
    ElMessage.error('获取测试题失败')
  } finally {
    testLoading.value = false
  }
}

/**
 * 初始化页面 - 获取文章详情
 */
const initArticle = async () => {
  try {
    loading.value = true
    await articleStore.fetchArticleDetail(articleId.value)
    // 获取阅读进度和收藏状态
    await Promise.all([
      articleStore.fetchArticleProgress(articleId.value),
      articleStore.fetchFavoriteStatus(articleId.value),
    ])
  } catch (err) {
    ElMessage.error('加载文章失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  initArticle()
})

onUnmounted(() => {
  articleStore.clearCurrentArticle()
})
</script>

<style scoped>
.article-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header-content {
  width: 100%;
}

.article-title {
  margin: 0;
  font-size: 2rem;
  color: #333;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  color: #666;
  font-size: 0.95rem;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.article-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.article-image-container {
  margin: 0 0 30px 0;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
}

.article-image {
  width: 100%;
  height: auto;
  display: block;
}

.article-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 15px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.highlight-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.toggle-label {
  margin-left: 5px;
}

.icon-info {
  cursor: help;
  color: #409eff;
  font-size: 1.1rem;
}

.color-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.article-content {
  line-height: 2;
  font-size: 1rem;
  color: #333;
  margin-bottom: 40px;
}

.paragraph {
  margin-bottom: 20px;
}

.paragraph-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin: 20px 0 10px 0;
  padding: 10px 0;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.paragraph-text {
  text-align: justify;
}

.sentence-wrapper {
  position: relative;
  display: inline;
}

.sentence {
  position: relative;
  padding: 2px 0;
}

.sentence.hovered {
  background-color: #f0f7ff;
}

.sentence-part {
  transition: background-color 0.2s;
  border-radius: 2px;
  padding: 1px 2px;
}

.sentence-part.highlighted {
  font-weight: 500;
}

.sentence-toolbar {
  position: absolute;
  top: -30px;
  left: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.article-translation {
  margin: 40px 0;
  padding: 20px;
  background: #f5f7fa;
  border-left: 4px solid #409eff;
  border-radius: 4px;
}

.translation-title {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.translation-content {
  line-height: 1.8;
  color: #666;
  font-size: 0.95rem;
}

.vocabulary-summary,
.article-insights,
.test-section {
  margin: 40px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.summary-title,
.insights-title,
.test-title {
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-content,
.insights-content {
  line-height: 1.8;
  color: #666;
  font-size: 0.95rem;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.difficulty-label {
  font-size: 0.95rem;
  color: #666;
}

.test-question-display {
  margin-top: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-question-header {
  margin-bottom: 12px;
}

.difficulty-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  color: #fff;
}

.difficulty-0 {
  background-color: #67c23a;
}

.difficulty-1 {
  background-color: #e6a23c;
}

.difficulty-2 {
  background-color: #f56c6c;
}

.test-question-content {
  line-height: 1.8;
  color: #333;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 768px) {
  .article-detail-page {
    padding: 12px;
  }

  .article-container {
    padding: 16px;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .toolbar-right {
    justify-content: flex-start;
  }

  .article-content {
    font-size: 0.95rem;
    line-height: 1.8;
  }

  .sentence-toolbar {
    position: static;
    margin-top: 8px;
    margin-left: 0;
  }

  .test-controls {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
