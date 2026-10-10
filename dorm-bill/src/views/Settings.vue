<template>
  <div class="settings-page">
    <h1 class="page-title">⚙️ 设置</h1>

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
      <p class="about-text">宿舍账单管家 v1.0.0</p>
      <p class="about-text">基于华为云 CodeArts 全生命周期开发</p>
      <p class="about-text">集成 ModelArts OCR + NLP 智能识别</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { loadBills, loadRoommates, saveBills, saveRoommates } from '@/utils/storage'

const config = reactive({
  ocrEndpoint: '',
  ocrApiKey: '',
  nlpEndpoint: '',
  nlpApiKey: ''
})
const billCount = ref(0)
const roommateCount = ref(0)

onMounted(() => {
  const saved = localStorage.getItem('dorm_config')
  if (saved) Object.assign(config, JSON.parse(saved))
  billCount.value = loadBills().length
  roommateCount.value = loadRoommates().length
})

function saveConfig() {
  localStorage.setItem('dorm_config', JSON.stringify(config))
  alert('配置已保存')
}

function exportData() {
  const data = {
    bills: loadBills(),
    roommates: loadRoommates(),
    config: JSON.parse(localStorage.getItem('dorm_config') || '{}')
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
  billCount.value = 0
  roommateCount.value = 0
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
.data-row { display: flex; gap: 20px; margin-bottom: 12px; font-size: 14px; }
.data-actions { display: flex; gap: 8px; }
.about-text { font-size: 13px; color: var(--text-light); line-height: 1.6; }
</style>