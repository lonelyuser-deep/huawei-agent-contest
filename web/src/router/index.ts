import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/add', name: 'add', component: () => import('@/views/AddExpress.vue') },
    { path: '/detail/:id', name: 'detail', component: () => import('@/views/Detail.vue') },
    { path: '/reminder', name: 'reminder', component: () => import('@/views/Reminder.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/Settings.vue') },
    { path: '/forum', name: 'forum', component: () => import('@/views/Forum.vue') },
    { path: '/forum/post', name: 'forum-post', component: () => import('@/views/ForumPost.vue') },
    { path: '/forum/:id', name: 'forum-detail', component: () => import('@/views/ForumDetail.vue') }
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router