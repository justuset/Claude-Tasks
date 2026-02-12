import { defineStore } from 'pinia'
import type { CanvasItem } from '~/types/canvas'

const STORAGE_KEY = 'claude-tasks-canvas'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadItems(): { items: CanvasItem[]; nextZIndex: number } {
  if (import.meta.server) return { items: [], nextZIndex: 1 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], nextZIndex: 1 }
    const data = JSON.parse(raw)
    return {
      items: data.items || [],
      nextZIndex: data.nextZIndex || 1,
    }
  } catch {
    return { items: [], nextZIndex: 1 }
  }
}

function saveState(items: CanvasItem[], nextZIndex: number) {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, nextZIndex }))
}

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    items: [] as CanvasItem[],
    nextZIndex: 1,
    hydrated: false,
  }),

  actions: {
    hydrate() {
      if (this.hydrated) return
      const saved = loadItems()
      this.items = saved.items
      this.nextZIndex = saved.nextZIndex
      this.hydrated = true
    },

    addItem(imageData: string, x: number, y: number, width: number, height: number) {
      const item: CanvasItem = {
        id: generateId(),
        imageData,
        x,
        y,
        width,
        height,
        zIndex: this.nextZIndex++,
        createdAt: new Date().toISOString(),
      }
      this.items.push(item)
      saveState(this.items, this.nextZIndex)
    },

    updateItemPosition(id: string, x: number, y: number) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.x = x
        item.y = y
        saveState(this.items, this.nextZIndex)
      }
    },

    updateItemSize(id: string, width: number, height: number) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.width = width
        item.height = height
        saveState(this.items, this.nextZIndex)
      }
    },

    bringToFront(id: string) {
      const item = this.items.find(i => i.id === id)
      if (item) {
        item.zIndex = this.nextZIndex++
        saveState(this.items, this.nextZIndex)
      }
    },

    removeItem(id: string) {
      this.items = this.items.filter(i => i.id !== id)
      saveState(this.items, this.nextZIndex)
    },

    clearAll() {
      this.items = []
      this.nextZIndex = 1
      saveState(this.items, this.nextZIndex)
    },
  },
})
