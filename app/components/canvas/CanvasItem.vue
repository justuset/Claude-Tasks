<script setup lang="ts">
import type { CanvasItem } from '~/types/canvas'

const props = defineProps<{
  item: CanvasItem
}>()

const emit = defineEmits<{
  'drag-end': [id: string, x: number, y: number]
  'resize-end': [id: string, width: number, height: number]
  'bring-to-front': []
  'remove': []
}>()

const isDragging = ref(false)
const localX = ref(props.item.x)
const localY = ref(props.item.y)
const localW = ref(props.item.width)
const localH = ref(props.item.height)

watch(() => props.item.x, (v) => { if (!isDragging.value) localX.value = v })
watch(() => props.item.y, (v) => { if (!isDragging.value) localY.value = v })
watch(() => props.item.width, (v) => { localW.value = v })
watch(() => props.item.height, (v) => { localH.value = v })

const itemStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${localX.value}px`,
  top: `${localY.value}px`,
  width: `${localW.value}px`,
  height: `${localH.value}px`,
  zIndex: props.item.zIndex,
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

// ---- Drag ----
let dragStartX = 0
let dragStartY = 0
let itemStartX = 0
let itemStartY = 0

function startDrag(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.resize-handle')) return
  e.preventDefault()
  emit('bring-to-front')
  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  itemStartX = localX.value
  itemStartY = localY.value
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

function onDrag(e: MouseEvent) {
  localX.value = itemStartX + (e.clientX - dragStartX)
  localY.value = itemStartY + (e.clientY - dragStartY)
}

function stopDrag() {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  isDragging.value = false
  emit('drag-end', props.item.id, localX.value, localY.value)
}

// ---- Resize ----
let resizeStartX = 0
let resizeStartY = 0
let startW = 0
let startH = 0
let aspectRatio = 1

function startResize(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('bring-to-front')
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  startW = localW.value
  startH = localH.value
  aspectRatio = startW / startH
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  const dx = e.clientX - resizeStartX
  let newW = Math.max(80, startW + dx)
  let newH = newW / aspectRatio
  localW.value = newW
  localH.value = newH
}

function stopResize() {
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  emit('resize-end', props.item.id, localW.value, localH.value)
}
</script>

<template>
  <div
    class="canvas-item"
    :style="itemStyle"
    @mousedown="startDrag"
  >
    <img :src="item.imageData" class="canvas-image" draggable="false" />

    <div class="resize-handle" @mousedown="startResize" />

    <button class="canvas-item-delete" @click.stop="$emit('remove')" aria-label="Remove image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.canvas-item {
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
  user-select: none;
}

.canvas-item:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.canvas-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  background: var(--accent);
  border-radius: 2px 0 var(--radius-md) 0;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.canvas-item:hover .resize-handle {
  opacity: 1;
}

.canvas-item-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  opacity: 0;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.canvas-item:hover .canvas-item-delete {
  opacity: 1;
}

.canvas-item-delete:hover {
  color: var(--priority-high);
  background: var(--bg-surface);
}
</style>
