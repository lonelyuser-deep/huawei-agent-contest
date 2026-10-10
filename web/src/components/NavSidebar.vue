<template>
  <nav class="sidebar">
    <div class="sidebar-glow"></div>
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.8" />
          <path d="M3 8L12 3L21 8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <rect x="10" y="13" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
          <path d="M8 8V6M16 8V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">智云校遇</span>
        <span class="brand-tag">CAMPUS DELIVERY</span>
      </div>
    </div>

    <ul class="nav-list">
      <li v-for="item in navItems" :key="item.path">
        <router-link :to="item.path" class="nav-link" active-class="active" exact>
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <div class="sidebar-footer">
      <div class="pending-badge" v-if="pendingCount > 0">
        <span class="badge-num">{{ pendingCount }}</span>
        <span class="badge-text">件待取</span>
      </div>
      <div class="pending-badge empty" v-else>
        <span class="badge-text">暂无待取快递</span>
      </div>
      <div class="version">v2.0 · 自然校园版</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getStats } from '@/utils/storage'

const pendingCount = ref(0)

const navItems = [
  { path: '/', icon: '<svg viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7H18" stroke="currentColor" stroke-width="1.5"/><path d="M6 3V7M14 3V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '快递看板' },
  { path: '/add', icon: '<svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6V14M6 10H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '添加快递' },
  { path: '/reminder', icon: '<svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2C6.5 2 4 4.5 4 8V12L2 15H18L16 12V8C16 4.5 13.5 2 10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 17C8 18 9 19 10 19C11 19 12 18 12 17" stroke="currentColor" stroke-width="1.5"/></svg>', label: '取件提醒' },
  { path: '/settings', icon: '<svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.5 4.5L5.8 5.8M14.2 14.2L15.5 15.5M4.5 15.5L5.8 14.2M14.2 5.8L15.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>', label: '设置' }
]

function updateCount() { pendingCount.value = getStats().pending }

onMounted(() => {
  updateCount()
  window.addEventListener('storage-updated', updateCount)
})
onUnmounted(() => { window.removeEventListener('storage-updated', updateCount) })
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, var(--pine) 0%, var(--jade-deep) 50%, var(--jade) 100%);
  color: #FFFDF0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.sidebar-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 60%;
  background: radial-gradient(ellipse at center, rgba(42, 157, 126, 0.15), transparent 70%);
  pointer-events: none;
}
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 28px 24px 24px;
  border-bottom: 1px solid rgba(255, 253, 240, 0.08);
  position: relative;
}
.brand-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 253, 240, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFDF0;
  border: 1px solid rgba(255, 253, 240, 0.12);
  flex-shrink: 0;
}
.brand-text { display: flex; flex-direction: column; gap: 2px; }
.brand-name { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
.brand-tag { font-size: 10px; letter-spacing: 2px; opacity: 0.5; font-family: var(--font-mono); }
.nav-list {
  list-style: none;
  padding: 20px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  color: rgba(255, 253, 240, 0.7);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  font-weight: 500;
  position: relative;
}
.nav-link:hover {
  background: rgba(255, 253, 240, 0.06);
  color: #FFFDF0;
}
.nav-link.active {
  background: rgba(255, 253, 240, 0.12);
  color: #FFFDF0;
  border: 1px solid rgba(255, 253, 240, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 253, 240, 0.08);
  font-weight: 600;
}
.nav-icon { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; }
.nav-label { letter-spacing: 0.5px; }
.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 253, 240, 0.08);
  position: relative;
}
.pending-badge {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}
.pending-badge.empty { opacity: 0.5; }
.badge-num {
  font-size: 28px;
  font-weight: 800;
  color: #FFFDF0;
  font-family: var(--font-mono);
  line-height: 1;
}
.badge-text { font-size: 13px; opacity: 0.7; }
.version { font-size: 11px; opacity: 0.4; letter-spacing: 1px; font-family: var(--font-mono); }
@media (max-width: 768px) {
  .sidebar { display: none; }
}
</style>