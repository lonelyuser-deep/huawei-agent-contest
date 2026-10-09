<template>
  <div class="card" :class="{ picked: isPicked }" @click="$emit('click')">
    <div class="card-header">
      <span class="card-station">{{ item.station || '未知驿站' }}</span>
      <span v-if="item.courier" class="card-courier">{{ item.courier }}</span>
    </div>
    <div class="card-body">
      <span class="card-code">取件码：{{ item.code }}</span>
      <span v-if="item.phone" class="card-phone">尾号 {{ item.phone }}</span>
    </div>
    <button v-if="!isPicked" class="pick-btn" @click.stop="$emit('pick')">✅ 已取</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExpressData } from '@shared/types/express'

const props = defineProps<{ item: ExpressData }>()
defineEmits<{ click: []; pick: [] }>()

const isPicked = computed(() => props.item.status === 'picked')
</script>

<style scoped>
.card {
  background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative;
  border-left: 4px solid var(--primary); cursor: pointer;
}
.card.picked { border-left-color: var(--picked); opacity: 0.65; }
.card-header { display: flex; align-items: center; margin-bottom: 6px; }
.card-station { font-size: 16px; font-weight: 600; }
.card-courier {
  font-size: 11px; color: #fff; background: var(--primary);
  border-radius: 10px; padding: 2px 6px; margin-left: 8px;
}
.card-body { display: flex; align-items: center; gap: 12px; }
.card-code { font-size: 14px; color: var(--text-secondary); }
.card-phone { font-size: 12px; color: var(--text-hint); }
.pick-btn {
  position: absolute; right: 14px; bottom: 14px;
  font-size: 13px; color: var(--picked); background: #fff;
  border: 1px solid var(--picked); border-radius: 15px; padding: 4px 10px;
}
</style>