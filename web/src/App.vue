<template>
  <NavSidebar />
  <main class="content">
    <router-view />
  </main>
</template>

<script setup lang="ts">
import NavSidebar from '@/components/NavSidebar.vue'
</script>

<style scoped>
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  max-width: 800px;
}
</style>