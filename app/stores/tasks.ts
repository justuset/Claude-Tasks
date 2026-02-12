import { defineStore } from 'pinia'
import type { Task, Category, Priority } from '~/types/task'

const STORAGE_KEY = 'claude-tasks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

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

async function isApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/tasks', { method: 'GET' })
    return res.ok
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

      if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(
          t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q),
        )
      }

      return result
    },

    completedTasks(state): Task[] {
      return state.tasks.filter(t => t.completed)
    },

    tasksByCategory(state) {
      return (category: Category) => state.tasks.filter(t => t.category === category && !t.completed)
    },

    totalActive(state): number {
      return state.tasks.filter(t => !t.completed).length
    },

    totalCompleted(state): number {
      return state.tasks.filter(t => t.completed).length
    },
  },

  actions: {
    async hydrate() {
      if (this.hydrated) return
      if (import.meta.server) return

      this.useApi = await isApiAvailable()

      if (this.useApi) {
        try {
          const data = await $fetch<Task[]>('/api/tasks')
          this.tasks = data
        } catch {
          this.tasks = loadTasksLocal()
          this.useApi = false
        }
      } else {
        this.tasks = loadTasksLocal()
      }

      this.hydrated = true
    },

    async addTask(title: string, category: Category, priority: Priority = 'medium', dueDate?: string, notes?: string) {
      if (this.useApi) {
        const task = await $fetch<Task>('/api/tasks', {
          method: 'POST',
          body: { title, category, priority, dueDate, notes },
        })
        this.tasks.unshift(task)
      } else {
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
      }
    },

    async toggleComplete(id: string) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return
      task.completed = !task.completed

      if (this.useApi) {
        await $fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          body: { completed: task.completed },
        })
      } else {
        saveTasksLocal(this.tasks)
      }
    },

    async deleteTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id)

      if (this.useApi) {
        await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      } else {
        saveTasksLocal(this.tasks)
      }
    },

    async updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'notes' | 'category' | 'priority' | 'dueDate'>>) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return
      Object.assign(task, updates)

      if (this.useApi) {
        await $fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          body: updates,
        })
      } else {
        saveTasksLocal(this.tasks)
      }
    },

    setActiveCategory(category: Category | null) {
      this.activeCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },
  },
})
