<template>
  <div class="roommates-page">
    <h1 class="page-title">👥 室友管理</h1>

    <div class="card">
      <div class="add-row">
        <input v-model="newName" type="text" placeholder="输入室友名字" @keyup.enter="addRoommate" />
        <button class="btn btn-primary" @click="addRoommate" :disabled="!newName.trim()">添加</button>
      </div>

      <div class="roommate-list">
        <div v-for="r in roommates" :key="r.id" class="roommate-item">
          <span class="avatar">{{ r.name.charAt(0) }}</span>
          <span class="name">{{ r.name }}</span>
          <span class="joined">加入于 {{ formatDate(new Date(r.joinedAt).toISOString().slice(0, 10)) }}</span>
          <button class="btn-icon" @click="removeRoommate(r.id)" title="删除">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Roommate } from '@/types/roommate'
import { loadRoommates, saveRoommates, generateId, formatDate } from '@/utils/storage'

const roommates = ref<Roommate[]>([])
const newName = ref('')

onMounted(() => { roommates.value = loadRoommates() })

function addRoommate() {
  if (!newName.value.trim()) return
  roommates.value.push({ id: generateId(), name: newName.value.trim(), joinedAt: Date.now() })
  saveRoommates(roommates.value)
  newName.value = ''
}

function removeRoommate(id: string) {
  if (!confirm('确定删除此室友？相关账单分摊将受影响。')) return
  roommates.value = roommates.value.filter(r => r.id !== id)
  saveRoommates(roommates.value)
}
</script>

<style scoped>
.add-row { display: flex; gap: 8px; margin-bottom: 16px; }
.add-row input { flex: 1; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
.add-row input:focus { border-color: var(--primary); }
.roommate-list { display: flex; flex-direction: column; gap: 8px; }
.roommate-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.roommate-item:last-child { border-bottom: none; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.name { font-weight: 500; }
.joined { flex: 1; font-size: 12px; color: var(--text-light); }
.btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; }
</style>