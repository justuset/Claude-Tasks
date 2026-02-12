<script setup lang="ts">
const taskStore = useTaskStore()

const message = computed(() => {
  if (taskStore.activeCategory) {
    const labels: Record<string, string> = {
      design: 'design',
      development: 'development',
      research: 'research',
      meetings: 'meeting',
      copy: 'copy',
    }
    return `No ${labels[taskStore.activeCategory]} tasks yet`
  }
  return 'No tasks yet'
})

const subtitle = computed(() => {
  if (taskStore.searchQuery) return 'Try a different search term'
  return 'Add your first task below to get started'
})
</script>

<template>
  <div class="empty-state">
    <div class="empty-mascot">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <!-- Claude-style pixel mascot -->
        <rect x="16" y="8" width="32" height="32" rx="4" fill="var(--accent)" opacity="0.2" />
        <rect x="20" y="12" width="24" height="24" rx="2" fill="var(--accent)" opacity="0.35" />
        <rect x="24" y="16" width="6" height="6" rx="1" fill="var(--accent)" />
        <rect x="34" y="16" width="6" height="6" rx="1" fill="var(--accent)" />
        <rect x="26" y="26" width="12" height="3" rx="1.5" fill="var(--accent)" opacity="0.6" />
        <rect x="22" y="44" width="20" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.3" />
        <rect x="18" y="50" width="28" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.2" />
        <rect x="24" y="56" width="16" height="3" rx="1.5" fill="var(--text-muted)" opacity="0.1" />
      </svg>
    </div>
    <h3 class="empty-title">{{ message }}</h3>
    <p class="empty-subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  gap: 12px;
  opacity: 0.9;
}

.empty-mascot {
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.empty-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
}
</style>
