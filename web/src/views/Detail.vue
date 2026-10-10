<template>
  <div class="detail-page" v-if="record">
    <div class="back-bar" @click="router.push('/')">
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      返回看板
    </div>

    <div class="status-badge" :class="record.status">
      <span class="status-dot"></span>
      {{ record.status === 'pending' ? '待取件' : '已取件' }}
    </div>

    <div class="code-hero fade-in-up">
      <span class="code-hero-label">取件码</span>
      <span class="code-hero-value">{{ record.code }}</span>
      <span class="code-hero-hint">向驿站工作人员出示此码取件</span>
    </div>

    <div class="detail-card fade-in-up" style="animation-delay:0.05s">
      <div class="detail-row">
        <span class="d-label">驿站</span>
        <span class="d-value">{{ record.station || '未填写' }}</span>
      </div>
      <div class="detail-row">
        <span class="d-label">快递公司</span>
        <span class="d-value" v-if="record.courier">
          <span class="courier-tag">{{ record.courier }}</span>
        </span>
        <span class="d-value" v-else>未填写</span>
      </div>
      <div class="detail-row">
        <span class="d-label">手机尾号</span>
        <span class="d-value mono">{{ record.phone || '未填写' }}</span>
      </div>
      <div class="detail-row">
        <span class="d-label">录入时间</span>
        <span class="d-value">{{ formatTime(record.createdAt) }}</span>
      </div>
      <div v-if="record.pickedAt" class="detail-row">
        <span class="d-label">取件时间</span>
        <span class="d-value">{{ formatTime(record.pickedAt) }}</span>
      </div>
    </div>

    <div class="action-group fade-in-up" style="animation-delay:0.1s">
      <button v-if="record.status === 'pending'" class="btn-success btn-block" @click="togglePick">
        标记已取件
      </button>
      <button v-else class="btn-outline btn-block" @click="togglePick">
        取消取件标记
      </button>
      <button class="btn-ghost btn-block" @click="goReminder">设置提醒</button>
      <button class="btn-danger btn-block" @click="onDelete">删除记录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getById, updateRecord, deleteRecord } from '@/utils/storage'
import type { ExpressData } from '@shared/types/express'

const route = useRoute()
const router = useRouter()
const record = ref<ExpressData | null>(null)

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function togglePick() {
  if (!record.value) return
  if (record.value.status === 'pending') {
    updateRecord(record.value.id, { status: 'picked', pickedAt: Date.now() })
  } else {
    updateRecord(record.value.id, { status: 'pending', pickedAt: null })
  }
  record.value = getById(route.params.id as string)
  window.dispatchEvent(new Event('storage-updated'))
}

function goReminder() { router.push('/reminder') }

function onDelete() {
  if (confirm('确认删除这条快递记录？删除后不可恢复')) {
    deleteRecord(route.params.id as string)
    window.dispatchEvent(new Event('storage-updated'))
    router.push('/')
  }
}

onMounted(() => { record.value = getById(route.params.id as string) })
</script>

<style scoped>
.detail-page { max-width: 640px; margin: 0 auto; }

.back-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--ink-hint);
  cursor: pointer;
  margin-bottom: 20px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.back-bar:hover { color: var(--jade-deep); background: var(--jade-light); }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-badge.pending { background: var(--jade-light); color: var(--jade-deep); }
.status-badge.pending .status-dot { background: var(--jade); }
.status-badge.picked { background: var(--cream-warm); color: var(--ink-soft); }
.status-badge.picked .status-dot { background: var(--ink-hint); }

.code-hero {
  background: linear-gradient(135deg, var(--pine), var(--jade-deep));
  border-radius: var(--radius-xl);
  padding: 36px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(18, 63, 55, 0.15);
}
.code-hero-label { font-size: 13px; color: rgba(255, 253, 240, 0.6); letter-spacing: 3px; }
.code-hero-value {
  font-size: 42px;
  font-weight: 800;
  color: #FFFDF0;
  font-family: var(--font-mono);
  letter-spacing: 4px;
  line-height: 1.2;
}
.code-hero-hint { font-size: 12px; color: rgba(255, 253, 240, 0.5); margin-top: 4px; }

.detail-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 24px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-soft);
}
.detail-row:last-child { border-bottom: none; }
.d-label { font-size: 14px; color: var(--ink-hint); }
.d-value { font-size: 15px; font-weight: 500; color: var(--ink); }
.d-value.mono { font-family: var(--font-mono); letter-spacing: 1px; }
.courier-tag {
  background: var(--jade-light);
  color: var(--jade-deep);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 13px;
  font-weight: 500;
}

.action-group { display: flex; flex-direction: column; gap: 10px; }

@media (max-width: 768px) {
  .code-hero { padding: 28px 20px; }
  .code-hero-value { font-size: 34px; letter-spacing: 3px; }
}
</style>