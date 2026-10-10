<template>
  <div class="add-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">添加快递</h1>
      <p class="page-desc">粘贴短信智能识别，或手动填写快递信息</p>
    </div>

    <div class="smart-section fade-in-up" style="animation-delay:0.05s">
      <div class="section-label">
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2L11 7L16 8L11 9L10 14L9 9L4 8L9 7L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
        <span>短信智能解析</span>
      </div>
      <div v-if="clipboardHint" class="clipboard-hint">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5V9M8 11V11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        {{ clipboardHint }}
      </div>
      <textarea v-model="rawInput" class="smart-input" placeholder="粘贴快递通知短信，如：&#10;【菜鸟驿站】您的快递已到达，取件码1-3-201，圆通速递，尾号1234，请及时取件"></textarea>
      <div class="smart-actions">
        <button class="btn-primary" @click="parseText">智能识别</button>
        <button class="btn-ghost" @click="rawInput = ''">清空</button>
      </div>
      <div v-if="parseResult" class="parse-preview">
        <div class="preview-title">识别结果预览（可编辑）</div>
        <div class="preview-grid">
          <div class="preview-item"><span class="pv-label">驿站</span><span class="pv-value">{{ form.station || '—' }}</span></div>
          <div class="preview-item"><span class="pv-label">取件码</span><span class="pv-value code">{{ form.code || '—' }}</span></div>
          <div class="preview-item"><span class="pv-label">公司</span><span class="pv-value">{{ form.courier || '—' }}</span></div>
          <div class="preview-item"><span class="pv-label">尾号</span><span class="pv-value">{{ form.phone || '—' }}</span></div>
        </div>
      </div>
    </div>

    <div class="manual-section fade-in-up" style="animation-delay:0.1s">
      <div class="section-label">
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M4 5H16M4 10H16M4 15H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>手动填写</span>
      </div>
      <div class="form-card">
        <div class="form-row">
          <label>驿站名称</label>
          <input v-model="form.station" placeholder="如：菜鸟驿站" />
        </div>
        <div class="form-row">
          <label>取件码</label>
          <input v-model="form.code" placeholder="如：1-3-201" class="code-input" />
        </div>
        <div class="form-row">
          <label>快递公司</label>
          <select v-model="form.courier">
            <option value="">请选择</option>
            <option v-for="c in couriers" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>手机尾号</label>
          <input v-model="form.phone" maxlength="4" placeholder="后4位（选填）" />
        </div>
      </div>
      <button class="btn-primary btn-block save-btn" @click="onSave" :disabled="!form.code">
        保存快递
      </button>
    </div>
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
const parseResult = ref(false)
const couriers = ['顺丰', '圆通', '中通', '申通', '韵达', '百世', '邮政EMS', '京东', '德邦', '极兔']
const form = ref({ station: '', code: '', courier: '', phone: '' })

onMounted(async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      const result = parseNotification(text)
      if (result && result.code) {
        clipboardHint.value = '检测到剪贴板有快递信息，点击"智能识别"可自动填入'
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
    parseResult.value = true
  }
}

function onSave() {
  if (!form.value.code) return
  addRecord(form.value.station, form.value.code, form.value.courier, form.value.phone)
  window.dispatchEvent(new Event('storage-updated'))
  router.push('/')
}
</script>

<style scoped>
.add-page { max-width: 720px; margin: 0 auto; }

.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.smart-section, .manual-section { margin-bottom: 28px; }
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 14px;
}
.section-label svg { color: var(--jade); }

.clipboard-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--jade-deep);
  background: var(--jade-light);
  border: 1px solid var(--jade-soft);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 12px;
}
.clipboard-hint svg { color: var(--jade); flex-shrink: 0; }

.smart-input {
  width: 100%;
  min-height: 100px;
  font-size: 14px;
  padding: 14px 16px;
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  resize: vertical;
  color: var(--ink);
  transition: border-color 0.2s;
  line-height: 1.6;
}
.smart-input:focus { outline: none; border-color: var(--jade); }
.smart-input::placeholder { color: var(--ink-hint); }

.smart-actions { display: flex; gap: 10px; margin-top: 12px; }

.parse-preview {
  margin-top: 16px;
  background: var(--jade-light);
  border: 1px solid var(--jade-soft);
  border-radius: var(--radius-md);
  padding: 16px;
}
.preview-title { font-size: 13px; color: var(--jade-deep); font-weight: 600; margin-bottom: 12px; }
.preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.preview-item { display: flex; flex-direction: column; gap: 4px; }
.pv-label { font-size: 11px; color: var(--ink-hint); letter-spacing: 1px; }
.pv-value { font-size: 15px; font-weight: 500; color: var(--ink); }
.pv-value.code { font-family: var(--font-mono); color: var(--pine); font-weight: 700; letter-spacing: 1px; }

.form-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.form-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-soft);
}
.form-row:last-child { border-bottom: none; }
.form-row label { width: 100px; font-size: 14px; color: var(--ink-soft); font-weight: 500; flex-shrink: 0; }
.form-row input, .form-row select {
  flex: 1;
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ink);
}
.form-row input::placeholder { color: var(--ink-hint); }
.code-input { font-family: var(--font-mono); font-weight: 600; letter-spacing: 1px; }

.save-btn { margin-top: 20px; font-size: 16px; padding: 14px; }
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .preview-grid { grid-template-columns: 1fr; }
  .form-row { padding: 14px 16px; }
  .form-row label { width: 80px; }
}
</style>