<template>
  <div v-if="showWarning" class="budget-warning" :class="status">
    <span class="warning-icon">{{ icon }}</span>
    <span class="warning-text">{{ message }}</span>
    <span class="warning-amount">¥{{ spent.toFixed(2) }} / ¥{{ budget.toFixed(2) }}</span>
  </div>

  <div v-if="showExceededModal" class="modal-overlay" @click="showExceededModal = false">
    <div class="modal-content" @click.stop>
      <span class="modal-icon">🚫</span>
      <h3>本月预算已超支！</h3>
      <p>已消费 <strong>¥{{ spent.toFixed(2) }}</strong>，超出预算 <strong class="over">¥{{ (spent - budget).toFixed(2) }}</strong></p>
      <p class="modal-tip">建议检查近期消费记录，控制非必要支出</p>
      <button class="btn btn-primary" @click="showExceededModal = false">知道了</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BudgetStatus } from '@/types/budget'

const props = defineProps<{
  spent: number
  budget: number
  threshold: number
  status: BudgetStatus
}>()

const emit = defineEmits<{ exceeded: [] }>()
const showExceededModal = ref(false)

const showWarning = computed(() => props.status === 'warning' || props.status === 'exceeded')
const icon = computed(() => props.status === 'exceeded' ? '🚫' : '⚠️')
const message = computed(() =>
  props.status === 'exceeded' ? '本月预算已超支！' : '本月预算即将耗尽'
)

watch(() => props.status, (newStatus) => {
  if (newStatus === 'exceeded') {
    showExceededModal.value = true
    emit('exceeded')
  }
}, { immediate: true })
</script>

<style scoped>
.budget-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}
.budget-warning.warning {
  background: #FFF3CD;
  color: #856404;
  border: 1px solid #FFE69C;
}
.budget-warning.exceeded {
  background: #FDE8E8;
  color: #C0392B;
  border: 1px solid #F5B7B1;
}
.warning-icon { font-size: 18px; }
.warning-text { flex: 1; }
.warning-amount { font-weight: 600; }
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: var(--card);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.modal-icon { font-size: 48px; display: block; margin-bottom: 12px; }
.modal-content h3 { font-size: 20px; margin-bottom: 12px; color: var(--danger); }
.modal-content p { font-size: 14px; color: var(--text-light); margin-bottom: 8px; line-height: 1.6; }
.modal-content .over { color: var(--danger); }
.modal-tip { font-size: 13px !important; }
.modal-content .btn { margin-top: 12px; }
</style>