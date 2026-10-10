import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/add', name: 'add', component: () => import('@/views/AddBill.vue') },
    { path: '/detail/:id', name: 'detail', component: () => import('@/views/BillDetail.vue') },
    { path: '/split', name: 'split', component: () => import('@/views/Split.vue') },
    { path: '/roommates', name: 'roommates', component: () => import('@/views/Roommates.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/Settings.vue') }
  ],
  scrollBehavior() { return { top: 0 } }
})

export default router