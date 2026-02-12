import { getSupabaseAdmin, rowToTask } from '~/server/utils/supabase'

export default defineEventHandler(async () => {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []).map(rowToTask)
})
