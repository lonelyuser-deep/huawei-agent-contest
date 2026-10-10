<template>
  <div class="upload-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">导入课表</h1>
      <p class="page-desc">上传课表截图，智能识别课程信息，也可手动添加</p>
    </div>

    <div v-if="step === 'upload'" class="upload-zone fade-in-up" style="animation-delay:0.05s"
      :class="{ dragover: isDragover }"
      @dragover.prevent="isDragover = true"
      @dragleave.prevent="isDragover = false"
      @drop.prevent="handleDrop">
      <div class="upload-icon">
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <rect x="6" y="10" width="36" height="32" rx="4" stroke="var(--jade-soft)" stroke-width="2"/>
          <path d="M24 30V18M18 24L24 18L30 24" stroke="var(--jade)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 36H34" stroke="var(--jade-soft)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h3 class="upload-title">拖拽课表截图到此处</h3>
      <p class="upload-desc">支持 JPG / PNG / WebP 格式，建议截取完整课表区域</p>
      <button class="btn-primary" @click="fileInput?.click()">选择图片</button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleFileSelect" />

      <div class="upload-tips">
        <div class="tip-item">
          <span class="tip-num">1</span>
          <span class="tip-text">在微信小程序中截取本周课表</span>
        </div>
        <div class="tip-item">
          <span class="tip-num">2</span>
          <span class="tip-text">上传截图，系统自动识别课程信息</span>
        </div>
        <div class="tip-item">
          <span class="tip-num">3</span>
          <span class="tip-text">检查并修正识别结果，保存课表</span>
        </div>
      </div>
    </div>

    <div v-if="step === 'preview'" class="preview-section fade-in">
      <div class="preview-image-wrap">
        <img :src="imageDataURL" class="preview-image" alt="课表截图" />
        <div class="preview-overlay" v-if="recognizing">
          <div class="recognizing-spinner"></div>
          <p class="recognizing-status">{{ progressStatus }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (progress * 100) + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn-outline" @click="resetUpload">重新选择</button>
        <button class="btn-primary" @click="startRecognize" :disabled="recognizing">
          {{ recognizing ? '识别中...' : '开始识别' }}
        </button>
      </div>
    </div>

    <div v-if="step === 'result'" class="result-section fade-in">
      <div class="result-header">
        <div class="result-info">
          <h2 class="result-title">识别结果</h2>
          <p class="result-stats">
            识别到 {{ editCourses.length }} 门课程
            <span v-if="ocrConfidence > 0" class="confidence">· 置信度 {{ Math.round(ocrConfidence) }}%</span>
          </p>
        </div>
        <button class="btn-outline" @click="resetUpload">重新上传</button>
      </div>

      <div v-if="editCourses.length === 0" class="empty-result">
        <p>未能自动识别出课程信息，请手动添加</p>
      </div>

      <div class="course-edit-list">
        <div v-for="(course, idx) in editCourses" :key="idx" class="course-edit-item">
          <div class="edit-fields">
            <input class="field name" v-model="course.name" placeholder="课程名称" />
            <select class="field weekday" v-model.number="course.weekday">
              <option v-for="d in 7" :key="d" :value="d">{{ weekdayName(d) }}</option>
            </select>
            <div class="field sections">
              <select v-model.number="course.startSection">
                <option v-for="s in 12" :key="s" :value="s">第{{ s }}节</option>
              </select>
              <span class="sep">-</span>
              <select v-model.number="course.endSection">
                <option v-for="s in 12" :key="s" :value="s">第{{ s }}节</option>
              </select>
            </div>
            <input class="field location" v-model="course.location" placeholder="教室" />
            <input class="field teacher" v-model="course.teacher" placeholder="教师" />
          </div>
          <button class="remove-btn" @click="editCourses.splice(idx, 1)">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <button class="btn-outline add-course-btn" @click="addBlankCourse">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" style="display:inline;vertical-align:-2px;margin-right:4px"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        手动添加课程
      </button>

      <div class="save-actions">
        <button class="btn-ghost" @click="$router.push('/schedule')">取消</button>
        <button class="btn-primary" @click="saveSchedule" :disabled="editCourses.length === 0">
          保存课表（{{ editCourses.length }} 门课程）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Course, Weekday } from '@shared/types/schedule'
import { WEEKDAY_NAMES, createCourse } from '@shared/types/schedule'
import { saveCourses } from '@/utils/scheduleStorage'
import { recognizeScheduleImage, fileToDataURL, type OCRProgress } from '@/utils/ocr'

const router = useRouter()
const step = ref<'upload' | 'preview' | 'result'>('upload')
const isDragover = ref(false)
const imageDataURL = ref('')
const recognizing = ref(false)
const progress = ref(0)
const progressStatus = ref('')
const ocrConfidence = ref(0)
const editCourses = ref<Course[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    loadFile(target.files[0])
  }
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    loadFile(file)
  }
}

async function loadFile(file: File) {
  imageDataURL.value = await fileToDataURL(file)
  step.value = 'preview'
}

async function startRecognize() {
  recognizing.value = true
  progress.value = 0
  progressStatus.value = '正在加载识别引擎...'
  try {
    const result = await recognizeScheduleImage(imageDataURL.value, (p: OCRProgress) => {
      progress.value = p.progress
      const statusMap: Record<string, string> = {
        'loading tesseract core': '正在加载识别引擎...',
        'initializing tesseract': '正在初始化...',
        'loading language traineddata': '正在加载中文语言包...',
        'initializing api': '正在准备识别...',
        'recognizing text': '正在识别课表内容...'
      }
      progressStatus.value = statusMap[p.status] || p.status
    })
    ocrConfidence.value = result.confidence
    editCourses.value = result.courses.length > 0 ? result.courses : []
  } catch (err) {
    editCourses.value = []
  } finally {
    recognizing.value = false
    step.value = 'result'
  }
}

function addBlankCourse() {
  editCourses.value.push(createCourse('', 1, 1, 2, '', '', '1-16周'))
}

function saveSchedule() {
  const valid = editCourses.value.filter(c => c.name.trim().length > 0)
  saveCourses(valid)
  router.push('/schedule')
}

function resetUpload() {
  step.value = 'upload'
  imageDataURL.value = ''
  editCourses.value = []
  ocrConfidence.value = 0
}

function weekdayName(d: number): string {
  return WEEKDAY_NAMES[d as Weekday]
}
</script>

<style scoped>
.upload-page { max-width: 760px; margin: 0 auto; }

.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.hidden-input { display: none; }

.upload-zone {
  background: var(--white);
  border: 2px dashed var(--border);
  border-radius: var(--radius-xl);
  padding: 48px 32px;
  text-align: center;
  transition: all 0.25s ease;
}
.upload-zone.dragover { border-color: var(--jade); background: var(--jade-light); }
.upload-icon { margin-bottom: 16px; }
.upload-title { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
.upload-desc { font-size: 13px; color: var(--ink-hint); margin-bottom: 20px; }

.upload-tips {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}
.tip-item { display: flex; align-items: center; gap: 8px; }
.tip-num {
  width: 22px; height: 22px;
  background: var(--jade-light);
  color: var(--jade-deep);
  border-radius: 50%;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.tip-text { font-size: 13px; color: var(--ink-soft); }

.preview-section { margin-bottom: 24px; }
.preview-image-wrap {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  margin-bottom: 16px;
}
.preview-image { width: 100%; display: block; }
.preview-overlay {
  position: absolute; inset: 0;
  background: rgba(18, 63, 55, 0.7);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  backdrop-filter: blur(4px);
}
.recognizing-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,253,240,0.2);
  border-top-color: #FFFDF0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.recognizing-status { color: #FFFDF0; font-size: 14px; }
.progress-bar {
  width: 200px; height: 4px;
  background: rgba(255,253,240,0.2);
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #FFFDF0;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.preview-actions { display: flex; gap: 12px; justify-content: center; }

.result-section { }
.result-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.result-title { font-size: 20px; font-weight: 700; color: var(--ink); }
.result-stats { font-size: 13px; color: var(--ink-hint); margin-top: 4px; }
.confidence { color: var(--jade); }

.empty-result {
  text-align: center; padding: 32px;
  color: var(--ink-hint); font-size: 14px;
  background: var(--cream-warm);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.course-edit-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.course-edit-item {
  display: flex; align-items: center; gap: 8px;
  background: var(--white);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 12px;
}
.edit-fields { flex: 1; display: grid; grid-template-columns: 1.5fr 0.8fr 1.2fr 1fr 1fr; gap: 8px; }
.field {
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  color: var(--ink);
  background: var(--white);
}
.field:focus { border-color: var(--jade); outline: none; }
.field.sections { display: flex; align-items: center; gap: 4px; }
.field.sections select { flex: 1; padding: 6px 4px; border: none; font-size: 12px; background: transparent; }
.field.sections .sep { color: var(--ink-hint); }
.remove-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--cream-warm);
  color: var(--ink-hint);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.remove-btn:hover { background: var(--danger-soft); color: var(--danger); }

.add-course-btn { width: 100%; padding: 14px; }

.save-actions {
  display: flex; gap: 12px; justify-content: flex-end;
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid var(--border-soft);
}

@media (max-width: 768px) {
  .edit-fields { grid-template-columns: 1fr 1fr; }
  .upload-tips { flex-direction: column; align-items: flex-start; gap: 8px; }
  .save-actions { flex-direction: column-reverse; }
  .save-actions button { width: 100%; }
}
</style>