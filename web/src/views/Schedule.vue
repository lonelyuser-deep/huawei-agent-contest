<template>
  <div class="schedule-page">
    <div class="page-header fade-in-up">
      <div class="header-left">
        <h1 class="page-title">课程表</h1>
        <p class="page-desc">{{ semester || '未设置学期' }} · 共 {{ stats.total }} 门课程</p>
      </div>
      <div class="header-actions">
        <button class="btn-outline" @click="$router.push('/schedule/upload')">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:4px"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          导入课表
        </button>
      </div>
    </div>

    <div v-if="allCourses.length === 0" class="empty-state fade-in">
      <svg viewBox="0 0 120 120" fill="none" width="100" height="100" class="empty-icon">
        <rect x="15" y="25" width="90" height="70" rx="8" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M15 45H105" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M40 25V95M70 25V95" stroke="var(--jade-soft)" stroke-width="2" stroke-dasharray="3 3"/>
        <rect x="45" y="55" width="20" height="14" rx="3" fill="var(--jade-light)" stroke="var(--jade-soft)" stroke-width="1.5"/>
      </svg>
      <h3 class="empty-title">还没有导入课表</h3>
      <p class="empty-desc">上传课表截图，智能识别后即可查看和管理</p>
      <button class="btn-primary" @click="$router.push('/schedule/upload')">导入我的课表</button>
    </div>

    <template v-if="allCourses.length > 0">
      <div class="today-section fade-in-up" style="animation-delay:0.05s">
        <div class="section-header">
          <h2 class="section-title">今日课程</h2>
          <span class="today-date">{{ todayLabel }}</span>
        </div>
        <div v-if="todayCourses.length > 0" class="today-list">
          <div v-for="course in todayCourses" :key="course.id"
            class="today-item" :class="getCourseStatus(course)"
            :style="{ '--course-color': course.color || '#1D7561' }">
            <div class="today-time">
              <span class="time-start">{{ getSectionTime(course.startSection).start }}</span>
              <span class="time-end">{{ getSectionTime(course.endSection).end }}</span>
            </div>
            <div class="today-info">
              <div class="today-name">{{ course.name }}</div>
              <div class="today-meta">
                <span v-if="course.location">{{ course.location }}</span>
                <span v-if="course.teacher">{{ course.teacher }}</span>
                <span class="sections">{{ course.startSection }}-{{ course.endSection }}节</span>
              </div>
            </div>
            <span class="status-tag">{{ getStatusText(course) }}</span>
          </div>
        </div>
        <div v-else class="today-empty">
          <span>今天没有课程，享受自由时光吧</span>
        </div>
      </div>

      <div class="reminder-section fade-in-up" style="animation-delay:0.1s">
        <div class="reminder-card">
          <div class="reminder-left">
            <div class="reminder-icon">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 3C8.5 3 6 5.5 6 9V14L4 17H20L18 14V9C18 5.5 15.5 3 12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 20C10 21 11 22 12 22C13 22 14 21 14 20" stroke="currentColor" stroke-width="1.5"/></svg>
            </div>
            <div class="reminder-info">
              <div class="reminder-title">上课提醒</div>
              <div class="reminder-desc">
                <span v-if="reminderConfig.enabled" class="enabled-text">
                  已开启 · 课前 {{ reminderConfig.advanceMinutes }} 分钟提醒
                </span>
                <span v-else class="disabled-text">未开启</span>
                <span class="perm-tag" :class="permStatus">{{ permText }}</span>
              </div>
            </div>
          </div>
          <div class="reminder-controls">
            <select class="advance-select" v-model.number="reminderConfig.advanceMinutes" @change="updateConfig">
              <option :value="5">提前5分钟</option>
              <option :value="10">提前10分钟</option>
              <option :value="15">提前15分钟</option>
              <option :value="30">提前30分钟</option>
              <option :value="60">提前1小时</option>
            </select>
            <button v-if="!reminderConfig.enabled" class="btn-primary" @click="enableReminder">开启提醒</button>
            <button v-else class="btn-outline" @click="disableReminder">关闭提醒</button>
          </div>
        </div>
      </div>

      <div class="week-section fade-in-up" style="animation-delay:0.15s">
        <div class="section-header">
          <h2 class="section-title">本周课表</h2>
          <div class="weekday-tabs">
            <button v-for="d in 7" :key="d"
              class="weekday-tab" :class="{ active: selectedDay === d, today: d === todayWeekday }"
              @click="selectDay(d)">
              {{ weekdayName(d) }}
            </button>
          </div>
        </div>
        <div class="day-courses">
          <div v-if="dayCourses.length > 0" class="day-list">
            <ScheduleCard v-for="course in dayCourses" :key="course.id"
              :item="course" editable
              @edit="openEditDialog" @delete="confirmDelete" />
          </div>
          <div v-else class="day-empty">
            <span>{{ weekdayName(selectedDay) }} 没有课程</span>
          </div>
        </div>
      </div>

      <div class="danger-section fade-in-up" style="animation-delay:0.2s">
        <button class="btn-danger" @click="clearAll">清空课表</button>
      </div>
    </template>

    <div v-if="editDialogVisible" class="edit-dialog-overlay" @click.self="editDialogVisible = false">
      <div class="edit-dialog">
        <h3 class="dialog-title">编辑课程</h3>
        <div class="dialog-body" v-if="editingCourse">
          <label class="dialog-field">
            <span class="label">课程名称</span>
            <input v-model="editingCourse.name" placeholder="请输入课程名称" />
          </label>
          <div class="dialog-row">
            <label class="dialog-field">
              <span class="label">星期</span>
              <select v-model.number="editingCourse.weekday">
                <option v-for="d in 7" :key="d" :value="d">{{ weekdayName(d) }}</option>
              </select>
            </label>
            <label class="dialog-field">
              <span class="label">开始节次</span>
              <select v-model.number="editingCourse.startSection">
                <option v-for="s in 12" :key="s" :value="s">第{{ s }}节</option>
              </select>
            </label>
            <label class="dialog-field">
              <span class="label">结束节次</span>
              <select v-model.number="editingCourse.endSection">
                <option v-for="s in 12" :key="s" :value="s">第{{ s }}节</option>
              </select>
            </label>
          </div>
          <div class="dialog-row">
            <label class="dialog-field">
              <span class="label">教室</span>
              <input v-model="editingCourse.location" placeholder="如：教A301" />
            </label>
            <label class="dialog-field">
              <span class="label">教师</span>
              <input v-model="editingCourse.teacher" placeholder="如：张老师" />
            </label>
          </div>
          <label class="dialog-field">
            <span class="label">上课周次</span>
            <input v-model="editingCourse.weeks" placeholder="如：1-16周" />
          </label>
        </div>
        <div class="dialog-actions">
          <button class="btn-ghost" @click="editDialogVisible = false">取消</button>
          <button class="btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ScheduleCard from '@/components/ScheduleCard.vue'
import type { Course, Weekday } from '@shared/types/schedule'
import { WEEKDAY_NAMES, getTodayWeekday, getSectionTime } from '@shared/types/schedule'
import { getCourses, getCoursesByWeekday, deleteCourse, updateCourse, clearSchedule, getScheduleStats, getSemester } from '@/utils/scheduleStorage'
import {
  getReminderConfig, saveReminderConfig, requestNotificationPermission, getPermissionStatus,
  startScheduleReminder, stopScheduleReminder, showNotification,
  type ScheduleReminderConfig
} from '@/utils/scheduleReminder'

const allCourses = ref<Course[]>([])
const selectedDay = ref<Weekday>(1)
const todayWeekday = ref<Weekday>(1)
const stats = ref({ total: 0, weekdays: 0, today: 0 })
const semester = ref('')
const permStatus = ref('default')
const reminderConfig = ref<ScheduleReminderConfig>({ enabled: false, advanceMinutes: 15, checkIntervalMinutes: 5 })
const editDialogVisible = ref(false)
const editingCourse = ref<Course | null>(null)

const todayCourses = computed(() => getCoursesByWeekday(todayWeekday.value))
const dayCourses = computed(() => getCoursesByWeekday(selectedDay.value))

const todayLabel = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAY_NAMES[todayWeekday.value]}`
})

const permText = computed(() => {
  const map: Record<string, string> = { granted: '通知已开启', denied: '通知被拒绝', default: '通知未开启', unsupported: '不支持通知' }
  return map[permStatus.value] || ''
})

function weekdayName(d: number): string {
  return WEEKDAY_NAMES[d as Weekday]
}

function selectDay(d: number): void {
  selectedDay.value = d as Weekday
}

function loadData() {
  allCourses.value = getCourses()
  todayWeekday.value = getTodayWeekday()
  selectedDay.value = todayWeekday.value
  stats.value = getScheduleStats()
  semester.value = getSemester()
  permStatus.value = getPermissionStatus()
  reminderConfig.value = getReminderConfig()
}

function getCourseStatus(course: Course): string {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const startTime = getSectionTime(course.startSection)
  const endTime = getSectionTime(course.endSection)
  const [sh, sm] = startTime.start.split(':').map(Number)
  const [eh, em] = endTime.end.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (nowMinutes < start) return 'upcoming'
  if (nowMinutes >= start && nowMinutes <= end) return 'ongoing'
  return 'finished'
}

function getStatusText(course: Course): string {
  const status = getCourseStatus(course)
  if (status === 'ongoing') return '上课中'
  if (status === 'upcoming') return '待上课'
  return '已结束'
}

async function enableReminder() {
  if (permStatus.value !== 'granted') {
    const granted = await requestNotificationPermission()
    permStatus.value = granted ? 'granted' : 'denied'
    if (!granted) return
  }
  reminderConfig.value.enabled = true
  saveReminderConfig(reminderConfig.value)
  startScheduleReminder(reminderConfig.value)
  showNotification('上课提醒已开启', `将在每节课前 ${reminderConfig.value.advanceMinutes} 分钟提醒你`)
}

function disableReminder() {
  reminderConfig.value.enabled = false
  saveReminderConfig(reminderConfig.value)
  stopScheduleReminder()
}

function updateConfig() {
  saveReminderConfig(reminderConfig.value)
  if (reminderConfig.value.enabled) {
    startScheduleReminder(reminderConfig.value)
  }
}

function openEditDialog(course: Course) {
  editingCourse.value = { ...course }
  editDialogVisible.value = true
}

function saveEdit() {
  if (editingCourse.value) {
    updateCourse(editingCourse.value.id, editingCourse.value)
    editDialogVisible.value = false
    loadData()
  }
}

function confirmDelete(course: Course) {
  if (confirm(`确定删除「${course.name}」吗？`)) {
    deleteCourse(course.id)
    loadData()
  }
}

function clearAll() {
  if (confirm('确定清空所有课表数据吗？此操作不可恢复。')) {
    clearSchedule()
    stopScheduleReminder()
    loadData()
  }
}

function onStorageUpdate() { loadData() }

onMounted(() => {
  loadData()
  window.addEventListener('storage-updated', onStorageUpdate)
  if (reminderConfig.value.enabled && permStatus.value === 'granted') {
    startScheduleReminder(reminderConfig.value)
  }
})
onUnmounted(() => {
  window.removeEventListener('storage-updated', onStorageUpdate)
})
</script>

<style scoped>
.schedule-page { max-width: 860px; margin: 0 auto; }

.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px;
}
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 60px 0; gap: 8px;
}
.empty-icon { margin-bottom: 8px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.empty-desc { font-size: 14px; color: var(--ink-hint); margin-bottom: 20px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.section-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.today-date { font-size: 13px; color: var(--ink-hint); font-family: var(--font-mono); }

.today-section { margin-bottom: 28px; }
.today-list { display: flex; flex-direction: column; gap: 10px; }
.today-item {
  display: flex; align-items: center; gap: 16px;
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-left: 4px solid var(--course-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.today-item.ongoing { background: var(--jade-light); border-left-color: var(--jade); }
.today-item.finished { opacity: 0.5; }
.today-time {
  display: flex; flex-direction: column; align-items: center;
  font-family: var(--font-mono); gap: 2px;
  min-width: 50px;
}
.time-start { font-size: 16px; font-weight: 700; color: var(--ink); }
.time-end { font-size: 12px; color: var(--ink-hint); }
.today-info { flex: 1; }
.today-name { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
.today-meta {
  display: flex; gap: 12px; font-size: 13px; color: var(--ink-hint);
}
.today-meta .sections { color: var(--course-color); font-weight: 500; }
.status-tag {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 10px;
  background: var(--cream-warm); color: var(--ink-hint);
}
.today-item.ongoing .status-tag { background: var(--jade); color: #FFFDF0; }
.today-item.upcoming .status-tag { background: var(--jade-light); color: var(--jade-deep); }
.today-empty {
  text-align: center; padding: 24px;
  color: var(--ink-hint); font-size: 14px;
  background: var(--cream-warm);
  border-radius: var(--radius-md);
}

.reminder-section { margin-bottom: 28px; }
.reminder-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; box-shadow: var(--shadow-sm);
}
.reminder-left { display: flex; align-items: center; gap: 14px; }
.reminder-icon {
  width: 42px; height: 42px;
  background: var(--jade-light); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--jade-deep); flex-shrink: 0;
}
.reminder-title { font-size: 15px; font-weight: 600; color: var(--ink); }
.reminder-desc { font-size: 13px; color: var(--ink-hint); display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.enabled-text { color: var(--jade-deep); }
.perm-tag {
  font-size: 11px; padding: 2px 8px; border-radius: 8px;
  background: var(--cream-warm);
}
.perm-tag.granted { background: var(--jade-light); color: var(--jade-deep); }
.perm-tag.denied { background: var(--danger-soft); color: var(--danger); }
.reminder-controls { display: flex; align-items: center; gap: 10px; }
.advance-select {
  padding: 8px 12px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); font-size: 13px;
  background: var(--white); color: var(--ink);
}

.week-section { margin-bottom: 28px; }
.weekday-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
.weekday-tab {
  padding: 6px 14px; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500;
  background: var(--white); color: var(--ink-soft);
  border: 1px solid var(--border);
  transition: all 0.15s ease;
}
.weekday-tab:hover { border-color: var(--jade-soft); }
.weekday-tab.active { background: var(--jade); color: #FFFDF0; border-color: var(--jade); }
.weekday-tab.today { position: relative; }
.weekday-tab.today::after {
  content: ''; position: absolute; top: -2px; right: -2px;
  width: 6px; height: 6px; background: var(--jade); border-radius: 50%;
  border: 1.5px solid var(--white);
}
.weekday-tab.today.active::after { background: #FFFDF0; }
.day-list { display: flex; flex-direction: column; gap: 10px; }
.day-empty {
  text-align: center; padding: 24px;
  color: var(--ink-hint); font-size: 14px;
  background: var(--cream-warm); border-radius: var(--radius-md);
}

.danger-section { text-align: center; }

.edit-dialog-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(18, 63, 55, 0.4);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.edit-dialog {
  background: var(--white); border-radius: var(--radius-xl);
  padding: 28px; width: 100%; max-width: 480px;
  box-shadow: var(--shadow-lg);
  animation: fadeInUp 0.3s ease both;
}
.dialog-title { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 20px; }
.dialog-body { display: flex; flex-direction: column; gap: 14px; }
.dialog-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.dialog-field .label { font-size: 12px; color: var(--ink-hint); font-weight: 500; }
.dialog-field input, .dialog-field select {
  padding: 10px 12px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); font-size: 14px; color: var(--ink);
  background: var(--white);
}
.dialog-field input:focus, .dialog-field select:focus { border-color: var(--jade); outline: none; }
.dialog-row { display: flex; gap: 12px; }
.dialog-actions {
  display: flex; gap: 12px; justify-content: flex-end;
  margin-top: 24px; padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .reminder-card { flex-direction: column; align-items: stretch; }
  .reminder-controls { justify-content: space-between; }
  .weekday-tabs { width: 100%; justify-content: space-between; }
  .weekday-tab { flex: 1; text-align: center; padding: 6px 4px; }
  .today-item { flex-wrap: wrap; }
  .dialog-row { flex-direction: column; }
}
</style>