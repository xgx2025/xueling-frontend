import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import LoginView from '@/view/auth/LoginView.vue'
import RegisterView from '@/view/auth/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/view/HomeView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// 路由守卫：未登录用户访问受保护路由时跳转到登录页
router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  const isLoggedIn = !!tokenStore.accessToken

  // 如果路由需要认证且用户未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
