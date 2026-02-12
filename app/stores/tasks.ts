import { defineStore } from 'pinia'
import type { Task, Category, Priority } from '~/types/task'

const STORAGE_KEY = 'claude-tasks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// localStorage fallback for static deploys (Netlify)
function loadTasksLocal(): Task[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasksLocal(tasks: Task[]) {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

// Detect if server API is available (dev mode with Nuxt server)
async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/tasks', { method: 'HEAD' })
    return res.ok || res.status === 200
  } catch {
    return false
  }
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    activeCategory: null as Category | null,
    searchQuery: '',
    hydrated: false,
    useApi: false,
  }),

  getters: {
    filteredTasks(state): Task[] {
      let result = state.tasks.filter(t => !t.completed)

      if (state.activeCategory) {
        result = result.filter(t => t.category === state.activeCategory)
      }

      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(t => t.title.toLowerCase().includes(q))
      }

      return result.sort((a, b) => {
        const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
        const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (pDiff !== 0) return pDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    },

    completedTasks(state): Task[] {
      return state.tasks
        .filter(t => t.completed)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },

    taskCountByCategory(state): Record<string, number> {
      const counts: Record<string, number> = {
        all: 0,
        design: 0,
        development: 0,
        research: 0,
        meetings: 0,
        copy: 0,
      }
      for (const t of state.tasks) {
        if (!t.completed) {
          counts.all++
          counts[t.category]++
        }
      }
      return counts
    },

    totalCompleted(state): number {
      return state.tasks.filter(t => t.completed).length
    },
  },

  actions: {
    async hydrate() {
      if (this.hydrated) return

      // Try API first (dev server running), fall back to localStorage (static deploy)
      if (!import.meta.server) {
        this.useApi = await isApiAvailable()

        if (this.useApi) {
          try {
            const tasks = await $fetch<Task[]>('/api/tasks')
            this.tasks = tasks
          } catch {
            this.tasks = loadTasksLocal()
            this.useApi = false
          }
        } else {
          this.tasks = loadTasksLocal()
        }
      }

      this.hydrated = true
    },

    async addTask(title: string, category: Category, priority: Priority = 'medium', dueDate?: string, notes?: string) {
      if (this.useApi) {
        try {
          const task = await $fetch<Task>('/api/tasks', {
            method: 'POST',
            body: { title, category, priority, dueDate, notes },
          })
          this.tasks.unshift(task)
          return
        } catch {
          // Fall through to local
        }
      }

      const task: Task = {
        id: generateId(),
        title: title.trim(),
        notes: notes?.trim() || '',
        category,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
      }
      this.tasks.unshift(task)
      saveTasksLocal(this.tasks)
    },

    async toggleComplete(id: string) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return

      task.completed = !task.completed

      if (this.useApi) {
        try {
          await $fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: { completed: task.completed },
          })
          return
        } catch {
          // Already updated locally
        }
      }
      saveTasksLocal(this.tasks)
    },

    async deleteTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id)

      if (this.useApi) {
        try {
          await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
          return
        } catch {
          // Already removed locally
        }
      }
      saveTasksLocal(this.tasks)
    },

    async updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'notes' | 'category' | 'priority' | 'dueDate'>>) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return

      Object.assign(task, updates)

      if (this.useApi) {
        try {
          await $fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            body: updates,
          })
          return
        } catch {
          // Already updated locally
        }
      }
      saveTasksLocal(this.tasks)
    },

    setActiveCategory(category: Category | null) {
      this.activeCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },
  },
})
