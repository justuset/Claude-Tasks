import { defineStore } from 'pinia'
import type { TabView } from '~/types/nav'

const STORAGE_KEY = 'claude-tasks-nav'

function loadNavState(): { sidebarOpen: boolean } {
  if (import.meta.server) return { sidebarOpen: true }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { sidebarOpen: true }
  } catch {
    return { sidebarOpen: true }
  }
}

function saveNavState(sidebarOpen: boolean) {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ sidebarOpen }))
}

export const useNavStore = defineStore('nav', {
  state: () => ({
    sidebarOpen: true,
    activeTab: 'tasks' as TabView,
    history: ['tasks'] as TabView[],
    historyIndex: 0,
    hydrated: false,
  }),

  getters: {
    canGoBack(state): boolean {
      return state.historyIndex > 0
    },
    canGoForward(state): boolean {
      return state.historyIndex < state.history.length - 1
    },
  },

  actions: {
    hydrate() {
      if (this.hydrated) return
      const saved = loadNavState()
      this.sidebarOpen = saved.sidebarOpen
      this.hydrated = true
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      saveNavState(this.sidebarOpen)
    },

    setTab(tab: TabView) {
      if (tab === this.activeTab) return
      // Truncate forward history
      this.history = this.history.slice(0, this.historyIndex + 1)
      this.history.push(tab)
      this.historyIndex = this.history.length - 1
      this.activeTab = tab
    },

    goBack() {
      if (!this.canGoBack) return
      this.historyIndex--
      this.activeTab = this.history[this.historyIndex]
    },

    goForward() {
      if (!this.canGoForward) return
      this.historyIndex++
      this.activeTab = this.history[this.historyIndex]
    },
  },
})
