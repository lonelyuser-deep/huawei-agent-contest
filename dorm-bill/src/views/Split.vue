<template>
  <div class="split-page">
    <h1 class="page-title">⚖️ 智能分摊</h1>

    <div class="card fairness-card">
      <h3>宿舍公平度</h3>
      <div v-for="score in fairnessScores" :key="score.roommateId" class="fairness-row">
        <span class="fairness-name">{{ score.name }}</span>
        <div class="fairness-bar-wrap">
          <div class="fairness-bar" :style="{ width: score.fairness + '%', background: barColor(score.fairness) }"></div>
        </div>
        <span class="fairness-value">{{ score.fairness }}%</span>
        <span class="fairness-balance" :class="{ positive: score.balance > 0, negative: score.balance < 0 }">
          {{ score.balance > 0 ? '+' : '' }}{{ formatAmount(score.balance) }}
        </span>
      </div>
    </div>

    <div class="card summary-card">
      <h3>收支汇总</h3>
      <div v-for="score in fairnessScores" :key="score.roommateId" class="summary-row">
        <span class="summary-name">{{ score.name }}</span>
        <span class="summary-paid">已付 {{ formatAmount(score.totalPaid) }}</span>
        <span class="summary-share">应付 {{ formatAmount(score.totalShare) }}</span>
        <span class="summary-balance" :class="{ positive: score.balance > 0, negative: score.balance < 0 }">
          {{ score.balance > 0 ? '+' : '' }}{{ formatAmount(score.balance) }}
        </span>
      </div>
    </div>

    <div class="card recommend-card">
      <h3>🤖 AI 推荐转账方案</h3>
      <div v-if="recommendations.length > 0" class="recommend-list">
        <div v-for="rec in recommendations" :key="rec" class="recommend-item">
          {{ rec }}
        </div>
      </div>
      <div v-else class="empty-state">
        <p>暂无账单数据，添加账单后查看推荐方案</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Bill } from '@/types/bill'
import type { Roommate, FairnessScore } from '@/types/roommate'
import { loadBills, loadRoommates, calculateFairness, recommendSplitPlan, formatAmount } from '@/utils/storage'

const bills = ref<Bill[]>([])
const roommates = ref<Roommate[]>([])
const fairnessScores = ref<FairnessScore[]>([])
const recommendations = ref<string[]>([])

onMounted(() => {
  bills.value = loadBills()
  roommates.value = loadRoommates()
  fairnessScores.value = calculateFairness(bills.value, roommates.value)
  recommendations.value = recommendSplitPlan(bills.value, roommates.value)
})

function barColor(fairness: number) {
  if (fairness >= 80) return 'var(--success)'
  if (fairness >= 50) return 'var(--warning)'
  return 'var(--danger)'
}
</script>

<style scoped>
.card { margin-bottom: 16px; }
.card h3 { font-size: 16px; margin-bottom: 12px; }
.fairness-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
.fairness-name { width: 60px; font-size: 14px; }
.fairness-bar-wrap { flex: 1; height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; }
.fairness-bar { height: 100%; border-radius: 4px; transition: width 0.3s; }
.fairness-value { width: 40px; text-align: right; font-size: 13px; font-weight: 600; }
.fairness-balance { width: 70px; text-align: right; font-size: 13px; }
.fairness-balance.positive { color: var(--success); }
.fairness-balance.negative { color: var(--danger); }
.summary-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
.summary-row:last-child { border-bottom: none; }
.summary-name { width: 60px; font-weight: 500; }
.summary-paid, .summary-share { flex: 1; color: var(--text-light); }
.summary-balance { width: 70px; text-align: right; font-weight: 600; }
.summary-balance.positive { color: var(--success); }
.summary-balance.negative { color: var(--danger); }
.recommend-list { display: flex; flex-direction: column; gap: 8px; }
.recommend-item { background: var(--bg); padding: 10px 14px; border-radius: 8px; font-size: 14px; }
</style>