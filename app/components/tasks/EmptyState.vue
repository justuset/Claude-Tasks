<script setup lang="ts">
import type { Category } from '~/types/task'

const taskStore = useTaskStore()

interface Suggestion {
  icon: string
  title: string
  category: Category
}

const suggestions: Suggestion[] = [
  { icon: '◆', title: 'Plan my designs', category: 'design' },
  { icon: '◎', title: 'Research competitors', category: 'research' },
  { icon: '⟨/⟩', title: 'Review codebase', category: 'development' },
]

function addSuggestion(s: Suggestion) {
  taskStore.addTask(s.title, s.category, 'medium')
}
</script>

<template>
  <div class="empty-state">
    <!-- Claude-style starburst icon -->
    <div class="empty-icon">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          d="M18 2 L20 14 L32 12 L22 18 L32 24 L20 22 L18 34 L16 22 L4 24 L14 18 L4 12 L16 14 Z"
          fill="var(--accent)"
          opacity="0.8"
        />
      </svg>
    </div>

    <h2 class="empty-headline">Let's knock something off your list</h2>

    <div class="suggestions">
      <span class="suggestions-label">Pick a task, any task</span>
      <div class="suggestion-cards">
        <button
          v-for="s in suggestions"
          :key="s.title"
          class="suggestion-card"
          @click="addSuggestion(s)"
        >
          <span class="suggestion-icon">{{ s.icon }}</span>
          <span class="suggestion-title">{{ s.title }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  max-width: 540px;
  margin-bottom: 20px;
}

.empty-icon {
  margin-bottom: 2px;
}

.empty-headline {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-primary);
  line-height: 1.3;
  font-family: var(--font-serif);
}

.suggestions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestions-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.suggestion-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.suggestion-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.suggestion-icon {
  font-size: 1rem;
  color: var(--text-muted);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.suggestion-title {
  font-size: 0.82rem;
  color: var(--text-primary);
  font-weight: 500;
  text-align: left;
}

@media (max-width: 600px) {
  .suggestion-cards {
    grid-template-columns: 1fr;
  }
}
</style>
