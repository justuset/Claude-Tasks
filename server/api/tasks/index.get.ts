import { readTasks } from '~/server/utils/storage'

export default defineEventHandler(async () => {
  return await readTasks()
})
