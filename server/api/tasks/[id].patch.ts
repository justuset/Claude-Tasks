import { readTasks, writeTasks } from '~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const tasks = await readTasks()
  const task = tasks.find(t => t.id === id)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }

  if (body.title !== undefined) task.title = body.title
  if (body.notes !== undefined) task.notes = body.notes
  if (body.category !== undefined) task.category = body.category
  if (body.priority !== undefined) task.priority = body.priority
  if (body.completed !== undefined) task.completed = body.completed
  if (body.dueDate !== undefined) task.dueDate = body.dueDate

  await writeTasks(tasks)
  return task
})
