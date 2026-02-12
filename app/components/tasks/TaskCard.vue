<script setup lang="ts">
import type { Task } from '~/types/task'

const props = defineProps<{
  task: Task
}>()

const taskStore = useTaskStore()

const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    design: 'Design',
    development: 'Dev',
    research: 'Research',
    meetings: 'Meeting',
    copy: 'Copy',
  }
  return labels[props.task.category] || props.task.category
})

const timeAgo = computed(() => {
  const now = Date.now()
  const created = new Date(props.task.createdAt).getTime()
  const diff = now - created
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(props.task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function handleDelete() {
  taskStore.deleteTask(props.task.id)
}
</script>

<template>
  <div
    class="task-card"
    :class="{ 'task-card--completed': task.completed }"
  >
    <button
      class="task-checkbox"
      :class="{ 'task-checkbox--checked': task.completed }"
      @click="taskStore.toggleComplete(task.id)"
      :aria-label="task.completed ? 'Mark incomplete' : 'Mark complete'"
    >
      <svg v-if="task.completed" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>

    <div class="task-body">
      <div class="task-top-row">
        <span class="task-title">{{ task.title }}</span>
        <button class="task-delete" @click="handleDelete" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div class="task-meta">
        <span class="cat-tag" :class="`cat-tag--${task.category}`">
          {{ categoryLabel }}
        </span>
        <span class="priority-dot" :class="`priority-dot--${task.priority}`" :title="task.priority + ' priority'" />
        <span class="task-time">{{ timeAgo }}</span>
        <span v-if="task.dueDate" class="task-due">
          Due {{ new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: default;
}

.task-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.task-card--completed {
  opacity: 0.5;
}

.task-card--completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--border-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--duration-fast) var(--ease-out);
  color: #fff;
}

.task-checkbox:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
}

.task-checkbox--checked {
  background: var(--accent);
  border-color: var(--accent);
}

.task-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.task-title {
  font-size: 0.88rem;
  color: var(--text-primary);
  line-height: 1.45;
  word-break: break-word;
}

.task-delete {
  color: var(--text-muted);
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
  padding: 2px;
  flex-shrink: 0;
}

.task-card:hover .task-delete {
  opacity: 1;
}

.task-delete:hover {
  color: var(--priority-high);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.task-time {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.task-due {
  font-size: 0.7rem;
  color: var(--cat-meetings);
}
</style>
