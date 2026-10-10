import type { ForumPost, ForumComment } from '@shared/types/forum'
import { createPost, createComment } from '@shared/types/forum'

const POSTS_KEY = 'forum_posts'
const LIKED_KEY = 'forum_liked_posts'

function getLikedSet(): Set<string> {
  const data = localStorage.getItem(LIKED_KEY)
  return data ? new Set(JSON.parse(data)) : new Set()
}

function saveLikedSet(set: Set<string>): void {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]))
}

export function getPosts(): ForumPost[] {
  const data = localStorage.getItem(POSTS_KEY)
  return data ? JSON.parse(data) : []
}

export function getPostsByCategory(category: string): ForumPost[] {
  if (!category || category === 'all') return getPosts()
  return getPosts().filter(p => p.category === category)
}

export function getPostById(id: string): ForumPost | null {
  return getPosts().find(p => p.id === id) || null
}

export function addPost(
  title: string,
  content: string,
  category: string,
  tags: string[] = [],
  author: string = '匿名用户'
): ForumPost {
  const posts = getPosts()
  const post = createPost(title, content, category, tags, author)
  posts.unshift(post)
  savePosts(posts)
  return post
}

export function deletePost(id: string): void {
  savePosts(getPosts().filter(p => p.id !== id))
}

export function incrementViews(id: string): void {
  const posts = getPosts()
  const post = posts.find(p => p.id === id)
  if (post) {
    post.views++
    savePosts(posts)
  }
}

export function toggleLike(id: string): boolean {
  const liked = getLikedSet()
  const posts = getPosts()
  const post = posts.find(p => p.id === id)
  if (!post) return false

  if (liked.has(id)) {
    liked.delete(id)
    post.likes = Math.max(0, post.likes - 1)
  } else {
    liked.add(id)
    post.likes++
  }
  saveLikedSet(liked)
  savePosts(posts)
  return liked.has(id)
}

export function isLiked(id: string): boolean {
  return getLikedSet().has(id)
}

export function addComment(
  postId: string,
  content: string,
  author: string = '匿名用户'
): ForumComment {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (!post) throw new Error('Post not found')
  const comment = createComment(postId, content, author)
  post.comments.push(comment)
  savePosts(posts)
  return comment
}

export function deleteComment(postId: string, commentId: string): void {
  const posts = getPosts()
  const post = posts.find(p => p.id === postId)
  if (post) {
    post.comments = post.comments.filter(c => c.id !== commentId)
    savePosts(posts)
  }
}

export function getForumStats() {
  const posts = getPosts()
  return {
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
    totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
    totalComments: posts.reduce((sum, p) => sum + p.comments.length, 0)
  }
}

function savePosts(posts: ForumPost[]) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts))
}