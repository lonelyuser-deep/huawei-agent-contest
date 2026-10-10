<template>
  <div class="reminder-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">取件提醒</h1>
      <p class="page-desc">设置定时提醒，不再错过待取快递</p>
    </div>

    <div class="permission-card fade-in-up" style="animation-delay:0.05s">
      <div class="card-icon-wrap">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 3C8.5 3 6 5.5 6 9V14L4 17H20L18 14V9C18 5.5 15.5 3 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 20C10 21 11 22 12 22C13 22 14 21 14 20" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <span class="card-title">通知权限</span>
          <span class="perm-status" :class="permissionStatus">{{ permissionText }}</span>
        </div>
        <p class="card-desc" v-if="permissionStatus === 'granted'">已开启通知权限，可以接收取件提醒</p>
        <p class="card-desc" v-else-if="permissionStatus === 'unsupported'">当前浏览器不支持通知功能</p>
        <p class="card-desc" v-else>开启通知权限后，可在待取快递时收到浏览器提醒</p>
      </div>
      <button v-if="permissionStatus !== 'granted' && permissionStatus !== 'unsupported'" class="btn-primary" @click="requestPermission">
        开启通知权限
      </button>
    </div>

    <div class="interval-card fade-in-up" style="animation-delay:0.1s">
      <div class="card-title">定时提醒间隔</div>
      <p class="card-desc">每隔指定时间自动检查未取快递并推送通知</p>
      <div class="interval-options">
        <div v-for="opt in intervalOptions" :key="opt.value"
          class="interval-option" :class="{ active: interval === opt.value, running: running && interval === opt.value }"
          @click="interval = opt.value">
          <span class="opt-value">{{ opt.label }}</span>
          <span class="opt-tag" v-if="running && interval === opt.value">运行中</span>
        </div>
      </div>
      <button v-if="!running" class="btn-primary btn-block" @click="start">开启提醒</button>
      <button v-else class="btn-outline btn-block" @click="stop">关闭提醒</button>
    </div>

    <div class="status-card fade-in-up" style="animation-delay:0.15s" v-if="stats.pending > 0">
      <div class="status-info">
        <span class="status-num">{{ stats.pending }}</span>
        <span class="status-text">件快递待取</span>
      </div>
      <button class="btn-outline" @click="testNotify">发送测试提醒</button>
    </div>

    <div class="status-card empty fade-in-up" style="animation-delay:0.15s" v-else>
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="all-done">所有快递都已取件，干得漂亮</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStats } from '@/utils/storage'
import { requestNotificationPermission, startReminder, stopReminder, showNotification, isReminderRunning, getPermissionStatus } from '@/utils/reminder'

const interval = ref(60)
const running = ref(false)
const permissionStatus = ref('default')
const stats = ref({ pending: 0, picked: 0, total: 0 })

const intervalOptions = [
  { value: 30, label: '30 分钟' },
  { value: 60, label: '1 小时' },
  { value: 120, label: '2 小时' },
  { value: 360, label: '6 小时' }
]

const permissionText = computed(() => {
  const map: Record<string, string> = { granted: '已开启', denied: '已拒绝', default: '未开启', unsupported: '不支持' }
  return map[permissionStatus.value] || '未知'
})

function requestPermission() {
  requestNotificationPermission().then(granted => {
    permissionStatus.value = granted ? 'granted' : 'denied'
  })
}

function start() {
  startReminder(interval.value)
  running.value = true
  localStorage.setItem('reminder_interval', interval.value.toString())
}

function stop() {
  stopReminder()
  running.value = false
  localStorage.removeItem('reminder_interval')
}

function testNotify() {
  showNotification('快递取件提醒', `您还有 ${stats.value.pending} 个快递未取，别忘了哦！`)
}

onMounted(() => {
  stats.value = getStats()
  permissionStatus.value = getPermissionStatus()
  running.value = isReminderRunning()
  const saved = localStorage.getItem('reminder_interval')
  if (saved) interval.value = parseInt(saved)
})
</script>

<style scoped>
.reminder-page { max-width: 720px; margin: 0 auto; }
.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }
.permission-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.card-icon-wrap { width: 48px; height: 48px; background: var(--jade-light); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--jade-deep); flex-shrink: 0; }
.card-content { flex: 1; }
.card-title-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.card-title { font-size: 16px; font-weight: 600; color: var(--ink); }
.perm-status { font-size: 12px; padding: 3px 10px; border-radius: 10px; font-weight: 500; }
.perm-status.granted { background: var(--jade-light); color: var(--jade-deep); }
.perm-status.denied { background: var(--danger-soft); color: var(--danger); }
.perm-status.default { background: var(--cream-warm); color: var(--ink-hint); }
.perm-status.unsupported { background: var(--cream-warm); color: var(--ink-hint); }
.card-desc { font-size: 13px; color: var(--ink-hint); line-height: 1.6; }
.interval-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.interval-card .card-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.interval-card .card-desc { font-size: 13px; color: var(--ink-hint); margin-bottom: 16px; }
.interval-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
.interval-option { text-align: center; padding: 14px 8px; border: 1.5px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease; background: var(--white); display: flex; flex-direction: column; align-items: center; gap: 4px; }
.interval-option:hover { border-color: var(--jade-soft); }
.interval-option.active { border-color: var(--jade); background: var(--jade-light); }
.opt-value { font-size: 14px; font-weight: 600; color: var(--ink); }
.interval-option.active .opt-value { color: var(--jade-deep); }
.opt-tag { font-size: 10px; color: var(--jade); font-weight: 600; letter-spacing: 1px; }
.status-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: var(--shadow-sm); }
.status-card.empty { justify-content: center; color: var(--ink-hint); }
.status-info { display: flex; align-items: baseline; gap: 6px; }
.status-num { font-size: 32px; font-weight: 800; color: var(--jade-deep); font-family: var(--font-mono); }
.status-text { font-size: 15px; color: var(--ink-soft); }
.all-done { font-size: 15px; font-weight: 500; }
@media (max-width: 768px) {
  .permission-card { flex-direction: column; align-items: stretch; text-align: left; }
  .interval-options { grid-template-columns: repeat(2, 1fr); }
  .status-card { flex-direction: column; align-items: stretch; text-align: center; }
  .status-card.empty { flex-direction: row; }
}
</style>