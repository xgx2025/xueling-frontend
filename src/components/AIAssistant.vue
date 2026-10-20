<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useTokenStore } from '@/stores/token'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const tokenStore = useTokenStore()
const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref<Message[]>([
  { id: 1, role: 'assistant', content: '您好！我是您的智能学习助手。有什么我可以帮您的吗？' }
])
const messagesContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

// --- 拖动逻辑 Start ---
const fabRef = ref<HTMLElement | null>(null)
const position = ref({ right: 22, bottom: 22 }) // 使用 right/bottom 定位
const isDragging = ref(false)
const hasMoved = ref(false) // 用于区分点击和拖动

const handleMouseDown = (e: MouseEvent | TouchEvent) => {
  if (isOpen.value) return // 打开聊天窗口时禁止拖动
  
  isDragging.value = true
  hasMoved.value = false
  
  const clientX = 'touches' in e ? (e.touches[0]?.clientX || 0) : e.clientX
  const clientY = 'touches' in e ? (e.touches[0]?.clientY || 0) : e.clientY
  
  // 记录初始位置
  const startX = clientX
  const startY = clientY
  const startRight = position.value.right
  const startBottom = position.value.bottom

  const moveHandler = (me: MouseEvent | TouchEvent) => {
    const curX = 'touches' in me ? (me.touches[0]?.clientX || 0) : me.clientX
    const curY = 'touches' in me ? (me.touches[0]?.clientY || 0) : me.clientY
    
    // 计算位移
    const deltaX = startX - curX // 向左拖，right 变大
    const deltaY = startY - curY // 向上拖，bottom 变大
    
    // 如果移动距离很小，视为点击防抖
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      hasMoved.value = true
    }

    if (hasMoved.value) {
      // 更新位置
      position.value.right = Math.max(10, startRight + deltaX)
      position.value.bottom = Math.max(10, startBottom + deltaY)
    }
  }

  const upHandler = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', moveHandler)
    document.removeEventListener('mouseup', upHandler)
    document.removeEventListener('touchmove', moveHandler)
    document.removeEventListener('touchend', upHandler)
  }

  document.addEventListener('mousemove', moveHandler)
  document.addEventListener('mouseup', upHandler)
  document.addEventListener('touchmove', moveHandler, { passive: false })
  document.addEventListener('touchend', upHandler)
}
// --- 拖动逻辑 End ---

const toggleChat = () => {
    // 如果发生过拖动，则不触发点击事件
  if (hasMoved.value) return

  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content
  })
  
  inputMessage.value = ''
  isLoading.value = true
  scrollToBottom()

  // 模拟AI思考和回复
  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: getMockAIResponse(content)
    })
    isLoading.value = false
    scrollToBottom()
  }, 1000)
}

const getMockAIResponse = (query: string): string => {
  if (query.includes('你好') || query.includes('你是谁')) {
    return '我是学灵平台的AI助手，可以帮助您解答关于英语学习、词汇记忆等方面的问题。'
  }
  if (query.includes('单词') || query.includes('背诵')) {
    return '背诵单词建议采用间隔重复法（Spaced Repetition）。您可以在我们的词汇模块创建生词本进行练习。'
  }
  return '抱歉，我目前还是演示版本，只能简单回答。您可以尝试问我关于平台使用的问题。'
}
</script>

<template>
  <div 
    v-if="tokenStore.accessToken"
    class="ai-assistant-container" 
    ref="fabRef"
    :style="{ right: position.right + 'px', bottom: position.bottom + 'px' }"
  >
    <!-- 聊天窗口 -->
    <transition name="fade-slide">
      <div v-if="isOpen" class="chat-window shadow-lg">
        <div class="chat-header">
          <div class="header-title">
            <span class="ai-avatar-small">🤖</span>
            <span>AI 学灵助手</span>
          </div>
          <button class="close-btn" @click="toggleChat">×</button>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            class="message-wrapper"
            :class="{ 'message-user': msg.role === 'user', 'message-ai': msg.role === 'assistant' }"
          >
            <div class="message-bubble">
              {{ msg.content }}
            </div>
          </div>
          <div v-if="isLoading" class="message-wrapper message-ai">
            <div class="message-bubble typing-indicator">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <input 
            v-model="inputMessage" 
            @keydown.enter="sendMessage"
            type="text" 
            placeholder="输入您的问题..."
            :disabled="isLoading"
          />
          <button @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
            <svg viewBox="0 0 24 24" w="20" h="20" class="send-icon">
              <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- 悬浮球 -->
    <button
      class="fab-button shadow-lg" 
      type="button"
      @mousedown="handleMouseDown"
      @touchstart="handleMouseDown"
      @click="toggleChat" 
      :class="{ 'is-open': isOpen, 'is-dragging': isDragging }"
      :aria-label="isOpen ? '关闭 AI 学灵助手' : '打开 AI 学灵助手'"
      :aria-expanded="isOpen"
    >
      <div class="fab-content">
        <div class="fab-icon" :class="{ 'icon-active': !isOpen, 'icon-hidden': isOpen }">
          <span aria-hidden="true">AI</span>
        </div>
        <div class="fab-icon-close" :class="{ 'icon-active': isOpen, 'icon-hidden': !isOpen }">
          <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
.ai-assistant-container {
  position: fixed;
  /* bottom: 30px; */
  /* right: 30px; */
  z-index: 9999;
  font-family: var(--xl-font-body);
  user-select: none;
  touch-action: none;
}

/* 悬浮球样式 */
.fab-button {
  width: 52px;
  height: 52px;
  border: 1px solid #254b33;
  border-radius: 50%;
  background: var(--xl-brand);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer; /* 或者是 grab */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 5px 16px rgba(36, 59, 45, 0.18);
  position: relative;
  user-select: none;
  overflow: hidden;
}

/* 拖动时的样式 */
.fab-button:active {
  cursor: grabbing;
}

.is-dragging {
  transition: none !important; /* 拖动时必须移除过渡动画，否则会卡顿 */
}

.fab-content {

  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fab-button:hover {
  transform: translateY(-2px);
  background: var(--xl-brand-hover);
  box-shadow: 0 8px 22px rgba(36, 59, 45, 0.22);
}

.fab-button.is-open {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* 图标切换动画 */
.fab-icon, .fab-icon-close {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fab-icon span { font: 800 16px var(--xl-font-display); letter-spacing: .04em; }

.fab-icon.icon-active {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.fab-icon.icon-hidden {
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
  pointer-events: none;
}

.fab-icon-close.icon-active {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.fab-icon-close.icon-hidden {
  opacity: 0;
  transform: scale(0.5) rotate(90deg);
  pointer-events: none;
}

/* 聊天窗口样式 */
.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.05);
  transform-origin: bottom right;
}

@media (max-width: 480px) {
  .chat-window {
    width: 90vw;
    right: -10px;
    height: 60vh;
  }
}


.chat-header {
  padding: 15px 20px;
  background: var(--xl-brand);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  gap: 8px;
}

.ai-avatar-small {
  background: rgba(255,255,255,0.2);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: white;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f9f9fc;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-wrapper {
  display: flex;
  max-width: 80%;
}

.message-user {
  align-self: flex-end;
}

.message-ai {
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-user .message-bubble {
  background-color: var(--xl-brand);
  color: white;
  border-bottom-right-radius: 2px;
}

.message-ai .message-bubble {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.chat-input-area {
  padding: 15px;
  background-color: white;
  border-top: 1px solid #eaeaea;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input-area input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chat-input-area input:focus {
  border-color: var(--xl-brand);
}

.chat-input-area button {
  background-color: var(--xl-brand);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-input-area button:hover:not(:disabled) {
  background-color: var(--xl-brand-hover);
}

.chat-input-area button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.send-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Typing indicator */
.typing-indicator span {
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
  margin: 0 1px;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
