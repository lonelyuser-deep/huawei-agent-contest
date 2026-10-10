<template>
  <div class="detail-page" v-if="post">
    <div class="back-bar" @click="router.push('/forum')">
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16"><path d="M10 4L6 8L10 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      返回论坛
    </div>

    <div class="post-cat-badge" :style="{ background: getCategoryColor(post.category) + '20', color: getCategoryColor(post.category) }">
      {{ getCategoryIcon(post.category) }} {{ getCategoryLabel(post.category) }}
    </div>

    <h1 class="post-title fade-in-up">{{ post.title }}</h1>

    <div class="post-meta-bar fade-in-up" style="animation-delay:0.05s">
      <span class="meta-author">{{ post.author }}</span>
      <span class="meta-time">{{ formatTime(post.createdAt) }}</span>
      <span class="meta-dot">·</span>
      <span class="meta-views">👁 {{ post.views }} 浏览</span>
    </div>

    <div class="post-tags" v-if="post.tags.length > 0">
      <span v-for="tag in post.tags" :key="tag" class="post-tag">#{{ tag }}</span>
    </div>

    <div class="post-content fade-in-up" style="animation-delay:0.1s">{{ post.content }}</div>

    <div class="action-bar fade-in-up" style="animation-delay:0.15s">
      <button class="like-btn" :class="{ liked: liked }" @click="handleLike">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M10 17C10 17 3 12 3 7C3 5 5 3 7 3C8.5 3 10 4 10 5C10 4 11.5 3 13 3C15 3 17 5 17 7C17 12 10 17 10 17Z"
            :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <span>{{ post.likes }}</span>
      </button>
      <button class="comment-btn" @click="scrollToComment">
        <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
          <path d="M3 5C3 4 4 3 5 3H15C16 3 17 4 17 5V11C17 12 16 13 15 13H8L4 16V13H5C4 13 3 12 3 11V5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
        <span>{{ post.comments.length }}</span>
      </button>
    </div>

    <div class="comments-section" ref="commentSection">
      <h2 class="comments-title">评论 ({{ post.comments.length }})</h2>

      <div class="comment-input-area">
        <input v-model="commentAuthor" class="comment-author-input" placeholder="昵称（选填）" maxlength="20" />
        <textarea v-model="commentText" class="comment-textarea" placeholder="写下你的评论..." rows="3"></textarea>
        <button class="btn-primary comment-submit" @click="submitComment" :disabled="!commentText.trim()">发表评论</button>
      </div>

      <div v-if="post.comments.length > 0" class="comment-list">
        <div v-for="comment in [...post.comments].reverse()" :key="comment.id" class="comment-item fade-in">
          <div class="comment-avatar">{{ comment.author.charAt(0) }}</div>
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-comments">还没有评论，来说两句吧</div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>帖子不存在或已被删除</p>
    <button class="btn-primary" @click="router.push('/forum')">返回论坛</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostById, incrementViews, toggleLike, isLiked, addComment } from '@/utils/forum'
import { getCategoryLabel, getCategoryIcon, getCategoryColor } from '@shared/types/forum'
import type { ForumPost } from '@shared/types/forum'

const route = useRoute()
const router = useRouter()
const post = ref<ForumPost | null>(null)
const liked = ref(false)
const commentText = ref('')
const commentAuthor = ref('')
const commentSection = ref<HTMLElement | null>(null)

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function handleLike() {
  const result = toggleLike(route.params.id as string)
  liked.value = result
  post.value = getPostById(route.params.id as string)
}

function submitComment() {
  if (!commentText.value.trim()) return
  addComment(
    route.params.id as string,
    commentText.value.trim(),
    commentAuthor.value.trim() || '匿名用户'
  )
  commentText.value = ''
  commentAuthor.value = ''
  post.value = getPostById(route.params.id as string)
}

function scrollToComment() {
  commentSection.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const id = route.params.id as string
  incrementViews(id)
  post.value = getPostById(id)
  liked.value = isLiked(id)
})
</script>

<style scoped>
.detail-page { max-width: 760px; margin: 0 auto; }

.back-bar { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--ink-hint); cursor: pointer; margin-bottom: 20px; padding: 6px 12px; border-radius: var(--radius-sm); transition: all 0.2s; }
.back-bar:hover { color: var(--jade-deep); background: var(--jade-light); }

.post-cat-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
.post-title { font-size: 26px; font-weight: 700; color: var(--ink); margin-bottom: 12px; line-height: 1.4; }
.post-meta-bar { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-hint); margin-bottom: 16px; }
.meta-author { font-weight: 500; color: var(--ink-soft); }
.meta-dot { opacity: 0.5; }

.post-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.post-tag { font-size: 13px; color: var(--jade-deep); background: var(--jade-light); border-radius: 8px; padding: 4px 10px; }

.post-content { font-size: 16px; color: var(--ink); line-height: 1.8; white-space: pre-wrap; background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 24px 28px; box-shadow: var(--shadow-sm); margin-bottom: 24px; }

.action-bar { display: flex; gap: 16px; margin-bottom: 32px; }
.like-btn, .comment-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--white); border: 1.5px solid var(--border); border-radius: 24px; font-size: 15px; font-weight: 600; color: var(--ink-soft); cursor: pointer; transition: all 0.2s ease; }
.like-btn:hover, .comment-btn:hover { border-color: var(--jade-soft); }
.like-btn.liked { color: var(--danger); border-color: var(--danger); background: var(--danger-soft); }
.like-btn.liked svg { animation: likePop 0.3s ease; }
@keyframes likePop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }

.comments-section { }
.comments-title { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 16px; }

.comment-input-area { background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-lg); padding: 16px 20px; box-shadow: var(--shadow-sm); margin-bottom: 24px; }
.comment-author-input { width: 100%; font-size: 14px; padding: 8px 0; border: none; border-bottom: 1px solid var(--border-soft); background: transparent; color: var(--ink); margin-bottom: 12px; }
.comment-author-input:focus { outline: none; border-bottom-color: var(--jade); }
.comment-author-input::placeholder { color: var(--ink-hint); }
.comment-textarea { width: 100%; font-size: 14px; padding: 10px 14px; background: var(--cream); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--ink); resize: vertical; min-height: 70px; line-height: 1.6; }
.comment-textarea:focus { outline: none; border-color: var(--jade); }
.comment-textarea::placeholder { color: var(--ink-hint); }
.comment-submit { margin-top: 12px; padding: 8px 20px; font-size: 14px; }
.comment-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.comment-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { display: flex; gap: 12px; background: var(--white); border: 1px solid var(--border-soft); border-radius: var(--radius-md); padding: 16px 20px; box-shadow: var(--shadow-sm); }
.comment-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--jade), var(--jade-deep)); color: #FFFDF0; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.comment-body { flex: 1; min-width: 0; }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comment-author { font-size: 14px; font-weight: 600; color: var(--ink); }
.comment-time { font-size: 12px; color: var(--ink-hint); }
.comment-content { font-size: 14px; color: var(--ink-soft); line-height: 1.6; white-space: pre-wrap; }

.no-comments { text-align: center; padding: 32px; color: var(--ink-hint); font-size: 14px; }

.not-found { text-align: center; padding: 60px 0; }
.not-found p { font-size: 16px; color: var(--ink-hint); margin-bottom: 20px; }

@media (max-width: 768px) {
  .post-title { font-size: 22px; }
  .post-content { padding: 18px 20px; font-size: 15px; }
  .comment-item { padding: 14px 16px; }
}
</style>