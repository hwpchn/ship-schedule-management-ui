import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

// 全局状态，用于避免循环依赖
let authStoreRef = null

/**
 * 权限管理Store
 */
export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const userPermissions = ref(null)
  const permissionsLoaded = ref(false)
  const loading = ref(false)

  // 计算属性
  const canEditVesselInfo = computed(() => {
    return hasPermission('vessel_info.update')
  })

  const canEditLocalFee = computed(() => {
    return hasPermission('local_fee.create') || 
           hasPermission('local_fee.update') || 
           hasPermission('local_fee.edit')
  })

  const canViewLocalFee = computed(() => {
    return hasPermission('local_fee.query') || 
           hasPermission('local_fee.list') || 
           hasPermission('local_fee.detail') ||
           hasPermission('local_fee.view')
  })

  const canDeleteLocalFee = computed(() => {
    return hasPermission('local_fee.delete')
  })

  const canCreateLocalFee = computed(() => {
    return hasPermission('local_fee.create')
  })

  const canQueryLocalFee = computed(() => {
    return hasPermission('local_fee.query')
  })

  const isAdmin = computed(() => {
    // 第一优先级：从authStoreRef获取用户信息
    if (authStoreRef?.user) {
      const isSuperUser = authStoreRef.user.is_superuser === true
      const isStaff = authStoreRef.user.is_staff === true
      console.log('🔍 isAdmin检查 - authStore用户:', authStoreRef.user.email)
      console.log('🔍 isAdmin检查 - is_superuser:', authStoreRef.user.is_superuser)
      console.log('🔍 isAdmin检查 - is_staff:', authStoreRef.user.is_staff)
      
      if (isSuperUser || isStaff) {
        console.log('🔍 isAdmin检查 - 结果: true (通过authStore)')
        return true
      }
    }
    
    // 第二优先级：从权限数据中获取
    if (userPermissions.value?.user) {
      const isSuperUser = userPermissions.value.user.is_superuser === true
      const isStaff = userPermissions.value.user.is_staff === true
      console.log('🔍 isAdmin检查 - 权限数据用户:', userPermissions.value.user.email)
      console.log('🔍 isAdmin检查 - 权限数据is_superuser:', userPermissions.value.user.is_superuser)
      console.log('🔍 isAdmin检查 - 权限数据is_staff:', userPermissions.value.user.is_staff)
      
      if (isSuperUser || isStaff) {
        console.log('🔍 isAdmin检查 - 结果: true (通过权限数据)')
        return true
      }
    }
    
    // 第三优先级：特殊处理admin@example.com用户
    const userEmail = authStoreRef?.user?.email || userPermissions.value?.user?.email
    if (userEmail === 'admin@example.com') {
      console.log('🔍 isAdmin检查 - 结果: true (admin@example.com特殊处理)')
      return true
    }
    
    console.log('🔍 isAdmin检查 - 结果: false')
    return false
  })

  /**
   * 设置authStore引用（避免循环依赖）
   * @param {Object} authStore authStore实例
   */
  const setAuthStoreRef = (authStore) => {
    authStoreRef = authStore
  }

  /**
   * 检查用户是否有特定权限
   * @param {string} permission 权限代码
   * @returns {boolean} 是否有权限
   */
  const hasPermission = (permission) => {
    console.log(`🔍 hasPermission检查 - 权限: ${permission}`)
    
    // 第一优先级：检查authStore中的超级管理员状态
    if (authStoreRef?.user) {
      const isSuperUser = authStoreRef.user.is_superuser === true
      const isStaff = authStoreRef.user.is_staff === true
      
      console.log(`🔍 hasPermission检查 - authStore用户:`, authStoreRef.user.email)
      console.log(`🔍 hasPermission检查 - is_superuser:`, authStoreRef.user.is_superuser)
      console.log(`🔍 hasPermission检查 - is_staff:`, authStoreRef.user.is_staff)
      
      if (isSuperUser || isStaff) {
        console.log(`👑 超级管理员自动拥有权限: ${permission}`)
        return true
      }
    }
    
    // 第二优先级：检查权限数据中的用户信息
    if (userPermissions.value?.user) {
      const isSuperUser = userPermissions.value.user.is_superuser === true
      const isStaff = userPermissions.value.user.is_staff === true
      
      console.log(`🔍 hasPermission检查 - 权限数据用户:`, userPermissions.value.user.email)
      console.log(`🔍 hasPermission检查 - 权限数据is_superuser:`, userPermissions.value.user.is_superuser)
      console.log(`🔍 hasPermission检查 - 权限数据is_staff:`, userPermissions.value.user.is_staff)
      
      if (isSuperUser || isStaff) {
        console.log(`👑 通过权限数据确认超级管理员权限: ${permission}`)
        return true
      }
    }
    
    // 第三优先级：特殊处理admin@example.com用户（临时解决方案）
    const userEmail = authStoreRef?.user?.email || userPermissions.value?.user?.email
    if (userEmail === 'admin@example.com') {
      console.log(`👑 admin@example.com用户自动拥有所有权限: ${permission}`)
      return true
    }
    
    // 第四优先级：对于查看类权限，如果用户已登录就允许
    const viewPermissions = [
      'schedule.list',
      'vessel_info.list', 
      'vessel_info.detail',
      'local_fee.view',
      'local_fee.list',
      'local_fee.query',
      'local_fee.detail'
    ]
    
    if (viewPermissions.includes(permission)) {
      const isLoggedIn = !!(authStoreRef?.user?.email || userPermissions.value?.user?.email)
      if (isLoggedIn) {
        console.log(`👀 已登录用户自动拥有查看权限: ${permission}`)
        return true
      }
    }
    
    // 第五优先级：检查具体权限
    if (!userPermissions.value?.permissions) {
      console.log(`❓ 权限数据未加载，拒绝权限: ${permission}`)
      return false
    }
    
    // 遍历权限分类查找特定权限
    for (const category in userPermissions.value.permissions) {
      const perms = userPermissions.value.permissions[category]
      if (Array.isArray(perms)) {
        for (const perm of perms) {
          if (perm.code === permission) {
            console.log(`✅ 找到匹配权限: ${permission}`)
            return true
          }
        }
      }
    }
    
    console.log(`❌ 未找到权限: ${permission}`)
    return false
  }

  /**
   * 检查用户是否有任一权限
   * @param {Array} permissionList 权限代码列表
   * @returns {boolean} 是否有任一权限
   */
  const hasAnyPermission = (permissionList) => {
    if (isAdmin.value) return true
    
    return permissionList.some(permission => hasPermission(permission))
  }

  /**
   * 加载用户权限
   * @returns {Promise<Object|null>} 权限数据
   */
  const loadUserPermissions = async () => {
    try {
      loading.value = true
      console.log('🔑 开始加载用户权限...')
      
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('📭 没有token，无法获取权限')
        userPermissions.value = null
        permissionsLoaded.value = true
        return null
      }
      
      const response = await authApi.getUserPermissions()
      
      if (response.code === 200) {
        userPermissions.value = response.data
        permissionsLoaded.value = true
        
        console.log('✅ 用户权限加载成功:', {
          user: response.data.user?.email,
          permissionCount: Object.keys(response.data.permissions || {}).length,
          canEditVessel: canEditVesselInfo.value
        })
        
        return response.data
      } else {
        console.error('❌ 权限加载失败，响应码:', response.code)
        throw new Error(response.message || '权限加载失败')
      }
    } catch (error) {
      console.error('💥 权限加载错误:', error)
      
      // 设置权限加载完成状态，避免阻塞系统使用
      permissionsLoaded.value = true
      
      // 网络错误不清除已有权限信息
      if (error.code === -1 || error.message?.includes('网络')) {
        console.log('🌐 网络错误，保持现有权限状态')
        ElMessage.warning('网络错误，权限信息可能已过期')
      } else {
        // 其他错误时，如果用户已有权限信息，不清除
        if (!userPermissions.value) {
          console.warn('⚠️ 权限加载失败，但不阻止系统使用')
          ElMessage.warning('权限加载失败，部分功能可能受限')
        }
      }
      
      return userPermissions.value
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除权限信息
   */
  const clearPermissions = () => {
    console.log('🗑️ 清除权限信息')
    userPermissions.value = null
    permissionsLoaded.value = false
  }

  /**
   * 刷新权限信息
   * @returns {Promise<Object|null>} 权限数据
   */
  const refreshPermissions = async () => {
    permissionsLoaded.value = false
    return await loadUserPermissions()
  }

  /**
   * 检查权限是否已初始化
   * @returns {boolean} 是否已初始化
   */
  const isPermissionsInitialized = computed(() => {
    return permissionsLoaded.value
  })

  return {
    // 状态
    userPermissions,
    permissionsLoaded,
    loading,
    
    // 计算属性
    canEditVesselInfo,
    canEditLocalFee,
    canViewLocalFee,
    canDeleteLocalFee,
    canCreateLocalFee,
    canQueryLocalFee,
    isAdmin,
    isPermissionsInitialized,
    
    // 方法
    hasPermission,
    hasAnyPermission,
    loadUserPermissions,
    clearPermissions,
    refreshPermissions,
    setAuthStoreRef
  }
})

/**
 * 权限工具函数
 */
export const usePermissionUtils = () => {
  const permissionStore = usePermissionStore()
  
  return {
    /**
     * 检查权限并显示提示
     * @param {string} permission 权限代码
     * @param {string} message 无权限时的提示信息
     * @returns {boolean} 是否有权限
     */
    checkPermissionWithMessage: (permission, message = '您没有执行此操作的权限') => {
      const hasPermission = permissionStore.hasPermission(permission)
      if (!hasPermission) {
        ElMessage.warning(message)
      }
      return hasPermission
    },
    
    /**
     * 确保权限已加载
     * @returns {Promise<boolean>} 是否加载成功
     */
    ensurePermissionsLoaded: async () => {
      if (!permissionStore.permissionsLoaded) {
        const result = await permissionStore.loadUserPermissions()
        return !!result
      }
      return true
    }
  }
}