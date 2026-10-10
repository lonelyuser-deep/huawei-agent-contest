<template>
  <Cover v-if="!entered" @entered="onEntered" />
  <div v-if="entered" class="app-layout" :class="{ 'app-entered': appReady }">
    <NavSidebar />
    <MobileNav />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavSidebar from '@/components/NavSidebar.vue'
import Cover from '@/components/Cover.vue'
import MobileNav from '@/components/MobileNav.vue'

const entered = ref(localStorage.getItem('app_entered') === 'true')
const appReady = ref(false)

function onEntered() {
  localStorage.setItem('app_entered', 'true')
  entered.value = true
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { appReady.value = true })
  })
}

onMounted(() => {
  if (entered.value) appReady.value = true
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.app-layout.app-entered { opacity: 1; }

.content {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
  background: var(--cream);
  min-width: 0;
}

@media (max-width: 768px) {
  .content { padding: 16px 16px 80px; }
}
</style>