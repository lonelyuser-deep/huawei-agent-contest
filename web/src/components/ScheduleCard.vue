<template>
  <div class="course-card" :style="{ '--course-color': item.color || '#1D7561' }">
    <div class="course-bar"></div>
    <div class="course-body">
      <div class="course-header">
        <span class="course-name">{{ item.name }}</span>
        <span class="course-section">{{ item.startSection }}-{{ item.endSection }}节</span>
      </div>
      <div class="course-time">{{ timeRange }}</div>
      <div class="course-meta">
        <span class="meta-item" v-if="item.location">
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M8 2C5.5 2 4 4 4 6C4 9 8 14 8 14C8 14 12 9 12 6C12 4 10.5 2 8 2Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
          {{ item.location }}
        </span>
        <span class="meta-item" v-if="item.teacher">
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><circle cx="8" cy="5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 14C3 11 5 9.5 8 9.5C11 9.5 13 11 13 14" stroke="currentColor" stroke-width="1.3"/></svg>
          {{ item.teacher }}
        </span>
        <span class="meta-item weeks">{{ item.weeks }}</span>
      </div>
      <div class="course-actions" v-if="editable">
        <button class="action-btn edit" @click="$emit('edit', item)">
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M11 3L13 5L5 13L2 13L2 10L11 3Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        </button>
        <button class="action-btn del" @click="$emit('delete', item)">
          <svg viewBox="0 0 16 16" fill="none" width="13" height="13"><path d="M3 4H13M6 4V2H10V4M5 4L5.5 13H10.5L11 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Course } from '@shared/types/schedule'
import { getSectionTime } from '@shared/types/schedule'

const props = withDefaults(defineProps<{
  item: Course
  editable?: boolean
}>(), {
  editable: false
})

defineEmits<{
  edit: [course: Course]
  delete: [course: Course]
}>()

const timeRange = computed(() => {
  const start = getSectionTime(props.item.startSection)
  const end = getSectionTime(props.item.endSection)
  return `${start.start} - ${end.end}`
})
</script>

<style scoped>
.course-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  display: flex;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
}
.course-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.course-bar {
  width: 4px;
  background: var(--course-color);
  flex-shrink: 0;
}
.course-body { flex: 1; padding: 14px 16px; }
.course-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.course-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}
.course-section {
  font-size: 12px;
  color: var(--course-color);
  font-weight: 600;
  font-family: var(--font-mono);
  background: var(--jade-light);
  padding: 2px 8px;
  border-radius: 8px;
}
.course-time {
  font-size: 13px;
  color: var(--ink-soft);
  font-family: var(--font-mono);
  margin-bottom: 8px;
}
.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ink-hint);
}
.meta-item.weeks {
  color: var(--course-color);
  opacity: 0.7;
}
.course-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.course-card:hover .course-actions { opacity: 1; }
.action-btn {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-warm);
  color: var(--ink-soft);
  transition: all 0.15s ease;
}
.action-btn.edit:hover { background: var(--jade-light); color: var(--jade-deep); }
.action-btn.del:hover { background: var(--danger-soft); color: var(--danger); }
</style>