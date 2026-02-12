export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  const tasks = readTasks()
  const index = tasks.findIndex(t => t.id === id)

  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  tasks.splice(index, 1)
  writeTasks(tasks)

  return { success: true }
})
