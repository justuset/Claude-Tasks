import { defineStore } from 'pinia'
import type { Task, Category, Priority } from '~/types/task'

const STORAGE_KEY = 'claude-tasks'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function loadTasks(): Task[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTasks(tasks: Task[]) {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    activeCategory: null as Category | null,
    searchQuery: '',
    hydrated: false,
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
    hydrate() {
      if (this.hydrated) return
      this.tasks = loadTasks()
      this.hydrated = true
    },

    addTask(title: string, category: Category, priority: Priority = 'medium', dueDate?: string) {
      const task: Task = {
        id: generateId(),
        title: title.trim(),
        category,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
      }
      this.tasks.unshift(task)
      saveTasks(this.tasks)
    },

    toggleComplete(id: string) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.completed = !task.completed
        saveTasks(this.tasks)
      }
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      saveTasks(this.tasks)
    },

    updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'priority' | 'dueDate'>>) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        Object.assign(task, updates)
        saveTasks(this.tasks)
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
