<template>
  <div class="translate-example-page">
    <div class="example-container">
      <h1>翻译功能演示</h1>
      
      <el-card class="demo-card">
        <template #header>
          <div class="card-header">
            <span>功能说明</span>
          </div>
        </template>
        
        <div class="feature-list">
          <el-alert
            title="翻译助手已集成到全局"
            type="success"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>你可以通过以下方式使用翻译功能：</p>
              <ul>
                <li>点击页面右下角的<strong>绿色翻译按钮</strong></li>
                <li>使用快捷键 <el-tag>Ctrl/Cmd + Shift + T</el-tag></li>
              </ul>
            </template>
          </el-alert>

          <div class="feature-section">
            <h3>✨ 核心功能</h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="feature-item">
                  <el-icon :size="24" color="#84fab0"><Document /></el-icon>
                  <h4>快速翻译</h4>
                  <p>输入单词即可获取详细释义、音标和例句</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-item">
                  <el-icon :size="24" color="#8fd3f4"><Microphone /></el-icon>
                  <h4>语音朗读</h4>
                  <p>点击发音按钮听取标准英语发音</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-item">
                  <el-icon :size="24" color="#a18cd1"><Collection /></el-icon>
                  <h4>添加到单词本</h4>
                  <p>一键将单词添加到你的单词本中</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="feature-item">
                  <el-icon :size="24" color="#fda085"><Clock /></el-icon>
                  <h4>翻译历史</h4>
                  <p>自动保存最近翻译，快速重新查看</p>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="feature-section">
            <h3>🎯 使用示例</h3>
            <el-steps :active="4" finish-status="success" align-center>
              <el-step title="打开翻译" description="点击悬浮按钮" />
              <el-step title="输入单词" description="例如: apple" />
              <el-step title="查看结果" description="释义、音标、例句" />
              <el-step title="添加单词本" description="保存到词库" />
            </el-steps>
          </div>

          <div class="feature-section">
            <h3>⌨️ 快捷键</h3>
            <el-table :data="shortcuts" style="width: 100%">
              <el-table-column prop="key" label="快捷键" width="200">
                <template #default="scope">
                  <el-tag>{{ scope.row.key }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="功能说明" />
            </el-table>
          </div>

          <div class="action-section">
            <el-button type="primary" size="large" @click="openTranslate">
              <el-icon class="mr-2"><Document /></el-icon>
              立即体验翻译功能
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, Microphone, Collection, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const shortcuts = [
  { key: 'Ctrl/Cmd + Shift + T', description: '打开/关闭翻译面板' },
  { key: 'Enter', description: '执行翻译' },
  { key: 'Esc', description: '关闭对话框' }
]

const openTranslate = () => {
  ElMessage.info({
    message: '请查看页面右下角的绿色翻译按钮，或按 Ctrl+Shift+T 打开翻译面板',
    duration: 3000
  })
}
</script>

<style scoped>
.translate-example-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.example-container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 32px;
}

.demo-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.feature-section {
  padding: 20px 0;
}

.feature-section h3 {
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s;
  height: 100%;
}

.feature-item:hover {
  background: #ecf5ff;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(132, 250, 176, 0.2);
}

.feature-item h4 {
  margin: 12px 0 8px;
  color: #2c3e50;
  font-size: 16px;
}

.feature-item p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.action-section {
  text-align: center;
  padding: 20px 0;
}

.mr-2 {
  margin-right: 8px;
}

:deep(.el-alert__content) {
  padding: 0;
}

:deep(.el-alert__content p) {
  margin: 8px 0;
}

:deep(.el-alert__content ul) {
  margin: 8px 0;
  padding-left: 20px;
}

:deep(.el-alert__content li) {
  margin: 4px 0;
}
</style>
