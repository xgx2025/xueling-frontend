<template>
  <div class="review-page">
    <!-- 装饰背景圆 -->
    <div class="background-shape shape-1"></div>
    <div class="background-shape shape-2"></div>

    <!-- 左侧脑图区域 -->
    <div class="mind-map-panel" v-if="currentWordFamily">
        <WordFamilyTree :data="currentWordFamily" @node-click="handleMindMapClick" />
    </div>

    <!-- 顶部导航与进度 -->
    <div class="review-header glass-panel">
      <div class="header-top">
        <el-page-header @back="router.back()">
          <template #content>
            <span class="header-title">{{ currentBookName }}</span>
          </template>
        </el-page-header>
        <div class="progress-badge">
          <span class="current">{{ Math.min(currentIndex + 1, cards.length) }}</span>
          <span class="separator">/</span>
          <span class="total">{{ cards.length }}</span>
        </div>
      </div>
      <el-progress 
        :percentage="progressPercentage" 
        :format="format"
        :stroke-width="8" 
        color="#4facfe"
        track-color="#ffffff"
        class="review-progress"
      />
    </div>

    <!-- 卡片区域 -->
    <div class="card-container" v-if="currentCard">
      <div class="card-wrapper">
        <div 
          class="flashcard" 
          :class="{ flipped: isFlipped }" 
          @click="isFlipped = !isFlipped"
        >
          <!-- 正面 -->
          <div class="card-face card-front">
            <div class="voice-icon-wrapper" @click.stop="playAudio(currentCard.word)">
                 <el-icon><Microphone /></el-icon>
            </div>
            
            <div class="card-image-box" v-if="currentCard.imageUrl">
               <img :src="currentCard.imageUrl" :alt="currentCard.word" />
            </div>

            <div class="card-content-center">
              <span class="word">{{ currentCard.word }}</span>
              <span class="phonetic">
                /{{ currentCard.phonetic }}/
              </span>
            </div>
            <div class="card-hint">
              <span>点击翻转</span>
            </div>
          </div>

          <!-- 背面 -->
          <div class="card-face card-back">
            <div class="card-content-scroll">
              <div class="meaning-wrapper">
                 <h3 class="meaning">{{ currentCard.meaning }}</h3>
              </div>
              <div class="example-box">
                <div class="example-item">
                    <p class="example-en">{{ currentCard.exampleEn }}</p>
                    <p class="example-cn">{{ currentCard.exampleCn }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="actions">
        <button class="action-btn forget" @click.stop="handleResult('forget')">
            <div class="btn-content">
                <el-icon><Close /></el-icon>
                <span>不认识</span>
            </div>
        </button>
        
        <button class="action-btn remember" @click.stop="handleResult('remember')">
            <div class="btn-content">
                <el-icon><Check /></el-icon>
                <span>认识</span>
            </div>
        </button>
      </div>
    </div>

    <!-- 完成状态 -->
    <div v-else class="completion-stage">
        <!-- 1. Simple Completion Card -->
        <div v-if="!showConsolidation" class="completion-container glass-panel">
            <div class="success-icon-wrapper">
                <el-icon class="success-icon"><Trophy /></el-icon>
            </div>
            <h2>今日复习完成！</h2>
            <p>坚持就是胜利，明天继续加油</p>
            
            <div class="completion-actions">
                <el-button size="large" round class="back-btn" @click="router.back()">
                    <el-icon><Back /></el-icon> 返回列表
                </el-button>
                <el-button 
                    color="#626aef" 
                    size="large" 
                    round 
                    class="consolidate-btn" 
                    @click="startConsolidation"
                >
                    <el-icon><MagicStick /></el-icon> AI 智能巩固
                </el-button>
            </div>
        </div>

        <!-- 2. Full Screen Immersive Consolidation -->
        <transition name="fade-slide">
        <div v-if="showConsolidation" class="consolidation-overlay">
            <!-- Top Bar -->
            <div class="overlay-header">
                <div class="header-left">
                    <div class="logo-text">⚡ AI 智能巩固</div>
                </div>
                <div class="header-center">
                    <h2 class="story-title-mini">{{ consolidationData.title }}</h2>
                </div>
                <div class="header-right">
                    <el-button circle @click="showConsolidation = false">
                        <el-icon><Close /></el-icon>
                    </el-button>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="cons-content-wrapper" v-if="!isGenerating">
                <!-- Left: Story Reader -->
                <div class="cons-left-panel">
                    <div class="story-scroll-container">
                        <div class="story-hero-image">
                             <img :src="consolidationData.imageUrl" alt="Scene" />
                             <div class="image-overlay-controls">
                                 <el-button circle size="large" @click="toggleAudio" class="play-btn-overlay">
                                     <el-icon v-if="isPlaying"><VideoPause /></el-icon>
                                     <el-icon v-else><VideoPlay /></el-icon>
                                 </el-button>
                             </div>
                        </div>

                        <div 
                            class="story-text-body" 
                            :class="{ 'mask-mode': isMasked }"
                            v-html="highlightedContent"
                            @click="handleWordClick"
                        ></div>
                    </div>
                </div>

                <!-- Right: Interactive Tools -->
                <div class="cons-right-panel glass-panel">
                    <div class="tools-tabs">
                        <div class="tool-card">
                            <div class="tool-header">
                                <h3><el-icon><Monitor /></el-icon> 学习看板</h3>
                            </div>
                            <!-- Word Mastery List -->
                            <div class="word-checklist">
                                <div 
                                    v-for="card in cards" 
                                    :key="card.id" 
                                    class="check-item glass-effect-sm"
                                    :class="{ 'is-mastered': wordStatusMap[card.word]?.mastered }"
                                >
                                    <div class="status-icon">
                                        <el-icon v-if="wordStatusMap[card.word]?.mastered" color="#67C23A"><Check /></el-icon>
                                        <div class="check-dot" v-else></div>
                                    </div>
                                    <span class="check-word">{{ card.word }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Spelling Challenge Box -->
                        <transition name="fade">
                        <div class="tool-card highlight-card" v-if="isMasked">
                            <div class="tool-header">
                                <h3><el-icon><EditPen /></el-icon> 拼写挑战</h3>
                            </div>
                            <div v-if="currentSpellingWord" class="spelling-box">
                                <div class="spelling-hint">
                                    <span class="hint-label">释义:</span>
                                    {{ currentSpellingMeaning }}
                                </div>
                                <el-input 
                                    v-model="spellingInput" 
                                    placeholder="输入单词..." 
                                    @keyup.enter="checkSpelling"
                                    size="large"
                                    ref="spellingInputRef"
                                    class="spelling-input"
                                >
                                    <template #append>
                                        <el-button @click="checkSpelling">确认</el-button>
                                    </template>
                                </el-input>
                                <div class="feedback-msg" :class="feedbackType" v-if="feedbackMsg">
                                    {{ feedbackMsg }}
                                </div>
                            </div>
                            <div v-else class="empty-spelling">
                                <p>👈 点击左侧文章中的空格 [ ] 开始拼写</p>
                            </div>
                        </div>
                        </transition>

                        <div class="tool-actions">
                             <el-button 
                                type="primary" 
                                plain 
                                size="large" 
                                class="action-toggle"
                                @click="toggleMaskMode"
                            >
                                <el-icon v-if="isMasked"><View /></el-icon>
                                <span>{{ isMasked ? '退出挑战' : '开启填空模式' }}</span>
                            </el-button>
                             <div class="bottom-btns">
                                <el-button size="default" @click="startConsolidation" round>
                                    <el-icon><RefreshRight /></el-icon> 换每篇
                                </el-button>
                                <el-button type="primary" size="default" @click="router.back()" round>完成</el-button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="loading-overlay">
                 <div class="loading-content">
                    <div class="loader-animation"></div>
                    <p>正在生成个性化学习内容...</p>
                 </div>
            </div>

            <!-- Floating Tooltip -->
            <div 
                v-if="activeTooltip.visible" 
                class="word-tooltip glass-effect"
                :style="{ left: activeTooltip.x + 'px', top: activeTooltip.y + 'px' }"
            >
                <div class="tooltip-word">{{ activeTooltip.word }}</div>
                <div class="tooltip-meaning">{{ activeTooltip.meaning }}</div>
                <div class="tooltip-arrow"></div>
            </div>
        </div>
        </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Check, Close, Microphone, Trophy, MagicStick, Back, RefreshRight, VideoPlay, VideoPause, View, Hide, EditPen, Monitor, Service } from '@element-plus/icons-vue'
import { ElMessage, ElNotification } from 'element-plus'
import WordFamilyTree from '@/components/WordFamilyTree.vue'
import { getWordsByIds, getWordFamily } from '@/api/wordbook'
import type { WordFamilyNodeVO } from '@/types/wordbook'
import { useReviewStore } from '@/stores/review'

const router = useRouter()
const route = useRoute()
const reviewStore = useReviewStore()

const currentBookName = ref(reviewStore.bookName || 'CET-4 核心词')
const isFlipped = ref(false)
const currentIndex = ref(0) // 当前索引，从 0 开始
const isLoading = ref(false)

// AI 巩固相关状态
const showConsolidation = ref(false)
const isGenerating = ref(false)
const isMasked = ref(false)
const isPlaying = ref(false)
const audioPlayer = ref<SpeechSynthesisUtterance | null>(null)
const activeTooltip = ref({ x: 0, y: 0, visible: false, word: '', meaning: '' })

// 新增交互状态
const spellingInput = ref('')
const currentSpellingWord = ref('')
const currentSpellingMeaning = ref('')
const spellingInputRef = ref<any>(null)
const feedbackMsg = ref('')
const feedbackType = ref('')
// 记录每个单词的掌握状态 (spelling correct)
const wordStatusMap = ref<Record<string, { mastered: boolean }>>({})

const consolidationData = ref({
    title: '',
    content: '',
    imageUrl: ''
})

const startConsolidation = async () => {
    showConsolidation.value = true
    isGenerating.value = true
    isMasked.value = false
    currentSpellingWord.value = ''
    wordStatusMap.value = {} // 重置状态
    if (typeof cancelAudio === 'function') cancelAudio()
    
    // 模拟 AI 生成过程
    setTimeout(() => {
        generateMockStory()
        isGenerating.value = false
    }, 2000)
}

const toggleMaskMode = () => {
    isMasked.value = !isMasked.value
    currentSpellingWord.value = '' 
    activeTooltip.value.visible = false
    if (isMasked.value) {
        ElMessage.info('已开启拼写挑战模式，点击文中 [ ] 空格开始拼写')
    }
}

const checkSpelling = () => {
    if (!currentSpellingWord.value) return
    
    const input = spellingInput.value.trim().toLowerCase()
    const target = currentSpellingWord.value.trim().toLowerCase()

    if (input === target) {
        feedbackMsg.value = '🎉 Correct! You marked it!'
        feedbackType.value = 'success'
        // 记录状态
        wordStatusMap.value[currentSpellingWord.value] = { mastered: true }
        // 播放提示音或特效（可选）
        
        // 延迟清空并关闭
        setTimeout(() => {
            spellingInput.value = ''
            currentSpellingWord.value = ''
            feedbackMsg.value = ''
        }, 1200)
    } else {
        feedbackMsg.value = '❌ Try again...'
        feedbackType.value = 'error'
    }
}

const generateMockStory = () => {
    const words = cards.value.map(c => c.word)
    const topicWord = words[0] || 'Journey'
    
    consolidationData.value = {
        title: `The ${topicWord} Adventure`,
        content: `Once upon a time, there was a student who wanted to master English. 
The journey was **${words[0] || 'ambiguous'}**, but the student was **${words[1] || 'benevolent'}** enough to help others along the way.
Through **${words[2] || 'comprehensive'}** study and **${words[3] || 'diligence'}**, they became **${words[4] || 'eloquent'}** speakers.
Eventually, they realized that every word has its own magic...`,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/600/300`
    }
}

// 高亮单词处理：注入数据以支持交互
const highlightedContent = computed(() => {
    let content = consolidationData.value.content
    
    // 创建单词-释义映射表
    const meaningMap = new Map(cards.value.map(c => [c.word.toLowerCase(), c.meaning]))

    // 假设 AI 返回的内容中，关键词用 **word** 包裹
    // 我们将其转换为带有 data 属性的 span
    return content.replace(/\*\*(.*?)\*\*/g, (match, word) => {
        const cleanWord = word.trim().replace(/[.,!?;:]/g, '') // 简单清理标点
        const matchedCard = cards.value.find(c => c.word.toLowerCase() === cleanWord.toLowerCase())
        const meaning = matchedCard ? matchedCard.meaning : '点击查看释义' // 降级处理
        
        return `<span class="highlight-word" data-word="${word}" data-meaning="${meaning}">${word}</span>`
    })
    .replace(/\n/g, '<br/>')
})

const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    return voices.find(v => v.name.includes('Google US English')) || 
           voices.find(v => v.name.includes('Microsoft Zira')) ||    
           voices.find(v => v.lang === 'en-US') || 
           voices.find(v => v.lang.startsWith('en')) ||
           null
}

// 音频控制
const toggleAudio = () => {
    if (isPlaying.value) {
        window.speechSynthesis.cancel()
        isPlaying.value = false
    } else {
        // 去除 Markdown 标记和 HTML 标签，确保朗读纯文本
        const text = consolidationData.value.content
            .replace(/\*\*/g, '')
            .replace(/<[^>]+>/g, '')
            
        const utterance = new SpeechSynthesisUtterance(text)
        
        // 尝试选择更有磁性的英语发音
        const voice = getBestVoice()
        if (voice) {
            utterance.voice = voice
        }

        utterance.lang = 'en-US'
        utterance.rate = 0.85 // 适中的语速，适合听力磨耳朵
        utterance.pitch = 1
        
        utterance.onend = () => { isPlaying.value = false }
        utterance.onerror = (e) => { 
            console.error('Speech synthesis error:', e)
            isPlaying.value = false 
        }
        
        window.speechSynthesis.speak(utterance)
        isPlaying.value = true
        audioPlayer.value = utterance
    }
}

const cancelAudio = () => {
    window.speechSynthesis.cancel()
    isPlaying.value = false
}

// 单词点击交互（通过事件委托）
const handleWordClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // 点击遮挡的单词
    if (target.classList.contains('highlight-word')) {
        const word = target.getAttribute('data-word') || ''
        const meaning = target.getAttribute('data-meaning') || ''

        // 如果是遮挡模式，点击触发拼写
        if (isMasked.value) {
            currentSpellingWord.value = word
            currentSpellingMeaning.value = meaning
            spellingInput.value = ''
            feedbackMsg.value = ''
            
            // 自动聚焦输入框
            nextTick(() => {
                spellingInputRef.value?.focus()
            })
            return; 
        }

        // 常规模式：显示 Tooltip
        const rect = target.getBoundingClientRect()
        // const container = document.querySelector('.story-content') as HTMLElement
        // 直接使用视口坐标（因為是 fixed overlay）
        
        activeTooltip.value = {
            visible: true,
            x: rect.left + rect.width / 2, 
            y: rect.top, // 显示在上方
            word: word,
            meaning: meaning
        }
        
        // 发音单词
        playAudio(word)

        // 3秒后自动消失
        setTimeout(() => {
            activeTooltip.value.visible = false
        }, 3000)
    } else {
        activeTooltip.value.visible = false
    }
}

onUnmounted(() => {
    cancelAudio()
})

interface ReviewCard {
  id: number
  word: string
  phonetic: string
  meaning: string
  exampleEn: string
  exampleCn: string
  imageUrl?: string
}

const cards = ref<ReviewCard[]>([])
const wordFamilies = ref<Record<string, WordFamilyNodeVO>>({})

const fetchMindMapData = async () => {
    if (cards.value.length === 0) return
    
    // 串行请求所有单词的脑图数据：前一个响应后再请求下一个
    for (const card of cards.value) {
        // 避免重复请求
        if (wordFamilies.value[card.word]) continue;

        try {
            const res = await getWordFamily(card.word)
            if (res.code === 0 && res.data) {
                wordFamilies.value[card.word] = res.data
            }
        } catch (e) {
            console.error(`Failed to fetch family for ${card.word}`, e)
        }
    }
}

const loadData = async () => {
  // 优先从 store 获取 IDs，兼容旧的 URL query 方式（可选）
  const ids = reviewStore.reviewIds.length > 0 ? reviewStore.reviewIds.join(',') : (route.query.ids as string)
  
  if (ids) {
    isLoading.value = true
    try {
      const res = await getWordsByIds(ids)
      if (res.code === 0 && res.data) {
        cards.value = res.data.map(item => ({
            id: item.id,
            word: item.word,
            phonetic: item.phonetic,
            meaning: item.meaning,
            exampleEn: item.example || 'Example sentences coming soon.',
            exampleCn: item.exampleTranslation || '暂无例句',
            imageUrl: item.imageUrl || `https://picsum.photos/seed/${item.id}/400/300`
        }))
        
        // 自动获取脑图数据
        fetchMindMapData()
      } else {
        ElMessage.warning(res.msg || '获取数据失败')
      }
    } catch (error) {
       console.error(error)
       ElMessage.error('网络请求失败')
    } finally {
       isLoading.value = false
    }
  } else {
    // 模拟数据 (Fallback)
    cards.value = [
      { 
        id: 1, 
        word: 'Ambiguous', 
        phonetic: 'æmbɪɡjuəs', 
        meaning: 'adj. 模棱两可的；含糊不清的', 
        exampleEn: 'The instructions were ambiguous.', 
        exampleCn: '说明书写得模棱两可。',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60'
      },
      { 
        id: 2, 
        word: 'Benevolent', 
        phonetic: 'bənevələnt', 
        meaning: 'adj. 仁慈的；慈善的', 
        exampleEn: 'A benevolent donor gave us money.', 
        exampleCn: '一位仁慈的捐赠者给了我们钱。',
        imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=500&auto=format&fit=crop&q=60'
      },
      { 
        id: 3, 
        word: 'Comprehensive', 
        phonetic: 'kɒmprɪhensɪv', 
        meaning: 'adj. 全面的；综合的', 
        exampleEn: 'We offer comprehensive training.', 
        exampleCn: '我们提供全面的培训。',
        imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60'
      },
      { 
        id: 4, 
        word: 'Diligence', 
        phonetic: 'dɪlɪdʒəns', 
        meaning: 'n. 勤奋，勤勉', 
        exampleEn: 'Success requires diligence and hard work.', 
        exampleCn: '成功需要勤奋和努力。',
        imageUrl: 'https://images.unsplash.com/photo-1503428593586-e225b476b52c?w=500&auto=format&fit=crop&q=60'
      },
      { 
        id: 5, 
        word: 'Eloquent', 
        phonetic: 'eləkwənt', 
        meaning: 'adj. 雄辩的；有口才的', 
        exampleEn: 'He gave an eloquent speech.', 
        exampleCn: '他发表了雄辩的演说。',
        imageUrl: 'https://images.unsplash.com/photo-1475721027785-f7a944c6ddef?w=500&auto=format&fit=crop&q=60'
      },
    ]
  }
}

onMounted(() => {
  loadData()
})

// 2. 样式映射配置
const posColorMap: Record<string, string> = {
  'n': '#67C23A',    // 名词 - 绿色
  'v': '#F56C6C',    // 动词 - 红色
  'adj': '#E6A23C',  // 形容词 - 橙色
  'adv': '#409EFF',  // 副词 - 蓝色
  'prep': '#909399', // 介词 - 灰色
  'conj': '#8E44AD'  // 连词 - 紫色
}

// 3. 数据转换函数：后端 VO -> ECharts Option Data
const transformToChartData = (node: WordFamilyNodeVO, parentColor?: string): any => {
  const chartNode: any = { 
    name: node.name || '',
    children: []
  }

  // 根据节点类型配置样式
  if (node.type === 'root') {
    chartNode.itemStyle = { color: '#409EFF', borderColor: '#409EFF' }
    chartNode.label = { backgroundColor: '#ecf5ff', color: '#409EFF', borderColor: '#d9ecff' }
  } else if (node.type === 'pos') {
    // 词性节点
    const color = (node.posCode && posColorMap[node.posCode]) || '#909399'
    chartNode.itemStyle = { color: color, borderColor: color }
    chartNode.lineStyle = { color: color }
    parentColor = color 
  } else if (node.type === 'word') {
     // 单词节点
     const color = parentColor || '#606266'
     chartNode.itemStyle = { color: '#fff', borderColor: color, borderWidth: 2 }
     chartNode.label = { color: '#303133', borderColor: '#DCDFE6', backgroundColor: '#fff' }
     // Pos -> Word 连线：使用词性颜色，强调派生
     chartNode.lineStyle = { color: color }
  } else if (node.type === 'meaning') {
      // 释义节点
      chartNode.itemStyle = { color: 'transparent', borderColor: 'transparent' } 
      chartNode.label = { color: '#909399', backgroundColor: 'transparent', borderColor: 'transparent', padding: 0 }
      // Word -> Meaning 连线：回归浅灰色，弱化辅助信息，构建视觉层级
      chartNode.lineStyle = { color: '#DCDFE6' }
  }

  // 递归处理子节点
  if (node.children && node.children.length > 0) {
    let children = node.children

    // 特殊处理：如果当前是根节点，合并相同名称的词性节点
    // 解决相同词性下多个单词被分散在不同分支的问题
    if (node.type === 'root') {
        const mergedMap = new Map<string, WordFamilyNodeVO>()
        const others: WordFamilyNodeVO[] = []

        children.forEach(child => {
            if (child.type === 'pos') {
                const key = child.name
                if (mergedMap.has(key)) {
                    const existing = mergedMap.get(key)!
                    if (child.children) {
                        existing.children = (existing.children || []).concat(child.children)
                    }
                } else {
                    // 浅拷贝节点并初始化 children 副本
                    mergedMap.set(key, { ...child, children: [...(child.children || [])] })
                }
            } else {
                others.push(child)
            }
        })
        children = [...mergedMap.values(), ...others]
    }

    chartNode.children = children.map(child => transformToChartData(child, parentColor))
  }

  return chartNode
}

const currentCard = computed(() => {
    if (currentIndex.value >= cards.value.length) return null;
    return cards.value[currentIndex.value];
})

// 根据当前卡片自动切换数据
const currentWordFamily = computed(() => {
    if (!currentCard.value) return null;
    
    const familyData = wordFamilies.value[currentCard.value.word]
    if (!familyData) {
        // 如果数据未加载完成，显示一个带状态的根节点
        return {
             name: currentCard.value.word,
             itemStyle: { color: '#909399', borderColor: '#909399', opacity: 0.6 },
             label: { backgroundColor: '#f4f4f5', color: '#909399', borderColor: '#e9e9eb' },
             children: [],
             isLoading: true // 自定义标记
        }
    }
    
    // 转换为前端图表数据
    return transformToChartData(familyData);
})

const handleMindMapClick = (params: any) => {
    if (params.data && params.data.isLoading) {
        ElMessage.info('正在深入挖掘单词族谱，请稍候...')
    }
}

const progressPercentage = computed(() => {
    if (cards.value.length === 0) return 0;
    return Math.floor(((currentIndex.value) / cards.value.length) * 100);
})

const format = (percentage: number) => (percentage === 100 ? 'Finished' : `${percentage}%`)

// 使用浏览器原生 Web Speech API 播放发音
const playAudio = (text: string) => {
  if (!window.speechSynthesis) {
      ElMessage.warning('当前浏览器不支持语音播放')
      return
  }
  // 播放前先取消之前的发音
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  
  // 关键修复：将 utterance 赋值给外部 ref，防止被浏览器垃圾回收导致无声
  audioPlayer.value = utterance

  // 尝试获取声音，如果列表为空（异步加载中），则不设置 voice，使用默认
  const voice = getBestVoice()
  if (voice) {
      utterance.voice = voice
  }
  
  utterance.lang = 'en-US' // 设置为美式英语
  utterance.rate = 0.8 // 稍慢一点点，更清晰
  
  utterance.onend = () => {
      audioPlayer.value = null
  }
  
  utterance.onerror = (e) => {
      console.error('Audio playback error:', e)
      audioPlayer.value = null
  }

  window.speechSynthesis.speak(utterance)
}

const handleResult = (result: 'forget' | 'remember') => {
    // 自动翻回正面
    if (isFlipped.value) {
        isFlipped.value = false;
        // 等待翻转动画一半时间后切换数据，体验更顺滑
        setTimeout(() => {
            if (currentIndex.value < cards.value.length) {
              currentIndex.value++;
            }
        }, 300)
    } else {
        if (currentIndex.value < cards.value.length) {
          currentIndex.value++;
        }
    }
}
</script>

<style scoped>
.review-page {
  width: 100%;
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
}

/* 装饰背景 */
.background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
}
.shape-1 {
  width: 60vw;
  height: 60vw;
  max-width: 600px;
  max-height: 600px;
  background: rgba(79, 172, 254, 0.15);
  top: -200px;
  left: -200px;
}
.shape-2 {
  width: 50vw;
  height: 50vw;
  max-width: 500px;
  max-height: 500px;
  background: rgba(161, 140, 209, 0.15);
  bottom: -150px;
  right: -150px;
}

/* 新增样式：左侧脑图定位 */
.mind-map-panel {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 500px; /* 增加宽度，展示更完整的脑图 */
  height: 600px;
  z-index: 2; /* 确保不被背景圆遮挡，但在 header 下面 */
  /* 可以加个半透明背景方便看清文字 */
  /* background: rgba(255,255,255,0.3); */
  /* backdrop-filter: blur(5px); */
  /* border-radius: 12px; */
}

/* 如果屏幕太小，隐藏脑图，避免遮挡卡片 */
@media (max-width: 1200px) {
  .mind-map-panel {
    display: none;
  }
}

/* 顶部 Header */
.glass-panel {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.07);
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-title {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.progress-badge {
    background: rgba(255, 255, 255, 0.5);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    color: #555;
    font-family: monospace;
}

/* 卡片容器 */
.card-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  perspective: 1200px;
  z-index: 1;
  width: 100%;
  max-width: 600px;
}

.card-wrapper {
  width: 100%;
  height: 520px;
  margin-bottom: 40px;
}

.flashcard {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 
    0 10px 30px -10px rgba(50, 50, 93, 0.25),
    0 5px 15px -10px rgba(0, 0, 0, 0.3),
    inset 0 0 0 2px white; /* 内发光效果 */
  box-sizing: border-box;
  padding: 30px;
  overflow: hidden;
}

/* 卡片 - 正面设计 */
.card-front {
   background: radial-gradient(circle at 10% 20%, rgb(255, 252, 252) 0%, rgb(250, 250, 255) 90.2%);
}

.voice-icon-wrapper {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4facfe;
    cursor: pointer;
    transition: all 0.3s;
}
.voice-icon-wrapper:hover {
    background: #e6eefb;
    transform: scale(1.1);
}

.card-image-box {
  width: 100%;
  max-width: 340px;
  height: 220px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 25px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  border: 6px solid #fff;
  background: #f0f2f5;
}
.card-image-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s;
}
.card-front:hover .card-image-box img {
    transform: scale(1.1);
}

.card-content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.word {
  font-size: 3.5rem;
  font-weight: 800;
  background: -webkit-linear-gradient(315deg, #1e3c72 0%, #2a5298 74%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0px; 
  letter-spacing: -1.5px;
}

.phonetic {
  color: #9aa8b9;
  font-family: 'Times New Roman', serif;
  font-size: 1.4rem;
  margin-top: 10px;
}

.card-hint {
   position: absolute;
   bottom: 30px;
   font-size: 12px;
   color: #ccc;
   text-transform: uppercase;
   letter-spacing: 2px;
}

/* 卡片 - 背面设计 */
.card-back {
  transform: rotateY(180deg);
  background: #fff;
  justify-content: flex-start;
  padding-top: 50px;
}

.meaning-wrapper {
    margin-bottom: 30px;
    position: relative;
}
.meaning-wrapper::after {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: #4facfe;
    margin: 15px auto 0;
    border-radius: 2px;
}

.meaning {
  font-size: 1.6rem;
  color: #333;
  margin: 0;
  text-align: center;
  font-weight: 700;
}

.example-box {
    width: 100%;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    margin-top: 10px;
}
.example-en {
  font-size: 1.15rem;
  color: #2c3e50;
  margin: 0 0 10px 0;
  font-weight: 500;
  line-height: 1.4;
}
.example-cn {
  color: #7f8c8d;
  margin: 0;
}

/* 按钮区域 */
.actions {
  display: flex;
  gap: 20px;
  width: 100%;
  padding: 0 10px;
  justify-content: space-between;
}

.action-btn {
  flex: 1;
  height: 60px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-btn.forget {
    background: #fff0f0;
    color: #ff5252;
}
.action-btn.forget:hover {
    background: #ffdede;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 82, 82, 0.15);
}

.action-btn.remember {
    background: #e8f5e9;
    color: #4caf50;
}
.action-btn.remember:hover {
    background: #c8e6c9;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.15);
}
.action-btn:active {
    transform: scale(0.98);
}

.completion-container {
    width: 100%;
    max-width: 600px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.completion-actions {
    display: flex;
    gap: 20px;
    margin-top: 30px;
    width: 100%;
    justify-content: center;
}

.back-btn, .consolidate-btn {
    min-width: 140px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.consolidate-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}
.consolidate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(118, 75, 162, 0.3);
}

/* 巩固面板样式 - 全屏 Overlay */
.consolidation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #f0f7ff 0%, #dbeafe 100%);
    z-index: 2000;
    display: flex;
    flex-direction: column;
}

.overlay-header {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.logo-text {
    font-weight: 800;
    font-size: 1.2rem;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.story-title-mini {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.cons-content-wrapper {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 30px;
    gap: 30px;
}

/* 左侧：文章阅读区 */
.cons-left-panel {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    display: flex;
    justify-content: center;
}

.story-scroll-container {
    height: 100%;
    overflow-y: auto;
    padding-right: 15px;
    width: 100%;
    max-width: 700px;
}

.story-hero-image {
    width: 100%;
    height: 280px;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 30px;
    position: relative;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}
.story-hero-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-overlay-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 20px;
}
.play-btn-overlay {
    background: rgba(255, 255, 255, 0.9) !important;
    border: none !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.story-text-body {
    font-family: 'Georgia', serif;
    font-size: 1.25rem;
    line-height: 2;
    color: #2d3748;
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

/* 右侧：交互工具区 */
.cons-right-panel {
    width: 380px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.6);
}

.tools-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
}

.tool-card {
    background: rgba(255,255,255,0.6);
    border-radius: 12px;
    padding: 15px;
}

.highlight-card {
    background: linear-gradient(135deg, #fff 0%, #f0f7ff 100%);
    border: 1px solid #c6e2ff;
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
}

.tool-header h3 {
    margin: 0 0 15px 0;
    font-size: 1rem;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 8px;
}

.word-checklist {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.check-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    transition: all 0.3s;
}
.is-mastered {
    background: #f0f9eb;
    color: #67C23A;
    font-weight: 600;
}
.check-dot {
    width: 14px;
    height: 14px;
    border: 2px solid #dcdfe6;
    border-radius: 50%;
}
.status-icon {
    width: 20px;
    display: flex;
    justify-content: center;
}

.spelling-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.spelling-hint {
    font-size: 0.95rem;
    color: #606266;
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    border-left: 3px solid #667eea;
}
.hint-label {
    font-weight: bold;
    font-size: 0.8rem;
    color: #909399;
}
.empty-spelling {
    text-align: center;
    color: #909399;
    padding: 20px 0;
    font-size: 0.9rem;
}

.feedback-msg {
    text-align: center;
    font-weight: bold;
    padding: 5px;
    border-radius: 4px;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.feedback-msg.success { color: #67C23A; background: #e1f3d8; }
.feedback-msg.error { color: #F56C6C; background: #fde2e2; }

@keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
}

.tool-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.action-toggle {
    width: 100%;
}
.bottom-btns {
    display: flex;
    gap: 10px;
    justify-content: space-between;
}
.bottom-btns button {
    flex: 1;
}

/* 深度选择器用于 v-html 内容 */
:deep(.highlight-word) {
    color: #626aef;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid rgba(98, 106, 239, 0.3);
}

:deep(.highlight-word:hover) {
    background: rgba(98, 106, 239, 0.15);
}

/* 遮挡模式（挑战模式）核心样式 */
.mask-mode :deep(.highlight-word) {
    background-color: #e2e8f0;
    color: transparent; /* 隐藏文字 */
    border-bottom: 2px dashed #a0aec0;
    border-radius: 6px;
    min-width: 40px;
    display: inline-block;
    vertical-align: bottom;
    margin: 0 2px;
    user-select: none;
}
.mask-mode :deep(.highlight-word:hover) {
    background-color: #cbd5e0;
    border-color: #718096;
    transform: translateY(-1px);
}

/* 单词 Tooltip 样式 */
.word-tooltip {
    position: fixed; /* Changed to fixed for overlay context */
    background: rgba(44, 62, 80, 0.95);
    color: #fff;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    pointer-events: none;
    transform: translate(-50%, -100%);
    margin-top: -10px;
    z-index: 3000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    text-align: center;
    min-width: 120px;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
}
.tooltip-word {
    font-weight: 700;
    margin-bottom: 4px;
    color: #a0cfff;
    font-size: 1rem;
}
.tooltip-arrow {
    position: absolute;
    bottom: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 6px 6px 0;
    border-style: solid;
    border-color: rgba(44, 62, 80, 0.95) transparent transparent;
}

/* Loading Overlay */
.loading-overlay {
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100% - 60px);
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255,255,255,0.5);
}
.loading-content {
    text-align: center;
    color: #606266;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* 完成状态卡片 & 容器 */
.completion-stage {
    width: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.completion-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.18);
}

.completion-actions {
    display: flex;
    gap: 20px;
    margin-top: 40px;
    justify-content: center;
    width: 100%;
}

.success-icon-wrapper {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
    box-shadow: 0 10px 20px rgba(253, 185, 49, 0.3);
}
.success-icon {
    font-size: 40px;
    color: white;
}
.back-btn {
    width: 150px;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}
.consolidate-btn {
    width: 180px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 6px 15px rgba(118, 75, 162, 0.3);
    transition: transform 0.2s;
}
.consolidate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(118, 75, 162, 0.4);
}
</style>
