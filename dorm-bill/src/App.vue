<template>
  <div class="app-layout">
    <NavSidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavSidebar from '@/components/NavSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background: var(--bg);
  min-width: 0;
}
@media (max-width: 768px) {
  .content { padding: 16px 16px 80px; }
}
</style>