<template>
  <div class="add-page">
    <h1 class="page-title">➕ 添加账单</h1>

    <div class="input-tabs">
      <button :class="{ active: tab === 'manual' }" @click="tab = 'manual'">✏️ 手动输入</button>
      <button :class="{ active: tab === 'ocr' }" @click="tab = 'ocr'">📸 OCR识别</button>
      <button :class="{ active: tab === 'nlp' }" @click="tab = 'nlp'">🗣️ 语义记账</button>
    </div>

    <div v-if="tab === 'ocr'" class="section">
      <OcrUpload @recognized="onOcrRecognized" />
    </div>

    <div v-if="tab === 'nlp'" class="section">
      <NlpInput @parsed="onNlpParsed" />
    </div>

    <div class="form card">
      <div class="form-row">
        <label>标题</label>
        <input v-model="form.title" type="text" placeholder="如：10月电费" />
      </div>
      <div class="form-row">
        <label>金额</label>
        <input v-model.number="form.amount" type="number" step="0.01" placeholder="0.00" />
      </div>
      <div class="form-row">
        <label>类别</label>
        <select v-model="form.category">
          <option v-for="(label, key) in CATEGORY_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>支付人</label>
        <select v-model="form.paidBy">
          <option v-for="r in roommates" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </div>
      <div class="form-row">
        <label>日期</label>
        <input v-model="form.date" type="date" />
      </div>
      <div class="form-row">
        <label>分摊方式</label>
        <select v-model="form.splitType">
          <option value="average">均摊</option>
          <option value="custom">自定义</option>
        </select>
      </div>
      <div class="form-row">
        <label>备注</label>
        <textarea v-model="form.note" rows="2" placeholder="可选备注"></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn-outline" @click="$router.back()">取消</button>
        <button class="btn btn-primary" @click="submit" :disabled="!canSubmit">保存账单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Bill, BillCategory } from '@/types/bill'
import { CATEGORY_LABELS } from '@/types/bill'
import type { Roommate } from '@/types/roommate'
import { loadRoommates, saveBills, loadBills, generateId, calculateSplits } from '@/utils/storage'
import OcrUpload from '@/components/OcrUpload.vue'
import NlpInput from '@/components/NlpInput.vue'

const router = useRouter()
const tab = ref<'manual' | 'ocr' | 'nlp'>('manual')
const roommates = ref<Roommate[]>([])

const form = reactive({
  title: '',
  amount: 0,
  category: 'other' as BillCategory,
  paidBy: '',
  date: new Date().toISOString().slice(0, 10),
  splitType: 'average' as 'average' | 'custom',
  note: ''
})

onMounted(() => {
  roommates.value = loadRoommates()
  if (roommates.value.length > 0) form.paidBy = roommates.value[0].id
})

const canSubmit = computed(() => form.title.trim() && form.amount > 0 && form.paidBy)

function onOcrRecognized(r: { amount: number; category: BillCategory; date?: string }) {
  form.amount = r.amount
  form.category = r.category
  if (r.date) form.date = r.date
  if (!form.title) form.title = CATEGORY_LABELS[r.category]
  tab.value = 'manual'
}

function onNlpParsed(r: { amount: number; category: BillCategory; paidByName?: string }) {
  form.amount = r.amount
  form.category = r.category
  if (r.paidByName) {
    const roommate = roommates.value.find(rm => rm.name === r.paidByName)
    if (roommate) form.paidBy = roommate.id
  }
  if (!form.title) form.title = CATEGORY_LABELS[r.category]
  tab.value = 'manual'
}

function submit() {
  if (!canSubmit.value) return
  const bill: Bill = {
    id: generateId(),
    title: form.title,
    amount: form.amount,
    category: form.category,
    paidBy: form.paidBy,
    date: form.date,
    note: form.note,
    splitType: form.splitType,
    createdAt: Date.now()
  }
  bill.splits = calculateSplits(bill, roommates.value)
  const bills = loadBills()
  bills.push(bill)
  saveBills(bills)
  router.push('/')
}
</script>

<style scoped>
.input-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.input-tabs button { flex: 1; padding: 10px; border-radius: 8px; background: var(--card); border: 1px solid var(--border); font-size: 14px; color: var(--text-light); transition: all 0.2s; }
.input-tabs button.active { border-color: var(--primary); color: var(--primary); background: rgba(76,175,80,0.05); font-weight: 600; }
.section { margin-bottom: 16px; }
.form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 13px; color: var(--text-light); }
.form-row input, .form-row select, .form-row textarea { padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
.form-row input:focus, .form-row select:focus, .form-row textarea:focus { border-color: var(--primary); }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
</style>