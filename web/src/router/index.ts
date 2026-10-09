import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/add', name: 'add', component: () => import('@/views/AddExpress.vue') },
    { path: '/detail/:id', name: 'detail', component: () => import('@/views/Detail.vue') }
  ]
})

export default router