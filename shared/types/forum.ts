export interface ForumComment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  author: string
  createdAt: number
  views: number
  likes: number
  comments: ForumComment[]
}

export const FORUM_CATEGORIES = [
  { key: 'study', label: '学习交流', icon: '📚', color: '#1D7561' },
  { key: 'life', label: '校园生活', icon: '🏫', color: '#2A9D7E' },
  { key: 'trade', label: '二手交易', icon: '🛒', color: '#155B4C' },
  { key: 'activity', label: '活动社团', icon: '🎉', color: '#3D8A6E' },
  { key: 'lost', label: '失物招领', icon: '🔍', color: '#123F37' },
  { key: 'help', label: '求助问答', icon: '❓', color: '#1D7561' },
  { key: 'social', label: '表白交友', icon: '💖', color: '#B54C4C' }
] as const

export function getCategoryLabel(key: string): string {
  const cat = FORUM_CATEGORIES.find(c => c.key === key)
  return cat ? cat.label : '未分类'
}

export function getCategoryIcon(key: string): string {
  const cat = FORUM_CATEGORIES.find(c => c.key === key)
  return cat ? cat.icon : '📝'
}

export function getCategoryColor(key: string): string {
  const cat = FORUM_CATEGORIES.find(c => c.key === key)
  return cat ? cat.color : '#1D7561'
}

export function createPost(
  title: string,
  content: string,
  category: string,
  tags: string[] = [],
  author: string = '匿名用户'
): ForumPost {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    title,
    content,
    category,
    tags,
    author,
    createdAt: Date.now(),
    views: 0,
    likes: 0,
    comments: []
  }
}

export function createComment(
  postId: string,
  content: string,
  author: string = '匿名用户'
): ForumComment {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    postId,
    content,
    author,
    createdAt: Date.now()
  }
}