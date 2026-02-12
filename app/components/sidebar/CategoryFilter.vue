<script setup lang="ts">
import type { Category } from '~/types/task'

const props = defineProps<{
  icon: string
  label: string
  count: number
  categoryKey: Category | null
  color: string
  active: boolean
}>()

const emit = defineEmits<{
  select: [category: Category | null]
}>()
</script>

<template>
  <button
    class="category-filter"
    :class="{ 'category-filter--active': active }"
    @click="emit('select', categoryKey)"
  >
    <span class="category-icon" :style="{ color: active ? color : 'var(--text-muted)' }">
      {{ icon }}
    </span>
    <span class="category-label">{{ label }}</span>
    <span v-if="count > 0" class="category-count" :class="{ 'category-count--active': active }">
      {{ count }}
    </span>
  </button>
</template>

<style scoped>
.category-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
}

.category-filter:hover {
  background: var(--bg-surface);
}

.category-filter--active {
  background: var(--accent-subtle);
}

.category-icon {
  font-size: 0.85rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  transition: color var(--duration-fast) var(--ease-out);
}

.category-label {
  flex: 1;
  text-align: left;
  color: var(--text-secondary);
  transition: color var(--duration-fast) var(--ease-out);
}

.category-filter--active .category-label {
  color: var(--text-primary);
}

.category-count {
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 1px 7px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
  transition: all var(--duration-fast) var(--ease-out);
}

.category-count--active {
  background: var(--accent);
  color: #fff;
}
</style>
