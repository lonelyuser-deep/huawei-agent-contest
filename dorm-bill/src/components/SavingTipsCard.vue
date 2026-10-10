<template>
  <div class="saving-tips-card card">
    <div class="card-header" @click="collapsed = !collapsed">
      <span class="header-icon">🤖</span>
      <span class="header-title">省钱小助手</span>
      <span class="header-count" v-if="tips.length > 0">{{ tips.length }}条建议</span>
      <span class="toggle">{{ collapsed ? '展开' : '收起' }} {{ collapsed ? '▼' : '▲' }}</span>
    </div>

    <div v-if="!collapsed" class="tips-list">
      <div v-if="tips.length === 0" class="tips-empty">
        <span class="empty-icon">💡</span>
        <p>暂无省钱建议</p>
        <p class="empty-hint">添加更多账单记录后，AI 将为你生成个性化省钱建议</p>
      </div>

      <div v-for="tip in tips" :key="tip.id" class="tip-item" :class="tip.severity">
        <div class="tip-header">
          <span class="tip-icon">{{ tip.icon }}</span>
          <span class="tip-title">{{ tip.title }}</span>
        </div>
        <p class="tip-desc">{{ tip.description }}</p>
        <div class="tip-footer">
          <span class="tip-saving">预计可省: <strong>{{ tip.estimatedSaving }}</strong></span>
          <div class="tip-feedback">
            <button class="feedback-btn" :class="{ active: feedbackMap[tip.id] === true }" @click="giveFeedback(tip.id, true)">👍</button>
            <button class="feedback-btn" :class="{ active: feedbackMap[tip.id] === false }" @click="giveFeedback(tip.id, false)">👎</button>
          </div>
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

const props = defineProps<{ bills: Bill[]; roommates: Roommate[] }>()

const collapsed = ref(false)
const tips = ref<SavingTip[]>([])
const feedbackMap = ref<Record<string, boolean>>({})

onMounted(() => {
  const feedbacks = loadSuggestionFeedback()
  feedbacks.forEach(f => { feedbackMap.value[f.suggestionId] = f.useful })
  updateTips()
})

watch(() => props.bills, updateTips, { deep: true })

function updateTips() {
  tips.value = generateSuggestions(props.bills)
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
.tip-feedback { display: flex; gap: 4px; }
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
</style>