<template>
  <div class="home-page">
    <h1 class="page-title">📊 账单总览</h1>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">💰</span>
        <span class="stat-label">总金额</span>
        <span class="stat-value">{{ formatAmount(totalAmount) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">📋</span>
        <span class="stat-label">账单数</span>
        <span class="stat-value">{{ bills.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⚖️</span>
        <span class="stat-label">公平度</span>
        <span class="stat-value" :class="fairnessClass">{{ avgFairness }}%</span>
      </div>
    </div>

    <div class="category-stats">
      <div v-for="cat in categoryStats" :key="cat.category" class="cat-item">
        <span class="cat-icon">{{ CATEGORY_ICONS[cat.category] }}</span>
        <span class="cat-name">{{ CATEGORY_LABELS[cat.category] }}</span>
        <span class="cat-amount">{{ formatAmount(cat.total) }}</span>
        <span class="cat-count">{{ cat.count }}笔</span>
      </div>
    </div>

    <div class="section-header">
      <h2>最近账单</h2>
      <router-link to="/add" class="btn btn-primary">➕ 添加</router-link>
    </div>

    <div v-if="bills.length === 0" class="empty-state">
      <div class="icon">📝</div>
      <p>还没有账单记录</p>
      <router-link to="/add" class="btn btn-primary">添加第一笔账单</router-link>
    </div>

    <div v-else class="bill-list">
      <BillCard v-for="bill in sortedBills" :key="bill.id" :bill="bill" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Bill, BillCategory } from '@/types/bill'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/bill'
import { loadBills, loadRoommates, formatAmount, calculateFairness } from '@/utils/storage'
import BillCard from '@/components/BillCard.vue'

const bills = ref<Bill[]>([])

onMounted(() => { bills.value = loadBills() })

const totalAmount = computed(() => bills.value.reduce((s, b) => s + b.amount, 0))

const sortedBills = computed(() => [...bills.value].sort((a, b) => b.createdAt - a.createdAt))

const categoryStats = computed(() => {
  const map = new Map<BillCategory, { total: number; count: number }>()
  for (const bill of bills.value) {
    const cur = map.get(bill.category) || { total: 0, count: 0 }
    cur.total += bill.amount
    cur.count++
    map.set(bill.category, cur)
  }
  return Array.from(map.entries()).map(([category, v]) => ({ category, ...v }))
})

const fairnessScores = computed(() => calculateFairness(bills.value, loadRoommates()))
const avgFairness = computed(() => {
  if (fairnessScores.value.length === 0) return 100
  return Math.round(fairnessScores.value.reduce((s, f) => s + f.fairness, 0) / fairnessScores.value.length)
})
const fairnessClass = computed(() => avgFairness.value >= 80 ? 'good' : avgFairness.value >= 50 ? 'ok' : 'bad')
</script>

<style scoped>
.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card { flex: 1; background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; display: flex; flex-direction: column; gap: 4px; }
.stat-icon { font-size: 24px; }
.stat-label { font-size: 12px; color: var(--text-light); }
.stat-value { font-size: 22px; font-weight: 700; }
.stat-value.good { color: var(--success); }
.stat-value.ok { color: var(--warning); }
.stat-value.bad { color: var(--danger); }
.category-stats { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.cat-item { background: var(--card); border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 6px; box-shadow: var(--shadow); }
.cat-icon { font-size: 16px; }
.cat-name { font-size: 12px; color: var(--text-light); }
.cat-amount { font-weight: 600; }
.cat-count { font-size: 11px; color: var(--text-light); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 18px; }
.bill-list { display: flex; flex-direction: column; gap: 12px; }
@media (max-width: 768px) { .stats-row { flex-direction: column; } }
</style>