<script setup lang="ts">
import type { Category, Priority } from '~/types/task'

const taskStore = useTaskStore()
const categories = useTaskCategories()

const title = ref('')
const notesValue = ref('')
const showNotes = ref(false)
const selectedCategory = ref<Category>('design')
const selectedPriority = ref<Priority>('medium')
const showCategoryDropdown = ref(false)
const showPriorityDropdown = ref(false)
const showAddDropdown = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const notesRef = ref<HTMLTextAreaElement | null>(null)

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
  taskStore.addTask(title.value, selectedCategory.value, selectedPriority.value, undefined, notesValue.value || undefined)
  title.value = ''
  notesValue.value = ''
  showNotes.value = false
  inputRef.value?.focus()
}

function toggleNotes() {
  showNotes.value = !showNotes.value
  showAddDropdown.value = false
  if (showNotes.value) {
    nextTick(() => notesRef.value?.focus())
  }
}

function handleAddImage() {
  showAddDropdown.value = false
  // Image attachment — future feature
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
  if (!target.closest('.add-selector')) showAddDropdown.value = false
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
    <!-- Text input row -->
    <div class="input-top">
      <textarea
        ref="inputRef"
        v-model="title"
        class="task-input"
        placeholder="Type / for commands"
        rows="1"
        @keydown="handleKeydown"
      />
    </div>

    <!-- Notes input (toggled) -->
    <div v-if="showNotes" class="notes-section">
      <div class="notes-row">
        <svg class="notes-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <textarea
          ref="notesRef"
          v-model="notesValue"
          class="notes-input"
          placeholder="Add a description..."
          rows="2"
        />
        <button class="notes-close" @click="showNotes = false; notesValue = ''" title="Remove notes">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Bottom toolbar -->
    <div class="input-toolbar">
      <div class="toolbar-left">
        <!-- Category selector -->
        <div class="category-selector">
          <button
            class="selector-btn"
            @click.stop="showCategoryDropdown = !showCategoryDropdown"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
            <span class="selector-label">{{ currentCategoryMeta.label }}</span>
            <svg class="selector-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <Transition name="fade">
            <div v-if="showCategoryDropdown" class="dropdown dropdown--up">
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

        <!-- Add extras (+ button with dropdown) -->
        <div class="add-selector">
          <button
            class="toolbar-icon-btn"
            :class="{ 'toolbar-icon-btn--active': showNotes }"
            @click.stop="showAddDropdown = !showAddDropdown"
            title="Add extras"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <Transition name="fade">
            <div v-if="showAddDropdown" class="dropdown dropdown--up">
              <button class="dropdown-item" :class="{ 'dropdown-item--active': showNotes }" @click="toggleNotes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Add notes</span>
              </button>
              <button class="dropdown-item" @click="handleAddImage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Add image</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Priority selector -->
        <div class="priority-selector">
          <button
            class="toolbar-icon-btn"
            @click.stop="showPriorityDropdown = !showPriorityDropdown"
            :title="`Priority: ${selectedPriority}`"
          >
            <span class="priority-dot" :class="`priority-dot--${selectedPriority}`" />
          </button>

          <Transition name="fade">
            <div v-if="showPriorityDropdown" class="dropdown dropdown--up">
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
      </div>

      <div class="toolbar-right">
        <!-- Submit button (Cowork "Let's go" style) -->
        <button
          class="submit-btn"
          :class="{ 'submit-btn--active': title.trim().length > 0 }"
          :disabled="!title.trim()"
          @click="submit"
        >
          <span class="submit-label">Let's go</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-bar {
  display: flex;
  flex-direction: column;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-fast) var(--ease-out);
  width: 100%;
  max-width: 680px;
}

.input-bar:focus-within {
  border-color: var(--border-hover);
}

/* Text input */
.input-top {
  padding: 14px 16px 8px;
}

.task-input {
  width: 100%;
  font-size: 0.9rem;
  color: var(--text-primary);
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.5;
  background: transparent;
}

.task-input::placeholder {
  color: var(--text-muted);
}

/* Notes section */
.notes-section {
  padding: 0 16px 4px;
}

.notes-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.notes-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  margin-top: 3px;
}

.notes-input {
  flex: 1;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: transparent;
  resize: none;
  min-height: 36px;
  max-height: 100px;
  line-height: 1.5;
}

.notes-input::placeholder {
  color: var(--text-muted);
}

.notes-close {
  flex-shrink: 0;
  color: var(--text-muted);
  padding: 2px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
  margin-top: 2px;
}

.notes-close:hover {
  color: var(--priority-high);
  background: var(--bg-surface);
}

/* Bottom toolbar */
.input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 8px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

/* Category selector */
.category-selector {
  position: relative;
}

.selector-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
}

.selector-btn:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.selector-label {
  font-weight: 500;
}

.selector-chevron {
  opacity: 0.4;
}

/* Toolbar icon buttons */
.toolbar-icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--duration-fast) var(--ease-out);
}

.toolbar-icon-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-surface);
}

/* Add selector */
.add-selector {
  position: relative;
}

.toolbar-icon-btn--active {
  color: var(--accent) !important;
}

/* Priority selector */
.priority-selector {
  position: relative;
}

/* Submit button (Cowork "Let's go" style) */
.submit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  transition: all var(--duration-fast) var(--ease-out);
}

.submit-btn--active {
  background: var(--accent);
  color: #fff;
}

.submit-btn--active:hover {
  background: var(--accent-hover);
}

.submit-btn:disabled {
  cursor: default;
}

.submit-label {
  white-space: nowrap;
}

/* Dropdowns */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-md);
  padding: 4px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.dropdown--up {
  top: auto;
  bottom: calc(100% + 6px);
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
</style>
