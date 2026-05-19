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

// Canvas transform state
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)

// Background image state
const backgroundImage = ref<HTMLImageElement | null>(null)
const bgImageX = ref(0)
const bgImageY = ref(0)
const bgImageScale = ref(1)
const isMovingImage = ref(false)

const drawCircles = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // Save context state
  ctx.save()

  // Apply transforms
  ctx.translate(canvas.value.width / 2 + panX.value, canvas.value.height / 2 + panY.value)
  ctx.scale(zoom.value, zoom.value)

  // Draw background image if loaded
  if (backgroundImage.value) {
    ctx.globalAlpha = 0.5
    ctx.drawImage(
      backgroundImage.value,
      bgImageX.value - (backgroundImage.value.width * bgImageScale.value) / 2,
      bgImageY.value - (backgroundImage.value.height * bgImageScale.value) / 2,
      backgroundImage.value.width * bgImageScale.value,
      backgroundImage.value.height * bgImageScale.value
    )
    ctx.globalAlpha = 1
  }

  // Draw grid
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1 / zoom.value
  for (let x = -500; x < 500; x += 50) {
    ctx.beginPath()
    ctx.moveTo(x, -500)
    ctx.lineTo(x, 500)
    ctx.stroke()
  }
  for (let y = -500; y < 500; y += 50) {
    ctx.beginPath()
    ctx.moveTo(-500, y)
    ctx.lineTo(500, y)
    ctx.stroke()
  }

  // Draw origin axes
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2 / zoom.value
  ctx.beginPath()
  ctx.moveTo(-500, 0)
  ctx.lineTo(500, 0)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -500)
  ctx.lineTo(0, 500)
  ctx.stroke()

  // Draw circles
  props.circles.forEach(circle => {
    const screenX = circle.x
    const screenY = -circle.y // Flip Y axis

    ctx.fillStyle = circle.color
    ctx.beginPath()
    ctx.arc(screenX, screenY, Math.max(2 / zoom.value, circle.radius), 0, 2 * Math.PI)
    ctx.fill()

    // Draw border
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1 / zoom.value
    ctx.stroke()
  })

  // Restore context state
  ctx.restore()
}

onMounted(() => {
  drawCircles()
})

watch(() => props.circles, () => {
  drawCircles()
}, { deep: true })

watch([zoom, panX, panY], () => {
  drawCircles()
})

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const rect = canvas.value?.getBoundingClientRect()
  if (!rect) return

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(10, zoom.value * zoomFactor))

  // Adjust pan to zoom towards cursor
  const scaleDiff = newZoom - zoom.value
  panX.value -= (x - rect.width / 2) * (scaleDiff / zoom.value)
  panY.value -= (y - rect.height / 2) * (scaleDiff / zoom.value)

  zoom.value = newZoom
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = event.clientX - panX.value
  dragStartY.value = event.clientY - panY.value
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    panX.value = event.clientX - dragStartX.value
    panY.value = event.clientY - dragStartY.value
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      backgroundImage.value = img
      bgImageX.value = 0
      bgImageY.value = 0
      bgImageScale.value = 1
      drawCircles()
      notificationStore.createNewItem({
        id: -1,
        message: 'Background image loaded. Drag to move, scroll to zoom.',
        type: 'success'
      })
    }
    img.onerror = () => {
      notificationStore.createNewItem({
        id: -1,
        message: 'Failed to load image',
        type: 'error'
      })
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const clearBackground = () => {
  backgroundImage.value = null
  bgImageX.value = 0
  bgImageY.value = 0
  bgImageScale.value = 1
  drawCircles()
  notificationStore.createNewItem({
    id: -1,
    message: 'Background image cleared',
    type: 'success'
  })
}

const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
  drawCircles()
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
    <div class="canvas-controls">
      <div class="control-group">
        <label class="btn-label">
          <input type="file" accept="image/*" @change="handleImageUpload" style="display: none" />
          Upload Background
        </label>
        <button v-if="backgroundImage" @click="clearBackground" class="btn-control btn-danger">
          Clear BG
        </button>
        <button @click="resetView" class="btn-control">Reset View</button>
        <span class="zoom-indicator">Zoom: {{ (zoom * 100).toFixed(0) }}%</span>
      </div>
      <div class="control-group">
        <button
          @click="handleExport"
          :disabled="isExporting || circles.length === 0"
          class="btn-export"
        >
          {{ isExporting ? 'Exporting...' : 'Export to PHZ' }}
        </button>
      </div>
    </div>

    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="preview-canvas"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    />

    <div class="canvas-info">
      <div class="info-left">{{ circles.length }} circles | Pan: drag | Zoom: scroll</div>
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
  background-color: #f5f5f5;
}

.canvas-controls {
  padding: 12px;
  background-color: #e8e8e8;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-label {
  padding: 6px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-label:hover {
  background-color: #5a6268;
}

.btn-control {
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-control:hover {
  background-color: #0056b3;
}

.btn-control.btn-danger {
  background-color: #dc3545;
}

.btn-control.btn-danger:hover {
  background-color: #c82333;
}

.zoom-indicator {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  padding: 0 8px;
}

.preview-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 800 / 600;
  max-height: 100%;
  border: 1px solid #ddd;
  cursor: grab;
  background-color: #f5f5f5;
  object-fit: contain;
}

.preview-canvas:active {
  cursor: grabbing;
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

.canvas-info {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
}

.info-left {
  flex: 1;
}
</style>
