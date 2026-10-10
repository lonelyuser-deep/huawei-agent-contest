<template>
  <div class="saving-tips-card card">
    <div class="card-header" @click="collapsed = !collapsed">
      <span class="header-icon">🤖</span>
      <span class="header-title">省钱小助手</span>
      <span class="header-count" v-if="tips.length > 0">{{ tips.length }}条建议</span>
      <span class="toggle">{{ collapsed ? '展开' : '收起' }} {{ collapsed ? '▼' : '▲' }}</span>
    </div>

    <div v-if="!collapsed" class="tips-list">
      <div class="manual-saving">
        <button class="btn btn-primary manual-btn" @click="showManual = true">✏️ 记录省钱</button>
        <div v-if="totalSaved > 0" class="total-saved">
          累计省钱: <strong>¥{{ totalSaved.toFixed(2) }}</strong>
        </div>
      </div>

      <div v-if="tips.length === 0 && manualRecords.length === 0" class="tips-empty">
        <span class="empty-icon">💡</span>
        <p>暂无省钱建议</p>
        <p class="empty-hint">添加更多账单记录后，AI 将为你生成个性化省钱建议</p>
      </div>

      <div v-for="record in manualRecords.slice().reverse()" :key="record.id" class="manual-record">
        <span class="record-icon">💰</span>
        <span class="record-desc">{{ record.description }}</span>
        <span class="record-amount">+¥{{ record.amount.toFixed(2) }}</span>
        <button class="record-del" @click="deleteRecord(record.id)">✕</button>
      </div>

      <div v-for="tip in tips" :key="tip.id" class="tip-item" :class="tip.severity">
        <div class="tip-header">
          <span class="tip-icon">{{ tip.icon }}</span>
          <span class="tip-title">{{ tip.title }}</span>
        </div>
        <p class="tip-desc">{{ tip.description }}</p>
        <div class="tip-footer">
          <span class="tip-saving">预计可省: <strong>{{ tip.estimatedSaving }}</strong></span>
          <div class="tip-actions">
            <button class="adopt-btn" @click="adoptTip(tip)">采纳</button>
            <button class="feedback-btn" :class="{ active: feedbackMap[tip.id] === true }" @click="giveFeedback(tip.id, true)">👍</button>
            <button class="feedback-btn" :class="{ active: feedbackMap[tip.id] === false }" @click="giveFeedback(tip.id, false)">👎</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showManual" class="manual-modal" @click.self="showManual = false">
      <div class="manual-content">
        <h3>记录省钱金额</h3>
        <div class="manual-row">
          <label>省钱金额 (元)</label>
          <input v-model.number="manualAmount" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>
        <div class="quick-amounts">
          <button v-for="v in [5, 10, 15, 20, 50, 100]" :key="v" class="quick-amt" @click="manualAmount = v">¥{{ v }}</button>
        </div>
        <div class="manual-row">
          <label>省钱说明</label>
          <input v-model="manualDesc" type="text" placeholder="如：少喝了一杯奶茶" />
        </div>
        <div class="manual-actions">
          <button class="btn btn-outline" @click="showManual = false">取消</button>
          <button class="btn btn-primary" @click="saveManual" :disabled="manualAmount <= 0">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Bill } from '@/types/bill'
import type { Roommate } from '@/types/roommate'
import type { SavingTip } from '@/types/suggestion'
import { generateSuggestions, saveSuggestionFeedback, loadSuggestionFeedback } from '@/api/suggestionApi'
import { generateId } from '@/utils/storage'

interface ManualRecord {
  id: string
  amount: number
  description: string
  createdAt: number
}

const STORAGE_KEY_MANUAL = 'dorm_manual_savings'

const props = defineProps<{ bills: Bill[]; roommates: Roommate[] }>()

const emit = defineEmits<{ saved: [amount: number, description: string] }>()

const collapsed = ref(false)
const tips = ref<SavingTip[]>([])
const feedbackMap = ref<Record<string, boolean>>({})
const showManual = ref(false)
const manualAmount = ref(0)
const manualDesc = ref('')
const manualRecords = ref<ManualRecord[]>([])

onMounted(() => {
  const feedbacks = loadSuggestionFeedback()
  feedbacks.forEach(f => { feedbackMap.value[f.suggestionId] = f.useful })
  loadManualRecords()
  updateTips()
})

watch(() => props.bills, updateTips, { deep: true })

const totalSaved = computed(() => manualRecords.value.reduce((s, r) => s + r.amount, 0))

function updateTips() {
  tips.value = generateSuggestions(props.bills)
}

function loadManualRecords() {
  const data = localStorage.getItem(STORAGE_KEY_MANUAL)
  manualRecords.value = data ? JSON.parse(data) : []
}

function saveManualRecords() {
  localStorage.setItem(STORAGE_KEY_MANUAL, JSON.stringify(manualRecords.value))
}

function saveManual() {
  if (manualAmount.value <= 0) return
  const record: ManualRecord = {
    id: generateId(),
    amount: manualAmount.value,
    description: manualDesc.value || '手动记录',
    createdAt: Date.now()
  }
  manualRecords.value.push(record)
  saveManualRecords()
  emit('saved', record.amount, record.description)
  manualAmount.value = 0
  manualDesc.value = ''
  showManual.value = false
}

function deleteRecord(id: string) {
  manualRecords.value = manualRecords.value.filter(r => r.id !== id)
  saveManualRecords()
}

function adoptTip(tip: SavingTip) {
  const match = tip.estimatedSaving.match(/[\d.]+/)
  const amount = match ? parseFloat(match[0]) : 10
  const record: ManualRecord = {
    id: generateId(),
    amount: amount,
    description: `采纳建议: ${tip.title}`,
    createdAt: Date.now()
  }
  manualRecords.value.push(record)
  saveManualRecords()
  emit('saved', amount, record.description)
}

function giveFeedback(tipId: string, useful: boolean) {
  feedbackMap.value[tipId] = useful
  saveSuggestionFeedback({ suggestionId: tipId, useful, createdAt: Date.now() })
}
</script>

<style scoped>
.saving-tips-card { margin-bottom: 16px; }
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.header-icon { font-size: 20px; }
.header-title { font-size: 16px; font-weight: 600; flex: 1; }
.header-count {
  font-size: 12px;
  color: var(--primary);
  background: rgba(76,175,80,0.1);
  padding: 2px 8px;
  border-radius: 10px;
}
.toggle { font-size: 12px; color: var(--text-light); }
.tips-list { margin-top: 12px; }
.manual-saving {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.manual-btn { font-size: 13px; padding: 8px 16px; }
.total-saved { font-size: 13px; color: var(--text-light); }
.total-saved strong { color: var(--primary); font-size: 16px; }
.manual-record {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(76,175,80,0.08);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
}
.record-icon { font-size: 14px; }
.record-desc { flex: 1; color: var(--text); }
.record-amount { font-weight: 600; color: var(--primary); }
.record-del {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  font-size: 14px;
  padding: 2px 4px;
}
.record-del:hover { color: var(--danger); }
.tips-empty { text-align: center; padding: 24px 12px; color: var(--text-light); }
.empty-icon { font-size: 32px; display: block; margin-bottom: 8px; }
.empty-hint { font-size: 12px; margin-top: 4px; }
.tip-item {
  background: var(--bg);
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-left: 3px solid var(--primary);
}
.tip-item.warning { border-left-color: var(--warning); }
.tip-item.danger { border-left-color: var(--danger); }
.tip-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.tip-icon { font-size: 16px; }
.tip-title { font-weight: 600; font-size: 14px; }
.tip-desc { font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 8px; }
.tip-footer { display: flex; justify-content: space-between; align-items: center; }
.tip-saving { font-size: 12px; color: var(--text-light); }
.tip-saving strong { color: var(--primary); }
.tip-actions { display: flex; gap: 4px; align-items: center; }
.adopt-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
}
.adopt-btn:hover { background: var(--primary-dark); }
.feedback-btn {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.feedback-btn:hover { border-color: var(--primary); }
.feedback-btn.active { background: rgba(76,175,80,0.1); border-color: var(--primary); }
.manual-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.manual-content {
  background: var(--card);
  border-radius: 16px;
  padding: 24px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.manual-content h3 { font-size: 18px; margin-bottom: 16px; }
.manual-row { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
.manual-row label { font-size: 13px; color: var(--text-light); }
.manual-row input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; }
.manual-row input:focus { border-color: var(--primary); }
.quick-amounts { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.quick-amt {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-amt:hover { border-color: var(--primary); color: var(--primary); }
.manual-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>