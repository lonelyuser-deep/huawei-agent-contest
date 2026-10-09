<template>
  <div class="settings-page">
    <h2 class="page-title">⚙ 设置</h2>

    <div class="card">
      <h3>数据管理</h3>
      <div class="setting-row"><span>快递记录总数</span><span class="value">{{ stats.total }} 条</span></div>
      <div class="setting-row"><span>待取件</span><span class="value">{{ stats.pending }} 条</span></div>
      <div class="setting-row"><span>已取件</span><span class="value">{{ stats.picked }} 条</span></div>
      <button class="outline-danger" style="margin-top: 16px" @click="clearAll">清空所有记录</button>
    </div>

    <div class="card">
      <h3>关于</h3>
      <div class="setting-row"><span>应用名称</span><span class="value">校园快递助手</span></div>
      <div class="setting-row"><span>版本</span><span class="value">v1.0 Demo</span></div>
      <div class="setting-row"><span>技术栈</span><span class="value">Vue3 + Vite + TS</span></div>
      <div class="setting-row"><span>适配平台</span><span class="value">HarmonyOS / Web</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStats } from '@/utils/storage'

const stats = ref({ pending: 0, picked: 0, total: 0 })

function clearAll() {
  if (confirm('确认清空所有快递记录？此操作不可恢复')) {
    localStorage.removeItem('express_list')
    stats.value = { pending: 0, picked: 0, total: 0 }
  }
}

onMounted(() => { stats.value = getStats() })
</script>

<style scoped>
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--primary); }
.card { background: var(--card-bg); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card h3 { font-size: 16px; margin-bottom: 12px; color: var(--text); }
.setting-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
.setting-row:last-child { border-bottom: none; }
.setting-row .value { font-size: 14px; color: var(--text-secondary); }
</style>