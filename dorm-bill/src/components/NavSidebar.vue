<template>
  <nav class="nav-sidebar">
    <div class="nav-header">
      <span class="logo">🏠</span>
      <span class="title">宿舍账单管家</span>
    </div>
    <ul class="nav-items">
      <li v-for="item in navItems" :key="item.path">
        <router-link :to="item.path" class="nav-link" active-class="active">
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
    <div class="nav-footer">
      <span class="version">v1.0.0</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', icon: '📊', label: '账单总览' },
  { path: '/add', icon: '➕', label: '添加账单' },
  { path: '/split', icon: '⚖️', label: '智能分摊' },
  { path: '/roommates', icon: '👥', label: '室友管理' },
  { path: '/settings', icon: '⚙️', label: '设置' }
]
</script>

<style scoped>
.nav-sidebar {
  width: 220px;
  background: var(--card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  position: sticky;
  top: 0;
  height: 100vh;
}
.nav-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 20px;
  border-bottom: 1px solid var(--border);
}
.logo { font-size: 28px; }
.title { font-size: 16px; font-weight: 700; }
.nav-items { flex: 1; padding: 12px 0; }
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: var(--text-light);
  transition: all 0.2s;
}
.nav-link:hover { background: var(--bg); color: var(--text); }
.nav-link.active { background: rgba(76,175,80,0.1); color: var(--primary); font-weight: 600; }
.icon { font-size: 18px; }
.nav-footer { padding: 12px 20px; border-top: 1px solid var(--border); }
.version { font-size: 12px; color: var(--text-light); }
@media (max-width: 768px) {
  .nav-sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    flex-direction: row;
    padding: 8px 0;
    border-right: none;
    border-top: 1px solid var(--border);
    z-index: 100;
  }
  .nav-header, .nav-footer { display: none; }
  .nav-items { display: flex; flex: 1; padding: 0; }
  .nav-link { flex-direction: column; gap: 2px; padding: 6px; flex: 1; font-size: 11px; }
  .label { font-size: 10px; }
}
</style>