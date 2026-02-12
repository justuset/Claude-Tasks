<script setup lang="ts">
const taskStore = useTaskStore()

onMounted(() => {
  taskStore.hydrate()
})
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main-content dot-grid-bg">
      <TaskList />
      <TaskInputBar />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-app);
}

@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
}
</style>
