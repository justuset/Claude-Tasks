import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { Task } from '~/types/task'

const DATA_DIR = join(process.cwd(), 'data')
const TASKS_FILE = join(DATA_DIR, 'tasks.json')

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function readTasks(): Promise<Task[]> {
  await ensureDir()
  try {
    const raw = await readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  await ensureDir()
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}
