<template>
  <div class="forum-page">
    <div class="page-header fade-in-up">
      <h1 class="page-title">校园论坛</h1>
      <p class="page-desc">分享校园点滴，交流学习生活</p>
    </div>

    <div class="forum-stats fade-in-up" style="animation-delay:0.05s">
      <div class="fstat"><span class="fs-num">{{ stats.totalPosts }}</span><span class="fs-label">帖子</span></div>
      <div class="fstat"><span class="fs-num">{{ stats.totalViews }}</span><span class="fs-label">浏览</span></div>
      <div class="fstat"><span class="fs-num">{{ stats.totalLikes }}</span><span class="fs-label">点赞</span></div>
      <div class="fstat"><span class="fs-num">{{ stats.totalComments }}</span><span class="fs-label">评论</span></div>
    </div>

    <div class="category-bar fade-in-up" style="animation-delay:0.08s">
      <div class="cat-chip" :class="{ active: selectedCategory === 'all' }" @click="selectedCategory = 'all'">
        <span class="cat-emoji">📋</span><span>全部</span>
      </div>
      <div v-for="cat in categories" :key="cat.key"
        class="cat-chip" :class="{ active: selectedCategory === cat.key }"
        :style="selectedCategory === cat.key ? { borderColor: cat.color, background: cat.color + '15' } : {}"
        @click="selectedCategory = cat.key">
        <span class="cat-emoji">{{ cat.icon }}</span><span>{{ cat.label }}</span>
      </div>
    </div>

    <div class="forum-actions fade-in-up" style="animation-delay:0.1s">
      <button class="btn-primary" @click="goPost">
        <svg viewBox="0 0 16 16" fill="none" width="16" height="16" style="display:inline;vertical-align:-2px;margin-right:6px"><path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        发布帖子
      </button>
    </div>

    <div v-if="filteredPosts.length > 0" class="post-list">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card fade-in-up" @click="goDetail(post.id)">
        <div class="post-cat-badge" :style="{ background: getCategoryColor(post.category) + '20', color: getCategoryColor(post.category) }">
          {{ getCategoryIcon(post.category) }} {{ getCategoryLabel(post.category) }}
        </div>
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-content-preview">{{ post.content.slice(0, 80) }}{{ post.content.length > 80 ? '...' : '' }}</p>
        <div class="post-tags" v-if="post.tags.length > 0">
          <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
        </div>
        <div class="post-meta">
          <span class="meta-author">{{ post.author }}</span>
          <span class="meta-time">{{ formatTime(post.createdAt) }}</span>
          <div class="meta-stats">
            <span class="mstat">👁 {{ post.views }}</span>
            <span class="mstat">👍 {{ post.likes }}</span>
            <span class="mstat">💬 {{ post.comments.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state fade-in">
      <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
        <rect x="12" y="16" width="56" height="48" rx="6" stroke="var(--jade-soft)" stroke-width="2"/>
        <path d="M24 30H56M24 40H48M24 50H40" stroke="var(--jade-soft)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h3 class="empty-title">还没有帖子</h3>
      <p class="empty-desc">成为第一个发帖的人吧</p>
      <button class="btn-primary" @click="goPost">发布第一篇帖子</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPosts, getPostsByCategory, getForumStats } from '@/utils/forum'
import { FORUM_CATEGORIES, getCategoryLabel, getCategoryIcon, getCategoryColor } from '@shared/types/forum'
import type { ForumPost } from '@shared/types/forum'

const router = useRouter()
const categories = FORUM_CATEGORIES
const selectedCategory = ref('all')
const allPosts = ref<ForumPost[]>([])
const stats = ref({ totalPosts: 0, totalViews: 0, totalLikes: 0, totalComments: 0 })

const filteredPosts = computed(() => {
  return getPostsByCategory(selectedCategory.value)
})

function loadData() {
  allPosts.value = getPosts()
  stats.value = getForumStats()
}

function goPost() { router.push('/forum/post') }
function goDetail(id: string) { router.push(`/forum/${id}`) }

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(loadData)
</script>

<style scoped>
.forum-page { max-width: 860px; margin: 0 auto; }
.page-header { margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; color: var(--ink); }
.page-desc { font-size: 14px; color: var(--ink-hint); margin-top: 6px; }

.forum-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.fstat { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 16px 12px; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: var(--shadow-sm); }
.fs-num { font-size: 24px; font-weight: 800; color: var(--jade-deep); font-family: var(--font-mono); }
.fs-label { font-size: 12px; color: var(--ink-hint); }

.category-bar { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; scrollbar-width: thin; }
.category-bar::-webkit-scrollbar { height: 4px; }
.cat-chip { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--white); border: 1.5px solid var(--border); border-radius: 20px; font-size: 13px; font-weight: 500; color: var(--ink-soft); cursor: pointer; white-space: nowrap; transition: all 0.2s ease; flex-shrink: 0; }
.cat-chip:hover { border-color: var(--jade-soft); }
.cat-chip.active { color: var(--jade-deep); font-weight: 600; }
.cat-emoji { font-size: 15px; }

.forum-actions { margin-bottom: 20px; }

.post-list { display: flex; flex-direction: column; gap: 14px; }
.post-card { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 20px 24px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.post-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--jade-soft); }
.post-cat-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
.post-title { font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.post-content-preview { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 12px; }
.post-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.post-tag { font-size: 12px; color: var(--jade-deep); background: var(--jade-light); border-radius: 6px; padding: 2px 8px; }
.post-meta { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--ink-hint); }
.meta-author { font-weight: 500; }
.meta-stats { margin-left: auto; display: flex; gap: 12px; }
.mstat { font-size: 12px; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 0; gap: 8px; }
.empty-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.empty-desc { font-size: 14px; color: var(--ink-hint); margin-bottom: 20px; }

@media (max-width: 768px) {
  .forum-stats { grid-template-columns: repeat(2, 1fr); }
  .post-card { padding: 16px 18px; }
  .post-meta { flex-wrap: wrap; }
  .meta-stats { margin-left: 0; }
}
</style>