<script setup lang="ts">
import type { Category, Priority } from '~/types/task'

const taskStore = useTaskStore()
const categories = useTaskCategories()

const title = ref('')
const selectedCategory = ref<Category>('design')
const selectedPriority = ref<Priority>('medium')
const showCategoryDropdown = ref(false)
const showPriorityDropdown = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const currentCategoryMeta = computed(() =>
  categories.find(c => c.key === selectedCategory.value)!
)

const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
}

function submit() {
  if (!title.value.trim()) return
  taskStore.addTask(title.value, selectedCategory.value, selectedPriority.value)
  title.value = ''
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

function selectCategory(cat: Category) {
  selectedCategory.value = cat
  showCategoryDropdown.value = false
}

function selectPriority(p: Priority) {
  selectedPriority.value = p
  showPriorityDropdown.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.category-selector')) showCategoryDropdown.value = false
  if (!target.closest('.priority-selector')) showPriorityDropdown.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="input-bar">
    <div class="input-wrapper">
      <!-- Add/Attachment icon -->
      <button class="input-icon-btn" aria-label="Attach" title="Attach file">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- Category selector (like Claude's "Code" toggle) -->
      <div class="category-selector">
        <button
          class="selector-btn"
          @click.stop="showCategoryDropdown = !showCategoryDropdown"
        >
          <span class="selector-icon" :style="{ color: currentCategoryMeta.color }">{{ currentCategoryMeta.icon }}</span>
          <span class="selector-label">{{ currentCategoryMeta.label }}</span>
          <svg class="selector-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <Transition name="fade">
          <div v-if="showCategoryDropdown" class="dropdown">
            <button
              v-for="cat in categories"
              :key="cat.key"
              class="dropdown-item"
              :class="{ 'dropdown-item--active': selectedCategory === cat.key }"
              @click="selectCategory(cat.key)"
            >
              <span class="dropdown-icon" :style="{ color: cat.color }">{{ cat.icon }}</span>
              <span>{{ cat.label }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Text input area -->
      <textarea
        ref="inputRef"
        v-model="title"
        class="task-input"
        placeholder="Add a task..."
        rows="1"
        @keydown="handleKeydown"
      />

      <!-- Priority selector -->
      <div class="priority-selector">
        <button
          class="priority-btn"
          :class="`priority-btn--${selectedPriority}`"
          @click.stop="showPriorityDropdown = !showPriorityDropdown"
          :title="`Priority: ${selectedPriority}`"
        >
          <span class="priority-dot" :class="`priority-dot--${selectedPriority}`" />
          <span class="priority-label">{{ priorityLabels[selectedPriority] }}</span>
        </button>

        <Transition name="fade">
          <div v-if="showPriorityDropdown" class="dropdown dropdown--right">
            <button
              v-for="p in (['low', 'medium', 'high'] as Priority[])"
              :key="p"
              class="dropdown-item"
              :class="{ 'dropdown-item--active': selectedPriority === p }"
              @click="selectPriority(p)"
            >
              <span class="priority-dot" :class="`priority-dot--${p}`" />
              <span>{{ priorityLabels[p] }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Send button (orange circle with arrow, matching Claude Code) -->
      <button
        class="send-btn"
        :class="{ 'send-btn--active': title.trim().length > 0 }"
        :disabled="!title.trim()"
        @click="submit"
        aria-label="Add task"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-bar {
  flex-shrink: 0;
  padding: 12px 24px 16px;
  background: var(--bg-app);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 8px 8px 8px 12px;
  transition: border-color var(--duration-fast) var(--ease-out);
}

.input-wrapper:focus-within {
  border-color: var(--border-hover);
}

.input-icon-btn {
  color: var(--text-muted);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-surface);
}

/* Category Selector (Claude "Code" toggle style) */
.category-selector {
  position: relative;
  flex-shrink: 0;
}

.selector-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
  border: 1px solid var(--border);
  background: var(--bg-surface);
}

.selector-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.selector-icon {
  font-size: 0.75rem;
}

.selector-label {
  font-weight: 500;
}

.selector-chevron {
  opacity: 0.5;
}

/* Priority Selector */
.priority-selector {
  position: relative;
  flex-shrink: 0;
}

.priority-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: all var(--duration-fast) var(--ease-out);
}

.priority-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-surface);
}

.priority-label {
  font-weight: 500;
}

/* Dropdowns */
.dropdown {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-md);
  padding: 4px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.dropdown--right {
  left: auto;
  right: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
}

.dropdown-item:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.dropdown-item--active {
  background: var(--accent-subtle);
  color: var(--accent);
}

.dropdown-icon {
  font-size: 0.85rem;
  width: 18px;
  text-align: center;
}

/* Text Input */
.task-input {
  flex: 1;
  font-size: 0.88rem;
  color: var(--text-primary);
  padding: 4px 8px;
  resize: none;
  min-height: 24px;
  max-height: 100px;
  line-height: 1.5;
  background: transparent;
}

.task-input::placeholder {
  color: var(--text-muted);
}

/* Send Button (Orange circle matching Claude Code) */
.send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.send-btn--active {
  background: var(--accent);
  color: #fff;
}

.send-btn--active:hover {
  background: var(--accent-hover);
}

.send-btn:disabled {
  cursor: default;
}
</style>
