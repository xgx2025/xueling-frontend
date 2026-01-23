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
                <span class="total-count">共 {{ words.length }} 个</span>
             </div>
          </div>

          <el-card shadow="never" class="table-card" :body-style="{ padding: '0' }">
            <el-table 
              v-if="words.length > 0"
              :data="words" 
              style="width: 100%" 
              :header-cell-style="{ background: '#fff', color: '#909399', fontWeight: '500', borderBottom: '1px solid #f0f2f5' }"
              :row-class-name="'word-row'"
            >
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
              
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="scope">
                  <el-tooltip content="编辑" placement="top">
                    <el-button circle size="small" type="primary" plain :icon="Edit" @click="editWord(scope.row)" />
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button circle size="small" type="danger" plain :icon="Delete" @click="deleteWord(scope.$index)" />
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
                       <el-progress type="dashboard" :percentage="35" :width="130" :stroke-width="8" color="#409EFF">
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
                      <el-icon class="mr-2"><VideoPlay /></el-icon> 开始今日复习
                   </el-button>
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

    <!-- 添加/编辑单词弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEditing ? '编辑单词' : '添加新单词'" 
      width="500px"
      align-center
    >
      <el-form label-width="80px" class="custom-form">
        <el-form-item label="单词">
          <el-input v-model="newWord.word" placeholder="例如: Apple" />
        </el-form-item>
        <el-form-item label="音标">
          <el-input v-model="newWord.phonetic" placeholder="例如: ˈæpl" />
        </el-form-item>
        <el-form-item label="释义">
          <el-input 
            v-model="newWord.meaning" 
            type="textarea" 
            :rows="2"
            placeholder="例如: n. 苹果" 
          />
        </el-form-item>
        <el-divider content-position="left">扩展信息 (选填)</el-divider>
        <el-form-item label="例句(英)">
          <el-input v-model="newWord.exampleEn" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="例句(中)">
          <el-input v-model="newWord.exampleCn" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetDialog">取消</el-button>
          <el-button type="primary" @click="saveWord">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, VideoPlay, Edit, Delete, Microphone, Search, DataLine, Trophy } from '@element-plus/icons-vue'
import { Vue3Lottie } from 'vue3-lottie'

const route = useRoute()
const router = useRouter()
const bookId = route.params.id
const bookName = ref('CET-4 核心词') 
const dialogVisible = ref(false)
const isEditing = ref(false)

const searchQuery = ref('')
const filterStatus = ref('all')

const newWord = ref({
    word: '',
    phonetic: '',
    meaning: '',
    exampleEn: '',
    exampleCn: ''
})

const words = ref([
  { word: 'Ambiguous', phonetic: '/æmˈbɪɡjuəs/', meaning: 'adj. 模棱两可的；含糊不清的', exampleEn: '', exampleCn: '' },
  { word: 'Benevolent', phonetic: '/bəˈnevələnt/', meaning: 'adj. 仁慈的；慈善的', exampleEn: '', exampleCn: '' },
  { word: 'Comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', meaning: 'adj. 全面的；综合的', exampleEn: '', exampleCn: '' },
])

const startReview = () => {
    router.push(`/english/vocab/review/${bookId}`)
}

const saveWord = () => {
    if(!newWord.value.word) return;
    
    // 模拟保存逻辑
    if (isEditing.value) {
       // 更新逻辑...实际应查找ID更新
       // 这里为了演示简单处理，假装更新了最后一个（实际逻辑需要修改）
       // 在前端演示中，我们可能只是关闭弹窗
    } else {
       words.value.push({...newWord.value});
    }
    
    resetDialog();
}

const editWord = (row: any) => {
  isEditing.value = true
  newWord.value = { ...row }
  dialogVisible.value = true
}

const deleteWord = (index: number) => {
    words.value.splice(index, 1);
}

const resetDialog = () => {
  dialogVisible.value = false
  isEditing.value = false
  newWord.value = {
        word: '',
        phonetic: '',
        meaning: '',
        exampleEn: '',
        exampleCn: ''
  }
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
}

.action-area {
  text-align: center;
}

.start-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 44px;
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
</style>
