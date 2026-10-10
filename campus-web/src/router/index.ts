import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/schedule', name: 'schedule', component: () => import('@/views/Schedule.vue') },
    { path: '/schedule/upload', name: 'schedule-upload', component: () => import('@/views/ScheduleUpload.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/Settings.vue') }
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router