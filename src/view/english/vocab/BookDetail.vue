<template>
  <div class="book-detail-page">
    <!-- 顶部导航 -->
    <div class="header-section animate__animated animate__fadeInDown">
      <el-page-header @back="router.back()" class="custom-header">
        <template #content>
          <div class="header-title-area">
            <span class="text-large font-600 mr-3"> {{ bookName }} </span>
            <el-tag type="primary" effect="light" round>英语四级</el-tag>
          </div>
        </template>
        <template #extra>
          <div class="header-actions">
            <!-- 主要操作移至右侧栏，这里保留添加 -->
            <el-button circle @click="dialogVisible = true">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </template>
      </el-page-header>
    </div>

    <el-row :gutter="24" class="main-layout">
      <!-- 左侧：核心列表区 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="17">
        <div class="content-section animate__animated animate__fadeInUp">
          <!-- 工具栏 -->
          <div class="action-toolbar">
             <div class="left-tools">
                <el-input 
                  v-model="searchQuery" 
                  placeholder="搜索单词..." 
                  prefix-icon="Search"
                  class="search-input"
                />
                <el-radio-group v-model="filterStatus" class="filter-group">
                  <el-radio-button label="all">全部</el-radio-button>
                  <el-radio-button label="learning">学习中</el-radio-button>
                  <el-radio-button label="mastered">已掌握</el-radio-button>
                </el-radio-group>
             </div>
             <div class="right-tools">
                <span class="total-count">共 {{ filteredWords.length }} 个</span>
             </div>
          </div>

          <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
            <el-table 
              v-if="words.length > 0"
              :data="filteredWords" 
              style="width: 100%" 
              :header-cell-style="{ background: '#fff', color: '#909399', fontWeight: '500', borderBottom: '1px solid #f0f2f5' }"
              :row-class-name="'word-row'"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="55" :selectable="checkSelectable" />
              <el-table-column prop="word" label="单词" width="220">
                <template #default="scope">
                  <div class="word-cell">
                    <span class="word-text">{{ scope.row.word }}</span>
                    <el-button link type="primary" size="small" class="pronounce-btn">
                      <el-icon><Microphone /></el-icon>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="phonetic" label="音标" width="160">
                <template #default="scope">
                  <span class="phonetic-text">{{ scope.row.phonetic }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="meaning" label="释义">
                <template #default="scope">
                  <div class="meaning-text">{{ scope.row.meaning }}</div>
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  
                  <el-tooltip content="删除" placement="top">
                    <el-button circle size="small" type="danger" plain :icon="Delete" @click="deleteWord(scope.row)" />
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <Vue3Lottie
                  animationLink="https://assets3.lottiefiles.com/packages/lf20_s8pbrcfw.json"
                  :height="200"
                  :width="200"
                />
                <p class="empty-text">这里空空如也，快去添加新单词吧！</p>
                <el-button type="primary" plain @click="dialogVisible = true">立即添加</el-button>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <!-- 右侧：数据看板与激励 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="7">
         <div class="side-section animate__animated animate__fadeInRight">
             <!-- 学习看板 -->
             <el-card shadow="never" class="side-card stats-widget">
                <div class="widget-header">
                   <h3><el-icon><DataLine /></el-icon> 学习概览</h3>
                </div>
                <div class="dashboard-area">
                   <div class="chart-container">
                       <el-progress type="dashboard" :percentage="mastery" :width="130" :stroke-width="8" color="#409EFF">
                          <template #default="{ percentage }">
                             <span class="percentage-value">{{ percentage }}%</span>
                             <span class="percentage-label">掌握率</span>
                          </template>
                       </el-progress>
                   </div>
                   <div class="stats-grid">
                      <div class="stat-box">
                         <span class="num text-success">12</span>
                         <span class="label">已掌握</span>
                      </div>
                      <div class="stat-box">
                         <span class="num text-warning">23</span>
                         <span class="label">学习中</span>
                      </div>
                   </div>
                </div>
                <div class="action-area">
                   <el-button type="primary" class="start-btn" size="large" @click="startReview" round>
                      <el-icon class="mr-2"><VideoPlay /></el-icon> 开始复习 / 专项训练
                   </el-button>
                   <div class="review-tips-wrapper">
                     <transition name="el-fade-in" mode="out-in">
                       <!-- 状态 1: 默认提示 (Design Upgrade for Narrow Spaces) -->
                       <div class="tip-card default-tip" v-if="selectedRows.length === 0">
                          <div class="decoration-arrow">
                              <el-icon><ArrowLeft /></el-icon>
                          </div>
                          <div class="tip-content-vertical">
                            <div class="tip-header">
                                <div class="icon-box">
                                    <el-icon><EditPen /></el-icon>
                                </div>
                                <span class="tip-title">自由选词</span>
                                <span class="tip-badge">DIY</span>
                            </div>
                            <div class="tip-desc-row">
                                勾选左侧列表 5~10 个单词即可开启专项训练
                            </div>
                          </div>
                       </div>
                       
                       <!-- 状态 2: 选中反馈 -->
                       <div class="tip-card active-tip" :class="{ 'is-valid': selectedRows.length >= 5 && selectedRows.length <= 10 }" v-else>
                          <div class="selected-count-ring">
                             <span>{{ selectedRows.length }}</span>
                          </div>
                          <div class="tip-content">
                             <div class="status-header">
                                <span class="status-text-main" v-if="selectedRows.length < 5">还需 {{ 5 - selectedRows.length }} 个</span>
                                <span class="status-text-main" v-else-if="selectedRows.length > 10">超出 {{ selectedRows.length - 10 }} 个</span>
                                <span class="status-text-main success-text" v-else>数量合适</span>
                             </div>
                             <div class="status-progress-track">
                                <div class="status-progress-bar" :style="{ width: `${Math.min(selectedRows.length * 10, 100)}%`, background: selectedRows.length > 10 ? '#F56C6C' : (selectedRows.length >= 5 ? '#67C23A' : '#E6A23C') }"></div>
                             </div>
                          </div>
                          <div class="tip-action-icon" v-if="selectedRows.length >= 5 && selectedRows.length <= 10">
                              <el-icon><VideoPlay /></el-icon>
                          </div>
                       </div>
                     </transition>
                   </div>
                </div>
             </el-card>

             <!-- 每日提示 -->
             <el-card shadow="never" class="side-card tip-widget mt-4">
                 <div class="tip-content">
                    <div class="tip-icon-wrapper">
                       <el-icon :size="24" color="#E6A23C"><Trophy /></el-icon>
                    </div>
                    <div class="tip-text">
                       <h4>保持出色状态！</h4>
                       <p>坚持每天复习，遗忘曲线将被你征服。</p>
                    </div>
                 </div>
             </el-card>
         </div>
      </el-col>
    </el-row>

    <!-- 批量添加单词弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="批量添加单词" 
      width="600px"
      align-center
      :close-on-click-modal="false"
    >
      <div class="batch-add-container">
          <!-- 阶段1: 输入 -->
          <div v-if="!isAnalyzed" class="batch-input-step">
              <el-alert title="一次最多添加20个单词，请用英文逗号分隔" type="info" show-icon :closable="false" class="mb-3" />
              <el-input 
                v-model="batchInput"
                type="textarea"
                :rows="8"
                placeholder="例如: apple, banana, orange, grape..."
                resize="none"
              />
              <div class="word-count-tip">
                 当前已输入: {{ batchInput ? batchInput.split(/[,，]/).filter(w=>w.trim()).length : 0 }} / 20
              </div>
          </div>

          <!-- 阶段2: 确认 -->
          <div v-else class="batch-confirm-step">
             <div class="result-header">
                <span class="confirm-title">匹配结果 ({{ batchList.length }})</span>
                <el-button link type="primary" @click="isAnalyzed = false">
                   <el-icon class="mr-1"><RefreshLeft /></el-icon> 重新输入
                </el-button>
             </div>
             
             <!-- 有匹配结果 -->
             <el-scrollbar v-if="batchList.length > 0" max-height="350px" class="result-list">
                <transition-group name="list">
                  <div v-for="(item, index) in batchList" :key="item.word" class="batch-item-row">
                      <div class="batch-word-info">
                          <div class="batch-word-text">{{ item.word }}</div>
                          <div class="batch-word-detail">{{ item.phonetic }} {{ item.meaning }}</div>
                      </div>
                      <el-button circle size="small" type="danger" plain :icon="Delete" @click="removeBatchItem(index)" />
                  </div>
                </transition-group>
             </el-scrollbar>
             
             <!-- 无匹配结果 -->
             <div v-else class="no-match-state">
                <el-empty description="暂无匹配单词" :image-size="120">
                  <template #description>
                    <p class="empty-desc">未找到匹配的单词，请检查输入是否正确</p>
                  </template>
                </el-empty>
             </div>
          </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetDialog">取消</el-button>
          
          <el-button v-if="!isAnalyzed" type="primary" @click="analyzeWords" :loading="isAnalyzing" :disabled="!batchInput">
              <el-icon class="mr-1"><MagicStick /></el-icon> 智能匹配
          </el-button>
          <el-button v-else type="primary" @click="saveWord" :disabled="batchList.length === 0">
              确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 复习分组选择弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="开启复习计划"
      width="640px"
      align-center
      class="review-select-dialog"
      destroy-on-close
    >
      <div class="dialog-body-content">
        <div class="dialog-header-tip">
           <el-alert title="系统已根据当前排序为您生成智能分组，请选择要复习的组别" type="info" :closable="false" show-icon />
        </div>
        
        <el-scrollbar max-height="400px" class="group-scrollbar">
          <div class="review-group-grid">
             <div 
                v-for="group in reviewGroups" 
                :key="group.index"
                class="group-card animate__animated animate__fadeIn"
                :class="{ 'is-disabled': !group.isValid }"
                :style="{ animationDelay: `${group.index * 0.05}s` }"
                @click="group.isValid && startReviewWithWords(group.list)"
             >
                <div class="card-left">
                    <div class="status-icon" :class="group.isValid ? 'bg-blue' : 'bg-gray'">
                        <el-icon v-if="group.isValid" color="#fff"><Collection /></el-icon>
                        <el-icon v-else color="#fff"><Lock /></el-icon>
                    </div>
                </div>
                <div class="card-main">
                   <div class="card-title">{{ group.label }}</div>
                   <div class="card-sub">序列覆盖: {{ group.range }}</div>
                </div>
                <div class="card-right">
                   <el-tag v-if="group.isValid" effect="plain" round type="primary">{{ group.count }} 词</el-tag>
                   <el-tag v-else effect="plain" type="info" size="small">词数不足</el-tag>
                </div>
                
                <!-- 装饰背景 -->
                <div class="card-bg-decoration"></div>
             </div>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, VideoPlay, Edit, Delete, Microphone, Search, DataLine, Trophy, MagicStick, Check, RefreshLeft, ArrowRight, Collection, Lock, InfoFilled, EditPen, ArrowLeft, Mouse } from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'
import { ElMessage, ElMessageBox } from 'element-plus'
import { matchWords, getWordBookDetail, addWordsToBook, removeWordsFromBook } from '@/api/wordbook'
import type { WordDictionary, WordVO } from '@/types/wordbook'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id
const bookName = ref('CET-4 核心词') 
const dialogVisible = ref(false)

const searchQuery = ref('')
const filterStatus = ref('all')
const mastery = ref(0)
const words = ref<WordVO[]>([])
const selectedRows = ref<WordVO[]>([])

const handleSelectionChange = (val: WordVO[]) => {
  selectedRows.value = val
}

const checkSelectable = (row: WordVO) => {
  if (selectedRows.value.length >= 10) {
    // 允许取消勾选已选中的，禁止勾选新的
    return selectedRows.value.some(item => item.id === row.id)
  }
  return true
}

const filteredWords = computed(() => {
  let result = words.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(item => 
      item.word.toLowerCase().includes(query) || 
      item.meaning.toLowerCase().includes(query)
    )
  }

  // 状态过滤 (预留扩展)
  if (filterStatus.value !== 'all') {
    // TODO: 后续根据实际字段过滤 learning/mastered
  }

  return result
})

const loadData = async () => {
  if (!bookId) return
  try {
    const res = await getWordBookDetail(bookId as string)
    if (res.code === 0 && res.data) {
      bookName.value = res.data.name
      mastery.value = res.data.mastery || 0
      // 根据create_time降序排序
      if (res.data.wordList) {
        words.value = res.data.wordList.sort((a, b) => {
          const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
          const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
          return timeB - timeA
        })
      }
    }
  } catch (error) {
    console.error('获取详情失败', error)
    ElMessage.error('获取单词本详情失败')
  }
}

onMounted(() => {
  loadData()
})

// 批量添加相关
const batchInput = ref('')
const batchList = ref<WordDictionary[]>([])
const isAnalyzed = ref(false)
const isAnalyzing = ref(false)

const analyzeWords = async () => {
  if (!batchInput.value.trim()) {
    ElMessage.warning('请输入单词')
    return
  }
  
  const wordsRaw = batchInput.value.split(/[,，\n]/).map(w => w.trim()).filter(w => w)
  if (wordsRaw.length === 0) {
    ElMessage.warning('请输入有效的单词')
    return
  }
  
  // 限制20个
  const finalWords = wordsRaw.slice(0, 20)
  const wordsString = finalWords.join(',')

  isAnalyzing.value = true
  
  try {
    const response = await matchWords(wordsString)
    
    if (response.code === 0) {
      if (response.data && response.data.length > 0) {
        batchList.value = response.data
        isAnalyzed.value = true
        ElMessage.success(`成功匹配 ${response.data.length} 个单词`)
      } else {
        ElMessage.warning('暂无匹配单词，请检查输入是否正确')
        batchList.value = []
      }
    } else {
      ElMessage.error(response.msg || '匹配失败')
    }
  } catch (error: any) {
    console.error('匹配单词失败:', error)
    ElMessage.error(error.message || '匹配失败，请稍后重试')
  } finally {
    isAnalyzing.value = false
  }
}

const removeBatchItem = (index: number) => {
  batchList.value.splice(index, 1)
  if (batchList.value.length === 0) {
     ElMessage.info('已清空匹配列表')
  }
}

// 复习分组相关
const reviewDialogVisible = ref(false)

const reviewGroups = computed(() => {
  const groups = []
  const chunkSize = 10
  const total = words.value.length
  
  if (total === 0) return []

  // 假设 words 已经按时间降序排好
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = words.value.slice(i, i + chunkSize)
    groups.push({
      index: i / chunkSize + 1,
      label: `第 ${Math.floor(i / chunkSize) + 1} 组`,
      range: `${i + 1} - ${Math.min(i + chunkSize, total)}`, // 这里的序号是针对当前排序的
      count: chunk.length,
      list: chunk,
      isValid: chunk.length >= 5
    })
  }
  return groups
})

const startReviewWithWords = (list: WordVO[]) => {
    const ids = list.map(w => w.id).join(',')
    router.push({
      path: `/english/vocab/review/${bookId}`,
      query: { 
        ids,
        bookName: bookName.value
      }
    })
    reviewDialogVisible.value = false
}

const startReview = () => {
    // 1. 优先处理用户手动勾选
    if (selectedRows.value.length > 0) {
        const selection = selectedRows.value
        if (selection.length < 5) {
             ElMessage.warning('复习单词过少（至少5个），无法生成复习计划')
             return
        }
        if (selection.length > 10) {
             ElMessage.warning('单次复习最多选择10个单词')
             return 
        }
        // 直接开始
        startReviewWithWords(selection)
        return
    }

    // 2. 默认流程：检查总数
    if (words.value.length < 5) {
         ElMessage.warning('单词本词汇太少，无法生成复习计划')
         return
    }

    // 3. 打开分组选择弹窗
    reviewDialogVisible.value = true
}

const saveWord = async () => {
    // 批量添加模式
    if (batchList.value.length > 0) {
      if (!bookId) return
      
      const wordIds = batchList.value.map(item => String(item.id))
      
      try {
        const res = await addWordsToBook({
          wordBookId: String(bookId),
          wordIds
        })
        
        if (res.code === 0) {
           ElMessage.success(`成功添加 ${batchList.value.length} 个单词`)
           // 重新加载数据以刷新列表
           loadData()
           resetDialog()
        } else {
           ElMessage.error(res.msg || '添加失败')
        }
      } catch (error: any) {
        console.error('添加单词失败', error)
        ElMessage.error(error.message || '添加失败，请稍后重试')
      }
    }
}

const deleteWord = (row: WordVO) => {
    ElMessageBox.confirm(
      '确定要从单词本中删除该单词吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      if (!bookId || !row.id) return

      try {
        const res = await removeWordsFromBook({
          wordBookId: String(bookId),
          wordIds: [String(row.id)]
        })

        if (res.code === 0) {
          ElMessage.success('删除成功')
          // 移除本地数据或重新加载
          const index = words.value.findIndex(w => w.id === row.id)
          if (index > -1) {
            words.value.splice(index, 1)
          }
          // 或者调用 loadData()
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error: any) {
        console.error('删除单词失败', error)
        ElMessage.error(error.message || '删除失败，请稍后重试')
      }
    }).catch(() => {
      // 取消删除
    })
}

const resetDialog = () => {
  dialogVisible.value = false
  // 重置批量状态
  batchInput.value = ''
  batchList.value = []
  isAnalyzed.value = false
  isAnalyzing.value = false
}
</script>

<style scoped>
.book-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.custom-header :deep(.el-page-header__content) {
  color: #303133;
}

/* Header Section */
.header-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title-area {
  display: flex;
  align-items: center;
}

/* Layout */
.main-layout {
  align-items: flex-start;
}

/* Toolbar */
.action-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.03);
}

.left-tools {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  width: 240px;
}

.total-count {
  font-size: 13px;
  color: #909399;
}

/* Table Card */
.table-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
}

.word-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.word-text {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  font-family: 'Segoe UI', user-scalable, sans-serif;
}

.pronounce-btn {
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
}

.word-cell:hover .pronounce-btn {
  opacity: 1;
  transform: translateX(0);
}

.phonetic-text {
  font-family: 'Lucida Sans Unicode', 'Arial Unicode MS', sans-serif;
  color: #909399;
  font-size: 13px;
  background-color: #f4f4f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.meaning-text {
  color: #606266;
  line-height: 1.6;
}

/* Side Card */
.side-card {
  border-radius: 12px;
  border: none;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.stats-widget {
  padding: 20px;
}

.widget-header h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.dashboard-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.chart-container {
  margin-bottom: 20px;
}

.percentage-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.percentage-label {
  font-size: 12px;
  color: #909399;
}

.stats-grid {
  display: flex;
  width: 100%;
  gap: 12px;
}

.stat-box {
  flex: 1;
  background: #f9fafc;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.stat-box .num {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-box .label {
  font-size: 12px;
  color: #909399;
.review-tips-container {
  height: 24px;
  margin-top: 12px;
}

.custom-review-tip {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
}

.active-tip {
  color: #409EFF;
  font-weight: 500;
}

.status-tag {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.status-tag.valid {
  background: #f0f9eb;
  color: #67c23a;
}

.status-tag.invalid {
  background: #fef0f0;
  color: #f56c6c;
}

}

.action-area {
  text-align: center;
}

.start-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 44px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  transition: all 0.3s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* Review Tips Widget - Vertical Optimize */
.review-tips-wrapper {
  margin-top: 20px;
  /* Min-height allows it to expand without jerkiness */
  min-height: 80px; 
  position: relative;
  perspective: 1000px;
}

.tip-card {
  border-radius: 12px;
  padding: 16px; /* Comfortable padding */
  display: flex;
  flex-direction: column; /* Vertical Layout by default */
  gap: 12px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: visible; /* Allow arrow to poke out if needed */
}

/* Default Tip Design */
.tip-card.default-tip {
  background: #ffffff;
  border: 1px solid #ebedf0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
  padding-left: 18px; /* Space for the left-side decor */
}

.tip-card.default-tip:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.1);
  border-color: #d9ecff;
}

/* Animated Arrow on the Left */
.decoration-arrow {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 40px;
  opacity: 0.6;
  animation: bounce-left 2s infinite;
}

.tip-card:hover .decoration-arrow {
    opacity: 1;
}

@keyframes bounce-left {
  0%, 100% { transform: translate(0, -50%); }
  50% { transform: translate(-4px, -50%); }
}

.tip-content-vertical {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 8px; /* Tighter gap */
}

.icon-box {
  width: 32px;
  height: 32px;
  background: #ecf5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  font-size: 16px;
}

.tip-title {
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  white-space: nowrap; /* Prevent wrapping if possible */
}

.tip-badge {
  font-size: 10px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 800;
  text-transform: uppercase;
}

.tip-desc-row {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  text-align: left;
}

.tip-title {
  font-size: 15px;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.tip-badge {
  font-size: 10px;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(79, 172, 254, 0.3);
}

.tip-desc {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

.tip-arrow-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #409EFF;
  font-size: 12px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 1px dashed #dcdfe6;
  opacity: 0.8;
  transition: all 0.3s;
}

.tip-card:hover .tip-arrow-hint {
  opacity: 1;
  color: #2c3e50;
}

.tip-arrow-hint .text {
  display: none;
}
@media (min-width: 1400px) {
    .tip-arrow-hint .text {
        display: block;
    }
}

.tip-arrow-hint .el-icon {
  animation: slide-left 1.5s infinite;
}

@keyframes slide-left {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
}

/* Active State (Retained and polished) */
.tip-card.active-tip {
  background: #fff;
  border: 1px solid #dcdfe6;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-left: 4px solid #E6A23C;
}

.tip-card.is-valid {
  border-left-color: #67C23A;
  background: linear-gradient(to right, #f0f9eb, #fff);
}

.selected-count-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid #E6A23C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  color: #E6A23C;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-shrink: 0;
  transition: all 0.3s;
}

.is-valid .selected-count-ring {
  border-color: #67C23A;
  color: #67C23A;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.status-text-main {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.success-text {
  color: #67C23A;
}

.status-progress-track {
  height: 6px;
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
  width: 100%;
  overflow: hidden;
}

.status-progress-bar {
  height: 100%;
  background: #E6A23C;
  border-radius: 3px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.4);
}

.is-valid .status-progress-bar {
  background: #67C23A;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}

.tip-action-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #67C23A, #85ce61);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
  animation: pulse 2s infinite;
  transition: transform 0.2s;
}

.tip-action-icon:hover {
  transform: scale(1.1);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}

/* Tip Card */
.tip-widget {
  background: linear-gradient(135deg, #fffbf0 0%, #fff 100%);
  border: 1px solid #faecd8;
}

.tip-content {
  display: flex;
  gap: 12px;
  padding: 10px;
}

.tip-icon-wrapper {
  background: #fff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.15);
  flex-shrink: 0;
}

.tip-text h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #E6A23C;
}

.tip-text p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

/* Color Utils */
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 0;
}

.empty-text {
  color: #909399;
  margin: 16px 0 24px;
  font-size: 15px;
}

/* Custom Overrides */
:deep(.el-page-header__left) {
  margin-right: 20px;
}

/* Table Row Hover */
:deep(.el-table__row) {
  transition: background-color 0.2s;
}

/* Responsive */
@media (max-width: 992px) {
  .left-tools {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}

/* Batch Add Styles */
.mb-3 { margin-bottom: 12px; }
.mr-1 { margin-right: 4px; }
.word-count-tip {
  text-align: right;
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}
.batch-confirm-step .result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.confirm-title {
  font-weight: 600;
  color: #303133;
}
.batch-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}
.batch-item-row:hover {
  background-color: #ecf5ff;
}

/* Review Group Selection Dialog */
.dialog-header-tip {
  margin-bottom: 20px;
}

.review-group-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 4px;
}

.group-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.group-card:not(.is-disabled):hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
  border-color: #a0cfff;
}

.group-card:not(.is-disabled):active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.group-card.is-disabled {
  background: #f5f7fa;
  cursor: not-allowed;
  opacity: 0.8;
  border: 1px dashed #dcdfe6;
}

.card-left {
  margin-right: 12px;
  z-index: 2;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.bg-blue {
  background: linear-gradient(135deg, #409EFF, #79bbff);
}

.bg-gray {
  background: #c8c9cc;
  box-shadow: none;
}

.card-main {
  flex: 1;
  z-index: 2;
  overflow: hidden;
}

.card-title {
  font-weight: 700;
  font-size: 15px;
  color: #303133;
  margin-bottom: 4px;
}

.card-sub {
  font-size: 12px;
  color: #909399;
}

.card-right {
  z-index: 2;
}

/* 装饰背景圆 */
.card-bg-decoration {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08), rgba(64, 158, 255, 0.02));
  border-radius: 50%;
  z-index: 1;
  transition: transform 0.3s;
}

.group-card:hover .card-bg-decoration {
  transform: scale(1.5);
}

.group-scrollbar {
  padding-right: 10px; /* 防止滚动条遮挡 */
}
.batch-word-text {
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}
.batch-word-detail {
  font-size: 12px;
  color: #909399;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* No Match State */
.no-match-state {
  padding: 40px 20px;
  text-align: center;
}

.empty-desc {
  color: #909399;
  font-size: 14px;
  margin: 8px 0 0 0;
}
</style>
