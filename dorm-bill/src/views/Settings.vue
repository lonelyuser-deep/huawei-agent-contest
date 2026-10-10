<template>
  <div class="settings-page">
    <h1 class="page-title">⚙️ 设置</h1>

    <div class="card">
      <h3>💰 预算管理</h3>
      <div class="form-row">
        <label>启用预算预警</label>
        <label class="switch">
          <input type="checkbox" v-model="budget.enabled" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="form-row" v-if="budget.enabled">
        <label>月度总预算 (元)</label>
        <input v-model.number="budget.monthlyBudget" type="number" min="0" step="100" placeholder="1500" />
      </div>
      <div class="form-row" v-if="budget.enabled">
        <label>预警阈值: {{ budget.alertThreshold }}%</label>
        <input type="range" min="50" max="100" v-model.number="budget.alertThreshold" class="slider-range" />
        <span class="range-hint">消费达到预算的 {{ budget.alertThreshold }}% 时预警</span>
      </div>
      <div class="form-row" v-if="budget.enabled">
        <label>本月消费情况</label>
        <div class="budget-preview">
          <span class="preview-spent">已消费 ¥{{ currentSpent.toFixed(2) }}</span>
          <span class="preview-budget">预算 ¥{{ budget.monthlyBudget.toFixed(2) }}</span>
          <span class="preview-status" :class="currentStatus">{{ statusText }}</span>
        </div>
      </div>
      <button class="btn btn-primary" @click="saveBudget">保存预算设置</button>
    </div>

    <div class="card">
      <h3>华为云服务配置</h3>
      <div class="form-row">
        <label>OCR 服务端点</label>
        <input v-model="config.ocrEndpoint" type="text" placeholder="https://modelarts.xxx.myhuaweicloud.com" />
      </div>
      <div class="form-row">
        <label>OCR API Key</label>
        <input v-model="config.ocrApiKey" type="password" placeholder="输入API Key" />
      </div>
      <div class="form-row">
        <label>NLP 服务端点</label>
        <input v-model="config.nlpEndpoint" type="text" placeholder="https://nlp.xxx.myhuaweicloud.com" />
      </div>
      <div class="form-row">
        <label>NLP API Key</label>
        <input v-model="config.nlpApiKey" type="password" placeholder="输入API Key" />
      </div>
      <button class="btn btn-primary" @click="saveConfig">保存配置</button>
    </div>

    <div class="card">
      <h3>数据管理</h3>
      <div class="data-row">
        <span>账单数量: {{ billCount }}</span>
        <span>室友数量: {{ roommateCount }}</span>
      </div>
      <div class="data-actions">
        <button class="btn btn-outline" @click="exportData">📤 导出数据</button>
        <button class="btn btn-danger" @click="clearData">🗑️ 清空数据</button>
      </div>
    </div>

    <div class="card about-card">
      <h3>关于</h3>
      <p class="about-text">宿舍账单管家 v1.1.0</p>
      <p class="about-text">基于华为云 CodeArts 全生命周期开发</p>
      <p class="about-text">集成 ModelArts OCR + NLP + AI 省钱建议</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { BudgetSettings } from '@/types/budget'
import { loadBills, loadRoommates, saveBills, saveRoommates } from '@/utils/storage'
import { loadBudgetSettings, saveBudgetSettings, getMonthSpent } from '@/api/budgetApi'

const config = reactive({
  ocrEndpoint: '',
  ocrApiKey: '',
  nlpEndpoint: '',
  nlpApiKey: ''
})
const billCount = ref(0)
const roommateCount = ref(0)
const budget = reactive<BudgetSettings>(loadBudgetSettings())
const currentSpent = ref(0)

onMounted(() => {
  const saved = localStorage.getItem('dorm_config')
  if (saved) Object.assign(config, JSON.parse(saved))
  const bills = loadBills()
  billCount.value = bills.length
  roommateCount.value = loadRoommates().length
  const now = new Date()
  currentSpent.value = getMonthSpent(bills, now.getFullYear(), now.getMonth() + 1)
})

const currentStatus = computed(() => {
  if (budget.monthlyBudget <= 0) return 'normal'
  const ratio = currentSpent.value / budget.monthlyBudget
  if (ratio >= 1) return 'exceeded'
  if (ratio >= budget.alertThreshold / 100) return 'warning'
  return 'normal'
})

const statusText = computed(() => {
  if (currentStatus.value === 'exceeded') return '已超支'
  if (currentStatus.value === 'warning') return '即将耗尽'
  return '正常'
})

function saveBudget() {
  saveBudgetSettings(budget)
  alert('预算设置已保存')
}

function saveConfig() {
  localStorage.setItem('dorm_config', JSON.stringify(config))
  alert('配置已保存')
}

function exportData() {
  const data = {
    bills: loadBills(),
    roommates: loadRoommates(),
    config: JSON.parse(localStorage.getItem('dorm_config') || '{}'),
    budget: loadBudgetSettings()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dorm-bill-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function clearData() {
  if (!confirm('确定清空所有数据？此操作不可恢复！')) return
  saveBills([])
  saveRoommates([])
  localStorage.removeItem('dorm_config')
  localStorage.removeItem('dorm_budget_settings')
  billCount.value = 0
  roommateCount.value = 0
  currentSpent.value = 0
  alert('数据已清空')
}
</script>

<style scoped>
.card { margin-bottom: 16px; }
.card h3 { font-size: 16px; margin-bottom: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-row label { font-size: 13px; color: var(--text-light); }
.form-row input { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
.form-row input:focus { border-color: var(--primary); }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--border); border-radius: 24px; transition: 0.3s; }
.slider:before { content: ""; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
.switch input:checked + .slider { background: var(--primary); }
.switch input:checked + .slider:before { transform: translateX(20px); }
.slider-range { width: 100%; accent-color: var(--primary); }
.range-hint { font-size: 12px; color: var(--text-light); }
.budget-preview { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.preview-spent { font-weight: 600; color: var(--primary); }
.preview-budget { color: var(--text-light); font-size: 13px; }
.preview-status { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.preview-status.normal { background: rgba(39,174,96,0.1); color: var(--success); }
.preview-status.warning { background: rgba(243,156,18,0.1); color: var(--warning); }
.preview-status.exceeded { background: rgba(231,76,60,0.1); color: var(--danger); }
.data-row { display: flex; gap: 20px; margin-bottom: 12px; font-size: 14px; }
.data-actions { display: flex; gap: 8px; }
.about-text { font-size: 13px; color: var(--text-light); line-height: 1.6; }
</style>