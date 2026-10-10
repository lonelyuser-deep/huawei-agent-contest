<template>
  <div class="express-card" :class="{ picked: isPicked }" @click="$emit('click')">
    <div class="card-left">
      <div class="courier-avatar" :style="{ background: avatarColor }">
        {{ courierInitial }}
      </div>
    </div>
    <div class="card-main">
      <div class="card-header">
        <span class="card-station">{{ item.station || '未知驿站' }}</span>
        <span v-if="item.courier" class="card-courier-tag">{{ item.courier }}</span>
      </div>
      <div class="card-code-row">
        <div class="code-highlight">
          <span class="code-label">取件码</span>
          <span class="code-value">{{ item.code }}</span>
        </div>
        <span v-if="item.phone" class="card-phone">尾号 {{ item.phone }}</span>
      </div>
      <div class="card-footer">
        <span class="card-time">{{ formatTime(item.createdAt) }}</span>
        <span class="card-status" :class="item.status">
          {{ isPicked ? '已取件' : '待取件' }}
        </span>
      </div>
    </div>
    <button v-if="!isPicked" class="pick-btn" @click.stop="$emit('pick')">
      <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
        <path d="M3 8L7 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      已取
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExpressData } from '@shared/types/express'

const props = defineProps<{ item: ExpressData }>()
defineEmits<{ click: []; pick: [] }>()

const isPicked = computed(() => props.item.status === 'picked')

const courierInitial = computed(() => {
  const c = props.item.courier
  if (!c) return '?'
  return c.charAt(0)
})

const avatarColor = computed(() => {
  const colors = [
    'linear-gradient(135deg, #1D7561, #155B4C)',
    'linear-gradient(135deg, #2A9D7E, #1D7561)',
    'linear-gradient(135deg, #155B4C, #123F37)',
    'linear-gradient(135deg, #3D8A6E, #2A9D7E)',
    'linear-gradient(135deg, #1D7561, #2A9D7E)',
    'linear-gradient(135deg, #123F37, #155B4C)',
  ]
  const c = props.item.courier || ''
  let hash = 0
  for (let i = 0; i < c.length; i++) hash = c.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.express-card { background: var(--white); border-radius: var(--radius-lg); padding: 18px 20px; display: flex; gap: 16px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-soft); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; align-items: stretch; }
.express-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--jade-soft); }
.express-card.picked { opacity: 0.6; }
.express-card.picked:hover { opacity: 0.8; }
.card-left { flex-shrink: 0; }
.courier-avatar { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #FFFDF0; font-size: 20px; font-weight: 700; font-family: var(--font-sans); box-shadow: 0 2px 8px rgba(18, 63, 55, 0.2); }
.card-main { flex: 1; display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.card-header { display: flex; align-items: center; gap: 10px; }
.card-station { font-size: 16px; font-weight: 600; color: var(--ink); }
.card-courier-tag { font-size: 11px; color: var(--jade-deep); background: var(--jade-light); border-radius: 6px; padding: 2px 8px; font-weight: 500; letter-spacing: 0.5px; }
.card-code-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.code-highlight { background: var(--jade-light); border: 1px solid var(--jade-soft); border-radius: 10px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 8px; }
.code-label { font-size: 11px; color: var(--ink-hint); letter-spacing: 1px; }
.code-value { font-size: 18px; font-weight: 700; color: var(--pine); font-family: var(--font-mono); letter-spacing: 1.5px; }
.card-phone { font-size: 13px; color: var(--ink-hint); font-family: var(--font-mono); }
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.card-time { font-size: 12px; color: var(--ink-hint); }
.card-status { font-size: 11px; padding: 3px 10px; border-radius: 10px; font-weight: 500; letter-spacing: 0.5px; }
.card-status.pending { background: var(--jade-light); color: var(--jade-deep); }
.card-status.picked { background: var(--cream-warm); color: var(--ink-hint); }
.pick-btn { position: absolute; right: 18px; bottom: 18px; display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--jade-deep); background: var(--white); border: 1.5px solid var(--jade); border-radius: 20px; padding: 6px 14px; font-weight: 600; transition: all 0.2s ease; }
.pick-btn:hover { background: var(--jade); color: var(--white); }
@media (max-width: 768px) {
  .express-card { padding: 14px 16px; gap: 12px; }
  .courier-avatar { width: 42px; height: 42px; font-size: 18px; }
  .code-value { font-size: 16px; }
  .pick-btn { right: 14px; bottom: 14px; }
}
</style>