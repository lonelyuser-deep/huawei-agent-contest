<template>
  <div class="detail-page" v-if="record">
    <div class="status-badge" :class="record.status">
      {{ record.status === 'pending' ? '📦 待取件' : '✅ 已取件' }}
    </div>

    <div class="detail-card">
      <div class="row"><span class="label">驿站</span><span class="value">{{ record.station || '未填写' }}</span></div>
      <div class="row"><span class="label">取件码</span><span class="value code">{{ record.code }}</span></div>
      <div class="row"><span class="label">快递公司</span><span class="value">{{ record.courier || '未填写' }}</span></div>
      <div class="row"><span class="label">手机尾号</span><span class="value">{{ record.phone || '未填写' }}</span></div>
      <div class="row"><span class="label">添加时间</span><span class="value">{{ formatTime(record.createdAt) }}</span></div>
      <div v-if="record.pickedAt" class="row"><span class="label">取件时间</span><span class="value">{{ formatTime(record.pickedAt) }}</span></div>
    </div>

    <button v-if="record.status === 'pending'" class="success" @click="togglePick">标记已取件</button>
    <button v-else class="outline-primary" @click="togglePick">取消取件标记</button>
    <button class="outline-danger" style="margin-top: 12px" @click="onDelete">删除记录</button>
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
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${pad(d.getMinutes())}`
}

function togglePick() {
  if (!record.value) return
  if (record.value.status === 'pending') {
    updateRecord(record.value.id, { status: 'picked', pickedAt: Date.now() })
  } else {
    updateRecord(record.value.id, { status: 'pending', pickedAt: null })
  }
  record.value = getById(route.params.id as string)
}

function onDelete() {
  if (confirm('确认删除？删除后不可恢复')) {
    deleteRecord(route.params.id as string)
    router.back()
  }
}

onMounted(() => {
  record.value = getById(route.params.id as string)
})
</script>

<style scoped>
.detail-page { padding: 16px; }
.status-badge {
  text-align: center; font-size: 18px; font-weight: 600; padding: 12px;
  border-radius: 8px; margin-bottom: 16px;
}
.status-badge.pending { background: #e8f2fe; color: var(--primary); }
.status-badge.picked { background: #f0fff0; color: var(--picked); }
.detail-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f5f5f5; }
.row:last-child { border-bottom: none; }
.label { font-size: 14px; color: var(--text-hint); }
.value { font-size: 16px; font-weight: 500; }
.value.code { font-size: 18px; color: var(--primary); font-weight: 700; letter-spacing: 2px; }
</style>