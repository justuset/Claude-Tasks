<script setup lang="ts">
const taskStore = useTaskStore()
</script>

<template>
  <div class="sidebar-header">
    <div class="brand">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.9" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
        </svg>
      </div>
      <span class="brand-name">Claude Tasks</span>
    </div>
    <div class="search-wrapper">
      <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="Search tasks..."
        :value="taskStore.searchQuery"
        @input="taskStore.setSearchQuery(($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.sidebar-header {
  padding: 16px 14px 8px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 7px 10px;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.search-wrapper:focus-within {
  border-color: var(--border-hover);
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
