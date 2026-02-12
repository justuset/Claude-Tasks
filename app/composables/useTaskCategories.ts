import type { CategoryMeta } from '~/types/task'

export function useTaskCategories(): CategoryMeta[] {
  return [
    { key: 'design', label: 'Design', icon: '◆', color: 'var(--cat-design)' },
    { key: 'development', label: 'Development', icon: '⟨/⟩', color: 'var(--cat-development)' },
    { key: 'research', label: 'Research', icon: '◎', color: 'var(--cat-research)' },
    { key: 'meetings', label: 'Meetings', icon: '◉', color: 'var(--cat-meetings)' },
    { key: 'copy', label: 'Copy', icon: '¶', color: 'var(--cat-copy)' },
  ]
}
