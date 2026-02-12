import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'
import type { Task, Category, Priority } from '~/types/task'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category,
    priority: row.priority,
    completed: row.completed,
    createdAt: row.created_at,
    dueDate: row.due_date ?? undefined,
  }
}

function getClient() {
  const config = useRuntimeConfig()
  return createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
  )
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    activeCategory: null as Category | null,
    searchQuery: '',
    hydrated: false,
    _channel: null as any,
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
      if (import.meta.server) return

      const supabase = getClient()

      // Initial load
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        this.tasks = data.map(rowToTask)
      }

      this.hydrated = true

      // Realtime subscription — picks up changes from MCP, other tabs, or Netlify
      this._channel = supabase
        .channel('tasks-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = rowToTask(payload.new)
            if (!this.tasks.find(t => t.id === incoming.id)) {
              this.tasks.unshift(incoming)
            }
          } else if (payload.eventType === 'UPDATE') {
            const idx = this.tasks.findIndex(t => t.id === (payload.new as any).id)
            if (idx !== -1) {
              this.tasks[idx] = rowToTask(payload.new)
            }
          } else if (payload.eventType === 'DELETE') {
            this.tasks = this.tasks.filter(t => t.id !== (payload.old as any).id)
          }
        })
        .subscribe()
    },

    async addTask(title: string, category: Category, priority: Priority = 'medium', dueDate?: string, notes?: string) {
      const supabase = getClient()
      const newId = generateId()

      // Optimistic insert
      const optimistic: Task = {
        id: newId,
        title: title.trim(),
        notes: notes?.trim() || '',
        category,
        priority,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
      }
      this.tasks.unshift(optimistic)

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: newId,
          title: optimistic.title,
          notes: optimistic.notes,
          category,
          priority,
          completed: false,
          created_at: optimistic.createdAt,
          due_date: dueDate ?? null,
        })
        .select()
        .single()

      if (error) {
        // Rollback optimistic insert
        this.tasks = this.tasks.filter(t => t.id !== newId)
      } else if (data) {
        // Replace optimistic with confirmed row
        const idx = this.tasks.findIndex(t => t.id === newId)
        if (idx !== -1) this.tasks[idx] = rowToTask(data)
      }
    },

    async toggleComplete(id: string) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return

      // Optimistic update
      task.completed = !task.completed

      const supabase = getClient()
      const { error } = await supabase
        .from('tasks')
        .update({ completed: task.completed })
        .eq('id', id)

      if (error) {
        // Rollback
        task.completed = !task.completed
      }
    },

    async deleteTask(id: string) {
      // Optimistic delete
      const backup = [...this.tasks]
      this.tasks = this.tasks.filter(t => t.id !== id)

      const supabase = getClient()
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) {
        this.tasks = backup
      }
    },

    async updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'notes' | 'category' | 'priority' | 'dueDate'>>) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return

      // Optimistic update
      const original = { ...task }
      Object.assign(task, updates)

      const rowUpdates: any = {}
      if (updates.title !== undefined) rowUpdates.title = updates.title
      if (updates.notes !== undefined) rowUpdates.notes = updates.notes
      if (updates.category !== undefined) rowUpdates.category = updates.category
      if (updates.priority !== undefined) rowUpdates.priority = updates.priority
      if (updates.dueDate !== undefined) rowUpdates.due_date = updates.dueDate

      const supabase = getClient()
      const { error } = await supabase
        .from('tasks')
        .update(rowUpdates)
        .eq('id', id)

      if (error) {
        Object.assign(task, original)
      }
    },

    setActiveCategory(category: Category | null) {
      this.activeCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    teardown() {
      if (this._channel) {
        const supabase = getClient()
        supabase.removeChannel(this._channel)
        this._channel = null
      }
    },
  },
})
