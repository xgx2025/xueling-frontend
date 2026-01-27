<template>
  <div class="translate-drawer-container" v-if="tokenStore.accessToken">
    <!-- 悬浮按钮 -->
    <div 
      class="translate-fab" 
      @click="toggleDrawer"
      :class="{ 'is-open': isOpen }"
      v-show="!isOpen"
    >
      <el-icon :size="24"><Document /></el-icon>
      <span class="fab-text">翻译</span>
    </div>

    <!-- 侧边抽屉 -->
    <transition name="drawer-slide">
      <div v-if="isOpen" class="translate-drawer">
        <!-- 头部 -->
        <div class="drawer-header">
          <div class="header-title">
            <el-icon :size="20"><Document /></el-icon>
            <span>翻译助手</span>
          </div>
          <el-button 
            circle 
            size="small" 
            @click="toggleDrawer"
            :icon="Close"
          />
        </div>

        <!-- 输入区域 -->
        <div class="input-section">
          <div class="input-wrapper">
            <el-input
              v-model="inputText"
              placeholder="输入要查询的单词"
              clearable
              @keydown.enter="handleTranslate"
              :disabled="isTranslating"
              class="translate-input"
            />
            <el-button
              type="primary"
              :loading="isTranslating"
              @click="handleTranslate"
              :disabled="!inputText.trim()"
              class="translate-btn"
            >
              翻译
            </el-button>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="result-section" v-loading="isTranslating">
          <!-- 错误提示 -->
          <el-alert
            v-if="error"
            :title="error"
            type="error"
            :closable="false"
            show-icon
            class="error-alert"
          />

          <!-- 翻译结果 -->
          <div v-else-if="currentResult" class="result-content">
            <div class="result-card">
              <!-- 单词卡片头部 -->
              <div class="card-header">
                <div class="word-title-row">
                  <h2 class="word-text">{{ currentResult.word }}</h2>
                  <div class="header-actions">
                    <el-button 
                      circle 
                      text
                      @click="showAddToBookDialog"
                      class="action-btn favorite-btn"
                      title="添加到单词本"
                    >
                      <el-icon :size="22"><Star /></el-icon>
                    </el-button>
                    <el-button 
                      circle 
                      text
                      @click="copyResult"
                      class="action-btn"
                      title="复制"
                    >
                      <el-icon :size="18"><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 音标部分 -->
                <div class="phonetic-row">
                  <div class="phonetic-tag">US</div>
                  <span v-if="currentResult.phonetic" class="phonetic-text">
                    /{{ currentResult.phonetic.replace(/^\/|\/$/g, '') }}/
                  </span>
                  <el-icon 
                    class="speaker-icon"
                    :size="18"
                    @click="playPronunciation"
                  >
                      <Microphone />
                  </el-icon>
                </div>
              </div>

              <!-- 释义列表 -->
              <div class="meanings-list">
                <div 
                  v-for="(trans, index) in currentResult.translations" 
                  :key="index"
                  class="meaning-item"
                >
                  <div class="pos-tag-wrapper">
                    <span class="pos-badge">{{ trans.pos }}</span>
                  </div>
                  <div class="meaning-content">
                    {{ trans.meanings.join('；') }}
                  </div>
                </div>
              </div>

              <!-- 例句 -->
              <div v-if="currentResult.examples && currentResult.examples.length > 0" class="examples-section">
                <!-- <div class="section-divider"></div> -->
                <div class="section-title">
                  <el-icon><ChatLineSquare /></el-icon>
                  <span>例句</span>
                </div>
                <div 
                  v-for="(example, index) in currentResult.examples" 
                  :key="index"
                  class="example-card-item"
                >
                  <p class="example-en">{{ example.en }}</p>
                  <p class="example-zh">{{ example.zh }}</p>
                </div>
              </div>

              <!-- 错误反馈 -->
              <div class="feedback-section">
                <el-button link type="info" size="small" @click="handleFeedback">
                   <el-icon style="margin-right: 4px"><Warning /></el-icon>
                   <span>内容有误？点击反馈</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <Vue3Lottie
              animationLink="https://assets2.lottiefiles.com/packages/lf20_uu0x8lqv.json"
              :height="180"
              :width="180"
            />
            <p class="empty-text">输入单词开始翻译</p>
          </div>
        </div>

        <!-- 翻译历史 -->
        <div class="history-section" v-if="recentHistory.length > 0">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            <span>最近翻译</span>
            <el-button
              link
              size="small"
              @click="clearHistory"
              class="clear-btn"
            >
              清空
            </el-button>
          </div>
          <div class="history-list">
            <div
              v-for="item in recentHistory"
              :key="item.id"
              class="history-item"
              @click="retranslate(item.word)"
            >
              <div class="history-word">
                <span class="word">{{ item.word }}</span>
                <span class="time">{{ formatTime(item.timestamp) }}</span>
              </div>
              <el-button
                circle
                size="small"
                @click.stop="removeFromHistory(item.id)"
                :icon="Delete"
                class="delete-btn"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 添加到单词本对话框 -->
    <el-dialog
      v-model="addToBookVisible"
      title="添加到单词本"
      width="360px"
      align-center
      class="add-book-dialog"
    >
      <div class="add-word-header" v-if="currentResult">
        <div class="preview-word">{{ currentResult.word }}</div>
        <div class="preview-phonetic" v-if="currentResult.phonetic">
          /{{ currentResult.phonetic.replace(/^\/|\/$/g, '') }}/
        </div>
      </div>
      
      <el-form label-position="top">
        <el-form-item label="选择目标单词本">
          <el-select
            v-model="selectedBookId"
            placeholder="请选择一个单词本"
            style="width: 100%"
            :loading="loadingBooks"
            :teleported="false"
            class="book-select"
            size="large"
          >
            <el-option
              v-for="book in wordBooks"
              :key="book.id"
              :label="book.name"
              :value="book.id"
            >
              <div class="book-option-item">
                <span class="book-icon">{{ book.icon }}</span>
                <span class="book-name">{{ book.name }}</span>
                <span class="book-count">{{ book.wordCount }} 词</span>
              </div>
            </el-option>
            <template #empty>
               <div class="empty-books">
                  <p>暂无单词本可用</p>
               </div>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addToBookVisible = false" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="handleAddToBook"
            :loading="addingToBook"
            :disabled="!selectedBookId"
            size="large"
            color="#626aef"
          >
            确认收藏
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 反馈对话框 -->
    <el-dialog
      v-model="feedbackVisible"
      title="错误反馈"
      width="420px"
      align-center
    >
      <el-form label-position="top">
        <el-form-item label="问题类型 (必选)">
          <div class="feedback-tags">
            <el-tag
              v-for="type in feedbackTypes"
              :key="type.value"
              :effect="feedbackForm.type === type.value ? 'dark' : 'plain'"
              class="feedback-tag"
              @click="feedbackForm.type = type.value"
              :type="feedbackForm.type === type.value ? 'primary' : 'info'"
              size="large"
            >
              {{ type.label }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="详情描述">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请描述具体问题，帮助我们要改进..."
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitFeedback"
          :loading="submittingFeedback"
          :disabled="!feedbackForm.type"
        >
          提交反馈
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { 
  Document, 
  Close, 
  Microphone, 
  Reading, 
  ChatLineSquare,
  Plus,
  CopyDocument,
  Clock,
  Delete,
  Star,
  Warning
} from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTranslate } from '@/composables/useTranslate'
import { getWordBooks } from '@/api/wordbook'
import { matchWords, addWordsToBook } from '@/api/wordbook'
import type { WordBookVo } from '@/types/wordbook'
import { useTokenStore } from '@/stores/token'

const tokenStore = useTokenStore()
const isOpen = ref(false)
const inputText = ref('')

// 反馈相关
const feedbackVisible = ref(false)
const submittingFeedback = ref(false)
const feedbackForm = reactive({
  type: '',
  content: ''
})

const feedbackTypes = [
  { label: '释义错误', value: 'meaning' },
  { label: '发音问题', value: 'sound' },
  { label: '例句问题', value: 'example' },
  { label: '其他', value: 'other' }
]

// 使用翻译 composable
const {
  isTranslating,
  currentResult,
  error,
  recentHistory,
  translate,
  removeFromHistory,
  clearHistory: clearHistoryFn,
  retranslate: retranslateFn
} = useTranslate()

// 单词本相关
const addToBookVisible = ref(false)
const wordBooks = ref<WordBookVo[]>([])
const selectedBookId = ref<string | null>(null)
const loadingBooks = ref(false)
const addingToBook = ref(false)

// 切换抽屉
const toggleDrawer = () => {
  isOpen.value = !isOpen.value
}

// 执行翻译
const handleTranslate = async () => {
  if (!inputText.value.trim()) return
  await translate(inputText.value)
}

// 播放发音
const playPronunciation = () => {
  if (!currentResult.value?.word) return
  
  try {
    const utterance = new SpeechSynthesisUtterance(currentResult.value.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('发音失败:', error)
    ElMessage.warning('发音功能暂不可用')
  }
}

// 错误反馈
const handleFeedback = () => {
  feedbackForm.type = ''
  feedbackForm.content = ''
  feedbackVisible.value = true
}

// 提交反馈
const submitFeedback = () => {
  if (!feedbackForm.type) {
    ElMessage.warning('请选择反馈类型')
    return
  }
  
  submittingFeedback.value = true
  
  // 模拟提交过程
  setTimeout(() => {
    submittingFeedback.value = false
    feedbackVisible.value = false
    ElMessage.success('感谢您的反馈，我们会尽快处理！')
  }, 800)
}

// 复制结果
const copyResult = () => {
  if (!currentResult.value) return
  
  const text = `${currentResult.value.word} ${currentResult.value.phonetic || ''}\n${
    currentResult.value.translations
      .map(t => `${t.pos} ${t.meanings.join('；')}`)
      .join('\n')
  }`
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 显示添加到单词本对话框
const showAddToBookDialog = async () => {
  addToBookVisible.value = true
  await loadWordBooks()
}

// 加载单词本列表
const loadWordBooks = async () => {
  try {
    loadingBooks.value = true
    console.log('开始加载单词本...')
    const response = await getWordBooks()
    console.log('加载单词本响应:', response)
    
    if (response.code === 0) {
      if (response.data && response.data.length > 0) {
        wordBooks.value = response.data.map((book, index) => ({
          ...book,
          // 如果后端没有返回图标和颜色，则使用默认的
          icon: book.icon || ['📘', '📖', '📚', '📕', '📗', '📙'][index % 6],
          color: book.color || ''
        }))
        console.log('单词本列表已更新:', wordBooks.value)
      } else {
        wordBooks.value = []
        ElMessage.info('您还没有创建单词本，请先去创建')
      }
    } else {
      console.error('业务状态码错误:', response)
      ElMessage.error(response.msg || '加载单词本失败')
    }
  } catch (error: any) {
    console.error('加载单词本网络或未知错误:', error)
    // 尝试提取错误信息
    const msg = error.msg || error.message || '加载出错'
    ElMessage.error(`无法获取单词本: ${msg}`)
  } finally {
    loadingBooks.value = false
  }
}

// 添加到单词本
const handleAddToBook = async () => {
  if (!selectedBookId.value || !currentResult.value) return
  
  try {
    addingToBook.value = true
    const targetWord = currentResult.value.word
    console.log('准备添加单词:', targetWord, '到单词本:', selectedBookId.value)
    
    // 1. 先匹配单词获取 ID
    const matchResponse = await matchWords(targetWord)
    console.log('单词匹配结果:', matchResponse)
    
    if (matchResponse.code === 0 && matchResponse.data && matchResponse.data.length > 0) {
      const wordId = matchResponse.data[0].id
      console.log('获取到单词ID:', wordId)
      
      // 2. 调用后端接口添加到单词本
      const addResponse = await addWordsToBook({
        wordBookId: String(selectedBookId.value),
        wordIds: [String(wordId)]
      })
      console.log('添加单词结果:', addResponse)
      
      if (addResponse.code === 0) {
        ElMessage.success({
          message: '添加成功',
          type: 'success',
          plain: true,
        })
        addToBookVisible.value = false
        selectedBookId.value = null
      } else {
        ElMessage.error(addResponse.msg || '添加失败')
      }
    } else {
      console.warn('词库中未找到该单词:', targetWord)
      ElMessage.warning({
        message: '该单词暂未收录到词库，无法添加',
        duration: 3000
      })
    }
  } catch (error: any) {
    console.error('添加到单词本操作失败:', error)
    ElMessage.error(error.message || '添加失败，请稍后重试')
  } finally {
    addingToBook.value = false
  }
}

// 重新翻译
const retranslate = async (word: string) => {
  inputText.value = word
  await retranslateFn(word)
}

// 清空历史
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空所有翻译历史吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    clearHistoryFn()
    ElMessage.success('已清空历史记录')
  }).catch(() => {})
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

// 监听全局快捷键
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + Shift + T
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
      e.preventDefault()
      toggleDrawer()
    }
  }
  
  window.addEventListener('keydown', handleKeydown)
  
  // 组件卸载时移除监听
  return () => {
    window.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.translate-drawer-container {
  position: fixed;
  z-index: 9998;
}

/* 悬浮按钮 */
.translate-fab {
  position: fixed;
  bottom: 110px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(132, 250, 176, 0.4);
  user-select: none;
}

.translate-fab:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(132, 250, 176, 0.5);
}

.fab-text {
  font-size: 11px;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.5px;
}

/* 抽屉 */
.translate-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 9999;
}

/* 头部 */
.drawer-header {
  padding: 20px;
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

/* 输入区域 */
.input-section {
  padding: 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.translate-input {
  flex: 1;
}

.translate-btn {
  height: 40px;
  padding: 0 24px;
}

/* 结果区域 */
.result-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.error-alert {
  margin-bottom: 16px;
}

.result-content {
  animation: fadeIn 0.3s ease;
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

/* 单词头部 */
.card-header {
  margin-bottom: 24px;
}

.word-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.word-text {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  color: #9ca3af;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #4b5563;
}

.favorite-btn:hover {
  color: #fbbf24;
}

.phonetic-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.phonetic-tag {
  background: #f3f4f6;
  color: #6b7280;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
}

.phonetic-text {
  font-family: 'Lucida Sans Unicode', sans-serif;
  color: #4b5563;
  font-size: 15px;
}

.speaker-icon {
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.speaker-icon:hover {
  color: #84fab0;
}

/* 释义列表 */
.meanings-list {
  margin-bottom: 32px;
}

.meaning-item {
  display: flex;
  margin-bottom: 16px;
  line-height: 1.6;
}

.pos-tag-wrapper {
  min-width: 48px;
  flex-shrink: 0;
  padding-top: 1px;
  margin-right: 12px;
}

.pos-badge {
  display: inline-block;
  background: #f3e8ff; /* Lavender */
  color: #7e22ce; /* Purple */
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.meaning-content {
  flex: 1;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
}

/* 例句 */
.examples-section {
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 16px;
}

.example-card-item {
  margin-bottom: 16px;
  padding: 0 4px;
}

.example-en {
  color: #374151;
  font-size: 15px;
  margin: 0 0 4px 0;
  font-weight: 500;
  font-style: normal;
}

.example-zh {
  color: #9ca3af;
  font-size: 13px;
  margin: 0;
}

/* 错误反馈 */
.feedback-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #f3f4f6;
}

.feedback-section .el-button {
  color: #9ca3af;
  font-size: 12px;
}

.feedback-section .el-button:hover {
  color: #ef4444;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-text {
  color: #9ca3af;
  font-size: 15px;
  margin-top: 16px;
}

/* 历史记录 */
.history-section {
  border-top: 1px solid #e5e7eb;
  padding: 16px 20px;
  background: #f9fafb;
}

.history-section .section-title {
  border-bottom: none;
  margin-bottom: 12px;
  justify-content: space-between;
}

.clear-btn {
  color: #ef4444;
  font-size: 13px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.history-item:hover {
  background: #f0fdf4;
  border-color: #84fab0;
  transform: translateX(-2px);
}

.history-word {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-word .word {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.history-word .time {
  font-size: 12px;
  color: #9ca3af;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}


/* 反馈标签 */
.feedback-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feedback-tag {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.feedback-tag:hover {
  transform: translateY(-1px);
}
.history-item:hover .delete-btn {
  opacity: 1;
}

/* 抽屉动画 */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}

/* 响应式 */
@media (max-width: 768px) {
  .translate-drawer {
    width: 100%;
  }
  
  .translate-fab {
    bottom: 90px;
    right: 20px;
    width: 56px;
    height: 56px;
  }
}

/* 滚动条样式 */
.result-section::-webkit-scrollbar {
  width: 6px;
}

.result-section::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.result-section::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.result-section::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 添加到单词本弹窗样式 */
.add-word-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.preview-word {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.preview-phonetic {
  font-family: 'Lucida Sans Unicode', sans-serif;
  color: #6b7280;
  margin-top: 4px;
  font-size: 13px;
}

.book-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 12px;
}

.book-option-item {
  display: flex;
  align-items: center;
  width: 100%;
}

.book-icon {
  margin-right: 10px;
  font-size: 18px;
}

.book-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-count {
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.empty-books {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}

.dialog-footer .el-button {
  flex: 1;
}

:deep(.add-book-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.add-book-dialog .el-dialog__header) {
  padding: 20px 24px 10px;
  margin-right: 0;
}

:deep(.add-book-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.add-book-dialog .el-dialog__body) {
  padding: 10px 24px 20px;
}

:deep(.add-book-dialog .el-dialog__footer) {
  padding: 10px 24px 24px;
  border-top: none;
}
</style>
