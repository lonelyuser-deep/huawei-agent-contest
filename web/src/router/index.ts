import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/add', name: 'add', component: () => import('@/views/AddExpress.vue') },
    { path: '/detail/:id', name: 'detail', component: () => import('@/views/Detail.vue') },
    { path: '/reminder', name: 'reminder', component: () => import('@/views/Reminder.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/Settings.vue') }
  ]
})

export default router