export type Category = 'design' | 'development' | 'research' | 'meetings' | 'copy'

export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  category: Category
  priority: Priority
  completed: boolean
  createdAt: string
  dueDate?: string
}

export interface CategoryMeta {
  key: Category
  label: string
  icon: string
  color: string
}
