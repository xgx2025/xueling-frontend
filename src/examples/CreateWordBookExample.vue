<template>
  <div class="create-wordbook-example">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>创建单词本示例</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="单词本名称">
          <el-input 
            v-model="form.name" 
            placeholder="请输入单词本名称"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleCreate" :loading="loading">
            创建单词本
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createWordBook } from '@/api/wordbook'

const form = ref({
  name: ''
})

const loading = ref(false)

/**
 * 处理创建单词本
 */
const handleCreate = async () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入单词本名称')
    return
  }
  
  try {
    loading.value = true
    const response = await createWordBook(form.value.name)
    
    if (response.code === 0) {
      ElMessage.success(response.msg || '单词本创建成功')
      // 清空表单
      form.value.name = ''
      // 这里可以添加其他逻辑，比如跳转到单词本列表页
    } else {
      ElMessage.error(response.msg || '创建失败')
    }
  } catch (error: any) {
    console.error('创建单词本失败:', error)
    ElMessage.error(error.message || '创建失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-wordbook-example {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
