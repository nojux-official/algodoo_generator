<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Circle } from '@/composables/useEquationParser'

interface Props {
  circles: Circle[]
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600
})

const canvas = ref<HTMLCanvasElement | null>(null)

const drawCircles = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw grid
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  for (let x = 0; x < canvas.value.width; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.value.height)
    ctx.stroke()
  }
  for (let y = 0; y < canvas.value.height; y += 50) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.value.width, y)
    ctx.stroke()
  }

  // Draw origin axes
  const centerX = canvas.value.width / 2
  const centerY = canvas.value.height / 2
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(centerX, 0)
  ctx.lineTo(centerX, canvas.value.height)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, centerY)
  ctx.lineTo(canvas.value.width, centerY)
  ctx.stroke()

  // Draw circles
  props.circles.forEach(circle => {
    const screenX = centerX + circle.x
    const screenY = centerY - circle.y // Flip Y axis

    ctx.fillStyle = circle.color
    ctx.beginPath()
    ctx.arc(screenX, screenY, Math.max(2, circle.radius), 0, 2 * Math.PI)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.stroke()
  })
}

onMounted(() => {
  drawCircles()
})

watch(() => props.circles, () => {
  drawCircles()
}, { deep: true })

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  // Zoom functionality can be added here in future
}
</script>

<template>
  <div class="canvas-container">
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="preview-canvas"
      @wheel="handleWheel"
    />
    <div class="canvas-info">
      {{ circles.length }} circles rendered
    </div>
  </div>
</template>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-canvas {
  flex: 1;
  border: 1px solid #ddd;
  cursor: crosshair;
  background-color: #f5f5f5;
}

.canvas-info {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
}
</style>
