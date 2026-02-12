<script setup lang="ts">
const taskStore = useTaskStore()
const navStore = useNavStore()

const inputBarRef = ref<HTMLElement | null>(null)

function handleNewTask() {
  // Switch to tasks tab if on canvas
  if (navStore.activeTab !== 'tasks') {
    navStore.setTab('tasks')
  }
  // Focus the task input bar
  nextTick(() => {
    const input = document.querySelector('.task-input') as HTMLTextAreaElement | null
    input?.focus()
  })
}
</script>

<template>
  <div class="sidebar-header">
    <button class="new-task-btn" @click="handleNewTask">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span>New task</span>
    </button>
    <div class="search-wrapper">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="Search"
        :value="taskStore.searchQuery"
        @input="taskStore.setSearchQuery(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.sidebar-header {
  padding: 12px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

.new-task-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border-radius: var(--radius-md);
  padding: 6px 10px;
  transition: all var(--duration-fast) var(--ease-out);
}

.search-wrapper:focus-within {
  background: var(--bg-surface);
}

.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-primary);
  background: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}
</style>
