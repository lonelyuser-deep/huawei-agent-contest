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
  { path: '/', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7H18" stroke="currentColor" stroke-width="1.5"/></svg>', label: '看板' },
  { path: '/add', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6V14M6 10H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '添加' },
  { path: '/reminder', icon: '<svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M10 2C6.5 2 4 4.5 4 8V12L2 15H18L16 12V8C16 4.5 13.5 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>', label: '提醒' },
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