import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import { useUserStore } from '@/stores/user'
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
    },
    {
      path: '/english',
      name: 'english',
      component: () => import('@/view/english/EnglishDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/english/vocab',
      name: 'english-vocab',
      component: () => import('@/view/english/vocab/VocabList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/english/vocab/book/:id',
      name: 'english-vocab-book',
      component: () => import('@/view/english/vocab/BookDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/english/vocab/review/:id',
      name: 'english-vocab-review',
      component: () => import('@/view/english/vocab/CardReview.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/english/articles',
      name: 'english-articles',
      component: () => import('@/view/english/article/ArticleList.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/english/articles/:id',
      name: 'english-article-detail',
      component: () => import('@/view/english/article/ArticleDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/profile',
      name: 'user-profile',
      component: () => import('@/view/user/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

// 路由守卫：未登录用户访问受保护路由时跳转到登录页
router.beforeEach(async (to, _from, next) => {
  const tokenStore = useTokenStore()
  const userStore = useUserStore()
  
  // 检查是否有有效的 token
  const hasToken = tokenStore.accessToken && tokenStore.accessToken.trim() !== ''

  // 如果路由需要认证且用户未登录，跳转到登录页
  if (to.meta.requiresAuth && !hasToken) {
    next({ name: 'login' })
    return
  }

  // 如果已登录但没有用户信息，尝试获取
  // 只在访问需要认证的页面时获取
  if (hasToken && !userStore.userInfo && to.meta.requiresAuth) {
    try {
      console.log('正在获取用户信息...')
      await userStore.fetchUserInfo()
      console.log('用户信息获取成功')
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      // 如果是 401 或 403，说明 token 无效，清除并跳转登录
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        tokenStore.removeToken()
        userStore.clearUserInfo()
        next({ name: 'login' })
        return
      }
      // 其他错误不阻止路由跳转
    }
  }

  next()
})

export default router
