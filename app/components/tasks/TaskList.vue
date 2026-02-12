<script setup lang="ts">
const taskStore = useTaskStore()

const heading = computed(() => {
  if (taskStore.activeCategory) {
    const labels: Record<string, string> = {
      design: 'Design',
      development: 'Development',
      research: 'Research',
      meetings: 'Meetings',
      copy: 'Copy',
    }
    return labels[taskStore.activeCategory] || 'Tasks'
  }
  return 'All Tasks'
})

const hasTasks = computed(() => taskStore.filteredTasks.length > 0 || taskStore.completedTasks.length > 0)
</script>

<template>
  <div class="task-list-container">
    <!-- Empty / Landing state -->
    <div v-if="!hasTasks && !taskStore.searchQuery" class="landing">
      <EmptyState />
    </div>

    <!-- Active tasks view with input at top -->
    <template v-else>
      <div class="task-list-header">
        <h2 class="task-list-title">{{ heading }}</h2>
        <span class="task-list-count">{{ taskStore.filteredTasks.length }} tasks</span>
      </div>

      <div class="task-list-scroll">
        <div v-if="taskStore.filteredTasks.length === 0 && taskStore.searchQuery" class="search-empty">
          <p class="search-empty-text">No results for "{{ taskStore.searchQuery }}"</p>
        </div>

        <TransitionGroup v-else name="list" tag="div" class="task-list">
          <TaskCard
            v-for="task in taskStore.filteredTasks"
            :key="task.id"
            :task="task"
          />
        </TransitionGroup>

        <div v-if="taskStore.completedTasks.length > 0 && !taskStore.activeCategory" class="completed-section">
          <button class="completed-toggle">
            <span class="completed-label">Completed</span>
            <span class="completed-count">{{ taskStore.completedTasks.length }}</span>
          </button>
          <TransitionGroup name="list" tag="div" class="task-list">
            <TaskCard
              v-for="task in taskStore.completedTasks.slice(0, 5)"
              :key="task.id"
              :task="task"
            />
          </TransitionGroup>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.task-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Landing / empty state - centered layout */
.landing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 0 24px;
}

.task-list-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px 24px 12px;
  flex-shrink: 0;
}

.task-list-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.task-list-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.task-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.search-empty-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.completed-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.completed-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 0 10px;
  cursor: pointer;
}

.completed-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

.completed-count {
  font-size: 0.68rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 1px 7px;
  border-radius: var(--radius-full);
}
</style>
