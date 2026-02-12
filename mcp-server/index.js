import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const TASKS_FILE = join(DATA_DIR, 'tasks.json')

const CATEGORIES = ['design', 'development', 'research', 'meetings', 'copy']
const PRIORITIES = ['low', 'medium', 'high']

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

async function readTasks() {
  await ensureDir()
  try {
    const raw = await readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeTasks(tasks) {
  await ensureDir()
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ── MCP Server ───────────────────────────────────────────
const server = new McpServer({
  name: 'claude-tasks',
  version: '1.0.0',
})

// Tool: List tasks
server.tool(
  'list_tasks',
  'List all tasks, optionally filtered by category, priority, or completion status',
  {
    category: z.enum(['design', 'development', 'research', 'meetings', 'copy']).optional().describe('Filter by category'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Filter by priority'),
    completed: z.boolean().optional().describe('Filter by completion status (true = completed, false = active)'),
  },
  async ({ category, priority, completed }) => {
    let tasks = await readTasks()

    if (category) tasks = tasks.filter(t => t.category === category)
    if (priority) tasks = tasks.filter(t => t.priority === priority)
    if (completed !== undefined) tasks = tasks.filter(t => t.completed === completed)

    if (tasks.length === 0) {
      return { content: [{ type: 'text', text: 'No tasks found matching the filters.' }] }
    }

    const lines = tasks.map((t, i) => {
      const status = t.completed ? '✅' : '⬜'
      const pri = { high: '🔴', medium: '🟡', low: '🟢' }[t.priority] || ''
      const notes = t.notes ? `\n     Notes: ${t.notes}` : ''
      return `${i + 1}. ${status} ${pri} [${t.category}] ${t.title} (id: ${t.id})${notes}`
    })

    return {
      content: [{ type: 'text', text: `Found ${tasks.length} task(s):\n\n${lines.join('\n')}` }],
    }
  }
)

// Tool: Add task
server.tool(
  'add_task',
  'Add a new task to Claude Tasks',
  {
    title: z.string().describe('Task title'),
    category: z.enum(['design', 'development', 'research', 'meetings', 'copy']).describe('Task category'),
    priority: z.enum(['low', 'medium', 'high']).default('medium').describe('Task priority'),
    notes: z.string().optional().describe('Optional description or notes for the task'),
    dueDate: z.string().optional().describe('Optional due date (ISO string)'),
  },
  async ({ title, category, priority, notes, dueDate }) => {
    const tasks = await readTasks()
    const task = {
      id: generateId(),
      title: title.trim(),
      notes: notes?.trim() || '',
      category,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate,
    }
    tasks.unshift(task)
    await writeTasks(tasks)

    return {
      content: [{ type: 'text', text: `Task added: "${task.title}" [${category}] (${priority} priority)\nID: ${task.id}` }],
    }
  }
)

// Tool: Complete task
server.tool(
  'complete_task',
  'Mark a task as completed',
  {
    id: z.string().describe('Task ID to complete'),
  },
  async ({ id }) => {
    const tasks = await readTasks()
    const task = tasks.find(t => t.id === id)

    if (!task) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    task.completed = true
    await writeTasks(tasks)

    return {
      content: [{ type: 'text', text: `Completed: "${task.title}" ✅` }],
    }
  }
)

// Tool: Update task
server.tool(
  'update_task',
  'Update a task\'s title, notes, category, priority, or due date',
  {
    id: z.string().describe('Task ID to update'),
    title: z.string().optional().describe('New title'),
    notes: z.string().optional().describe('New notes/description'),
    category: z.enum(['design', 'development', 'research', 'meetings', 'copy']).optional().describe('New category'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority'),
    dueDate: z.string().optional().describe('New due date (ISO string)'),
  },
  async ({ id, title, notes, category, priority, dueDate }) => {
    const tasks = await readTasks()
    const task = tasks.find(t => t.id === id)

    if (!task) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    if (title !== undefined) task.title = title.trim()
    if (notes !== undefined) task.notes = notes.trim()
    if (category !== undefined) task.category = category
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate

    await writeTasks(tasks)

    return {
      content: [{ type: 'text', text: `Updated task: "${task.title}" (id: ${task.id})` }],
    }
  }
)

// Tool: Delete task
server.tool(
  'delete_task',
  'Delete a task permanently',
  {
    id: z.string().describe('Task ID to delete'),
  },
  async ({ id }) => {
    const tasks = await readTasks()
    const task = tasks.find(t => t.id === id)

    if (!task) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    const filtered = tasks.filter(t => t.id !== id)
    await writeTasks(filtered)

    return {
      content: [{ type: 'text', text: `Deleted: "${task.title}" 🗑️` }],
    }
  }
)

// Tool: Task summary
server.tool(
  'task_summary',
  'Get a summary of all tasks grouped by category with counts',
  {},
  async () => {
    const tasks = await readTasks()
    const active = tasks.filter(t => !t.completed)
    const completed = tasks.filter(t => t.completed)

    const byCategory = {}
    for (const cat of CATEGORIES) {
      byCategory[cat] = active.filter(t => t.category === cat).length
    }

    const byPriority = {}
    for (const pri of PRIORITIES) {
      byPriority[pri] = active.filter(t => t.priority === pri).length
    }

    const lines = [
      `📊 Task Summary`,
      `────────────────`,
      `Active: ${active.length}  |  Completed: ${completed.length}  |  Total: ${tasks.length}`,
      ``,
      `By Category:`,
      ...CATEGORIES.map(c => `  ${c}: ${byCategory[c]}`),
      ``,
      `By Priority:`,
      `  🔴 High: ${byPriority.high}`,
      `  🟡 Medium: ${byPriority.medium}`,
      `  🟢 Low: ${byPriority.low}`,
    ]

    return { content: [{ type: 'text', text: lines.join('\n') }] }
  }
)

// ── Start ────────────────────────────────────────────────
const transport = new StdioServerTransport()
await server.connect(transport)
