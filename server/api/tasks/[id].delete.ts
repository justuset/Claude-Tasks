import { readTasks, writeTasks } from '~/server/utils/storage'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const tasks = await readTasks()
  const filtered = tasks.filter(t => t.id !== id)

  await writeTasks(filtered)
  return { success: true }
})
