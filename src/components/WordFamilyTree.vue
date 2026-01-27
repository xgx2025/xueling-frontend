<template>
  <div class="chart-container">
    <v-chart class="chart" :option="option" autoresize />
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

// 接收外部传入的单词家族数据
const props = defineProps<{
  data: any
}>()

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove'
  },
  series: [
    {
      type: 'tree',
      data: [props.data],
      top: '1%',
      left: '10%',
      bottom: '1%',
      right: '25%',
      symbolSize: 7,
      orient: 'LR', // Left to Right 从左到右布局
      
      // 线条样式
      itemStyle: {
        borderWidth: 2
      },
      lineStyle: {
        color: '#ccc',
        width: 1.5,
        curveness: 0.5 // 曲线程度，0.5 很平滑，类似脑图
      },
      
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 13,
        fontWeight: 'bold'
      },

      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
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
