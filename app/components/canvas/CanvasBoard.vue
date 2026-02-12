<script setup lang="ts">
const canvasStore = useCanvasStore()
const viewportRef = ref<HTMLElement | null>(null)

function handlePaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const blob = item.getAsFile()
      if (!blob) continue

      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        const img = new Image()
        img.onload = () => {
          let width = img.naturalWidth
          let height = img.naturalHeight
          const maxWidth = 600
          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }
          const offsetX = Math.random() * 100 - 50
          const offsetY = Math.random() * 100 - 50
          const vpW = viewportRef.value?.clientWidth || 800
          const vpH = viewportRef.value?.clientHeight || 600
          const x = Math.max(20, vpW / 2 - width / 2 + offsetX)
          const y = Math.max(20, vpH / 2 - height / 2 + offsetY)
          canvasStore.addItem(imageData, x, y, width, height)
        }
        img.src = imageData
      }
      reader.readAsDataURL(blob)
    }
  }
}

function onDragEnd(id: string, x: number, y: number) {
  canvasStore.updateItemPosition(id, x, y)
}

function onResizeEnd(id: string, width: number, height: number) {
  canvasStore.updateItemSize(id, width, height)
}

onMounted(() => {
  // Auto-focus viewport for paste events
  viewportRef.value?.focus()
})
</script>

<template>
  <div
    ref="viewportRef"
    class="canvas-board dot-grid-bg"
    tabindex="0"
    @paste="handlePaste"
  >
    <CanvasItem
      v-for="item in canvasStore.items"
      :key="item.id"
      :item="item"
      @drag-end="onDragEnd"
      @resize-end="onResizeEnd"
      @bring-to-front="canvasStore.bringToFront(item.id)"
      @remove="canvasStore.removeItem(item.id)"
    />

    <div v-if="canvasStore.items.length === 0" class="canvas-empty">
      <div class="canvas-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      </div>
      <h3 class="canvas-empty-title">Paste screenshots here</h3>
      <p class="canvas-empty-subtitle">Cmd+V to paste images from your clipboard</p>
      <p class="canvas-empty-hint">Drag to move · Corner to resize</p>
    </div>
  </div>
</template>

<style scoped>
.canvas-board {
  flex: 1;
  position: relative;
  overflow: auto;
  outline: none;
}

.canvas-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  pointer-events: none;
}

.canvas-empty-icon {
  color: var(--text-muted);
  opacity: 0.4;
  margin-bottom: 4px;
}

.canvas-empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.canvas-empty-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.canvas-empty-hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  opacity: 0.6;
  margin-top: 4px;
}
</style>
