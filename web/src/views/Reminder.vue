<template>
  <div class="reminder-page">
    <h2 class="page-title">⏰ 取件提醒</h2>

    <div class="card">
      <div class="card-row">
        <span>通知权限</span>
        <span class="status" :class="permissionStatus">{{ permissionText }}</span>
      </div>
      <button v-if="permissionStatus !== 'granted' && permissionStatus !== 'unsupported'" class="primary" @click="requestPermission">
        开启通知权限
      </button>
      <p v-if="permissionStatus === 'unsupported'" class="hint">当前浏览器不支持通知功能</p>
    </div>

    <div class="card">
      <h3>定时提醒</h3>
      <p class="hint">每隔指定时间检查未取快递并推送通知</p>
      <div class="interval-setting">
        <label>提醒间隔</label>
        <select v-model="interval">
          <option :value="30">30 分钟</option>
          <option :value="60">1 小时</option>
          <option :value="120">2 小时</option>
          <option :value="360">6 小时</option>
        </select>
      </div>
      <button v-if="!running" class="primary" @click="start">开启提醒</button>
      <button v-else class="outline-primary" @click="stop">关闭提醒</button>
    </div>

    <div class="card" v-if="stats.pending > 0">
      <h3>当前待取</h3>
      <p class="pending-text">您有 <strong>{{ stats.pending }}</strong> 个快递待取</p>
      <button class="primary" @click="testNotify">发送测试提醒</button>
    </div>

    <div class="card" v-if="stats.pending === 0">
      <h3>暂无待取</h3>
      <p class="hint">所有快递都已取件，干得漂亮！🎉</p>
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
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--primary); }
.card { background: var(--card-bg); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card h3 { font-size: 16px; margin-bottom: 8px; color: var(--text); }
.card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.status { font-size: 14px; padding: 4px 12px; border-radius: 12px; }
.status.granted { background: var(--primary-pale); color: var(--primary); }
.status.denied { background: #fadbd8; color: var(--delete); }
.status.default { background: #f0f0f0; color: var(--text-hint); }
.hint { font-size: 13px; color: var(--text-hint); margin-bottom: 12px; }
.interval-setting { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.interval-setting label { font-size: 14px; }
.interval-setting select { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); background: #fff; font-size: 14px; }
.pending-text { font-size: 15px; margin-bottom: 12px; }
.pending-text strong { color: var(--primary); font-size: 18px; }
</style>