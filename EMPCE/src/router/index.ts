import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' } // 可选：兜底
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const isAuthed = !!localStorage.getItem('token')
  console.log('[guard]', to.fullPath, 'isAuthed=', isAuthed) // 调试用，可留

  // 已登录访问 /login -> 回首页
  if (to.name === 'login' && isAuthed) return { name: 'home' }

  // 受保护路由且未登录 -> 去登录
  if (to.matched.some(r => r.meta.requiresAuth) && !isAuthed) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
