<template>
  <div class="bill-card" @click="$router.push(`/detail/${bill.id}`)">
    <div class="bill-header">
      <span class="category-icon">{{ CATEGORY_ICONS[bill.category] }}</span>
      <span class="category-label">{{ CATEGORY_LABELS[bill.category] }}</span>
      <span class="amount">{{ formatAmount(bill.amount) }}</span>
    </div>
    <div class="bill-body">
      <span class="title">{{ bill.title }}</span>
      <span class="date">{{ formatDate(bill.date) }}</span>
    </div>
    <div class="bill-footer">
      <span class="paid-by">由 {{ getPaidByName() }} 支付</span>
      <span class="split-type">{{ splitTypeLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bill } from '@/types/bill'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/bill'
import { formatAmount, formatDate, loadRoommates } from '@/utils/storage'

const props = defineProps<{ bill: Bill }>()

const splitTypeLabel = { average: '均摊', custom: '自定义', ratio: '按比例' }[props.bill.splitType]

function getPaidByName(): string {
  const roommates = loadRoommates()
  const r = roommates.find(r => r.id === props.bill.paidBy)
  return r?.name || '未知'
}
</script>

<style scoped>
.bill-card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.bill-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.bill-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.category-icon { font-size: 20px; }
.category-label { font-size: 13px; color: var(--text-light); background: var(--bg); padding: 2px 8px; border-radius: 4px; }
.amount { margin-left: auto; font-size: 20px; font-weight: 700; color: var(--primary); }
.bill-body { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 15px; font-weight: 500; }
.date { font-size: 13px; color: var(--text-light); }
.bill-footer { display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-light); }
</style>