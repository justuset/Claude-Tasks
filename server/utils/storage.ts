import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export interface StoredTask {
  id: string
  title: string
  notes: string
  category: 'design' | 'development' | 'research' | 'meetings' | 'copy'
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: string
  dueDate?: string
}

const TASKS_DIR = join(homedir(), '.claude-tasks')
const TASKS_FILE = join(TASKS_DIR, 'tasks.json')

function ensureDir() {
  if (!existsSync(TASKS_DIR)) {
    mkdirSync(TASKS_DIR, { recursive: true })
  }
}

export function readTasks(): StoredTask[] {
  ensureDir()
  if (!existsSync(TASKS_FILE)) {
    writeFileSync(TASKS_FILE, '[]', 'utf-8')
    return []
  }
  try {
    const raw = readFileSync(TASKS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeTasks(tasks: StoredTask[]) {
  ensureDir()
  writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
