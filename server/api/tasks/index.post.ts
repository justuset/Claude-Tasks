import { readTasks, writeTasks, generateId } from '~/server/utils/storage'
import type { Task } from '~/types/task'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.category) {
    throw createError({ statusCode: 400, statusMessage: 'title and category are required' })
  }

  const tasks = await readTasks()
  const task: Task = {
    id: generateId(),
    title: body.title.trim(),
    notes: body.notes?.trim() || '',
    category: body.category,
    priority: body.priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: body.dueDate,
  }

  tasks.unshift(task)
  await writeTasks(tasks)
  return task
})
