import { usePermissionStore } from '@/stores/permission'

/**
 * 权限指令
 * 用法：v-permission="'permission_code'"
 */
export const permission = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  
  updated(el, binding) {
    checkPermission(el, binding)
  }
}

/**
 * 检查权限并控制元素显示
 * @param {HTMLElement} el DOM元素
 * @param {Object} binding 指令绑定对象
 */
function checkPermission(el, binding) {
  const permissionStore = usePermissionStore()
  const requiredPermission = binding.value
  
  if (!requiredPermission) {
    console.warn('权限指令需要提供权限代码')
    return
  }
  
  // 检查权限
  const hasPermission = permissionStore.hasPermission(requiredPermission)
  
  if (!hasPermission) {
    // 没有权限则隐藏元素
    el.style.display = 'none'
    // 添加data属性标记，便于调试
    el.setAttribute('data-permission-hidden', requiredPermission)
  } else {
    // 有权限则显示元素
    el.style.display = ''
    // 移除隐藏标记
    el.removeAttribute('data-permission-hidden')
  }
}

/**
 * 权限指令组 - 支持多权限控制
 * 用法：v-permission-any="['perm1', 'perm2']" (有任一权限即可)
 * 用法：v-permission-all="['perm1', 'perm2']" (需要所有权限)
 */

/**
 * 任一权限指令
 */
export const permissionAny = {
  mounted(el, binding) {
    checkAnyPermission(el, binding)
  },
  
  updated(el, binding) {
    checkAnyPermission(el, binding)
  }
}

/**
 * 检查任一权限
 */
function checkAnyPermission(el, binding) {
  const permissionStore = usePermissionStore()
  const requiredPermissions = binding.value
  
  if (!Array.isArray(requiredPermissions)) {
    console.warn('permission-any指令需要提供权限代码数组')
    return
  }
  
  const hasAnyPermission = permissionStore.hasAnyPermission(requiredPermissions)
  
  if (!hasAnyPermission) {
    el.style.display = 'none'
    el.setAttribute('data-permission-any-hidden', requiredPermissions.join(','))
  } else {
    el.style.display = ''
    el.removeAttribute('data-permission-any-hidden')
  }
}

/**
 * 所有权限指令
 */
export const permissionAll = {
  mounted(el, binding) {
    checkAllPermissions(el, binding)
  },
  
  updated(el, binding) {
    checkAllPermissions(el, binding)
  }
}

/**
 * 检查所有权限
 */
function checkAllPermissions(el, binding) {
  const permissionStore = usePermissionStore()
  const requiredPermissions = binding.value
  
  if (!Array.isArray(requiredPermissions)) {
    console.warn('permission-all指令需要提供权限代码数组')
    return
  }
  
  const hasAllPermissions = requiredPermissions.every(permission => 
    permissionStore.hasPermission(permission)
  )
  
  if (!hasAllPermissions) {
    el.style.display = 'none'
    el.setAttribute('data-permission-all-hidden', requiredPermissions.join(','))
  } else {
    el.style.display = ''
    el.removeAttribute('data-permission-all-hidden')
  }
}

/**
 * 角色权限指令
 * 用法：v-permission-role="'admin'" (仅超级管理员可见)
 */
export const permissionRole = {
  mounted(el, binding) {
    checkRolePermission(el, binding)
  },
  
  updated(el, binding) {
    checkRolePermission(el, binding)
  }
}

/**
 * 检查角色权限
 */
function checkRolePermission(el, binding) {
  const permissionStore = usePermissionStore()
  const requiredRole = binding.value
  
  let hasRole = false
  
  if (requiredRole === 'admin' || requiredRole === 'superuser') {
    hasRole = permissionStore.isAdmin
  }
  
  if (!hasRole) {
    el.style.display = 'none'
    el.setAttribute('data-role-hidden', requiredRole)
  } else {
    el.style.display = ''
    el.removeAttribute('data-role-hidden')
  }
}

/**
 * 权限指令安装函数
 * @param {Object} app Vue应用实例
 */
export function installPermissionDirectives(app) {
  app.directive('permission', permission)
  app.directive('permission-any', permissionAny)
  app.directive('permission-all', permissionAll)
  app.directive('permission-role', permissionRole)
}

// 默认导出基础权限指令
export default permission