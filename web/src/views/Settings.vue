<template>
  <div class="settings-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">设置</h1>
      <p class="page-desc">数据管理与应用信息</p>
    </div>

    <div class="stats-overview fade-in-up" style="animation-delay:0.05s">
      <div class="overview-card">
        <span class="ov-num">{{ stats.total }}</span>
        <span class="ov-label">总快递数</span>
      </div>
      <div class="overview-card pending">
        <span class="ov-num">{{ stats.pending }}</span>
        <span class="ov-label">待取件</span>
      </div>
      <div class="overview-card picked">
        <span class="ov-num">{{ stats.picked }}</span>
        <span class="ov-label">已取件</span>
      </div>
    </div>

    <div class="section-card fade-in-up" style="animation-delay:0.1s" v-if="courierStats.length > 0">
      <div class="section-card-title">快递公司分布</div>
      <div class="courier-bars">
        <div class="courier-bar" v-for="c in courierStats" :key="c.name">
          <span class="cb-name">{{ c.name }}</span>
          <div class="cb-track">
            <div class="cb-fill" :style="{ width: (c.count / stats.total * 100) + '%' }"></div>
          </div>
          <span class="cb-count">{{ c.count }}</span>
        </div>
      </div>
    </div>

    <div class="section-card fade-in-up" style="animation-delay:0.15s">
      <div class="section-card-title">关于</div>
      <div class="info-row"><span class="i-label">应用名称</span><span class="i-value">智云校遇</span></div>
      <div class="info-row"><span class="i-label">版本</span><span class="i-value">v2.0 自然校园版</span></div>
      <div class="info-row"><span class="i-label">技术栈</span><span class="i-value">Vue3 + Vite5 + TS</span></div>
      <div class="info-row"><span class="i-label">适配平台</span><span class="i-value">HarmonyOS / Web</span></div>
      <div class="info-row"><span class="i-label">数据存储</span><span class="i-value">本地 localStorage</span></div>
    </div>

    <div class="section-card danger-zone fade-in-up" style="animation-delay:0.2s">
      <div class="section-card-title">危险操作</div>
      <p class="danger-desc">清空所有快递记录，此操作不可恢复，请谨慎操作</p>
      <button class="btn-danger btn-block" @click="clearAll">清空所有记录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getStats, getList } from '@/utils/storage'

const stats = ref({ pending: 0, picked: 0, total: 0 })

const courierStats = computed(() => {
  const list = getList()
  const map: Record<string, number> = {}
  for (const r of list) {
    const name = r.courier || '未分类'
    map[name] = (map[name] || 0) + 1
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

function clearAll() {
  if (confirm('确认清空所有快递记录？此操作不可恢复')) {
    localStorage.removeItem('express_list')
    stats.value = { pending: 0, picked: 0, total: 0 }
    window.dispatchEvent(new Event('storage-updated'))
  }
}

onMounted(() => { stats.value = getStats() })
</script>

<style scoped>
.settings-page { max-width: 720px; margin: 0 auto; }
.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }
.stats-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
.overview-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 6px; box-shadow: var(--shadow-sm); }
.overview-card.pending { background: var(--jade-light); border-color: var(--jade-soft); }
.overview-card.picked { background: var(--cream-warm); }
.ov-num { font-size: 32px; font-weight: 800; color: var(--ink); font-family: var(--font-mono); line-height: 1; }
.overview-card.pending .ov-num { color: var(--jade-deep); }
.overview-card.picked .ov-num { color: var(--ink-soft); }
.ov-label { font-size: 13px; color: var(--ink-hint); letter-spacing: 1px; }
.section-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 16px; }
.section-card-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 16px; }
.courier-bars { display: flex; flex-direction: column; gap: 12px; }
.courier-bar { display: flex; align-items: center; gap: 12px; }
.cb-name { width: 70px; font-size: 13px; color: var(--ink-soft); font-weight: 500; flex-shrink: 0; }
.cb-track { flex: 1; height: 8px; background: var(--border-soft); border-radius: 4px; overflow: hidden; }
.cb-fill { height: 100%; background: linear-gradient(90deg, var(--jade), var(--jade-deep)); border-radius: 4px; transition: width 0.5s ease; }
.cb-count { font-size: 13px; color: var(--ink-hint); font-family: var(--font-mono); width: 24px; text-align: right; }
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-soft); }
.info-row:last-child { border-bottom: none; }
.i-label { font-size: 14px; color: var(--ink-hint); }
.i-value { font-size: 14px; color: var(--ink); font-weight: 500; }
.danger-zone { border-color: var(--danger-soft); }
.danger-desc { font-size: 13px; color: var(--ink-hint); margin-bottom: 16px; line-height: 1.6; }
@media (max-width: 768px) {
  .stats-overview { grid-template-columns: 1fr; }
  .cb-name { width: 60px; }
}
</style>