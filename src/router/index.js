import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NProgress from 'nprogress'

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: (to) => {
      // 动态重定向：根据用户登录状态决定跳转地址
      const authStore = useAuthStore()
      return authStore.isAuthenticated ? '/dashboard' : '/login'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '用户登录',
      guest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '用户注册',
      guest: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '控制台',
      requiresAuth: true
    }
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: {
      title: '系统管理',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Admin',
        redirect: '/admin/users'
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: {
          title: '用户管理',
          permission: 'user.list'
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('@/views/admin/RoleManagement.vue'),
        meta: {
          title: '角色管理',
          permission: 'role.list'
        }
      },
      {
        path: 'permissions',
        name: 'PermissionManagement',
        component: () => import('@/views/admin/PermissionManagement.vue'),
        meta: {
          title: '权限管理',
          permission: 'permission.list'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  // 设置页面标题
  document.title = `${to.meta.title} - 船期管理系统`
  
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    console.log('🛡️ 页面需要认证，当前状态:', authStore.authStatus)
    
    // 如果有token但认证状态未知或正在初始化，先尝试初始化
    if (localStorage.getItem('token') && 
        (authStore.authStatus === 'unknown' || authStore.authStatus === 'initializing')) {
      console.log('🔄 检测到token但认证状态未确定，等待初始化...')
      
      try {
        const initSuccess = await authStore.initAuth()
        console.log('📋 认证初始化结果:', initSuccess, '状态:', authStore.authStatus)
        
        // 初始化成功，继续检查认证状态
        if (initSuccess && authStore.isAuthenticated) {
          console.log('✅ 认证成功，允许访问')
        } else if (authStore.authStatus === 'network_error') {
          console.log('🌐 网络错误，但保持认证状态，允许访问离线功能')
          // 网络错误时，如果有完整的本地认证信息，允许访问
          if (authStore.token && authStore.user) {
            console.log('📱 离线模式，允许访问')
          } else {
            console.log('❌ 离线模式但缺少认证信息，重定向登录')
            next('/login')
            return
          }
        } else {
          console.log('❌ 认证失败，重定向到登录页')
          next('/login')
          return
        }
      } catch (error) {
        console.error('💥 认证初始化失败:', error)
        
        // 判断是否为网络错误
        if (authStore.isNetworkErrorType && authStore.isNetworkErrorType(error)) {
          console.log('🌐 网络错误导致初始化失败，检查本地认证信息')
          
          // 如果有本地认证信息，允许离线访问
          if (authStore.token && authStore.user) {
            console.log('📱 离线模式，使用本地认证信息')
            authStore.setNetworkError()
          } else {
            console.log('❌ 无有效的本地认证信息，重定向登录')
            next('/login')
            return
          }
        } else {
          console.log('❌ 非网络错误，重定向登录')
          next('/login')
          return
        }
      }
    }
    // 如果认证状态为网络错误，检查本地认证信息
    else if (authStore.authStatus === 'network_error') {
      console.log('🌐 当前处于网络错误状态')
      
      if (authStore.token && authStore.user) {
        console.log('📱 离线模式，使用本地认证信息')
      } else {
        console.log('❌ 离线模式但缺少认证信息，重定向登录')
        next('/login')
        return
      }
    }
    // 如果明确未认证，重定向到登录页
    else if (!authStore.isAuthenticated) {
      console.log('❌ 用户未认证，重定向到登录页')
      next('/login')
      return
    }
    
    // 检查权限
    if (to.meta.permission) {
      if (!authStore.hasPermission(to.meta.permission)) {
        console.log(`❌ 用户无权限访问 ${to.path}，需要权限: ${to.meta.permission}`)
        next('/dashboard')
        return
      }
    }
    
    console.log('✅ 认证和权限检查通过')
  }
  
  // 如果已登录用户访问登录/注册页面，重定向到仪表盘
  if (to.meta.guest && authStore.isAuthenticated) {
    console.log('🔄 已登录用户访问登录页，重定向到仪表盘')
    next('/dashboard')
    return
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router 