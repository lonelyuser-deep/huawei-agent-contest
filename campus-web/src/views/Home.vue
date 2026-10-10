<template>
  <div class="home">
    <div class="welcome-banner fade-in-up">
      <div class="banner-left">
        <span class="banner-tag">CAMPUS LIFE</span>
        <h1 class="banner-title">今天有什么安排？</h1>
        <p class="banner-desc">管理你的校园生活，课程提醒、时间规划，一切井然有序</p>
        <div class="banner-actions">
          <button class="btn-primary" @click="$router.push('/schedule')">查看课表</button>
          <button class="btn-outline" @click="$router.push('/schedule/upload')">导入课表</button>
        </div>
      </div>
      <div class="banner-right">
        <div class="stat-card">
          <span class="stat-num">{{ stats.today }}</span>
          <span class="stat-label">今日课程</span>
        </div>
        <div class="stat-card alt">
          <span class="stat-num">{{ stats.total }}</span>
          <span class="stat-label">本周课程</span>
        </div>
        <div class="stat-card alt2">
          <span class="stat-num">{{ stats.weekdays }}</span>
          <span class="stat-label">上课天数</span>
        </div>
      </div>
    </div>

    <div v-if="todayCourses.length > 0" class="section fade-in-up" style="animation-delay:0.1s">
      <div class="section-header">
        <h2 class="section-title">今日课程</h2>
        <span class="section-count">{{ todayCourses.length }} 节</span>
      </div>
      <div class="today-list">
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
    </div>

    <div v-if="nextCourse && todayCourses.length > 0" class="next-card fade-in-up" style="animation-delay:0.15s">
      <div class="next-icon">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7V12L15 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div class="next-info">
        <span class="next-label">下一节课</span>
        <span class="next-name">{{ nextCourse.name }}</span>
        <span class="next-detail">{{ getSectionTime(nextCourse.startSection).start }} · {{ nextCourse.location || '未设置教室' }}</span>
      </div>
    </div>

    <div class="features-section fade-in-up" style="animation-delay:0.2s">
      <h2 class="section-title">校园服务</h2>
      <div class="feature-grid">
        <div class="feature-card" @click="$router.push('/schedule')">
          <div class="feature-icon schedule">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9H21" stroke="currentColor" stroke-width="1.5"/><path d="M8 5V3M16 5V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 13H10M14 13H16M8 17H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="feature-title">课程表</h3>
          <p class="feature-desc">查看本周课表，设置上课提醒</p>
        </div>
        <div class="feature-card" @click="$router.push('/schedule/upload')">
          <div class="feature-icon upload">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M12 15V8M9 11L12 8L15 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="feature-title">导入课表</h3>
          <p class="feature-desc">截图智能识别，一键导入课表</p>
        </div>
        <div class="feature-card" @click="$router.push('/settings')">
          <div class="feature-icon settings">
            <svg viewBox="0 0 24 24" fill="none" width="24" height="24"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M12 3V5M12 19V21M3 12H5M19 12H21M5.6 5.6L7 7M17 17L18.4 18.4M5.6 18.4L7 17M17 7L18.4 5.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="feature-title">设置</h3>
          <p class="feature-desc">课表管理、数据统计与更多</p>
        </div>
      </div>
    </div>

    <div v-if="stats.total === 0" class="empty-guide fade-in" style="animation-delay:0.25s">
      <svg viewBox="0 0 120 120" fill="none" width="80" height="80" class="empty-icon">
        <rect x="15" y="25" width="90" height="70" rx="8" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M15 45H105" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M40 25V95M70 25V95" stroke="var(--jade-soft)" stroke-width="2" stroke-dasharray="3 3"/>
        <rect x="45" y="55" width="20" height="14" rx="3" fill="var(--jade-light)" stroke="var(--jade-soft)" stroke-width="1.5"/>
      </svg>
      <h3 class="empty-title">还没有导入课表</h3>
      <p class="empty-desc">上传课表截图，开启上课提醒服务</p>
      <button class="btn-primary" @click="$router.push('/schedule/upload')">导入我的课表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Course } from '@shared/types/schedule'
import { getTodayWeekday, getSectionTime } from '@shared/types/schedule'
import { getCoursesByWeekday, getScheduleStats } from '@/utils/scheduleStorage'
import { getNextCourse } from '@/utils/scheduleReminder'

const todayCourses = ref<Course[]>([])
const nextCourse = ref<Course | null>(null)
const stats = ref({ total: 0, weekdays: 0, today: 0 })

function loadData() {
  const today = getTodayWeekday()
  todayCourses.value = getCoursesByWeekday(today)
  stats.value = getScheduleStats()
  nextCourse.value = getNextCourse()
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

onMounted(loadData)
</script>

<style scoped>
.home { max-width: 860px; margin: 0 auto; }

.welcome-banner {
  background: linear-gradient(135deg, var(--pine) 0%, var(--jade-deep) 60%, var(--jade) 100%);
  border-radius: var(--radius-xl);
  padding: 36px;
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
.section-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.section-count { font-size: 13px; color: var(--ink-hint); font-family: var(--font-mono); }

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
.today-meta { display: flex; gap: 12px; font-size: 13px; color: var(--ink-hint); }
.today-meta .sections { color: var(--course-color); font-weight: 500; }
.status-tag {
  font-size: 12px; font-weight: 600;
  padding: 4px 12px; border-radius: 10px;
  background: var(--cream-warm); color: var(--ink-hint);
}
.today-item.ongoing .status-tag { background: var(--jade); color: #FFFDF0; }
.today-item.upcoming .status-tag { background: var(--jade-light); color: var(--jade-deep); }

.next-card {
  display: flex; align-items: center; gap: 14px;
  background: linear-gradient(135deg, var(--jade-light), var(--jade-soft));
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 32px;
}
.next-icon {
  width: 40px; height: 40px;
  background: var(--white);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--jade-deep);
}
.next-info { display: flex; flex-direction: column; gap: 2px; }
.next-label { font-size: 11px; color: var(--ink-hint); letter-spacing: 1px; }
.next-name { font-size: 16px; font-weight: 600; color: var(--ink); }
.next-detail { font-size: 13px; color: var(--ink-soft); font-family: var(--font-mono); }

.features-section { margin-bottom: 32px; }
.features-section .section-title { margin-bottom: 16px; padding: 0 4px; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feature-card {
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: var(--shadow-sm);
}
.feature-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); border-color: var(--jade-soft); }
.feature-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 14px;
}
.feature-icon.schedule { background: var(--jade-light); color: var(--jade-deep); }
.feature-icon.upload { background: var(--cream-warm); color: var(--ink-soft); }
.feature-icon.settings { background: var(--jade-soft); color: var(--jade-deep); }
.feature-title { font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
.feature-desc { font-size: 13px; color: var(--ink-hint); line-height: 1.5; }

.empty-guide {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 0; gap: 8px;
  background: var(--white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-soft);
  margin-top: 16px;
}
.empty-icon { margin-bottom: 8px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.empty-desc { font-size: 14px; color: var(--ink-hint); margin-bottom: 20px; }

@media (max-width: 768px) {
  .welcome-banner { flex-direction: column; padding: 24px 20px; gap: 20px; }
  .banner-title { font-size: 22px; }
  .banner-right { width: 100%; justify-content: space-between; }
  .stat-card { flex: 1; min-width: 0; padding: 14px 12px; }
  .stat-num { font-size: 24px; }
  .feature-grid { grid-template-columns: 1fr; }
  .today-item { flex-wrap: wrap; }
}
</style>