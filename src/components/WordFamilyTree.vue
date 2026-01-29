<template>
  <div class="chart-container">
    <v-chart class="chart" :option="option" autoresize @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

// 注册必须的组件
use([
  CanvasRenderer,
  TreeChart,
  TitleComponent,
  TooltipComponent
])

const emit = defineEmits<{
  (e: 'node-click', params: any): void
}>()

// 接收外部传入的单词家族数据
const props = defineProps<{
  data: any
}>()

// 处理点击事件
const handleClick = (params: any) => {
  emit('node-click', params)
}

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#e4e7ed',
    textStyle: {
      color: '#606266'
    },
    enterable: true,
    extraCssText: 'box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15); border-radius: 8px;',
    formatter: '{b}' // 只显示当前节点的名称，不显示完整路径
  },
  series: [
    {
      type: 'tree',
      data: [props.data],
      top: '5%',
      left: '15%',
      bottom: '5%',
      right: '25%',
      symbolSize: 14,
      symbol: 'emptyCircle',
      orient: 'LR',
      
      // 节点基础样式
      itemStyle: {
        color: '#fff',
        borderColor: '#409EFF',
        borderWidth: 3,
        shadowBlur: 4,
        shadowColor: 'rgba(0, 0, 0, 0.1)'
      },

      // 连线样式
      lineStyle: {
        color: '#dcdfe6',
        width: 1.5,
        curveness: 0.5
      },
      
      // 非叶子节点标签样式 (Root & Intermediate)
      // 改为显示在节点上方，避免遮挡水平连线
      label: {
        position: 'top',
        verticalAlign: 'bottom',
        align: 'center',
        fontSize: 14,
        color: '#303133',
        fontWeight: 'bold',
        backgroundColor: '#fff', 
        borderColor: '#EBEEF5',
        borderWidth: 1,
        borderRadius: 8,
        padding: [6, 10],
        distance: 10,
        rich: {
          // 这里可以预留富文本样式
        }
      },

      // 叶子节点样式
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left',
          distance: 12,
          backgroundColor: '#f4f4f5',
          borderColor: '#e9e9eb',
          color: '#606266',
          fontWeight: 'normal'
        }
      },

      // 高亮/悬停样式
      emphasis: {
        focus: 'ancestor', // 聚焦时高亮祖先路径
        scale: true,
        itemStyle: {
          color: '#409EFF',
          borderWidth: 4
        },
        lineStyle: {
          color: '#409EFF',
          width: 2.5
        },
        label: {
          color: '#409EFF',
          borderColor: '#c6e2ff',
          backgroundColor: '#ecf5ff'
        }
      },

      expandAndCollapse: true,
      initialTreeDepth: 0, // 初始展开层级：0（仅显示根节点，点击展开第一层分支，引导思考）
      animationDuration: 550,
      animationDurationUpdate: 750
    }
  ]
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
.chart {
  height: 100%;
  width: 100%;
}
</style>
