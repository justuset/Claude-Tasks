<script setup lang="ts">
import type { Category } from '~/types/task'

const taskStore = useTaskStore()
const categories = useTaskCategories()
</script>

<template>
  <aside class="sidebar">
    <SidebarHeader />

    <nav class="sidebar-nav">
      <div class="nav-section">
        <CategoryFilter
          icon="⊞"
          label="All Tasks"
          :count="taskStore.taskCountByCategory.all"
          :category-key="null"
          color="var(--accent)"
          :active="taskStore.activeCategory === null"
          @select="taskStore.setActiveCategory(null)"
        />
      </div>

      <div class="nav-divider" />

      <div class="nav-section">
        <span class="nav-section-label">Categories</span>
        <CategoryFilter
          v-for="cat in categories"
          :key="cat.key"
          :icon="cat.icon"
          :label="cat.label"
          :count="taskStore.taskCountByCategory[cat.key]"
          :category-key="cat.key"
          :color="cat.color"
          :active="taskStore.activeCategory === cat.key"
          @select="taskStore.setActiveCategory($event as Category | null)"
        />
      </div>

      <div class="nav-divider" />

      <div class="nav-section">
        <CategoryFilter
          icon="✓"
          label="Completed"
          :count="taskStore.totalCompleted"
          category-key="__completed__"
          color="var(--priority-low)"
          :active="false"
          @select="() => {}"
        />
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">JR</div>
        <div class="user-details">
          <span class="user-name">Designer</span>
          <span class="user-plan">Claude Tasks</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 12px 12px 6px;
}

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 12px;
}

.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid var(--border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--accent-subtle);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.8rem;
  color: var(--text-primary);
  font-weight: 500;
}

.user-plan {
  font-size: 0.68rem;
  color: var(--text-muted);
}

</style>
