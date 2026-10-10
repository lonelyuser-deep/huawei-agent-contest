<template>
  <div class="settings-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">设置</h1>
      <p class="page-desc">课表管理与应用信息</p>
    </div>

    <div class="stats-card fade-in-up" style="animation-delay:0.05s">
      <div class="stat-item">
        <span class="stat-num">{{ stats.total }}</span>
        <span class="stat-label">总课程</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.today }}</span>
        <span class="stat-label">今日</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num">{{ stats.weekdays }}</span>
        <span class="stat-label">上课天数</span>
      </div>
    </div>

    <div class="info-card fade-in-up" style="animation-delay:0.1s">
      <h2 class="card-title">关于</h2>
      <div class="info-list">
        <div class="info-row">
          <span class="info-label">应用名称</span>
          <span class="info-value">校园生活助手</span>
        </div>
        <div class="info-row">
          <span class="info-label">版本</span>
          <span class="info-value">v1.0 · 校园生活版</span>
        </div>
        <div class="info-row">
          <span class="info-label">技术栈</span>
          <span class="info-value">Vue 3 + TypeScript + Vite</span>
        </div>
        <div class="info-row">
          <span class="info-label">适配平台</span>
          <span class="info-value">桌面端 / 移动端</span>
        </div>
      </div>
    </div>

    <div class="danger-card fade-in-up" style="animation-delay:0.15s">
      <h2 class="card-title danger">危险操作</h2>
      <p class="danger-desc">清空所有课表数据，此操作不可恢复</p>
      <button class="btn-danger" @click="clearAll">清空课表数据</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getScheduleStats, clearSchedule } from '@/utils/scheduleStorage'
import { stopScheduleReminder } from '@/utils/scheduleReminder'

const stats = ref({ total: 0, weekdays: 0, today: 0 })

function loadData() {
  stats.value = getScheduleStats()
}

function clearAll() {
  if (confirm('确定清空所有课表数据吗？此操作不可恢复。')) {
    clearSchedule()
    stopScheduleReminder()
    loadData()
    window.dispatchEvent(new Event('storage-updated'))
  }
}

onMounted(loadData)
</script>

<style scoped>
.settings-page { max-width: 640px; margin: 0 auto; }

.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.stats-card {
  background: linear-gradient(135deg, var(--pine), var(--jade-deep));
  border-radius: var(--radius-xl);
  padding: 28px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  color: #FFFDF0;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(18, 63, 55, 0.15);
}
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.stat-num { font-size: 32px; font-weight: 800; font-family: var(--font-mono); }
.stat-label { font-size: 13px; opacity: 0.7; letter-spacing: 1px; }
.stat-divider { width: 1px; height: 40px; background: rgba(255, 253, 240, 0.15); }

.info-card, .danger-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}
.card-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 16px; }
.card-title.danger { color: var(--danger); }

.info-list { display: flex; flex-direction: column; gap: 12px; }
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-soft);
}
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 14px; color: var(--ink-hint); }
.info-value { font-size: 14px; color: var(--ink); font-weight: 500; }

.danger-desc { font-size: 13px; color: var(--ink-hint); margin-bottom: 16px; }

@media (max-width: 768px) {
  .stats-card { padding: 20px; }
  .stat-num { font-size: 26px; }
}
</style>