<template>
  <div class="budget-progress" v-if="budget > 0">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-amount">¥{{ spent.toFixed(2) }} / ¥{{ budget.toFixed(2) }}</span>
      <button class="edit-btn" @click="showEdit = true">✏️ 编辑</button>
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

    <div v-if="showEdit" class="edit-modal" @click.self="showEdit = false">
      <div class="edit-content">
        <h3>修改月度预算</h3>
        <div class="edit-row">
          <label>预算金额 (元)</label>
          <input v-model.number="editBudget" type="number" min="0" step="50" />
        </div>
        <div class="edit-row">
          <label>预警阈值: {{ editThreshold }}%</label>
          <input type="range" min="50" max="100" v-model.number="editThreshold" />
        </div>
        <div class="quick-set">
          <button v-for="v in [500, 1000, 1500, 2000, 3000]" :key="v" class="quick-btn" @click="editBudget = v">¥{{ v }}</button>
        </div>
        <div class="edit-actions">
          <button class="btn btn-outline" @click="showEdit = false">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { loadBudgetSettings, saveBudgetSettings } from '@/api/budgetApi'

const props = withDefaults(defineProps<{
  spent: number
  budget: number
  label?: string
}>(), {
  label: '本月预算'
})

const emit = defineEmits<{ updated: [] }>()

const showEdit = ref(false)
const editBudget = ref(props.budget)
const editThreshold = ref(loadBudgetSettings().alertThreshold)

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

function save() {
  const settings = loadBudgetSettings()
  settings.monthlyBudget = editBudget.value
  settings.alertThreshold = editThreshold.value
  saveBudgetSettings(settings)
  showEdit.value = false
  emit('updated')
}
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
  gap: 8px;
}
.progress-label { font-size: 14px; font-weight: 600; }
.progress-amount { font-size: 13px; color: var(--text-light); flex: 1; text-align: right; }
.edit-btn {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}
.edit-btn:hover { border-color: var(--primary); color: var(--primary); }
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
.edit-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.edit-content {
  background: var(--card);
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.edit-content h3 { font-size: 18px; margin-bottom: 16px; }
.edit-row { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
.edit-row label { font-size: 13px; color: var(--text-light); }
.edit-row input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; font-weight: 600; }
.edit-row input[type="range"] { accent-color: var(--primary); padding: 0; border: none; }
.quick-set { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.quick-btn {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover { border-color: var(--primary); color: var(--primary); }
.edit-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>