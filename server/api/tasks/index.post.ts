import { getSupabaseAdmin, rowToTask, generateId } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.title || !body.category) {
    throw createError({ statusCode: 400, statusMessage: 'title and category are required' })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      id: generateId(),
      title: body.title.trim(),
      notes: body.notes?.trim() || '',
      category: body.category,
      priority: body.priority || 'medium',
      completed: false,
      created_at: new Date().toISOString(),
      due_date: body.dueDate ?? null,
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return rowToTask(data)
})
