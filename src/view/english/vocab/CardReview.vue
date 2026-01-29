<template>
  <div class="review-page">
    <!-- 装饰背景圆 -->
    <div class="background-shape shape-1"></div>
    <div class="background-shape shape-2"></div>

    <!-- 左侧脑图区域 -->
    <div class="mind-map-panel" v-if="currentWordFamily">
        <WordFamilyTree :data="currentWordFamily" />
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
    <div v-else class="empty-state glass-panel">
      <div class="success-icon-wrapper">
          <el-icon class="success-icon"><Trophy /></el-icon>
      </div>
      <h2>今日复习完成！</h2>
      <p>坚持就是胜利，明天继续加油</p>
      <el-button color="#626aef" size="large" round class="back-btn" @click="router.back()">返回列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Check, Close, Microphone, Trophy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import WordFamilyTree from '@/components/WordFamilyTree.vue'
import { getWordsByIds } from '@/api/wordbook'

const router = useRouter()
const route = useRoute()

const currentBookName = ref((route.query.bookName as string) || 'CET-4 核心词')
const isFlipped = ref(false)
const currentIndex = ref(0) // 当前索引，从 0 开始
const isLoading = ref(false)

interface ReviewCard {
  id: number
  word: string
  phonetic: string
  meaning: string
  exampleEn: string
  exampleCn: string
}

const cards = ref<ReviewCard[]>([])

const loadData = async () => {
  const ids = route.query.ids as string
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
            exampleCn: item.exampleTranslation || '暂无例句'
        }))
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
      { id: 1, word: 'Ambiguous', phonetic: 'æmbɪɡjuəs', meaning: 'adj. 模棱两可的；含糊不清的', exampleEn: 'The instructions were ambiguous.', exampleCn: '说明书写得模棱两可。' },
      { id: 2, word: 'Benevolent', phonetic: 'bənevələnt', meaning: 'adj. 仁慈的；慈善的', exampleEn: 'A benevolent donor gave us money.', exampleCn: '一位仁慈的捐赠者给了我们钱。' },
      { id: 3, word: 'Comprehensive', phonetic: 'kɒmprɪhensɪv', meaning: 'adj. 全面的；综合的', exampleEn: 'We offer comprehensive training.', exampleCn: '我们提供全面的培训。' },
      { id: 4, word: 'Diligence', phonetic: 'dɪlɪdʒəns', meaning: 'n. 勤奋，勤勉', exampleEn: 'Success requires diligence and hard work.', exampleCn: '成功需要勤奋和努力。' },
      { id: 5, word: 'Eloquent', phonetic: 'eləkwənt', meaning: 'adj. 雄辩的；有口才的', exampleEn: 'He gave an eloquent speech.', exampleCn: '他发表了雄辩的演说。' },
    ]
  }
}

onMounted(() => {
  loadData()
})

// 1. 定义后端数据接口
interface WordFamilyNodeVO {
  name: string
  type: 'root' | 'pos' | 'word' | 'meaning'
  posCode?: string | null
  children?: WordFamilyNodeVO[]
}

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
    chartNode.children = node.children.map(child => transformToChartData(child, parentColor))
  }

  return chartNode
}

// 4. 模拟后端返回的数据
const getWordFamilyMock = (word: string): WordFamilyNodeVO => {
    return {
        name: word,
        type: 'root',
        posCode: null,
        children: [
            {
                name: 'n. 名词',
                type: 'pos',
                posCode: 'n',
                children: [
                    { 
                        name: 'happiness', 
                        type: 'word', 
                        posCode: null, 
                        children: [
                            { name: '幸福', type: 'meaning', posCode: null, children: [] }
                        ] 
                    }
                ]
            },
            {
                name: 'adv. 副词',
                type: 'pos',
                posCode: 'adv',
                children: [
                    { 
                        name: 'happily', 
                        type: 'word', 
                        posCode: null, 
                        children: [
                            { name: '快乐地', type: 'meaning', posCode: null, children: [] }
                        ] 
                    }
                ]
            },
            {
                name: 'v. 动词',
                type: 'pos',
                posCode: 'v',
                children: [
                    { 
                        name: 'happify', 
                        type: 'word', 
                        posCode: null, 
                        children: [
                            { name: '使快乐', type: 'meaning', posCode: null, children: [] }
                        ] 
                    }
                ]
            }
        ]
    }
};

const currentCard = computed(() => {
    if (currentIndex.value >= cards.value.length) return null;
    return cards.value[currentIndex.value];
})

// 根据当前卡片自动切换数据
const currentWordFamily = computed(() => {
    if (!currentCard.value) return null;
    
    // 1. 获取模拟的后端数据
    // 假设第一个单词是 Ambiguous，演示 happy 的数据
    const mockBackendData = currentIndex.value === 0 
        ? getWordFamilyMock('happy') 
        : getWordFamilyMock(currentCard.value.word);
    
    // 2. 转换为前端图表数据
    return transformToChartData(mockBackendData);
})

const progressPercentage = computed(() => {
    if (cards.value.length === 0) return 0;
    return Math.floor(((currentIndex.value) / cards.value.length) * 100);
})

const format = (percentage: number) => (percentage === 100 ? 'Finished' : `${percentage}%`)

// 使用浏览器原生 Web Speech API 播放发音
const playAudio = (text: string) => {
  if (!window.speechSynthesis) return
  // 播放前先取消之前的发音
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US' // 设置为美式英语
  utterance.rate = 0.8 // 稍慢一点点，更清晰
  
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
  height: 400px;
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

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    flex: 1;
    width: 100%;
    max-width: 600px;
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
    width: 200px;
    margin-top: 30px;
    box-shadow: 0 10px 20px rgba(98, 106, 239, 0.3);
}
</style>
