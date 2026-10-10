<template>
  <nav class="mobile-nav">
    <router-link :to="item.path" class="mobile-nav-item" active-class="active" exact v-for="item in navItems" :key="item.path">
      <span class="m-icon" v-html="item.icon"></span>
      <span class="m-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M3 10L10 3L17 10V16C17 16.5 16.5 17 16 17H12V12H8V17H4C3.5 17 3 16.5 3 16V10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>', label: '首页' },
  { path: '/schedule', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 8H17" stroke="currentColor" stroke-width="1.5"/><path d="M7 4V2M13 4V2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '课表' },
  { path: '/settings', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M10 2V4M10 16V18M2 10H4M16 10H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '设置' }
]
</script>

<style scoped>
.mobile-nav { display: none; }

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(255, 253, 240, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--border);
    padding: 8px 0 env(safe-area-inset-bottom, 8px);
    justify-content: space-around;
  }
  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    color: var(--ink-hint);
    border-radius: 12px;
    transition: all 0.2s ease;
  }
  .mobile-nav-item.active { color: var(--jade-deep); }
  .m-icon { display: flex; }
  .m-label { font-size: 11px; font-weight: 500; }
}
</style>