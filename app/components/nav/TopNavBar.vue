<script setup lang="ts">
import type { TabView } from '~/types/nav'

const navStore = useNavStore()

const indicatorStyle = computed(() => {
  const isCanvas = navStore.activeTab === 'canvas'
  return {
    transform: isCanvas ? 'translateX(100%)' : 'translateX(0)',
  }
})

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === '.') {
    e.preventDefault()
    navStore.toggleSidebar()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="top-nav">
    <div class="top-nav-left">
      <!-- Sidebar toggle -->
      <button
        class="nav-btn"
        :class="{ 'nav-btn--active': !navStore.sidebarOpen }"
        @click="navStore.toggleSidebar()"
        title="Toggle sidebar (⌘.)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      </button>

      <!-- Back -->
      <button
        class="nav-btn"
        :disabled="!navStore.canGoBack"
        @click="navStore.goBack()"
        title="Go back"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <!-- Forward -->
      <button
        class="nav-btn"
        :disabled="!navStore.canGoForward"
        @click="navStore.goForward()"
        title="Go forward"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
    </div>

    <div class="top-nav-center">
      <div class="tab-switcher">
        <div class="tab-indicator" :style="indicatorStyle" />
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': navStore.activeTab === 'tasks' }"
          @click="navStore.setTab('tasks')"
        >
          Tasks
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-btn--active': navStore.activeTab === 'canvas' }"
          @click="navStore.setTab('canvas')"
        >
          Canvas
        </button>
      </div>
    </div>

    <div class="top-nav-right" />
  </div>
</template>

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height, 44px);
  padding: 0 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--bg-app);
}

.top-nav-left,
.top-nav-right {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 100px;
}

.top-nav-right {
  justify-content: flex-end;
}

.top-nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Nav buttons */
.nav-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-btn:hover:not(:disabled) {
  color: var(--text-secondary);
  background: var(--bg-surface);
}

.nav-btn--active {
  color: var(--accent);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Tab switcher (pill segmented control) */
.tab-switcher {
  position: relative;
  display: flex;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 3px;
}

.tab-indicator {
  position: absolute;
  top: 3px;
  left: 3px;
  width: calc(50% - 3px);
  height: calc(100% - 6px);
  background: var(--bg-elevated);
  border-radius: var(--radius-full);
  transition: transform var(--duration-normal) var(--ease-out);
  pointer-events: none;
}

.tab-btn {
  position: relative;
  z-index: 1;
  padding: 4px 18px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: var(--radius-full);
  transition: color var(--duration-fast) var(--ease-out);
  white-space: nowrap;
}

.tab-btn:hover {
  color: var(--text-secondary);
}

.tab-btn--active {
  color: var(--text-primary);
}
</style>
