<script setup lang="ts">
const taskStore = useTaskStore()
const navStore = useNavStore()
const canvasStore = useCanvasStore()

onMounted(() => {
  taskStore.hydrate()
  navStore.hydrate()
  canvasStore.hydrate()
})
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': !navStore.sidebarOpen }">
    <AppSidebar />
    <main class="main-content dot-grid-bg">
      <TopNavBar />
      <template v-if="navStore.activeTab === 'tasks'">
        <TaskList />
        <div class="input-bottom">
          <TaskInputBar />
        </div>
      </template>
      <CanvasBoard v-else-if="navStore.activeTab === 'canvas'" />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100vh;
  overflow: hidden;
  transition: grid-template-columns var(--duration-normal) var(--ease-out);
}

.app-layout.sidebar-collapsed {
  grid-template-columns: 0px 1fr;
}

.app-layout :deep(.sidebar) {
  min-width: 0;
  overflow: hidden;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.app-layout.sidebar-collapsed :deep(.sidebar) {
  opacity: 0;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-app);
}

.input-bottom {
  flex-shrink: 0;
  padding: 12px 24px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: center;
}
</style>
