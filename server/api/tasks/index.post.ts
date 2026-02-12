export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.category) {
    throw createError({ statusCode: 400, statusMessage: 'title and category are required' })
  }

  const task: StoredTask = {
    id: generateId(),
    title: body.title.trim(),
    notes: body.notes?.trim() || '',
    category: body.category,
    priority: body.priority || 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: body.dueDate,
  }

  const tasks = readTasks()
  tasks.unshift(task)
  writeTasks(tasks)

  return task
})
