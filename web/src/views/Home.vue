<template>
  <div class="home">
    <div class="welcome-banner fade-in-up">
      <div class="banner-left">
        <span class="banner-tag">CAMPUS DELIVERY</span>
        <h1 class="banner-title">今天还有几件快递待领取？</h1>
        <p class="banner-desc">管理你的校园快递，取件码一目了然，不再错过每一件包裹</p>
        <div class="banner-actions">
          <button class="btn-primary" @click="goAdd">
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16" style="display:inline;vertical-align:-2px;margin-right:6px"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            添加快递
          </button>
          <button class="btn-outline" @click="goAdd">短信智能解析</button>
          <button class="btn-ghost" @click="goReminder">设置提醒</button>
        </div>
      </div>
      <div class="banner-right">
        <div class="stat-card">
          <span class="stat-num">{{ stats.pending }}</span>
          <span class="stat-label">待取件</span>
        </div>
        <div class="stat-card alt">
          <span class="stat-num">{{ todayPicked }}</span>
          <span class="stat-label">今日已取</span>
        </div>
        <div class="stat-card alt2">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">累计快递</span>
        </div>
      </div>
    </div>

    <div v-if="pendingList.length > 0" class="section fade-in-up" style="animation-delay:0.1s">
      <div class="section-header">
        <h2 class="section-title">待取快递</h2>
        <span class="section-count">{{ pendingList.length }} 件</span>
      </div>
      <div class="card-list">
        <ExpressCard v-for="item in pendingList" :key="item.id" :item="item" @click="goDetail(item.id)" @pick="quickPick(item)" />
      </div>
    </div>

    <div v-if="pendingList.length === 0 && pickedList.length === 0" class="empty-state fade-in">
      <svg viewBox="0 0 120 120" fill="none" width="100" height="100" class="empty-icon">
        <rect x="20" y="40" width="80" height="60" rx="8" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M20 40L60 20L100 40" stroke="var(--jade-soft)" stroke-width="2" stroke-linejoin="round"/>
        <rect x="48" y="60" width="24" height="20" rx="3" fill="var(--jade-light)" stroke="var(--jade-soft)" stroke-width="1.5"/>
        <path d="M40 40V30M80 40V30" stroke="var(--jade-soft)" stroke-width="2" stroke-linecap="round"/>
        <path d="M52 70L58 76L68 66" stroke="var(--jade)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 class="empty-title">还没有快递记录</h3>
      <p class="empty-desc">添加你的第一件快递，开始轻松管理取件</p>
      <button class="btn-primary" @click="goAdd">添加第一件快递</button>
    </div>

    <div v-if="pickedList.length > 0" class="section">
      <div class="section-header toggle" @click="showPicked = !showPicked">
        <h2 class="section-title">已取快递</h2>
        <div class="toggle-right">
          <span class="section-count">{{ pickedList.length }} 件</span>
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16" class="toggle-arrow" :class="{ open: showPicked }">
            <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      <transition name="collapse">
        <div v-if="showPicked" class="card-list">
          <ExpressCard v-for="item in pickedList" :key="item.id" :item="item" @click="goDetail(item.id)" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExpressCard from '@/components/ExpressCard.vue'
import { getList, getStats, updateRecord } from '@/utils/storage'
import type { ExpressData } from '@shared/types/express'

const router = useRouter()
const pendingList = ref<ExpressData[]>([])
const pickedList = ref<ExpressData[]>([])
const stats = ref({ pending: 0, picked: 0, total: 0 })
const showPicked = ref(false)

const todayPicked = computed(() => {
  const today = new Date()
  return pickedList.value.filter(r => {
    if (!r.pickedAt) return false
    const d = new Date(r.pickedAt)
    return d.toDateString() === today.toDateString()
  }).length
})

function loadData() {
  const list = getList()
  pendingList.value = list.filter(r => r.status === 'pending')
  pickedList.value = list.filter(r => r.status === 'picked')
  stats.value = getStats()
}

function goAdd() { router.push('/add') }
function goReminder() { router.push('/reminder') }
function goDetail(id: string) { router.push(`/detail/${id}`) }
function quickPick(item: ExpressData) {
  updateRecord(item.id, { status: 'picked', pickedAt: Date.now() })
  loadData()
  window.dispatchEvent(new Event('storage-updated'))
}

onMounted(loadData)
</script>

<style scoped>
.home { max-width: 860px; margin: 0 auto; }

.welcome-banner {
  background: linear-gradient(135deg, var(--pine) 0%, var(--jade-deep) 60%, var(--jade) 100%);
  border-radius: var(--radius-xl);
  padding: 36px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  color: #FFFDF0;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(18, 63, 55, 0.15);
}
.welcome-banner::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -10%;
  width: 50%;
  height: 160%;
  background: radial-gradient(ellipse, rgba(42, 157, 126, 0.2), transparent 70%);
  pointer-events: none;
}

.banner-left { flex: 1; position: relative; z-index: 1; }
.banner-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 3px; opacity: 0.6; }
.banner-title { font-size: 26px; font-weight: 700; margin: 12px 0 10px; letter-spacing: 1px; }
.banner-desc { font-size: 14px; opacity: 0.75; margin-bottom: 24px; line-height: 1.7; }
.banner-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.banner-actions .btn-primary {
  background: rgba(255, 253, 240, 0.95);
  color: var(--pine);
  border-radius: var(--radius-md);
  padding: 11px 22px;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}
.banner-actions .btn-primary:hover { background: #FFFDF0; transform: translateY(-1px); }
.banner-actions .btn-outline {
  background: rgba(255, 253, 240, 0.12);
  color: #FFFDF0;
  border: 1px solid rgba(255, 253, 240, 0.25);
  border-radius: var(--radius-md);
  padding: 11px 22px;
  font-weight: 500;
  backdrop-filter: blur(8px);
}
.banner-actions .btn-outline:hover { background: rgba(255, 253, 240, 0.2); }
.banner-actions .btn-ghost {
  background: transparent;
  color: rgba(255, 253, 240, 0.8);
  border-radius: var(--radius-md);
  padding: 11px 18px;
  font-weight: 500;
}
.banner-actions .btn-ghost:hover { background: rgba(255, 253, 240, 0.08); }

.banner-right { display: flex; gap: 12px; position: relative; z-index: 1; }
.stat-card {
  background: rgba(255, 253, 240, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 253, 240, 0.12);
  border-radius: var(--radius-md);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}
.stat-card.alt { background: rgba(42, 157, 126, 0.15); }
.stat-card.alt2 { background: rgba(255, 253, 240, 0.06); }
.stat-num { font-size: 28px; font-weight: 800; font-family: var(--font-mono); line-height: 1; }
.stat-label { font-size: 12px; opacity: 0.7; letter-spacing: 1px; }

.section { margin-bottom: 32px; }
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}
.section-header.toggle { cursor: pointer; user-select: none; }
.section-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.section-count { font-size: 13px; color: var(--ink-hint); font-family: var(--font-mono); }
.toggle-right { display: flex; align-items: center; gap: 8px; }
.toggle-arrow { color: var(--ink-hint); transition: transform 0.3s ease; }
.toggle-arrow.open { transform: rotate(180deg); }

.card-list { display: flex; flex-direction: column; gap: 12px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 8px;
}
.empty-icon { margin-bottom: 8px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.empty-desc { font-size: 14px; color: var(--ink-hint); margin-bottom: 20px; }

.collapse-enter-active, .collapse-leave-active { transition: all 0.3s ease; overflow: hidden; }
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 2000px; }

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; padding: 24px 20px; gap: 20px; }
  .banner-title { font-size: 22px; }
  .banner-right { width: 100%; justify-content: space-between; }
  .stat-card { flex: 1; min-width: 0; padding: 14px 12px; }
  .stat-num { font-size: 24px; }
}
</style>