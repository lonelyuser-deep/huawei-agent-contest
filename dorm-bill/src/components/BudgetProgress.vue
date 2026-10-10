<template>
  <div class="budget-progress" v-if="budget > 0">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-amount">¥{{ spent.toFixed(2) }} / ¥{{ budget.toFixed(2) }}</span>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar" :style="{ width: percentage + '%', background: barColor }"></div>
    </div>
    <div class="progress-footer">
      <span class="progress-percent" :style="{ color: barColor }">{{ percentage }}%</span>
      <span class="progress-remaining">
        {{ remaining >= 0 ? `剩余 ¥${remaining.toFixed(2)}` : `超支 ¥${Math.abs(remaining).toFixed(2)}` }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  spent: number
  budget: number
  label?: string
}>(), {
  label: '本月预算'
})

const percentage = computed(() => {
  if (props.budget <= 0) return 0
  return Math.min(100, Math.round((props.spent / props.budget) * 100))
})

const remaining = computed(() => Math.round((props.budget - props.spent) * 100) / 100)

const barColor = computed(() => {
  const ratio = props.budget > 0 ? props.spent / props.budget : 0
  if (ratio >= 1) return 'var(--danger)'
  if (ratio >= 0.8) return 'var(--warning)'
  return 'var(--success)'
})
</script>

<style scoped>
.budget-progress {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px 20px;
  margin-bottom: 16px;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.progress-label { font-size: 14px; font-weight: 600; }
.progress-amount { font-size: 13px; color: var(--text-light); }
.progress-bar-wrap {
  height: 10px;
  background: var(--bg);
  border-radius: 5px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s ease, background 0.3s ease;
}
.progress-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
}
.progress-percent { font-weight: 700; }
.progress-remaining { color: var(--text-light); }
</style>