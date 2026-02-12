import { getSupabaseAdmin, rowToTask } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const rowUpdates: any = {}
  if (body.title !== undefined) rowUpdates.title = body.title
  if (body.notes !== undefined) rowUpdates.notes = body.notes
  if (body.category !== undefined) rowUpdates.category = body.category
  if (body.priority !== undefined) rowUpdates.priority = body.priority
  if (body.completed !== undefined) rowUpdates.completed = body.completed
  if (body.dueDate !== undefined) rowUpdates.due_date = body.dueDate

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('tasks')
    .update(rowUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error?.code === 'PGRST116') {
    throw createError({ statusCode: 404, statusMessage: 'Task not found' })
  }
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return rowToTask(data)
})
