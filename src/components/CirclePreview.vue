<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { exportCirclesToPhz, downloadPhzFile } from '@/services/phzExporter'
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

const notificationStore = useNotificationStore()
const canvas = ref<HTMLCanvasElement | null>(null)
const isExporting = ref(false)

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

const handleExport = async () => {
  if (props.circles.length === 0) {
    notificationStore.createNewItem({
      id: -1,
      message: 'No circles to export. Create some first.',
      type: 'warning'
    })
    return
  }

  isExporting.value = true
  try {
    const blob = await exportCirclesToPhz(props.circles)
    downloadPhzFile(blob, 'generated_circles.phz')
    notificationStore.createNewItem({
      id: -1,
      message: `Successfully exported ${props.circles.length} circle(s) to PHZ file!`,
      type: 'success'
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    notificationStore.createNewItem({
      id: -1,
      message: `Export failed: ${errorMsg}`,
      type: 'error'
    })
    console.error('Export error:', error)
  } finally {
    isExporting.value = false
  }
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
      <div class="info-left">{{ circles.length }} circles rendered</div>
      <button
        @click="handleExport"
        :disabled="isExporting || circles.length === 0"
        class="btn-export"
      >
        {{ isExporting ? 'Exporting...' : 'Export to PHZ' }}
      </button>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-left {
  flex: 1;
}

.btn-export {
  padding: 6px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-export:hover:not(:disabled) {
  background-color: #218838;
}

.btn-export:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
