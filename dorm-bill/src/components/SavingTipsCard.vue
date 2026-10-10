<template>
  <div class="saving-tips-card card">
    <div class="card-header" @click="collapsed = !collapsed">
      <span class="header-icon">🤖</span>
      <span class="header-title">省钱小助手</span>
      <span class="toggle">{{ collapsed ? '展开' : '收起' }} {{ collapsed ? '▼' : '▲' }}</span>
    </div>

    <div v-if="!collapsed" class="tips-list">
      <div v-if="goal.target > 0" class="saving-goal">
        <div class="goal-header">
          <span class="goal-icon">🎯</span>
          <span class="goal-title">省钱目标：{{ goal.purpose || '攒钱' }}</span>
          <button class="edit-btn" @click="showEdit = true">✏️</button>
        </div>
        <div class="goal-amounts">
          <span class="goal-saved">已省 ¥{{ savedAmount.toFixed(2) }}</span>
          <span class="goal-target">目标 ¥{{ goal.target.toFixed(2) }}</span>
        </div>
        <div class="goal-bar-wrap">
          <div class="goal-bar" :style="{ width: progress + '%', background: progressColor }"></div>
        </div>
        <div class="goal-footer">
          <span class="goal-progress" :style="{ color: progressColor }">{{ progress }}%</span>
          <span class="goal-remaining">
            {{ remaining > 0 ? `还需省 ¥${remaining.toFixed(2)}` : '🎉 目标达成！' }}
          </span>
        </div>
        <div v-if="goal.deadline" class="goal-deadline">截止日期: {{ goal.deadline }}</div>
      </div>

      <div v-else class="no-goal">
        <span class="no-goal-icon">🎯</span>
        <p>设置月度省钱目标，追踪攒钱进度</p>
        <button class="btn btn-primary" @click="showEdit = true">设置省钱目标</button>
      </div>

      <div v-if="tips.length > 0" class="ai-tips-section">
        <div class="section-label">AI 省钱建议</div>
        <div v-for="tip in tips" :key="tip.id" class="tip-item" :class="tip.severity">
          <div class="tip-header">
            <span class="tip-icon">{{ tip.icon }}</span>
            <span class="tip-title">{{ tip.title }}</span>
          </div>
          <p class="tip-desc">{{ tip.description }}</p>
          <div class="tip-footer">
            <span class="tip-saving">预计可省: <strong>{{ tip.estimatedSaving }}</strong></span>
            <button class="adopt-btn" @click="adoptTip(tip)">采纳建议</button>
          </div>
        </div>
      </div>

      <div v-if="tips.length === 0 && goal.target === 0" class="tips-empty">
        <span class="empty-icon">💡</span>
        <p>添加账单后 AI 将生成省钱建议</p>
      </div>
    </div>

    <div v-if="showEdit" class="goal-modal" @click.self="showEdit = false">
      <div class="goal-modal-content">
        <h3>设置省钱目标</h3>
        <div class="modal-row">
          <label>这个月想省多少钱 (元)</label>
          <input v-model.number="editTarget" type="number" min="0" step="50" placeholder="如 500" />
        </div>
        <div class="quick-amounts">
          <button v-for="v in [100, 200, 300, 500, 800, 1000]" :key="v" class="quick-amt" @click="editTarget = v">¥{{ v }}</button>
        </div>
        <div class="modal-row">
          <label>用来干什么</label>
          <input v-model="editPurpose" type="text" placeholder="如 买电脑 / 旅游 / 攒生活费" />
        </div>
        <div class="modal-row">
          <label>截止日期（可选）</label>
          <input v-model="editDeadline" type="date" />
        </div>
        <div class="modal-actions">
          <button v-if="goal.target > 0" class="btn btn-danger" @click="clearGoal">删除目标</button>
          <button class="btn btn-outline" @click="showEdit = false">取消</button>
          <button class="btn btn-primary" @click="saveGoal" :disabled="editTarget <= 0">保存</button>
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
import { generateSuggestions } from '@/api/suggestionApi'
import { loadBudgetSettings, getMonthSpent } from '@/api/budgetApi'
import { generateId } from '@/utils/storage'

interface SavingGoalLocal {
  target: number
  purpose: string
  deadline: string
  adoptedTips: string[]
  manualSaved: number
  month: string
}

const STORAGE_KEY_GOAL = 'dorm_saving_goal'

const props = defineProps<{ bills: Bill[]; roommates: Roommate[] }>()

const collapsed = ref(false)
const tips = ref<SavingTip[]>([])
const showEdit = ref(false)
const editTarget = ref(0)
const editPurpose = ref('')
const editDeadline = ref('')
const goal = ref<SavingGoalLocal>({ target: 0, purpose: '', deadline: '', adoptedTips: [], manualSaved: 0, month: '' })

onMounted(() => {
  loadGoal()
  updateTips()
})

watch(() => props.bills, () => { updateTips(); checkMonthReset() }, { deep: true })

const budgetSurplus = computed(() => {
  const settings = loadBudgetSettings()
  if (!settings.enabled || settings.monthlyBudget <= 0) return 0
  const now = new Date()
  const spent = getMonthSpent(props.bills, now.getFullYear(), now.getMonth() + 1)
  return Math.max(0, settings.monthlyBudget - spent)
})

const adoptedSaving = computed(() => {
  let total = 0
  for (const tipId of goal.value.adoptedTips) {
    const tip = tips.value.find(t => t.id === tipId)
    if (tip) {
      const match = tip.estimatedSaving.match(/[\d.]+/)
      total += match ? parseFloat(match[0]) * 0.5 : 0
    }
  }
  return total
})

const savedAmount = computed(() => {
  return Math.round((budgetSurplus.value + adoptedSaving.value + goal.value.manualSaved) * 100) / 100
})

const progress = computed(() => {
  if (goal.value.target <= 0) return 0
  return Math.min(100, Math.round((savedAmount.value / goal.value.target) * 100))
})

const remaining = computed(() => Math.round((goal.value.target - savedAmount.value) * 100) / 100)

const progressColor = computed(() => {
  if (progress.value >= 100) return 'var(--success)'
  if (progress.value >= 60) return 'var(--primary)'
  if (progress.value >= 30) return 'var(--warning)'
  return 'var(--text-light)'
})

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function loadGoal() {
  const data = localStorage.getItem(STORAGE_KEY_GOAL)
  if (data) {
    const parsed = JSON.parse(data)
    if (parsed.month !== currentMonth()) {
      parsed.month = currentMonth()
      parsed.adoptedTips = []
      parsed.manualSaved = 0
    }
    goal.value = parsed
    editTarget.value = parsed.target
    editPurpose.value = parsed.purpose
    editDeadline.value = parsed.deadline
  }
}

function saveGoalStorage() {
  localStorage.setItem(STORAGE_KEY_GOAL, JSON.stringify(goal.value))
}

function checkMonthReset() {
  if (goal.value.month !== currentMonth()) {
    goal.value.month = currentMonth()
    goal.value.adoptedTips = []
    goal.value.manualSaved = 0
    saveGoalStorage()
  }
}

function updateTips() {
  tips.value = generateSuggestions(props.bills)
}

function saveGoal() {
  goal.value.target = editTarget.value
  goal.value.purpose = editPurpose.value
  goal.value.deadline = editDeadline.value
  goal.value.month = currentMonth()
  saveGoalStorage()
  showEdit.value = false
}

function clearGoal() {
  goal.value = { target: 0, purpose: '', deadline: '', adoptedTips: [], manualSaved: 0, month: '' }
  saveGoalStorage()
  showEdit.value = false
}

function adoptTip(tip: SavingTip) {
  if (goal.value.target <= 0) {
    alert('请先设置省钱目标！')
    showEdit.value = true
    return
  }
  if (!goal.value.adoptedTips.includes(tip.id)) {
    goal.value.adoptedTips.push(tip.id)
    saveGoalStorage()
  }
}
</script>

<style scoped>
.saving-tips-card { margin-bottom: 16px; }
.card-header { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.header-icon { font-size: 20px; }
.header-title { font-size: 16px; font-weight: 600; flex: 1; }
.toggle { font-size: 12px; color: var(--text-light); }
.tips-list { margin-top: 12px; }
.saving-goal {
  background: linear-gradient(135deg, rgba(76,175,80,0.08), rgba(76,175,80,0.02));
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.goal-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.goal-icon { font-size: 18px; }
.goal-title { font-size: 14px; font-weight: 600; flex: 1; }
.edit-btn { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 2px 8px; font-size: 12px; cursor: pointer; }
.edit-btn:hover { border-color: var(--primary); color: var(--primary); }
.goal-amounts { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.goal-saved { font-weight: 700; color: var(--primary); }
.goal-target { color: var(--text-light); }
.goal-bar-wrap { height: 10px; background: var(--bg); border-radius: 5px; overflow: hidden; }
.goal-bar { height: 100%; border-radius: 5px; transition: width 0.4s ease; }
.goal-footer { display: flex; justify-content: space-between; margin-top: 6px; font-size: 12px; }
.goal-progress { font-weight: 700; }
.goal-remaining { color: var(--text-light); }
.goal-deadline { font-size: 11px; color: var(--text-light); margin-top: 4px; }
.no-goal { text-align: center; padding: 20px 12px; }
.no-goal-icon { font-size: 32px; display: block; margin-bottom: 8px; }
.no-goal p { font-size: 13px; color: var(--text-light); margin-bottom: 12px; }
.ai-tips-section { margin-top: 12px; }
.section-label { font-size: 13px; font-weight: 600; color: var(--text-light); margin-bottom: 8px; }
.tip-item { background: var(--bg); border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; border-left: 3px solid var(--primary); }
.tip-item.warning { border-left-color: var(--warning); }
.tip-item.danger { border-left-color: var(--danger); }
.tip-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.tip-icon { font-size: 16px; }
.tip-title { font-weight: 600; font-size: 14px; }
.tip-desc { font-size: 13px; color: var(--text); line-height: 1.5; margin-bottom: 8px; }
.tip-footer { display: flex; justify-content: space-between; align-items: center; }
.tip-saving { font-size: 12px; color: var(--text-light); }
.tip-saving strong { color: var(--primary); }
.adopt-btn { background: var(--primary); color: #fff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; }
.adopt-btn:hover { background: var(--primary-dark); }
.tips-empty { text-align: center; padding: 20px 12px; color: var(--text-light); }
.empty-icon { font-size: 28px; display: block; margin-bottom: 6px; }
.goal-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; }
.goal-modal-content { background: var(--card); border-radius: 16px; padding: 24px; width: 380px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.goal-modal-content h3 { font-size: 18px; margin-bottom: 16px; }
.modal-row { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
.modal-row label { font-size: 13px; color: var(--text-light); }
.modal-row input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 16px; }
.modal-row input:focus { border-color: var(--primary); }
.quick-amounts { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.quick-amt { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 4px 12px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.quick-amt:hover { border-color: var(--primary); color: var(--primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>