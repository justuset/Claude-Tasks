export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const tasks = readTasks()
  const task = tasks.find(t => t.id === id)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  const allowedFields = ['title', 'notes', 'category', 'priority', 'completed', 'dueDate'] as const
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      ;(task as any)[field] = body[field]
    }
  }

  writeTasks(tasks)
  return task
})
