<template>
  <div class="ocr-upload">
    <div class="upload-zone" @click="triggerUpload" @dragover.prevent="onDragOver" @drop.prevent="onDrop" :class="{ dragging }">
      <span class="upload-icon">📸</span>
      <span class="upload-text">点击或拖拽上传账单截图</span>
      <span class="upload-hint">支持电费/水费/外卖订单截图</span>
    </div>
    <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" hidden />

    <div v-if="loading" class="ocr-loading">
      <span class="spinner"></span> 正在识别中...
    </div>

    <div v-if="result" class="ocr-result">
      <div class="result-row">
        <span class="label">识别金额</span>
        <span class="value amount">{{ formatAmount(result.amount) }}</span>
      </div>
      <div class="result-row">
        <span class="label">账单类别</span>
        <span class="value">{{ CATEGORY_LABELS[result.category] }}</span>
      </div>
      <div v-if="result.date" class="result-row">
        <span class="label">日期</span>
        <span class="value">{{ result.date }}</span>
      </div>
      <details class="result-details">
        <summary>查看识别详情</summary>
        <pre>{{ result.details }}</pre>
      </details>
      <button class="btn btn-primary" @click="applyResult">使用识别结果</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { recognizeImage } from '@/api/ocr'
import { CATEGORY_LABELS, type BillCategory } from '@/types/bill'
import { formatAmount } from '@/utils/storage'

const emit = defineEmits<{
  recognized: [result: { amount: number; category: BillCategory; date?: string }]
}>()

const fileInput = ref<HTMLInputElement>()
const loading = ref(false)
const dragging = ref(false)
const result = ref<Awaited<ReturnType<typeof recognizeImage>> | null>(null)

function triggerUpload() { fileInput.value?.click() }

function onDragOver() { dragging.value = true }

async function onDrop(e: DragEvent) {
  dragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) await processFile(file)
}

async function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) await processFile(file)
}

async function processFile(file: File) {
  loading.value = true
  result.value = null
  try {
    result.value = await recognizeImage(file)
  } finally {
    loading.value = false
  }
}

function applyResult() {
  if (result.value) {
    emit('recognized', {
      amount: result.value.amount,
      category: result.value.category,
      date: result.value.date
    })
  }
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.upload-zone:hover, .upload-zone.dragging { border-color: var(--primary); background: rgba(76,175,80,0.05); }
.upload-icon { font-size: 36px; }
.upload-text { font-size: 14px; font-weight: 500; }
.upload-hint { font-size: 12px; color: var(--text-light); }
.ocr-loading { text-align: center; padding: 20px; color: var(--text-light); display: flex; align-items: center; justify-content: center; gap: 8px; }
.spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ocr-result { margin-top: 16px; padding: 16px; background: var(--bg); border-radius: 8px; }
.result-row { display: flex; justify-content: space-between; padding: 6px 0; }
.result-row .label { color: var(--text-light); font-size: 13px; }
.result-row .value { font-weight: 500; }
.result-row .amount { color: var(--primary); font-size: 18px; }
.result-details { margin: 8px 0; }
.result-details pre { font-size: 12px; white-space: pre-wrap; background: var(--card); padding: 8px; border-radius: 4px; margin-top: 4px; }
</style>