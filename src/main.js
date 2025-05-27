import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'nprogress/nprogress.css'

import App from './App.vue'
import router from './router'
import './styles/index.scss'
import { installPermissionDirectives } from './directives/permission'

const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
})

// 注册权限指令
installPermissionDirectives(app)

app.mount('#app')

// 设置Store之间的引用（避免循环依赖）
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

// 在应用启动后设置引用
const authStore = useAuthStore()
const permissionStore = usePermissionStore()
permissionStore.setAuthStoreRef(authStore)

console.log('🔗 已设置authStore引用到permissionStore')