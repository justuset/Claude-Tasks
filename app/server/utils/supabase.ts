import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_KEY!
  return createClient(url, key)
}

// DB row (snake_case) → Task (camelCase)
export function rowToTask(row: any) {
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

// Task fields (camelCase) → DB row (snake_case)
export function taskToRow(task: any) {
  const row: any = {}
  if (task.id !== undefined) row.id = task.id
  if (task.title !== undefined) row.title = task.title
  if (task.notes !== undefined) row.notes = task.notes
  if (task.category !== undefined) row.category = task.category
  if (task.priority !== undefined) row.priority = task.priority
  if (task.completed !== undefined) row.completed = task.completed
  if (task.createdAt !== undefined) row.created_at = task.createdAt
  if (task.dueDate !== undefined) row.due_date = task.dueDate
  return row
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
