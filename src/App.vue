<template>
  <div id="app">
    <!-- 应用初始化加载状态 -->
    <div v-if="isInitializing" class="app-initializing">
      <div class="loading-spinner">
        <el-icon class="spin" :size="40">
          <Loading />
        </el-icon>
        <p>正在初始化应用...</p>
      </div>
    </div>

    <!-- 主应用内容 -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { Loading } from '@element-plus/icons-vue'

const isInitializing = ref(true)
let authStore = null
let permissionStore = null

// 网络状态监听
const handleOnline = () => {
  console.log('🌐 网络已恢复')
  if (authStore && authStore.authStatus === 'network_error') {
    console.log('📡 尝试恢复认证状态...')
    authStore.restoreFromNetworkError()
    // 如果有token，尝试重新初始化认证状态
    if (authStore.token) {
      authStore.initAuth().then(async success => {
        if (success) {
          console.log('✅ 认证状态已恢复')
          // 恢复认证后重新加载权限
          try {
            if (permissionStore) {
              await permissionStore.loadUserPermissions()
              console.log('🔑 权限状态已恢复')
            }
          } catch (permError) {
            console.warn('⚠️ 权限恢复失败:', permError)
          }
        } else {
          console.log('❌ 认证状态恢复失败')
        }
      })
    }
  }
}

const handleOffline = () => {
  console.log('📵 网络连接已断开')
  // 设置网络错误状态，但保持认证信息
  if (authStore && authStore.isAuthenticated) {
    authStore.setNetworkError()
  }
}

// 应用启动时初始化认证状态
onMounted(async () => {
  console.log('🚀 应用启动，初始化认证状态...')

  // 初始化 store
  authStore = useAuthStore()
  permissionStore = usePermissionStore()

  // 添加网络状态监听
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  try {
    // 检查localStorage中是否有token
    const hasToken = localStorage.getItem('token')
    const hasRefreshToken = localStorage.getItem('refreshToken')

    console.log('🔍 本地认证信息检查:', {
      hasToken: !!hasToken,
      hasRefreshToken: !!hasRefreshToken,
      tokenLength: hasToken?.length,
      refreshTokenLength: hasRefreshToken?.length,
      authStoreStatus: authStore.authStatus,
      timestamp: new Date().toISOString()
    })

    if (hasToken && authStore.authStatus === 'unknown') {
      console.log('📦 发现本地token，验证完整性并尝试初始化认证状态...')

      // 预先检查认证数据完整性
      if (!hasRefreshToken) {
        console.log('⚠️ 发现不完整的本地认证信息，尝试使用现有token验证身份...')

        // 不立即清理，先尝试用现有token验证身份
        try {
          // 允许使用部分token进行验证
          const success = await authStore.initAuth(true)
          if (success) {
            console.log('✅ 使用现有token认证成功')
            // 认证成功后初始化权限
            try {
              await permissionStore.loadUserPermissions()
              console.log('🔑 权限初始化完成')
            } catch (permError) {
              console.warn('⚠️ 权限初始化失败，但不影响应用启动:', permError)
            }
          } else {
            console.log('❌ 现有token验证失败，清理认证信息')
            // 只有在验证失败后才清理
            authStore.validateAndCleanAuthData()
          }
        } catch (error) {
          console.error('💥 token验证过程出错:', error)
          // 出错时也清理认证信息
          authStore.validateAndCleanAuthData()
        }
      } else {
        // 认证信息完整，正常初始化
        const success = await authStore.initAuth()
        if (success) {
          console.log('✅ 认证状态初始化成功')

          // 认证成功后初始化权限
          try {
            await permissionStore.loadUserPermissions()
            console.log('🔑 权限初始化完成')
          } catch (permError) {
            console.warn('⚠️ 权限初始化失败，但不影响应用启动:', permError)
          }
        } else if (authStore.authStatus === 'network_error') {
          console.log('🌐 网络错误导致初始化失败，将在网络恢复后重试')
        } else {
          console.log('❌ 认证状态初始化失败')
        }
      }
    } else if (!hasToken) {
      console.log('📭 未发现本地token，用户需要重新登录')
      // 使用 validateAndCleanAuthData 来正确设置状态
      authStore.validateAndCleanAuthData()
    } else {
      console.log('🔄 认证状态已存在，跳过初始化')
    }
  } catch (error) {
    console.error('💥 认证状态初始化失败:', error)

    // 判断错误类型
    if (authStore.isNetworkErrorType(error)) {
      console.log('🌐 网络错误，保持认证状态')
      authStore.setNetworkError()
    } else {
      console.log('❌ 其他错误，可能需要重新登录')
    }
  } finally {
    // 初始化完成，隐藏加载状态
    isInitializing.value = false
  }
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-initializing {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .loading-spinner {
    text-align: center;
    color: white;

    .spin {
      animation: spin 1s linear infinite;
    }

    p {
      margin-top: 16px;
      font-size: 16px;
      opacity: 0.9;
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
