<template>
  <nav class="sidebar">
    <div class="logo">
      <span class="logo-icon">📦</span>
      <span class="logo-text">校园快递助手</span>
    </div>
    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <router-link :to="item.path" class="nav-link" active-class="active" exact>
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
    <div class="nav-footer">
      <span>v1.0 Demo</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/', icon: '📊', label: '快递看板' },
  { path: '/add', icon: '➕', label: '添加快递' },
  { path: '/reminder', icon: '⏰', label: '取件提醒' },
  { path: '/settings', icon: '⚙', label: '设置' }
]
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--nav-bg);
  color: var(--nav-text);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  flex-shrink: 0;
}
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.logo-icon { font-size: 24px; }
.logo-text { font-size: 15px; font-weight: 600; }
.nav-list { list-style: none; padding: 12px 0; flex: 1; }
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: var(--nav-text);
  transition: background 0.2s;
  opacity: 0.8;
}
.nav-link:hover { background: rgba(255,255,255,0.1); opacity: 1; }
.nav-link.active { background: rgba(255,255,255,0.15); opacity: 1; }
.nav-icon { font-size: 18px; }
.nav-label { font-size: 14px; }
.nav-footer {
  padding: 16px;
  font-size: 12px;
  opacity: 0.5;
  border-top: 1px solid rgba(255,255,255,0.1);
}
</style>