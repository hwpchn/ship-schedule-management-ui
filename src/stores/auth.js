import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

// 认证状态枚举
const AUTH_STATUS = {
  UNKNOWN: 'unknown', // 未知状态（刚启动）
  INITIALIZING: 'initializing', // 正在初始化
  AUTHENTICATED: 'authenticated', // 已认证
  UNAUTHENTICATED: 'unauthenticated', // 未认证
  NETWORK_ERROR: 'network_error', // 网络错误（保持之前状态）
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refreshToken') || '')
  const loading = ref(false)
  const permissions = ref([])
  const roles = ref([])
  const avatarVersion = ref(Date.now()) // 头像版本号，用于强制刷新

  // 认证状态管理
  const authStatus = ref(AUTH_STATUS.UNKNOWN)
  const lastAuthCheck = ref(null) // 最后一次认证检查时间
  const networkAvailable = ref(true) // 网络状态

  // 计算属性
  const isAuthenticated = computed(() => {
    // 只有在明确认证成功时才返回true
    return authStatus.value === AUTH_STATUS.AUTHENTICATED && !!token.value && !!user.value
  })

  const isInitializing = computed(() => authStatus.value === AUTH_STATUS.INITIALIZING)
  const isNetworkError = computed(() => authStatus.value === AUTH_STATUS.NETWORK_ERROR)
  const isSuperAdmin = computed(() => user.value?.is_superuser || false)

  // 检测错误类型
  const isNetworkErrorType = error => {
    // 网络连接错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return true
    }
    // axios网络错误
    if (error.code === -1 || error.message?.includes('网络连接失败')) {
      return true
    }
    // 浏览器网络错误
    if (!navigator.onLine) {
      return true
    }
    // 超时错误
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return true
    }
    return false
  }

  // 检测认证错误
  const isAuthErrorType = error => {
    // 401 未授权
    if (error.response?.status === 401) {
      return true
    }
    // 403 禁止访问
    if (error.response?.status === 403) {
      return true
    }
    // 特定的认证错误消息
    const authErrorMessages = [
      'Token expired',
      'Invalid token',
      'Authentication failed',
      'Unauthorized',
    ]
    return authErrorMessages.some(msg => error.message?.includes(msg))
  }

  // 检查是否有特定权限
  const hasPermission = permission => {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(permission)
  }

  // 检查是否有任一权限
  const hasAnyPermission = permissionList => {
    if (isSuperAdmin.value) return true
    return permissionList.some(permission => permissions.value.includes(permission))
  }

  // 设置token
  const setToken = (newToken, newRefreshToken) => {
    console.log('🔑 设置认证token:', {
      hasAccessToken: !!newToken,
      hasRefreshToken: !!newRefreshToken,
      accessTokenLength: newToken?.length,
      refreshTokenLength: newRefreshToken?.length
    })

    token.value = newToken
    refreshToken.value = newRefreshToken
    localStorage.setItem('token', newToken)
    localStorage.setItem('refreshToken', newRefreshToken)

    // 验证存储是否成功
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    console.log('💾 token存储验证:', {
      tokenStored: !!storedToken,
      refreshTokenStored: !!storedRefreshToken
    })
  }

  // 清除token（只在确认认证失败时调用）
  const clearToken = () => {
    console.log('🗑️ 清除认证状态')
    token.value = ''
    refreshToken.value = ''
    user.value = null
    permissions.value = []
    roles.value = []
    authStatus.value = AUTH_STATUS.UNAUTHENTICATED
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  // 设置网络错误状态（保持认证信息）
  const setNetworkError = () => {
    console.log('🌐 网络错误，保持认证状态')
    authStatus.value = AUTH_STATUS.NETWORK_ERROR
    networkAvailable.value = false
  }

  // 检查并清理不完整的认证信息
  const validateAndCleanAuthData = (allowPartialToken = false) => {
    const hasToken = !!token.value
    const hasRefreshToken = !!refreshToken.value

    console.log('🔍 检查认证数据完整性:', { hasToken, hasRefreshToken, allowPartialToken })

    // 如果允许部分token（仅用于特殊情况下的验证）
    if (allowPartialToken && hasToken && !hasRefreshToken) {
      console.log('🔄 允许使用部分认证信息进行验证')
      return true
    }

    // 如果只有其中一个 token，说明认证信息不完整
    if (hasToken && !hasRefreshToken) {
      console.log('⚠️ 发现不完整的认证信息：有 access token 但缺少 refresh token')
      clearToken()
      return false
    } else if (!hasToken && hasRefreshToken) {
      console.log('⚠️ 发现不完整的认证信息：有 refresh token 但缺少 access token')
      clearToken()
      return false
    } else if (!hasToken && !hasRefreshToken) {
      console.log('📭 没有任何认证信息')
      authStatus.value = AUTH_STATUS.UNAUTHENTICATED
      return false
    }

    console.log('✅ 认证数据完整性检查通过')
    return true
  }

  // 恢复网络状态
  const restoreFromNetworkError = () => {
    console.log('🌐 网络恢复，恢复认证状态')
    if (token.value && user.value) {
      authStatus.value = AUTH_STATUS.AUTHENTICATED
    } else {
      authStatus.value = AUTH_STATUS.UNAUTHENTICATED
    }
    networkAvailable.value = true
  }

  // 用户登录
  const login = async credentials => {
    try {
      loading.value = true
      console.log('🔐 开始用户登录...')

      const response = await authApi.login(credentials)

      // 添加原始响应数据的详细日志
      console.log('📦 原始API响应:', response)
      console.log('📦 响应状态码:', response.code)
      console.log('📦 响应数据结构:', {
        data: response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'data为空',
      })

      if (response.code === 200) {
        console.log('✅ 登录API调用成功，响应数据:', {
          access: response.data.access || response.data.tokens?.access ? '已提供' : '缺失',
          refresh: response.data.refresh || response.data.tokens?.refresh ? '已提供' : '缺失',
          user: response.data.user ? '已提供' : '缺失',
        })

        // 适配后端返回的数据结构
        // 后端可能返回两种格式：
        // 1. { data: { access, refresh, user } }
        // 2. { data: { tokens: { access, refresh }, user } }
        let accessToken, refreshToken, userInfo

        if (response.data.tokens) {
          // 新格式：tokens在单独的字段中
          accessToken = response.data.tokens.access
          refreshToken = response.data.tokens.refresh
          userInfo = response.data.user
        } else {
          // 旧格式：tokens直接在data中
          accessToken = response.data.access
          refreshToken = response.data.refresh
          userInfo = response.data.user
        }

        // 检查必要的响应数据
        if (!accessToken || !refreshToken) {
          console.error('❌ Token信息缺失，完整响应数据:', JSON.stringify(response, null, 2))
          throw new Error('登录响应缺少token信息')
        }

        if (!userInfo) {
          console.error('❌ 用户信息缺失，完整响应数据:', JSON.stringify(response, null, 2))
          throw new Error('登录响应缺少用户信息')
        }

        // 设置认证信息
        setToken(accessToken, refreshToken)
        user.value = userInfo

        // 🔑 关键修复：设置认证状态为已认证
        authStatus.value = AUTH_STATUS.AUTHENTICATED

        console.log('🎯 认证信息设置完成:', {
          tokenSet: !!token.value,
          userSet: !!user.value,
          authStatus: authStatus.value,
          userEmail: user.value?.email,
          isAuthenticated: isAuthenticated.value,
        })

        // 获取权限信息
        console.log('🔑 开始获取用户权限...')
        try {
          await getUserPermissions()
          console.log('✅ 权限获取成功，权限数量:', permissions.value.length)
        } catch (permError) {
          console.warn('⚠️ 权限获取失败，但不影响登录:', permError)
          // 权限获取失败不应该影响登录成功
        }

        // 最终状态检查
        const finalAuthState = {
          token: !!token.value,
          user: !!user.value,
          isAuthenticated: isAuthenticated.value,
          permissions: permissions.value.length,
        }

        console.log('🎉 登录流程完成，最终认证状态:', finalAuthState)

        if (!finalAuthState.isAuthenticated) {
          throw new Error('登录后认证状态异常')
        }

        ElMessage.success('登录成功！')
        return { success: true, authState: finalAuthState }
      } else {
        console.log('❌ 登录失败，响应码:', response.code, '消息:', response.message)
        const friendlyMessage = response.message || '登录失败'
        ElMessage.error(friendlyMessage)
        return { success: false, message: friendlyMessage }
      }
    } catch (error) {
      console.error('💥 登录错误:', error)

      // 优化错误消息处理
      let friendlyMessage = '登录失败，请重试'

      if (error.response) {
        // HTTP错误响应
        const { status, data } = error.response

        if (status === 400) {
          // 从拦截器返回的message中获取友好错误信息
          friendlyMessage = error.message || '邮箱或密码错误，请重新输入'
        } else if (status === 401) {
          friendlyMessage = '邮箱或密码错误，请重新输入'
        } else if (status === 403) {
          friendlyMessage = '账户已被禁用，请联系管理员'
        } else if (status === 429) {
          friendlyMessage = '登录尝试过于频繁，请稍后再试'
        } else if (status >= 500) {
          friendlyMessage = '服务器错误，请稍后再试'
        } else {
          // 其他HTTP错误
          friendlyMessage = error.message || data?.message || `登录失败 (错误代码: ${status})`
        }
      } else if (error.code === -1) {
        // 网络错误
        friendlyMessage = '网络连接失败，请检查网络连接'
      } else if (error.message) {
        // 其他错误
        friendlyMessage = error.message
      }

      ElMessage.error(friendlyMessage)
      return { success: false, message: friendlyMessage }
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const register = async userData => {
    try {
      loading.value = true
      const response = await authApi.register(userData)

      if (response.code === 201) {
        ElMessage.success('注册成功！请登录您的账户')
        return { success: true }
      } else {
        const friendlyMessage = response.message || '注册失败'
        ElMessage.error(friendlyMessage)
        return { success: false, message: friendlyMessage }
      }
    } catch (error) {
      console.error('注册错误:', error)

      // 优化错误消息处理
      let friendlyMessage = '注册失败，请重试'

      if (error.response) {
        // HTTP错误响应
        const { status, data } = error.response

        if (status === 400) {
          // 从拦截器返回的message中获取友好错误信息
          friendlyMessage = error.message || '注册信息有误，请检查输入'
        } else if (status === 409) {
          friendlyMessage = '该邮箱已被注册，请使用其他邮箱'
        } else if (status === 422) {
          friendlyMessage = error.message || '输入信息格式不正确'
        } else if (status >= 500) {
          friendlyMessage = '服务器错误，请稍后再试'
        } else {
          // 其他HTTP错误
          friendlyMessage = error.message || data?.message || `注册失败 (错误代码: ${status})`
        }
      } else if (error.code === -1) {
        // 网络错误
        friendlyMessage = '网络连接失败，请检查网络连接'
      } else if (error.message) {
        // 其他错误
        friendlyMessage = error.message
      }

      ElMessage.error(friendlyMessage)
      return { success: false, message: friendlyMessage }
    } finally {
      loading.value = false
    }
  }

  // 用户登出
  const logout = async () => {
    try {
      loading.value = true
      await authApi.logout()
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      clearToken()
      loading.value = false
      ElMessage.success('已安全退出')
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      if (!token.value) {
        console.log('没有token，无法获取用户信息')
        return false
      }

      // 使用 /auth/me/ 接口获取包含头像的用户信息
      const response = await authApi.getMe()
      if (response.code === 200) {
        // 根据API文档，响应格式是 { user: {...} }
        const userData = response.data.user || response.data
        user.value = userData
        console.log('用户信息获取成功:', userData.email, '头像URL:', userData.avatar_url)
        return true
      } else {
        console.log('获取用户信息失败，响应码:', response.code)
        return false
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)

      // 区分错误类型
      if (isNetworkErrorType(error)) {
        console.log('🌐 网络错误，不清除认证状态')
        throw error // 抛出网络错误，让上层处理
      } else if (isAuthErrorType(error)) {
        console.log('🔐 认证错误，token可能已过期')
        // 不在这里清除token，让上层决定是否需要刷新
        return false
      } else {
        console.log('❓ 其他错误，保守处理')
        return false
      }
    }
  }

  // 更新用户信息
  const updateUserInfo = newUserInfo => {
    if (user.value) {
      user.value = { ...user.value, ...newUserInfo }
      console.log('用户信息已更新:', newUserInfo)
    }
  }

  // 上传用户头像
  const uploadAvatar = async file => {
    try {
      const response = await authApi.uploadAvatar(file)
      console.log('头像上传响应:', response)

      // 根据API文档处理响应格式
      if (response.code === 200) {
        // 无论响应格式如何，都重新获取用户信息以确保头像URL更新
        await getUserInfo()

        // 更新头像版本号，强制刷新所有头像显示
        avatarVersion.value = Date.now()
        console.log('头像版本号已更新:', avatarVersion.value)

        return {
          success: true,
          message: response.message || '头像上传成功',
          data: response.data,
        }
      } else {
        throw new Error(response.message || response.data?.message || '头像上传失败')
      }
    } catch (error) {
      console.error('上传头像失败:', error)
      throw error
    }
  }

  // 删除用户头像
  const deleteAvatar = async () => {
    try {
      const response = await authApi.deleteAvatar()
      console.log('头像删除响应:', response)

      if (response.code === 200) {
        // 无论响应格式如何，都重新获取用户信息以确保头像URL更新
        await getUserInfo()

        // 更新头像版本号，强制刷新所有头像显示
        avatarVersion.value = Date.now()
        console.log('头像版本号已更新:', avatarVersion.value)

        return {
          success: true,
          message: response.message || '头像删除成功',
          data: response.data,
        }
      } else {
        throw new Error(response.message || response.data?.message || '头像删除失败')
      }
    } catch (error) {
      console.error('删除头像失败:', error)
      throw error
    }
  }

  // 获取用户权限
  const getUserPermissions = async () => {
    try {
      if (!token.value) return false

      const response = await authApi.getUserPermissions()
      if (response.code === 200) {
        permissions.value = response.data.permissions || []
        roles.value = response.data.roles || []
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户权限失败:', error)

      // 权限获取失败不影响认证状态，只记录错误
      if (isNetworkErrorType(error)) {
        console.log('🌐 网络错误导致权限获取失败')
      }

      return false
    }
  }

  // 刷新token
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        console.log('❌ 没有refresh token，无法刷新认证状态')
        console.log('💡 这通常意味着：1) 用户需要重新登录，2) 认证信息不完整，3) refresh token 已过期被清除')

        // 清除可能存在的不完整认证信息
        if (token.value) {
          console.log('🧹 清除不完整的认证信息')
          clearToken()
        }

        return false
      }

      console.log('开始刷新access token...')
      const response = await authApi.refreshToken({ refresh: refreshToken.value })

      if (response.code === 200) {
        token.value = response.data.access
        localStorage.setItem('token', response.data.access)
        console.log('Token刷新成功')
        return true
      } else {
        console.log('Token刷新失败，响应码:', response.code, '消息:', response.message)
        // 刷新失败，清除认证状态
        clearToken()
        return false
      }
    } catch (error) {
      console.error('刷新token失败:', error)

      // 区分错误类型
      if (isNetworkErrorType(error)) {
        console.log('🌐 网络错误导致token刷新失败，保持当前状态')
        throw error // 抛出网络错误，让上层处理
      } else if (isAuthErrorType(error)) {
        console.log('🔐 认证错误，refresh token已过期，清除所有认证信息')
        clearToken()
        return false
      } else {
        console.log('❓ 其他错误导致token刷新失败')
        clearToken()
        return false
      }
    }
  }

  // 初始化认证状态
  const initAuth = async (allowPartialToken = false) => {
    console.log('🔐 开始初始化认证状态...', { allowPartialToken })

    // 首先检查认证数据的完整性
    if (!validateAndCleanAuthData(allowPartialToken)) {
      // 如果认证数据不完整，validateAndCleanAuthData 已经处理了清理工作
      if (token.value || refreshToken.value) {
        // 如果之前有不完整的数据被清理，给用户提示
        ElMessage.warning('检测到认证信息不完整，请重新登录以确保账户安全')
      }
      return false
    }

    // 如果正在初始化，避免重复调用
    if (authStatus.value === AUTH_STATUS.INITIALIZING) {
      console.log('🔄 认证状态正在初始化中，等待完成...')
      // 等待初始化完成
      while (authStatus.value === AUTH_STATUS.INITIALIZING) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return authStatus.value === AUTH_STATUS.AUTHENTICATED
    }

    // 如果已经有完整的认证信息，无需重新初始化
    if (authStatus.value === AUTH_STATUS.AUTHENTICATED && user.value) {
      console.log('✅ 认证状态已完整，跳过初始化')
      return true
    }

    // 如果是网络错误状态，尝试恢复
    if (authStatus.value === AUTH_STATUS.NETWORK_ERROR) {
      console.log('🌐 尝试从网络错误状态恢复...')
      // 检查网络状态
      if (navigator.onLine) {
        console.log('📶 网络已恢复，尝试重新验证认证状态')
      } else {
        console.log('📵 网络仍然不可用，保持当前状态')
        return false
      }
    }

    try {
      authStatus.value = AUTH_STATUS.INITIALIZING
      lastAuthCheck.value = new Date()

      console.log('🔐 开始初始化认证状态...')

      // 尝试获取用户信息
      const userInfoSuccess = await getUserInfo()

      if (userInfoSuccess) {
        console.log('✅ 用户信息获取成功')
        // 尝试获取权限信息
        try {
          await getUserPermissions()
          console.log('🔑 权限信息获取成功')
        } catch (permError) {
          console.warn('⚠️ 权限获取失败，但不影响认证状态:', permError)
          // 权限获取失败不影响认证状态
        }

        authStatus.value = AUTH_STATUS.AUTHENTICATED
        console.log('🎉 认证状态初始化完成')
        return true
      } else {
        console.log('❌ 用户信息获取失败，尝试刷新token...')

        // 尝试刷新token
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          console.log('🔄 Token刷新成功，重新获取用户信息...')
          const retrySuccess = await getUserInfo()
          if (retrySuccess) {
            await getUserPermissions()
            authStatus.value = AUTH_STATUS.AUTHENTICATED
            console.log('🎉 认证状态初始化完成（通过token刷新）')
            return true
          } else {
            console.log('❌ Token刷新后仍无法获取用户信息')
            authStatus.value = AUTH_STATUS.UNAUTHENTICATED
            clearToken()
            return false
          }
        } else {
          console.log('❌ Token刷新失败')
          authStatus.value = AUTH_STATUS.UNAUTHENTICATED
          // clearToken() 已在 refreshAccessToken 中处理
          return false
        }
      }
    } catch (error) {
      console.error('💥 认证状态初始化失败:', error)

      // 判断错误类型
      if (isNetworkErrorType(error)) {
        console.log('🌐 网络错误，保持认证状态不变')
        setNetworkError()
        return false
      } else if (isAuthErrorType(error)) {
        console.log('🔐 认证错误，清除认证状态')
        authStatus.value = AUTH_STATUS.UNAUTHENTICATED
        clearToken()
        return false
      } else {
        console.log('❓ 未知错误，保持认证状态不变')
        // 对于未知错误，保守处理，不清除认证状态
        if (token.value && user.value) {
          authStatus.value = AUTH_STATUS.AUTHENTICATED
        } else {
          authStatus.value = AUTH_STATUS.UNAUTHENTICATED
        }
        return false
      }
    }
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    permissions: readonly(permissions),
    roles: readonly(roles),
    avatarVersion: readonly(avatarVersion),

    // 新增状态管理
    authStatus: readonly(authStatus),
    lastAuthCheck: readonly(lastAuthCheck),
    networkAvailable: readonly(networkAvailable),

    // 计算属性
    isAuthenticated,
    isInitializing,
    isNetworkError,
    isSuperAdmin,

    // 方法
    login,
    register,
    logout,
    getUserInfo,
    updateUserInfo,
    uploadAvatar,
    deleteAvatar,
    getUserPermissions,
    refreshAccessToken,
    initAuth,
    clearToken,
    setNetworkError,
    restoreFromNetworkError,
    validateAndCleanAuthData,
    hasPermission,
    hasAnyPermission,

    // 工具方法
    isNetworkErrorType,
    isAuthErrorType,
  }
})
