<template>
  <div class="add-page">
    <h2 class="section-title">🤖 智能录入</h2>
    <div v-if="clipboardHint" class="clipboard-hint">{{ clipboardHint }}</div>
    <textarea
      v-model="rawInput"
      class="smart-input"
      placeholder="粘贴快递通知，或输入如：菜鸟驿站取件码1-3-201圆通尾号1234"
    ></textarea>
    <button class="primary" @click="parseText">智能识别</button>

    <h2 class="section-title" style="margin-top: 20px">📝 手动填写</h2>
    <div class="form">
      <div class="form-item">
        <label>驿站名称</label>
        <input v-model="form.station" placeholder="如：菜鸟驿站" />
      </div>
      <div class="form-item">
        <label>取件码</label>
        <input v-model="form.code" placeholder="如：1-3-201" />
      </div>
      <div class="form-item">
        <label>快递公司</label>
        <select v-model="form.courier">
          <option value="">请选择</option>
          <option v-for="c in couriers" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="form-item">
        <label>手机尾号</label>
        <input v-model="form.phone" type="number" maxlength="4" placeholder="后4位（选填）" />
      </div>
    </div>

    <button class="primary" style="margin-top: 24px" @click="onSave">保存</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { addRecord } from '@/utils/storage'
import { parseNotification } from '@shared/parser/notificationParser'

const router = useRouter()
const rawInput = ref('')
const clipboardHint = ref('')
const couriers = ['顺丰', '圆通', '中通', '申通', '韵达', '百世', '邮政EMS', '京东', '德邦', '极兔']
const form = ref({ station: '', code: '', courier: '', phone: '' })

onMounted(async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      const result = parseNotification(text)
      if (result && result.code) {
        clipboardHint.value = '检测到粘贴板有快递信息，点击"智能识别"自动填入'
        rawInput.value = text
      }
    }
  } catch {}
})

function parseText() {
  if (!rawInput.value.trim()) return
  const result = parseNotification(rawInput.value)
  if (result) {
    form.value = { station: result.station, code: result.code, courier: result.courier, phone: result.phone }
  }
}

function onSave() {
  if (!form.value.code) return
  addRecord(form.value.station, form.value.code, form.value.courier, form.value.phone)
  router.back()
}
</script>

<style scoped>
.add-page { padding: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.clipboard-hint {
  font-size: 12px; color: var(--primary); background: #e8f2fe;
  border-radius: 8px; padding: 10px; margin-bottom: 8px;
}
.smart-input {
  width: 100%; min-height: 80px; font-size: 14px; padding: 10px;
  background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
  resize: vertical; font-family: inherit;
}
.form { background: #fff; border-radius: 12px; padding: 0 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.form-item {
  display: flex; align-items: center; padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.form-item:last-child { border-bottom: none; }
.form-item label { width: 90px; font-size: 15px; }
.form-item input, .form-item select {
  flex: 1; font-size: 14px; border: none; outline: none; background: transparent;
}
</style>