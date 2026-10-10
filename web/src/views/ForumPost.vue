<template>
  <div class="post-page">
    <div class="back-bar" @click="router.push('/forum')">
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      返回论坛
    </div>

    <div class="page-header fade-in-up">
      <h1 class="page-title">发布帖子</h1>
      <p class="page-desc">选择分类，分享你的校园故事</p>
    </div>

    <div class="form-section fade-in-up" style="animation-delay:0.05s">
      <div class="form-label">分类 <span class="required">*</span></div>
      <div class="category-grid">
        <div v-for="cat in categories" :key="cat.key"
          class="cat-option" :class="{ active: form.category === cat.key }"
          :style="form.category === cat.key ? { borderColor: cat.color, background: cat.color + '15' } : {}"
          @click="form.category = cat.key">
          <span class="cat-opt-icon">{{ cat.icon }}</span>
          <span class="cat-opt-label">{{ cat.label }}</span>
        </div>
      </div>
    </div>

    <div class="form-section fade-in-up" style="animation-delay:0.1s">
      <div class="form-label">标题 <span class="required">*</span></div>
      <input v-model="form.title" class="form-input" placeholder="给帖子起个标题（2-50字）" maxlength="50" />
    </div>

    <div class="form-section fade-in-up" style="animation-delay:0.15s">
      <div class="form-label">内容 <span class="required">*</span></div>
      <textarea v-model="form.content" class="form-textarea" placeholder="写下你想分享的内容..." rows="8"></textarea>
      <div class="char-count">{{ form.content.length }} 字</div>
    </div>

    <div class="form-section fade-in-up" style="animation-delay:0.2s">
      <div class="form-label">标签 <span class="optional">（选填，最多5个）</span></div>
      <div class="tag-input-area">
        <div class="tag-list">
          <span v-for="(tag, i) in form.tags" :key="i" class="tag-item">
            #{{ tag }}
            <button class="tag-remove" @click="removeTag(i)">×</button>
          </span>
        </div>
        <input v-if="form.tags.length < 5" v-model="tagInput" class="tag-input"
          placeholder="输入标签后回车" @keydown.enter.prevent="addTag" />
      </div>
    </div>

    <div class="form-section fade-in-up" style="animation-delay:0.25s">
      <div class="form-label">昵称 <span class="optional">（选填，默认匿名）</span></div>
      <input v-model="form.author" class="form-input" placeholder="匿名用户" maxlength="20" />
    </div>

    <div class="form-actions fade-in-up" style="animation-delay:0.3s">
      <button class="btn-outline" @click="router.push('/forum')">取消</button>
      <button class="btn-primary" @click="onSubmit" :disabled="!canSubmit">
        发布帖子
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { addPost } from '@/utils/forum'
import { FORUM_CATEGORIES } from '@shared/types/forum'

const router = useRouter()
const categories = FORUM_CATEGORIES
const tagInput = ref('')

const form = ref({
  title: '',
  content: '',
  category: '',
  tags: [] as string[],
  author: ''
})

const canSubmit = computed(() => {
  return form.value.title.trim().length >= 2 &&
         form.value.content.trim().length >= 5 &&
         form.value.category !== ''
})

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 5) {
    form.value.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1)
}

function onSubmit() {
  if (!canSubmit.value) return
  addPost(
    form.value.title.trim(),
    form.value.content.trim(),
    form.value.category,
    form.value.tags,
    form.value.author.trim() || '匿名用户'
  )
  router.push('/forum')
}
</script>

<style scoped>
.post-page { max-width: 720px; margin: 0 auto; }

.back-bar { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--ink-hint); cursor: pointer; margin-bottom: 20px; padding: 6px 12px; border-radius: var(--radius-sm); transition: all 0.2s; }
.back-bar:hover { color: var(--jade-deep); background: var(--jade-light); }

.page-header { margin-bottom: 28px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.form-section { margin-bottom: 24px; }
.form-label { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
.required { color: var(--danger); }
.optional { font-size: 12px; color: var(--ink-hint); font-weight: 400; }

.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.cat-option { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 8px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease; }
.cat-option:hover { border-color: var(--jade-soft); transform: translateY(-2px); }
.cat-option.active { font-weight: 600; }
.cat-opt-icon { font-size: 24px; }
.cat-opt-label { font-size: 13px; color: var(--ink-soft); }
.cat-option.active .cat-opt-label { color: var(--ink); }

.form-input { width: 100%; font-size: 15px; padding: 14px 16px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--ink); transition: border-color 0.2s; }
.form-input:focus { outline: none; border-color: var(--jade); }
.form-input::placeholder { color: var(--ink-hint); }

.form-textarea { width: 100%; font-size: 15px; padding: 14px 16px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); color: var(--ink); resize: vertical; min-height: 160px; line-height: 1.7; transition: border-color 0.2s; }
.form-textarea:focus { outline: none; border-color: var(--jade); }
.form-textarea::placeholder { color: var(--ink-hint); }
.char-count { text-align: right; font-size: 12px; color: var(--ink-hint); margin-top: 6px; }

.tag-input-area { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px 14px; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--radius-md); min-height: 50px; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-item { display: inline-flex; align-items: center; gap: 4px; background: var(--jade-light); color: var(--jade-deep); border-radius: 8px; padding: 4px 10px; font-size: 13px; font-weight: 500; }
.tag-remove { background: none; border: none; color: var(--ink-hint); cursor: pointer; font-size: 16px; padding: 0 2px; line-height: 1; }
.tag-remove:hover { color: var(--danger); }
.tag-input { flex: 1; min-width: 120px; border: none; outline: none; font-size: 14px; background: transparent; }
.tag-input::placeholder { color: var(--ink-hint); }

.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.form-actions .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .category-grid { grid-template-columns: repeat(3, 1fr); }
  .form-actions { flex-direction: column-reverse; }
  .form-actions button { width: 100%; }
}
</style>