<template>
  <div class="home">
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-num pending">{{ stats.pending }}</span>
        <span class="stat-label">待取件</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-num picked">{{ stats.picked }}</span>
        <span class="stat-label">已取件</span>
      </div>
    </div>

    <div v-if="pendingList.length > 0" class="section">
      <h2 class="section-title">📦 待取件</h2>
      <ExpressCard
        v-for="item in pendingList"
        :key="item.id"
        :item="item"
        @click="goDetail(item.id)"
        @pick="quickPick(item)"
      />
    </div>

    <div v-if="pendingList.length === 0 && pickedList.length === 0" class="empty">
      <span class="empty-icon">📦</span>
      <span class="empty-text">还没有快递记录</span>
      <span class="empty-hint">点击右下角 + 添加快递</span>
    </div>

    <div v-if="pickedList.length > 0" class="section">
      <h2 class="section-title toggle" @click="showPicked = !showPicked">
        ✅ 已取件 ({{ pickedList.length }}) {{ showPicked ? '▲' : '▼' }}
      </h2>
      <template v-if="showPicked">
        <ExpressCard
          v-for="item in pickedList"
          :key="item.id"
          :item="item"
          @click="goDetail(item.id)"
        />
      </template>
    </div>

    <button class="fab" @click="goAdd">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExpressCard from '@/components/ExpressCard.vue'
import { getList, getStats, updateRecord } from '@/utils/storage'
import type { ExpressData } from '@shared/types/express'

const router = useRouter()
const pendingList = ref<ExpressData[]>([])
const pickedList = ref<ExpressData[]>([])
const stats = ref({ pending: 0, picked: 0, total: 0 })
const showPicked = ref(false)

function loadData() {
  const list = getList()
  pendingList.value = list.filter(r => r.status === 'pending')
  pickedList.value = list.filter(r => r.status === 'picked')
  stats.value = getStats()
}

function goAdd() { router.push('/add') }
function goDetail(id: string) { router.push(`/detail/${id}`) }

function quickPick(item: ExpressData) {
  updateRecord(item.id, { status: 'picked', pickedAt: Date.now() })
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.stats-bar {
  display: flex; align-items: center; justify-content: center;
  background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-item { display: flex; flex-direction: column; align-items: center; flex: 1; }
.stat-num { font-size: 28px; font-weight: 700; }
.stat-num.pending { color: var(--primary); }
.stat-num.picked { color: var(--picked); }
.stat-label { font-size: 12px; color: var(--text-hint); margin-top: 4px; }
.stat-divider { width: 1px; height: 30px; background: #eee; }
.section { margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; padding-left: 4px; }
.section-title.toggle { cursor: pointer; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 60px 0; }
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-text { font-size: 16px; color: var(--text-hint); }
.empty-hint { font-size: 13px; color: #ccc; margin-top: 4px; }
.fab {
  position: fixed; right: 50%; transform: translateX(210px); bottom: 30px;
  width: 50px; height: 50px; border-radius: 50%; background: var(--primary);
  color: #fff; font-size: 28px; font-weight: 300; padding: 0;
  box-shadow: 0 4px 16px rgba(74,144,217,0.4); z-index: 100;
}
</style>