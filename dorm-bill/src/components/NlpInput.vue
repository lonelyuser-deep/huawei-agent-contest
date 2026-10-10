<template>
  <div class="nlp-input">
    <div class="input-area">
      <input
        v-model="text"
        type="text"
        placeholder="试试输入：今天帮室友A带了15元的奶茶"
        @keyup.enter="parse"
      />
      <button class="btn btn-primary" @click="parse" :disabled="!text.trim()">解析</button>
    </div>
    <div v-if="result" class="nlp-result">
      <div v-if="result.success" class="result-success">
        <div class="result-row">
          <span class="label">💰 金额</span>
          <span class="value">{{ formatAmount(result.amount) }}</span>
        </div>
        <div class="result-row">
          <span class="label">📦 类别</span>
          <span class="value">{{ CATEGORY_LABELS[result.category] }}</span>
        </div>
        <div v-if="result.paidByName" class="result-row">
          <span class="label">👤 支付人</span>
          <span class="value">{{ result.paidByName }}</span>
        </div>
        <div v-if="result.involvedNames.length > 0" class="result-row">
          <span class="label">👥 相关人</span>
          <span class="value">{{ result.involvedNames.join('、') }}</span>
        </div>
        <button class="btn btn-primary" @click="applyResult">使用解析结果</button>
      </div>
      <div v-else class="result-fail">
        ⚠️ 无法识别金额，请尝试更明确的表述，如"今天电费50元"
      </div>
    </div>
    <div class="nlp-examples">
      <span class="examples-label">示例：</span>
      <button v-for="ex in examples" :key="ex" class="example-chip" @click="text = ex; parse()">{{ ex }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { parseNaturalLanguage } from '@/api/nlp'
import { CATEGORY_LABELS, type BillCategory } from '@/types/bill'
import { formatAmount, loadRoommates } from '@/utils/storage'

const emit = defineEmits<{
  parsed: [result: { amount: number; category: BillCategory; paidByName?: string }]
}>()

const text = ref('')
const result = ref<Awaited<ReturnType<typeof parseNaturalLanguage>> | null>(null)

const examples = [
  '今天帮室友A带了15元的奶茶',
  '昨天电费50元',
  '水费30元我付的',
  '买了20元的纸巾'
]

function parse() {
  if (!text.value.trim()) return
  const roommates = loadRoommates()
  result.value = parseNaturalLanguage(text.value, roommates.map(r => r.name))
}

function applyResult() {
  if (result.value && result.value.success) {
    emit('parsed', {
      amount: result.value.amount,
      category: result.value.category,
      paidByName: result.value.paidByName
    })
  }
}
</script>

<style scoped>
.input-area { display: flex; gap: 8px; }
.input-area input { flex: 1; padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
.input-area input:focus { border-color: var(--primary); }
.nlp-result { margin-top: 12px; padding: 14px; background: var(--bg); border-radius: 8px; }
.result-row { display: flex; justify-content: space-between; padding: 4px 0; }
.result-row .label { color: var(--text-light); font-size: 13px; }
.result-row .value { font-weight: 500; }
.result-fail { color: var(--warning); font-size: 13px; }
.nlp-examples { margin-top: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.examples-label { font-size: 12px; color: var(--text-light); }
.example-chip { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 4px 10px; font-size: 12px; color: var(--text-light); cursor: pointer; transition: all 0.2s; }
.example-chip:hover { border-color: var(--primary); color: var(--primary); }
</style>