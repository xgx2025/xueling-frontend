<template>
  <div class="interactive-background" ref="container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let width = 0
let height = 0
let particles: Particle[] = []

// 配置参数
const particleCount = 80 // 粒子数量
const connectionDistance = 140 // 连线距离
const mouseDistance = 180 // 鼠标互动距离

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  baseColor: string // 用于连线颜色取样
}

// 更多彩的配色方案，符合学习和炫酷的主题
const colors = [
  '64, 158, 255',   // 品牌蓝
  '59, 130, 246',   // 深一点的蓝
  '139, 92, 246',   // 紫色
  '236, 72, 153',   // 粉色
  '16, 185, 129',   // 绿色
  '245, 158, 11'    // 橙色
]

let mouse = { x: -1000, y: -1000 } // 初始鼠标位置在屏幕外
let animationFrameId: number

const initParticles = () => {
  particles = []
  for (let i = 0; i < particleCount; i++) {
    const colorStr = colors[Math.floor(Math.random() * colors.length)]
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5, // 稍微加快一点速度
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 3 + 1.5, // 稍微变大
      color: `rgba(${colorStr}, ${Math.random() * 0.5 + 0.3})`, // 增加不透明度
      baseColor: colorStr || '64, 158, 255'
    })
  }
}

const draw = () => {
  if (!ctx || !canvas.value) return
  const context = ctx
  context.clearRect(0, 0, width, height)

  // 更新和绘制粒子
  particles.forEach(p => {
    // 移动
    p.x += p.vx
    p.y += p.vy

    // 边界反弹
    if (p.x < 0 || p.x > width) p.vx = -p.vx
    if (p.y < 0 || p.y > height) p.vy = -p.vy

    // 鼠标互动（排斥/吸引）
    const dx = mouse.x - p.x
    const dy = mouse.y - p.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    
    // 简单的鼠标"扰动"效果，让粒子活跃一点
    if (dist < mouseDistance) {
       const forceDirectionX = dx / dist
       const forceDirectionY = dy / dist
       const force = (mouseDistance - dist) / mouseDistance
       
       // 靠近鼠标时稍微加速跑开或靠近，这里做成轻微吸引
       p.vx += forceDirectionX * force * 0.05
       p.vy += forceDirectionY * force * 0.05
    }

    // 绘制点
    context.beginPath()
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    context.fillStyle = p.color
    context.fill()
  })

  // 连线
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i]
    if (!p1) continue

    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      if (!p2) continue

      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < connectionDistance) {
        context.beginPath()
        // 使用两个点颜色的混合或者深色，这里使用稍深的颜色增加可见度
        context.strokeStyle = `rgba(100, 100, 120, ${0.25 * (1 - dist / connectionDistance)})` 
        context.lineWidth = 1
        context.moveTo(p1.x, p1.y)
        context.lineTo(p2.x, p2.y)
        context.stroke()
      }
    }
    
    // 鼠标连线
    const dx = mouse.x - p1.x
    const dy = mouse.y - p1.y
    const dist = Math.sqrt(dx * dx + dy * dy)
     if (dist < mouseDistance) {
        context.beginPath()
        context.strokeStyle = `rgba(64, 158, 255, ${0.5 * (1 - dist / mouseDistance)})`
        context.lineWidth = 1.2
        context.moveTo(mouse.x, mouse.y)
        context.lineTo(p1.x, p1.y)
        context.stroke()
     }
  }

  animationFrameId = requestAnimationFrame(draw)
}

const handleResize = () => {
  if (container.value && canvas.value) {
    width = container.value.clientWidth
    height = container.value.clientHeight
    canvas.value.width = width
    canvas.value.height = height
    // 重新分布粒子，避免resize后粒子堆积
    initParticles() 
  }
}

const handleMouseMove = (e: MouseEvent) => {
  // 因为是全屏/背景组件，直接用 clientX/Y 或者相对于视口
  // 但最好是相对于 canvas 元素
  if (canvas.value) {
    const rect = canvas.value.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }
}

const handleMouseLeave = () => {
  mouse.x = -1000
  mouse.y = -1000
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseout', handleMouseLeave)
  
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    handleResize()
    draw()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseout', handleMouseLeave)
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
.interactive-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 事件穿透 */
  z-index: 0; /* 默认层级 */
  overflow: hidden;
}
</style>
