<template>
  <div class="article-reader">
    <!-- 水印背景 -->
    <div class="watermark-background">
      <span v-for="letter in letters" :key="letter" class="watermark-letter" :style="{ animationDelay: `${letters.indexOf(letter)}s` }">
        {{ letter }}
      </span>
    </div>
    
    <!-- 水印字母背景 -->
    <div class="watermark-letters-bg"></div>

    <!-- 导航栏 -->
    <nav class="reader-nav">
      <div class="nav-content">
        <div class="nav-brand">SmartRead AI</div>
        <div class="nav-user">
          <span v-if="isSVIP" class="vip-badge svip-badge">SVIP会员</span>
          <span v-else-if="isVIP" class="vip-badge">VIP会员</span>
          <div class="user-avatar">
            <img :src="userStore.userInfo?.avatar || defaultAvatar" alt="User">
          </div>
        </div>
      </div>
    </nav>

    <!-- 工具栏 -->
    <div class="article-toolbar">
      <div class="toolbar-left">
        <!-- 阅读状态显示 -->
        <div class="reading-status">
          <div class="status-indicator" :class="{ active: isReadingInProgress }">
            <span class="status-dot"></span>
            <span class="status-text">{{ readingStatusText }}</span>
          </div>
        </div>

        <label class="highlight-toggle">
          <div class="toggle-switch">
            <input type="checkbox" v-model="showHighlights" class="toggle-input">
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <span class="toggle-label">重点高亮</span>
        </label>

        <label class="highlight-toggle" :class="{ disabled: !isReadComplete }">
          <div class="toggle-switch">
            <input type="checkbox" v-model="showInsights" class="toggle-input" :disabled="!isReadComplete">
            <div class="toggle-track">
              <div class="toggle-thumb"></div>
            </div>
          </div>
          <span class="toggle-label">金句</span>
          <span v-if="!isReadComplete" class="toggle-hint">(阅读完成后可用)</span>
        </label>

        <div v-if="showHighlights" class="highlight-legend">
          <div class="legend-item">
            <span class="legend-dot vocab-dot"></span>
            <span>核心生词</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot phrase-dot"></span>
            <span>固定搭配/短语</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot logic-dot"></span>
            <span>逻辑连接词</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot grammar-dot"></span>
            <span>语法重点</span>
          </div>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="btn-tooltip-trigger">
          <button class="toolbar-button translate-btn" @click="toggleTranslation">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
            <span>中文翻译</span>
          </button>
        </div>
        <div class="btn-tooltip-trigger">
          <button
            class="toolbar-button vocab-btn"
            :class="{ disabled: !isVIP }"
            @click="handleVocabClick"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span>词汇汇总</span>
          </button>
          <div class="btn-tooltip">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded uppercase">VIP</span>
              <span class="font-semibold">词汇汇总</span>
            </div>
            <p class="text-xs text-gray-300">汇总重要的词汇与短语，可快速浏览，进行学习和复习</p>
          </div>
        </div>
        <div class="btn-tooltip-trigger">
          <button
            class="toolbar-button quiz-btn"
            :class="{ disabled: !isSVIP }"
            @click="handleQuizClick"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <span>阅读测试</span>
          </button>
          <div class="btn-tooltip">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-1.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded uppercase">SVIP</span>
              <span class="font-semibold">阅读测试</span>
            </div>
            <p class="text-xs text-gray-300">文章阅读后，可以对自己进行测试，了解自己的阅读情况，提升阅读能力</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="reader-main">
      <!-- 文章内容 -->
      <main class="article-main">
        <!-- 文章封面 -->
        <div v-if="article?.imageUrl && article.imageUrl.trim() !== ''" class="article-cover">
          <img :src="article.imageUrl.trim()" :alt="article.title" class="cover-image" 
               @error="handleImageError" @load="handleImageLoad">
          <button class="like-button" @click="handleToggleFavorite">
            <svg class="heart-icon" :class="{ liked: isFavorited }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- 文章标题和信息 -->
        <div class="article-header">
          <h1 class="article-title">{{ article?.title }}</h1>
          <div class="article-meta">
            <div class="meta-item">
              <img :src="defaultAvatar" class="author-avatar" alt="Author">
              <span>{{ article?.author }}</span>
            </div>
            <span class="meta-separator">•</span>
            <span>{{ formatDate(article?.createTime) }}</span>
            <span class="meta-separator">•</span>
            <span>阅读时长 {{ readingTime }}分钟</span>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="article-body" :class="{ 'show-highlights': showHighlights, 'show-translation': showTranslateDrawer }">
          <div
            v-for="(paragraph, index) in parsedParagraphs"
            :key="index"
            class="paragraph"
          >
            <div v-if="paragraph.isTitle" class="paragraph-title">
              {{ paragraph.text }}
              <span v-if="showTranslateDrawer && getParagraphTranslation(index)" class="title-translation">
                {{ getParagraphTranslation(index) }}
              </span>
            </div>
            <div v-else class="paragraph-text">
              <div class="english-text">
                <span
                  v-for="(sentence, sentenceIndex) in paragraph.sentences"
                  :key="`${index}-${sentenceIndex}`"
                  class="sentence-span"
                >
                  <span
                    v-for="(part, partIndex) in highlightSentence(sentence)"
                    :key="`${index}-${sentenceIndex}-${partIndex}`"
                    :class="[
                      'sentence-part',
                      {
                        'highlight-vocab': part.isVocab && showHighlights,
                        'highlight-phrase': part.isPhrase && showHighlights,
                        'highlight-logic': part.isLogic && showHighlights,
                        'highlight-grammar': part.isGrammar && showHighlights,
                      },
                    ]"
                  >
                    {{ part.text }}
                  </span>

                  <!-- 悬浮工具栏 -->
                  <div class="sentence-toolbar">
                    <button class="toolbar-action analyze-btn" @click="handleAnalyzeSentence(sentence)">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                      <span>分析句子</span>
                    </button>
                    <button class="toolbar-action chat-btn" @click="handleAIChat(sentence)">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                      </svg>
                      <span>AI对话</span>
                    </button>
                  </div>
                </span>
              </div>

              <!-- 中文翻译 -->
              <div v-if="showTranslateDrawer && getParagraphTranslation(index)" class="paragraph-translation">
                {{ getParagraphTranslation(index) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 完成阅读按钮 -->
        <div class="finish-section" v-if="!isArticleReadComplete">
          <button class="finish-button" @click="handleMarkAsRead">
            <span>✅ 我已读完</span>
          </button>
        </div>

        <!-- 金句区域 -->
        <div v-if="article && showInsights && isReadComplete" class="insights-section">
          <div class="insights-content">
            <div class="insights-header">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
              </svg>
              <h3>金句</h3>
            </div>
            <blockquote class="golden-quote">
              <p class="quote-text">{{ article.articleInsights }}</p>
              <footer class="quote-footer">— 本文核心观点</footer>
            </blockquote>
            <div class="insights-notice">
              <p class="insights-notice-title">🎉 恭喜您完成阅读！</p>
              <p class="insights-notice-subtitle">您可以在侧边栏进行阅读理解测试</p>
            </div>
          </div>
        </div>
      </main>

      <!-- 词汇侧边栏 -->
      <aside class="vocab-sidebar" :class="{ active: activeSidebar === 'vocab' }">
        <div class="sidebar-header">
          <h4>词汇汇总</h4>
          <span class="vip-badge">VIP</span>
        </div>
        <div class="sidebar-content" v-loading="vocabLoading">
          <div v-if="vocabularyPhrasesSummary" class="vocab-summary">
            <div v-html="formatVocabularySummary(vocabularyPhrasesSummary)"></div>
          </div>
          <el-empty v-else description="暂无词汇汇总" />
        </div>
      </aside>

      <!-- 测试侧边栏 -->
      <aside class="quiz-sidebar" :class="{ active: activeSidebar === 'quiz' }">
        <div class="sidebar-header">
          <h4> 阅读理解测试</h4>
          <span class="vip-badge">VIP</span>
        </div>
        <div class="sidebar-content">
          <div class="difficulty-selector">
            <label class="difficulty-label">选择难度</label>
            <div class="difficulty-buttons">
              <button
                v-for="level in difficultyLevels"
                :key="level.value"
                class="difficulty-btn"
                :class="{ active: selectedDifficulty === level.value }"
                @click="selectDifficulty(level.value)"
              >
                {{ level.label }}
              </button>
            </div>
          </div>

          <button class="generate-quiz-btn" @click="handleGenerateQuiz" :disabled="quizLoading">
            <svg v-if="quizLoading" class="loading-icon" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>{{ quizLoading ? '生成中...' : '生成测试题' }}</span>
          </button>

          <div v-if="quizQuestions && quizQuestions.length > 0" class="quiz-display">
            <div v-for="(question, qIndex) in quizQuestions" :key="qIndex" class="quiz-question-container">
              <div class="quiz-question">
                <div class="question-number">问题 {{ qIndex + 1 }}</div>
                <p>{{ question.question }}</p>
              </div>
              <div class="quiz-options">
                <label
                  v-for="(option, oIndex) in question.options"
                  :key="oIndex"
                  class="quiz-option"
                  :class="{
                    'selected': selectedAnswers[qIndex] === oIndex,
                    'correct': showExplanation && question.answer === String.fromCharCode(65 + oIndex),
                    'wrong': showExplanation && selectedAnswers[qIndex] === oIndex && question.answer !== String.fromCharCode(65 + oIndex)
                  }"
                >
                  <input 
                    type="radio" 
                    :name="`quiz-${qIndex}`" 
                    :value="oIndex" 
                    v-model="selectedAnswers[qIndex]"
                    :disabled="showExplanation"
                  >
                  <span class="option-label">{{ String.fromCharCode(65 + oIndex) }}.</span>
                  <span class="option-text">{{ option }}</span>
                </label>
              </div>
              <div v-if="showExplanation" class="quiz-explanation">
                <div class="explanation-title">答案解析</div>
                <div class="explanation-content">{{ question.explanation }}</div>
              </div>
            </div>
            <button v-if="!showExplanation" class="submit-quiz-btn" @click="handleSubmitQuiz">提交答案</button>
            <button v-else class="submit-quiz-btn" @click="handleGenerateQuiz">重新生成测试题</button>
          </div>
        </div>
      </aside>
    </div>

    <!-- 句子分析对话框 -->
    <el-dialog
      v-model="showSentenceAnalysis"
      title="句子分析"
      width="60%"
      class="sentence-analysis-dialog"
    >
      <div class="analysis-content">
        <div class="original-sentence">
          <h4>原句：</h4>
          <p>{{ currentSentence }}</p>
        </div>
        <div class="analysis-result">
          <h4>分析结果：</h4>
          <div v-loading="sentenceAnalysisResult === '分析中...'" class="result-text">
            <div v-if="sentenceAnalysisResult !== '分析中...'" class="markdown-content" v-html="formatAnalysisResult(sentenceAnalysisResult)"></div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 翻译加载提示 -->
    <div v-if="translationLoading" class="translation-loading">
      <div class="loading-spinner"></div>
      <span>翻译加载中...</span>
    </div>

    <!-- Toast 提示 -->
    <div class="toast" :class="{ show: toast.show }">
      <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useArticleStore } from '@/stores/article'
import { ElMessage } from 'element-plus'
import { analyzeSentence, getArticleTranslation, getVocabularyPhrases } from '@/api/article'
import { marked } from 'marked'
import type { ArticleVO } from '@/types/article'
import './ArticleReader.css'

interface Props {
  article: ArticleVO | null
  readingStatus?: number // 0：未开始，1：阅读中，2：已读完
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  'reading-complete': []
}>()

const userStore = useUserStore()
const articleStore = useArticleStore()
const { addReadingTime, updateReadingInProgress } = articleStore

// 状态
const showHighlights = ref(false)
const showInsights = ref(false)
const activeSidebar = ref<'vocab' | 'quiz' | null>(null)
const selectedDifficulty = ref<1 | 2 | 3>(1)
const isReadComplete = ref(false)
const quizLoading = ref(false)
const quizQuestions = ref<any[]>([])
const selectedAnswers = ref<(number | null)[]>([])
const showExplanation = ref(false)
const toast = ref({
  show: false,
  message: '',
})
const showTranslateDrawer = ref(false)
const translationLoading = ref(false)
const translationContent = ref<any>(null)

// 阅读状态相关
const isReadingInProgress = ref(false)
const readingProgressValue = ref(0)
const startReadingTime = ref<number | null>(null)
const totalReadingTime = ref(0)
const vocabLoading = ref(false)
const vocabularyPhrasesSummary = ref<string>('')
const readTimeTimer = ref<number | null>(null)
const totalReadTime = ref(0) // 总阅读时间（秒）
const lastSyncTime = ref(0) // 上次同步时间
const showSentenceAnalysis = ref(false)
const currentSentence = ref('')
const sentenceAnalysisResult = ref('')

// 监听后端阅读状态变化
watch(() => props.readingStatus, (newStatus) => {
  console.log('阅读状态变化:', newStatus)
  if (newStatus !== undefined) {
    isReadComplete.value = newStatus === 2
    isReadingInProgress.value = newStatus === 1
    
    // 如果后端状态是已读完，确保本地状态也同步
    if (newStatus === 2) {
      isReadComplete.value = true
    }
  }
}, { immediate: true })

// 常量
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Author'
const difficultyLevels = [
  { value: 1, label: '简单' },
  { value: 2, label: '中等' },
  { value: 3, label: '困难' },
]

// 计算属性
const isFavorited = computed(() => articleStore.isFavorited)
const isArticleReadComplete = computed(() => isReadComplete.value)
const isVIP = computed(() => (userStore.userInfo?.vipLevel || 0) >= 1)
const isSVIP = computed(() => (userStore.userInfo?.vipLevel || 0) >= 2)
const readingTime = computed(() => {
  if (!props.article?.content) return 0
  const wordCount = props.article.content.split(/\s+/).length
  return Math.ceil(wordCount / 200) // 假设每分钟阅读200词
})

const vocabularyCount = computed(() => {
  return props.article?.highlights?.highlights?.length || 0
})

const vocabularyList = computed(() => {
  if (!props.article?.highlights?.highlights) return []
  return props.article.highlights.highlights.map(hl => ({
    word: hl.text,
    pronunciation: '/' + hl.text.toLowerCase() + '/',
    meaning: hl.reason || '',
  }))
})

// 阅读状态计算属性
const readingStatusText = computed(() => {
  // 优先使用从后端获取的阅读状态
  if (props.readingStatus !== undefined) {
    switch (props.readingStatus) {
      case 0:
        return '未开始'
      case 1:
        return '阅读中'
      case 2:
        return '已完成'
      default:
        return '未开始'
    }
  }
  
  // 如果没有后端状态，使用本地状态
  if (isReadComplete.value) {
    return '已完成'
  }
  return isReadingInProgress.value ? '阅读中' : '未开始'
})

const readingProgress = computed(() => {
  if (!props.article) return 0
  
  // 简单的进度计算：根据滚动位置估算
  const totalParagraphs = parsedParagraphs.value.length
  if (totalParagraphs === 0) return 0
  
  // 这里可以更精确地计算实际阅读进度
  // 暂时使用固定值或基于时间的估算
  return Math.min(Math.floor((totalReadingTime.value / 300) * 100), 100) // 假设5分钟完成
})

/**
 * 解析文章段落
 */
const parsedParagraphs = computed(() => {
  if (!props.article?.content) return []

  try {
    // 尝试解析JSON格式的内容
    const contentData = typeof props.article.content === 'string' 
      ? JSON.parse(props.article.content) 
      : props.article.content

    if (contentData.blocks && Array.isArray(contentData.blocks)) {
      // 如果是blocks数组格式，转换为段落格式
      return contentData.blocks.map((block: any) => ({
        isTitle: block.type === 'heading',
        text: block.text || '',
        sentences: block.sentences || [],
      }))
    }
  } catch (e) {
    console.error('解析文章内容失败，尝试使用旧格式:', e)
    // 如果JSON解析失败，尝试使用旧的文本格式
    const paragraphs: Array<{
      isTitle: boolean
      text: string
      sentences?: string[]
    }> = []

    const lines = props.article.content.split('\n')

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
  }

  return []
})

/**
 * 高亮句子
 */
const highlightSentence = (sentence: string) => {
  const parts: Array<{
    text: string
    isVocab: boolean
    isPhrase: boolean
    isLogic: boolean
    isGrammar: boolean
  }> = []

  if (!props.article?.highlights?.highlights) {
    return [{ text: sentence, isVocab: false, isPhrase: false, isLogic: false, isGrammar: false }]
  }

  const highlightMap = new Map<string, { type: string }>()
  for (const highlight of props.article.highlights.highlights) {
    highlightMap.set(highlight.text, { type: highlight.type })
  }

  let currentPos = 0
  const highlights: Array<{
    start: number
    end: number
    type: string
  }> = []

  for (const [text, item] of highlightMap) {
    let index = sentence.indexOf(text, currentPos)
    while (index !== -1) {
      highlights.push({
        start: index,
        end: index + text.length,
        type: item.type,
      })
      index = sentence.indexOf(text, index + 1)
    }
  }

  // 按开始位置排序
  highlights.sort((a, b) => a.start - b.start)

  // 生成部分
  currentPos = 0
  for (const hl of highlights) {
    if (currentPos < hl.start) {
      parts.push({
        text: sentence.substring(currentPos, hl.start),
        isVocab: false,
        isPhrase: false,
        isLogic: false,
        isGrammar: false,
      })
    }

    parts.push({
      text: sentence.substring(hl.start, hl.end),
      isVocab: hl.type === 'core_vocabulary',
      isPhrase: hl.type === 'collocation',
      isLogic: hl.type === 'logical_connector',
      isGrammar: hl.type === 'grammar_focus',
    })

    currentPos = hl.end
  }

  if (currentPos < sentence.length) {
    parts.push({
      text: sentence.substring(currentPos),
      isVocab: false,
      isPhrase: false,
      isLogic: false,
      isGrammar: false,
    })
  }

  return parts
}

/**
 * 格式化日期
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 切换侧边栏
 */
const toggleSidebar = async (type: 'vocab' | 'quiz') => {
  if (activeSidebar.value === type) {
    activeSidebar.value = null
  } else {
    activeSidebar.value = type
    // 如果打开词汇侧边栏且尚未加载数据，则加载词汇汇总
    if (type === 'vocab' && !vocabularyPhrasesSummary.value) {
      await loadVocabularyPhrasesSummary()
    }
  }
}

/**
 * 处理词汇汇总按钮点击
 */
const handleVocabClick = () => {
  if (!isVIP.value) {
    ElMessage.warning('词汇汇总功能需要VIP会员权限')
    return
  }
  toggleSidebar('vocab')
}

/**
 * 处理阅读测试按钮点击
 */
const handleQuizClick = () => {
  if (!isSVIP.value) {
    ElMessage.warning('阅读测试功能需要SVIP会员权限')
    return
  }
  toggleSidebar('quiz')
}

/**
 * 加载词汇短语汇总
 */
const loadVocabularyPhrasesSummary = async () => {
  if (!props.article?.id) return

  try {
    vocabLoading.value = true
    const response = await getVocabularyPhrases(props.article.id)
    if (response.code === 0 && response.data) {
      vocabularyPhrasesSummary.value = response.data
    }
  } catch (err) {
    console.error('加载词汇汇总失败:', err)
    ElMessage.error('加载词汇汇总失败，请重试')
  } finally {
    vocabLoading.value = false
  }
}

/**
 * 格式化词汇汇总内容
 * 将文本内容转换为HTML格式
 */
const formatVocabularySummary = (content: string) => {
  if (!content) return ''

  // 使用marked库将Markdown转换为HTML
  return marked(content)
}

/**
 * 格式化分析结果（Markdown格式）
 */
const formatAnalysisResult = (content: string) => {
  if (!content) return ''

  let formatted = content

  // 先处理多级标题
  formatted = formatted.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>')
  formatted = formatted.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>')
  formatted = formatted.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>')

  // 处理带颜色的文本 <font color="...">
  // 保留原有的HTML标签，不进行任何转换

  // 处理加粗文本 **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体文本 *text* (避免匹配已经处理过的 **text**)
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  // 处理代码 `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 处理句子高亮 [text]
  formatted = formatted.replace(/\[([^\]]+)\]/g, '<span class="sentence-highlight">$1</span>')

  // 处理换行，将连续的换行转换为段落分隔
  formatted = formatted.replace(/\n\n+/g, '</p><p>')
  formatted = formatted.replace(/\n/g, '<br>')

  // 处理列表项 - 支持嵌套列表
  const lines = formatted.split('<br>')
  let inList = false
  let listItems: string[] = []
  const processedLines: string[] = []

  for (const line of lines) {
    // 检查是否是列表项（包括嵌套列表项）
    const listMatch = line.match(/^(\s*)\*\s+(.*)$/)
    if (listMatch) {
      if (!inList) {
        inList = true
        listItems = []
      }
      // 保留缩进以支持嵌套列表
      const indent = listMatch[1].length / 4 // 假设4个空格为一个缩进级别
      const indentClass = indent > 0 ? ` indent-${Math.min(indent, 3)}` : ''
      listItems.push(`<li class="list-item${indentClass}">${listMatch[2]}</li>`)
    } else {
      if (inList) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`)
        inList = false
        listItems = []
      }
      processedLines.push(line)
    }
  }

  // 处理最后一组列表项
  if (inList) {
    processedLines.push(`<ul>${listItems.join('')}</ul>`)
  }

  formatted = processedLines.join('<br>')

  // 包装在段落标签中
  if (!formatted.startsWith('<h') && !formatted.startsWith('<ul>')) {
    formatted = `<p>${formatted}</p>`
  }

  return formatted
}

/**
 * 开始阅读时间计时
 */
const startReadingTimer = () => {
  if (readTimeTimer.value) return

  readTimeTimer.value = window.setInterval(() => {
    totalReadTime.value++

    // 每150秒同步一次阅读时间到后端
    if (totalReadTime.value - lastSyncTime.value >= 150) {
      syncReadTime()
    }
  }, 1000)

  // 更新阅读状态为阅读中
  if (props.article?.id) {
    updateReadingInProgress(props.article.id).catch(() => {
      console.log('更新阅读状态失败')
    })
  }
}

/**
 * 停止阅读时间计时
 */
const stopReadingTimer = () => {
  if (readTimeTimer.value) {
    clearInterval(readTimeTimer.value)
    readTimeTimer.value = null

    // 停止时同步剩余的阅读时间
    if (totalReadTime.value - lastSyncTime.value > 0) {
      syncReadTime()
    }
  }
}

/**
 * 同步阅读时间到后端
 */
const syncReadTime = async () => {
  if (!props.article?.id || totalReadTime.value - lastSyncTime.value < 150) return

  try {
    const syncTime = totalReadTime.value - lastSyncTime.value
    await addReadingTime(props.article.id, syncTime)
    lastSyncTime.value = totalReadTime.value
    console.log(`已同步阅读时间: ${syncTime}秒`)
  } catch (err) {
    console.error('同步阅读时间失败:', err)
  }
}

/**
 * 切换翻译显示
 */
const toggleTranslation = async () => {
  showTranslateDrawer.value = !showTranslateDrawer.value
  if (showTranslateDrawer.value && !translationContent.value) {
    await loadTranslation()
  }
}

/**
 * 获取段落翻译
 */
const getParagraphTranslation = (paragraphIndex: number) => {
  if (!translationContent.value?.blocks || !Array.isArray(translationContent.value.blocks)) {
    return ''
  }

  // 直接使用段落索引获取对应的翻译块
  // 翻译块应该与英文段落一一对应
  const block = translationContent.value.blocks[paragraphIndex]
  if (!block) {
    return ''
  }

  // 如果是标题，返回标题文本
  if (block.type === 'heading') {
    return block.text || ''
  }

  // 如果是段落，返回段落文本
  if (block.type === 'paragraph') {
    return block.sentences?.join('') || block.text || ''
  }

  return ''
}

/**
 * 加载文章翻译
 */
const loadTranslation = async () => {
  if (!props.article?.id) return

  try {
    translationLoading.value = true
    const response = await getArticleTranslation(props.article.id)
    if (response.code === 0 && response.data) {
      // 解析JSON格式的翻译内容
      try {
        // 后端返回的 data 字段是 JSON 字符串，需要先解析
        let parsedData
        if (typeof response.data === 'string') {
          // 先解码转义的换行符
          let jsonStr = response.data.replace(/\\\\n/g, '\n')
          // 解析 JSON
          try {
            parsedData = JSON.parse(jsonStr)
          } catch (e) {
            console.error('解析翻译内容 JSON 失败:', e)
            console.error('原始数据:', response.data)
            console.error('解码后的数据:', jsonStr)
            throw e
          }
        } else {
          parsedData = response.data
        }

        // 确保解析后的数据包含 blocks 数组
        if (parsedData && parsedData.blocks && Array.isArray(parsedData.blocks)) {
          translationContent.value = parsedData
        } else {
          console.error('翻译数据格式不正确，缺少 blocks 数组:', parsedData)
          ElMessage.error('翻译内容格式错误')
        }
      } catch (e) {
        console.error('解析翻译内容失败:', e)
        ElMessage.error('翻译内容格式错误')
      }
    }
  } catch (err) {
    console.error('加载翻译失败:', err)
    ElMessage.error('加载翻译失败，请重试')
  } finally {
    translationLoading.value = false
  }
}


/**
 * 选择难度
 */
const selectDifficulty = (level: 1 | 2 | 3) => {
  selectedDifficulty.value = level
}

/**
 * 切换收藏
 */
const handleToggleFavorite = async () => {
  try {
    await articleStore.toggleFavorite(props.article?.id || 0)
    showToast(isFavorited.value ? '已取消收藏' : '收藏成功')
  } catch (err) {
    ElMessage.error('操作失败，请重试')
  }
}

/**
 * 标记为已读
 */
const handleMarkAsRead = async () => {
  try {
    await articleStore.completeReading(props.article?.id || 0)
    // 更新本地状态
    isReadComplete.value = true
    showToast('恭喜！您已完成本篇阅读 🎉')
    // 触发彩纸屑庆祝效果
    createConfetti()
    // 通知父组件重新获取阅读状态
    emit('reading-complete')
  } catch (err) {
    ElMessage.error('标记失败，请重试')
  }
}

/**
 * 创建彩纸屑效果
 */
const createConfetti = () => {
  const colors = ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div')
    confetti.style.position = 'fixed'
    confetti.style.left = Math.random() * 100 + 'vw'
    confetti.style.top = '-10px'
    confetti.style.width = '10px'
    confetti.style.height = '10px'
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.borderRadius = '50%'
    confetti.style.pointerEvents = 'none'
    confetti.style.zIndex = '9999'
    document.body.appendChild(confetti)

    const animation = confetti.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 2000 + Math.random() * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    })

    animation.onfinish = () => confetti.remove()
  }
}

/**
 * 分析句子
 */
const handleAnalyzeSentence = async (sentence: string) => {
  if (!isVIP.value) {
    ElMessage.warning('句子分析功能需要VIP会员权限')
    return
  }

  try {
    currentSentence.value = sentence
    showSentenceAnalysis.value = true
    sentenceAnalysisResult.value = '分析中...'

    const response = await analyzeSentence(sentence)
    if (response.code === 0 && response.data) {
      sentenceAnalysisResult.value = response.data
    } else {
      sentenceAnalysisResult.value = response.message || '句子分析失败'
    }
  } catch (err) {
    console.error('句子分析失败:', err)
    sentenceAnalysisResult.value = '句子分析失败，请重试'
  }
}

/**
 * 图片加载错误处理
 */
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  console.error('图片加载失败:', imgElement.src)
  
  // 设置默认图片
  imgElement.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  
  // 移除错误监听器，避免循环
  imgElement.onerror = null
}

/**
 * 图片加载成功处理
 */
const handleImageLoad = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  console.log('图片加载成功:', imgElement.src)
  console.log('图片尺寸:', imgElement.naturalWidth, 'x', imgElement.naturalHeight)
}

/**
 * 开始阅读
 */
const startReading = () => {
  if (!isReadingInProgress.value && !isReadComplete.value) {
    isReadingInProgress.value = true
    startReadingTime.value = Date.now()
    
    // 通知后端开始阅读
    if (props.article?.id) {
      articleStore.updateReadingInProgress(props.article.id)
    }
  }
}

/**
 * 更新阅读进度
 */
const updateReadingProgress = () => {
  if (isReadingInProgress.value && startReadingTime.value) {
    totalReadingTime.value = Math.floor((Date.now() - startReadingTime.value) / 1000) // 转换为秒
    
    // 每30秒更新一次阅读时间到后端
    if (totalReadingTime.value % 30 === 0 && props.article?.id) {
      articleStore.addReadingTime(props.article.id, totalReadingTime.value)
    }
    
    // 如果阅读时间超过2.5分钟，自动标记为完成
    if (totalReadingTime.value >= 150 && !isReadComplete.value) {
      completeReading()
    }
  }
}

/**
 * 完成阅读
 */
const completeReading = async () => {
  if (isReadingInProgress.value && !isReadComplete.value) {
    isReadingInProgress.value = false
    isReadComplete.value = true
    
    // 通知后端完成阅读
    if (props.article?.id) {
      await articleStore.completeArticleReading(props.article.id)
    }
  }
}

/**
 * AI对话
 */
const handleAIChat = (sentence: string) => {
  // TODO: 实现AI对话功能
  console.log('AI对话:', sentence)
  showToast('AI对话功能开发中...')
}

/**
 * 生成测试题
 */
const handleGenerateQuiz = async () => {
  try {
    quizLoading.value = true
    showExplanation.value = false
    selectedAnswers.value = []
    
    const result = await articleStore.fetchTestQuestions(
      props.article?.id || 0,
      selectedDifficulty.value
    )
    
    if (result) {
      // 后端返回的是字符串格式的测试题，需要解析
      try {
        // 尝试解析JSON格式的测试题
        let quizData
        if (typeof result === 'string') {
          // 先检查是否包含```json标记，如果有则移除
          let jsonStr = result
          if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
          }
          quizData = JSON.parse(jsonStr)
        } else {
          quizData = result
        }
        
        // 检查解析后的数据格式
        if (quizData.questions && Array.isArray(quizData.questions)) {
          quizQuestions.value = quizData.questions
        } else if (Array.isArray(quizData)) {
          quizQuestions.value = quizData
        } else {
          throw new Error('测试题格式不正确')
        }
        
        showToast('测试题已生成')
      } catch (e) {
        console.error('解析测试题失败:', e)
        ElMessage.error('测试题格式错误，请重试')
      }
    }
  } catch (err) {
    console.error('获取测试题失败:', err)
    ElMessage.error('获取测试题失败，请重试')
  } finally {
    quizLoading.value = false
  }
}

/**
 * 提交测试答案
 */
const handleSubmitQuiz = () => {
  // 检查是否所有问题都已作答
  const unansweredQuestions = selectedAnswers.value.filter(answer => answer === null)
  if (unansweredQuestions.length > 0) {
    ElMessage.warning(`还有 ${unansweredQuestions.length} 道题未作答，请完成后再提交`)
    return
  }

  // 计算正确答案数量
  let correctCount = 0
  quizQuestions.value.forEach((question, index) => {
    const userAnswer = selectedAnswers.value[index]
    const correctAnswerIndex = question.answer.charCodeAt(0) - 65 // 将'A'转换为0，'B'转换为1，以此类推
    if (userAnswer === correctAnswerIndex) {
      correctCount++
    }
  })

  // 显示解析
  showExplanation.value = true

  // 根据得分显示不同的提示
  const score = Math.round((correctCount / quizQuestions.value.length) * 100)
  if (score === 100) {
    ElMessage.success(`太棒了！全部答对！🎉 得分：${score}分`)
  } else if (score >= 80) {
    ElMessage.success(`做得很好！得分：${score}分`)
  } else if (score >= 60) {
    ElMessage.warning(`及格了，继续加油！得分：${score}分`)
  } else {
    ElMessage.warning(`还需要多加练习哦！得分：${score}分`)
  }
}

/**
 * 显示Toast提示
 */
const showToast = (message: string) => {
  toast.value.message = message
  toast.value.show = true
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 监听文章变化，重置阅读计时器
watch(() => props.article, (newArticle) => {
  if (newArticle?.id) {
    // 停止之前的计时器
    stopReadingTimer()
    // 重置阅读时间
    totalReadTime.value = 0
    lastSyncTime.value = 0
    // 启动新的计时器
    startReadingTimer()
  }
}, { immediate: true })

// 组件挂载时启动阅读计时器
onMounted(() => {
  if (props.article?.id) {
    startReadingTimer()
  }
  
  // 设置阅读进度更新定时器
  const progressInterval = setInterval(updateReadingProgress, 1000) // 每秒更新一次
  
  // 监听滚动事件，自动开始阅读
  const articleContainer = document.querySelector('.article-body')
  if (articleContainer) {
    articleContainer.addEventListener('scroll', () => {
      if (!isReadingInProgress.value && !isReadComplete.value) {
        startReading()
      }
    })
  }
  
  onUnmounted(() => {
    // 清理定时器和事件监听器
    clearInterval(progressInterval)
    if (articleContainer) {
      articleContainer.removeEventListener('scroll', startReading)
    }
  })
})

// 组件卸载时停止阅读计时器
onUnmounted(() => {
  stopReadingTimer()
})
</script>

<style scoped>
.article-reader {
  position: relative;
  min-height: 100vh;
  /* 移除 height: 100vh; 让内容自然流动 */
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #EFF2F7, #F7F9FC);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  /* 移除 overflow: hidden; 允许内容溢出 */
}

/* 水印背景 */
.watermark-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.05;
  font-family: 'Georgia', serif;
  font-size: 120px;
  font-weight: bold;
  color: #E1E6ED;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-around;
  padding: 50px;
}

/* 水印字母背景 */
.watermark-letters-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

.watermark-letter {
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(2deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(10px) rotate(-2deg); }
}

/* 导航栏 */
.reader-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.nav-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 3.5rem;
}

.nav-brand {
  font-size: 1.25rem;
  font-weight: bold;
  color: #475569;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vip-badge {
  padding: 0.125rem 0.375rem;
  background: rgba(148, 163, 184, 0.3);
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.vip-badge.svip-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-color: #d97706;
}

.user-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(148, 163, 184, 0.3);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 主内容区 */
.reader-main {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0.25rem 0.5rem 2rem;
  display: flex;
  gap: 0.01rem;
  overflow-y: auto;
  min-height: 0;
}

.article-main {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow-y: auto;  /* 改为允许垂直滚动 */
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 文章封面 */
.article-cover {
  position: relative;
  width: 100%;
  height: 12rem;
  overflow: hidden;
  /* 移除 flex-shrink: 0; 允许随容器滚动 */
}

@media (min-width: 640px) {
  .article-cover {
    height: 14rem;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
}

.article-cover:hover .cover-image {
  transform: scale(1.05);
}

.like-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.like-button:hover {
  background: rgba(255, 255, 255, 0.4);
}

.like-button:active {
  transform: scale(0.95);
}

.heart-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
  transition: all 0.2s;
}

.heart-icon.liked {
  fill: #ef4444;
  stroke: #ef4444;
}

/* 文章标题和信息 */
.article-header {
  padding: 1rem 1.5rem 0.75rem;
  /* 移除 flex-shrink: 0; 允许随容器滚动 */
}

.article-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.author-avatar {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
}

.meta-separator {
  color: #9ca3af;
}

/* 工具栏 */
.article-toolbar {
  position: sticky;
  top: 3.5rem;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.375rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 0.75rem;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlight-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-switch {
  position: relative;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  width: 2.5rem;
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  transition: background 0.2s;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-track {
  background: #6366f1;
}

.toggle-thumb {
  position: absolute;
  left: 0.25rem;
  top: 0.25rem;
  width: 1rem;
  height: 1rem;
  background: white;
  border-radius: 9999px;
  transition: transform 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(1rem);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.highlight-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 1rem;
  font-size: 0.75rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.legend-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
}

.vocab-dot {
  background: #fef08a;
  border: 2px solid #eab308;
}

.grammar-dot {
  background: #bae6fd;
  border: 2px solid #0ea5e9;
}

.toolbar-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.vocab-btn {
  color: #f97316;
}

.vocab-btn:hover {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.05);
}

.quiz-btn {
  color: #3b82f6;
}

.quiz-btn:hover {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.05);
}

.toolbar-button svg {
  width: 1rem;
  height: 1rem;
}

/* 按钮提示框 */
.btn-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background-color: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}

.btn-tooltip::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #1f2937 transparent;
}

.btn-tooltip-trigger {
  position: relative;
}

.btn-tooltip-trigger:hover .btn-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 文章内容 */
.article-body {
  /* 移除 flex: 1; 让内容自然流动 */
  /* 移除 overflow-y: auto; 使用外层容器的滚动 */
  padding: 1rem 1.5rem;
  line-height: 1.8;
  font-size: 1rem;
  color: #2d3748;
  font-family: 'Noto Serif SC', serif;
  /* 移除 min-height: 0; */
}

.paragraph {
  margin-bottom: 1.25rem;
  line-height: 1.8;
  min-height: 0;
}

.paragraph-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin: 1.25rem 0 0.625rem;
  padding: 0.625rem 0;
  border-left: 4px solid #6366f1;
  padding-left: 0.625rem;
  flex-shrink: 0;
}

.paragraph-text {
  text-align: justify;
  line-height: 1.8;
}

.sentence-span {
  position: relative;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-block;
  line-height: 1.8;
}

.sentence-span:hover {
  background-color: rgba(37, 99, 235, 0.1);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.sentence-part {
  transition: background 0.3s;
  border-radius: 0.125rem;
  padding: 0 0.125rem;
  display: inline;
}

.show-highlights .highlight-vocab {
  background-color: #fef08a;
  border-bottom: 2px solid #eab308;
  padding: 0 0.125rem;
}

.show-highlights .highlight-grammar {
  background-color: #bae6fd;
  border-bottom: 2px solid #0ea5e9;
  padding: 0 0.125rem;
}

/* 悬浮工具栏 */
.sentence-toolbar {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  display: flex;
  gap: 0.25rem;
  border: 1px solid #e2e8f0;
}

.sentence-span:hover .sentence-toolbar {
  transform: translateX(-50%) scale(1);
  opacity: 1;
  visibility: visible;
}

.toolbar-action {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.analyze-btn {
  color: #2563eb;
}

.analyze-btn:hover {
  background: #eff6ff;
}

.chat-btn {
  color: #9333ea;
}

.chat-btn:hover {
  background: #faf5ff;
}

.toolbar-action svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* 完成阅读按钮 */
.finish-section {
  padding: 2rem 1.5rem;  /* 增加上下间距 */
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /* 移除 flex-shrink: 0; 允许随容器滚动 */
  margin-top: auto;  /* 确保按钮在内容末尾 */
}

.finish-button {
  padding: 0.625rem 1.5rem;
  background: #475569;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.finish-button:hover {
  background: #334155;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-0.125rem);
}

/* 金句区域 */
.insights-section {
  background: linear-gradient(to bottom right, #fef3c7, #ffedd5);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  /* 移除 flex-shrink: 0; 允许随容器滚动 */
  margin-top: 2rem;
}

.insights-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insights-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #92400e;
}

.insights-header h3 {
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0;
}

.insights-header svg {
  width: 1.5rem;
  height: 1.5rem;
}

.golden-quote {
  position: relative;
  padding-left: 1.5rem;
  border-left: 4px solid #f59e0b;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.quote-text {
  font-size: 1.25rem;
  font-family: 'Ma Shan Zheng', cursive;
  font-style: italic;
  line-height: 1.75;
  color: #1e293b;
  margin: 0 0 0.5rem;
  flex-shrink: 0;
}

.quote-footer {
  font-size: 0.875rem;
  color: #475569;
  flex-shrink: 0;
}

.insights-footer {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  text-align: left;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.insight-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.5rem;
  flex-shrink: 0;
}

.insight-text {
  line-height: 1.6;
  flex-shrink: 0;
}

.insights-notice {
  text-align: center;
  padding-top: 1rem;
  flex-shrink: 0;
}

.insights-notice-title {
  color: #475569;
  font-weight: 500;
  flex-shrink: 0;
}

.insights-notice-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  flex-shrink: 0;
}

/* 侧边栏 */
.vocab-sidebar,
.quiz-sidebar {
  width: 0;
  opacity: 0;
  overflow: hidden;
  transition: all 0.4s ease-in-out;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  align-self: flex-start;
  position: sticky;
  top: 5.5rem;
  display: flex;
  flex-direction: column;
  margin-top: 0;
}

.vocab-sidebar.active,
.quiz-sidebar.active {
  width: 18rem;
  opacity: 1;
  margin-left: 0.01rem;
}

.sidebar-header {
  padding: 0.01rem 0.75rem;
  background: rgba(148, 163, 184, 0.2);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.sidebar-header h4 {
  font-size: 0.875rem;
  font-weight: bold;
  color: #334155;
  margin: 0;
}

.vocab-count {
  font-size: 0.75rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0.375rem;
}

/* 阅读理解测试侧边栏内容区域 - 更高的滚动高度 */
.quiz-sidebar .sidebar-content {
  max-height: calc(100vh - 12rem);  /* 比文章内容区域更高 */
  min-height: 400px;  /* 设置最小高度 */
}

/* 词汇汇总侧边栏内容区域 - 更高的滚动高度 */
.vocab-sidebar .sidebar-content {
  max-height: calc(100vh - 10rem);  /* 比文章内容区域更高，稍低于测试侧边栏 */
  min-height: 350px;  /* 设置最小高度 */
}

.vocab-item {
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.vocab-item:hover {
  background: #f1f5f9;
  border-color: rgba(148, 163, 184, 0.4);
  transform: translateX(0.25rem);
}

.vocab-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 0.125rem;
  flex-shrink: 0;
}

.vocab-tag {
  padding: 0.125rem 0.375rem;
  background: rgba(148, 163, 184, 0.3);
  color: #334155;
  font-size: 0.625rem;
  font-weight: bold;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.vocab-word {
  font-weight: bold;
  color: #1e293b;
  font-size: 0.875rem;
}

.vocab-pronunciation {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.125rem;
}

.vocab-meaning {
  font-size: 0.75rem;
  color: #334155;
}

/* 测试侧边栏 */
.difficulty-selector {
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.difficulty-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

.difficulty-buttons {
  display: flex;
  gap: 0.375rem;
}

.difficulty-btn {
  flex: 1;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.difficulty-btn:hover {
  border-color: #a5b4fc;
}

.difficulty-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.generate-quiz-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: #1f2937;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.generate-quiz-btn:hover:not(:disabled) {
  background: #111827;
}

.generate-quiz-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.generate-quiz-btn svg {
  width: 1rem;
  height: 1rem;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.quiz-display {
  margin-top: 0.75rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-question-container {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.quiz-question {
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.question-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quiz-question p {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
  line-height: 1.6;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex-shrink: 0;
}

.quiz-option {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8125rem;
  color: #4b5563;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.quiz-option:hover {
  background: white;
  border-color: #e5e7eb;
}

.quiz-option.selected {
  background: rgba(99, 102, 241, 0.05);
  border-color: #6366f1;
}

.quiz-option.correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  color: #065f46;
}

.quiz-option.wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #991b1b;
}

.quiz-option input[type="radio"] {
  accent-color: #4f46e5;
  margin-top: 0.125rem;
}

.option-label {
  font-weight: 600;
  color: #6366f1;
  flex-shrink: 0;
}

.quiz-option.correct .option-label {
  color: #10b981;
}

.quiz-option.wrong .option-label {
  color: #ef4444;
}

.option-text {
  line-height: 1.5;
  word-break: break-word;
}

.quiz-explanation {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 0.375rem;
  border-left: 3px solid #6366f1;
  flex-shrink: 0;
}

.explanation-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 0.375rem;
}

.explanation-content {
  font-size: 0.8125rem;
  color: #374151;
  line-height: 1.6;
}

.submit-quiz-btn {
  width: 100%;
  padding: 0.5rem;
  background: #4f46e5;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.submit-quiz-btn:hover {
  background: #4338ca;
}

/* Toast 提示 */
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toast.show {
  opacity: 1;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #4ade80;
}

/* 翻译抽屉样式 */
.translate-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.translate-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px 0;
}

.translation-blocks {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.translation-block {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.translation-block h3 {
  margin: 0 0 12px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
}

.translation-block h3.heading-1 {
  font-size: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

.translation-block h3.heading-2 {
  font-size: 1.35rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 6px;
}

.translation-block h3.heading-3 {
  font-size: 1.2rem;
}

.translation-paragraph {
  margin: 0;
  line-height: 1.8;
  color: #4b5563;
  text-align: justify;
  text-indent: 2em;
}

.translate-btn {
  color: #6366f1;
}

.translate-btn:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

/* 禁用状态 */
.toolbar-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 词汇汇总样式 */
.vocab-summary {
  padding: 1rem;
  line-height: 1.8;
  color: #4b5563;
}

.vocab-summary :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 1.5rem 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.vocab-summary :deep(h3:first-child) {
  margin-top: 0;
}

.vocab-summary :deep(strong) {
  color: #6366f1;
  font-weight: 600;
}

.vocab-summary :deep(p) {
  margin: 0.5rem 0;
}

/* 句子分析对话框样式 */
.sentence-analysis-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.original-sentence h4,
.analysis-result h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 10px 0;
}

.original-sentence p {
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #6366f1;
  margin: 0;
  line-height: 1.6;
  color: #374151;
  font-style: italic;
}

.analysis-result {
  min-height: 120px;
}

.result-text {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  min-height: 100px;
}

.result-text p {
  margin: 0;
  line-height: 1.8;
  color: #4b5563;
}

.markdown-content {
  line-height: 1.8;
  color: #374151;
  font-size: 0.95rem;
  padding: 0.5rem;
}

.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 2rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.markdown-content h2 {
  font-size: 1.3rem;
  font-weight: 650;
  color: #1f2937;
  margin: 1.75rem 0 0.875rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.markdown-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 1.5rem 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* 句子分析结果中的特殊样式 */
.markdown-content .sentence-highlight {
  padding: 0.2rem 0.3rem;
  background-color: #f0f9ff;
  border-radius: 3px;
  margin: 0 0.1rem;
  font-family: 'Georgia', serif;
  font-size: 1rem;
  display: inline-block;
}

.markdown-content strong {
  color: #6366f1;
  font-weight: 600;
}

.markdown-content em {
  color: #059669;
  font-style: italic;
}

.markdown-content code {
  background: #f3f4f6;
  color: #ef4444;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

/* 支持带颜色的文本 */
.markdown-content font[color] {
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}

.markdown-content p {
  margin: 0.75rem 0;
  text-align: justify;
}

.markdown-content ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.markdown-content li {
  margin: 0.5rem 0;
  line-height: 1.7;
  color: #4b5563;
}

/* 嵌套列表样式 */
.markdown-content .list-item.indent-1 {
  margin-left: 1rem;
}

.markdown-content .list-item.indent-2 {
  margin-left: 2rem;
}

.markdown-content .list-item.indent-3 {
  margin-left: 3rem;
}

.markdown-content li::marker {
  color: #6366f1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reader-main {
    flex-direction: column;
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

  .vocab-sidebar.active,
  .quiz-sidebar.active {
    width: 100%;
    margin-left: 0;
    margin-top: 1rem;
  }

  .sidebar-content {
    max-height: 20rem;
  }

  .sentence-toolbar {
    position: static;
    transform: none;
    opacity: 1;
    visibility: visible;
    margin-top: 0.5rem;
  }

  .article-title {
    font-size: 1.25rem;
  }

  .article-body {
    font-size: 0.95rem;
    line-height: 1.8;
  }
}
</style>