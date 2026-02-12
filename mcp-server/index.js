import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// ── Supabase ──────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
)

function rowToTask(row) {
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

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const CATEGORIES = ['design', 'development', 'research', 'meetings', 'copy']
const PRIORITIES = ['low', 'medium', 'high']

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
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
    if (category) query = query.eq('category', category)
    if (priority) query = query.eq('priority', priority)
    if (completed !== undefined) query = query.eq('completed', completed)

    const { data, error } = await query
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] }

    const tasks = (data ?? []).map(rowToTask)
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
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: generateId(),
        title: title.trim(),
        notes: notes?.trim() || '',
        category,
        priority,
        completed: false,
        created_at: new Date().toISOString(),
        due_date: dueDate ?? null,
      })
      .select()
      .single()

    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] }

    return {
      content: [{ type: 'text', text: `Task added: "${data.title}" [${category}] (${priority} priority)\nID: ${data.id}` }],
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
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: true })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    return {
      content: [{ type: 'text', text: `Completed: "${data.title}" ✅` }],
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
    const rowUpdates = {}
    if (title !== undefined) rowUpdates.title = title.trim()
    if (notes !== undefined) rowUpdates.notes = notes.trim()
    if (category !== undefined) rowUpdates.category = category
    if (priority !== undefined) rowUpdates.priority = priority
    if (dueDate !== undefined) rowUpdates.due_date = dueDate

    const { data, error } = await supabase
      .from('tasks')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    return {
      content: [{ type: 'text', text: `Updated task: "${data.title}" (id: ${data.id})` }],
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
    const { data: task } = await supabase.from('tasks').select('title').eq('id', id).single()

    if (!task) {
      return { content: [{ type: 'text', text: `Task not found with ID: ${id}` }] }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] }

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
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] }

    const tasks = (data ?? []).map(rowToTask)
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
