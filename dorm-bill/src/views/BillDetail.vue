<template>
  <div v-if="bill" class="detail-page">
    <h1 class="page-title">📋 账单详情</h1>

    <div class="card detail-card">
      <div class="detail-header">
        <span class="cat-icon">{{ CATEGORY_ICONS[bill.category] }}</span>
        <span class="detail-title">{{ bill.title }}</span>
        <span class="detail-amount">{{ formatAmount(bill.amount) }}</span>
      </div>
      <div class="detail-info">
        <div class="info-row"><span>类别</span><span>{{ CATEGORY_LABELS[bill.category] }}</span></div>
        <div class="info-row"><span>支付人</span><span>{{ getPaidByName() }}</span></div>
        <div class="info-row"><span>日期</span><span>{{ bill.date }}</span></div>
        <div class="info-row"><span>分摊方式</span><span>{{ splitTypeLabel }}</span></div>
        <div v-if="bill.note" class="info-row"><span>备注</span><span>{{ bill.note }}</span></div>
      </div>
    </div>

    <div class="card split-card">
      <h3>分摊明细</h3>
      <div v-for="split in splits" :key="split.roommateId" class="split-row">
        <span class="split-name">{{ getRoommateName(split.roommateId) }}</span>
        <span class="split-amount">{{ formatAmount(split.amount) }}</span>
        <span class="split-status" :class="{ paid: split.paid }">{{ split.paid ? '✅ 已付' : '⏳ 待付' }}</span>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-danger" @click="remove">🗑️ 删除</button>
      <button class="btn btn-outline" @click="$router.push('/')">返回</button>
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="icon">❓</div>
    <p>账单不存在</p>
    <router-link to="/" class="btn btn-primary">返回首页</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Bill } from '@/types/bill'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/bill'
import type { Roommate } from '@/types/roommate'
import { loadBills, saveBills, loadRoommates, formatAmount, calculateSplits } from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const bill = ref<Bill | null>(null)
const roommates = ref<Roommate[]>([])

onMounted(() => {
  roommates.value = loadRoommates()
  const bills = loadBills()
  bill.value = bills.find(b => b.id === route.params.id) || null
})

const splits = computed(() => {
  if (!bill.value) return []
  return bill.value.splits && bill.value.splits.length > 0
    ? bill.value.splits
    : calculateSplits(bill.value, roommates.value)
})

const splitTypeLabel = computed(() => {
  if (!bill.value) return ''
  return { average: '均摊', custom: '自定义', ratio: '按比例' }[bill.value.splitType]
})

function getPaidByName() { return roommates.value.find(r => r.id === bill.value?.paidBy)?.name || '未知' }
function getRoommateName(id: string) { return roommates.value.find(r => r.id === id)?.name || '未知' }

function remove() {
  if (!bill.value) return
  if (!confirm('确定删除此账单？')) return
  const bills = loadBills().filter(b => b.id !== bill.value!.id)
  saveBills(bills)
  router.push('/')
}
</script>

<style scoped>
.detail-card { margin-bottom: 16px; }
.detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.cat-icon { font-size: 28px; }
.detail-title { font-size: 18px; font-weight: 600; flex: 1; }
.detail-amount { font-size: 24px; font-weight: 700; color: var(--primary); }
.detail-info { display: flex; flex-direction: column; gap: 8px; }
.info-row { display: flex; justify-content: space-between; font-size: 14px; }
.info-row span:first-child { color: var(--text-light); }
.split-card { margin-bottom: 16px; }
.split-card h3 { font-size: 16px; margin-bottom: 12px; }
.split-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.split-row:last-child { border-bottom: none; }
.split-name { flex: 1; }
.split-amount { font-weight: 600; }
.split-status { font-size: 12px; color: var(--text-light); }
.split-status.paid { color: var(--success); }
.actions { display: flex; gap: 8px; }
</style>