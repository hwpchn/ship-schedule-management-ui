# 权限系统调试测试

## 🐛 问题描述
admin@example.com 用户虽然是超级管理员（is_superuser=True），但是：
1. 看不到编辑按钮（船期查询页面）
2. 无法访问系统管理页面（/admin路径被拒绝）

## 🔍 调试步骤

### 1. 在浏览器控制台运行以下代码进行调试：

```javascript
// 1. 检查authStore用户信息
const authStore = useAuthStore()
console.log('👤 当前用户信息:', authStore.user)
console.log('🔐 是否超级管理员:', authStore.user?.is_superuser)
console.log('🔐 是否管理员:', authStore.user?.is_staff)

// 2. 检查permissionStore
const permissionStore = usePermissionStore()
console.log('📋 权限数据已加载:', permissionStore.isPermissionsInitialized)
console.log('📋 权限数据:', permissionStore.userPermissions)
console.log('🔓 是否管理员(from permissionStore):', permissionStore.isAdmin)

// 3. 测试具体权限
console.log('✅ vessel_info.update权限:', permissionStore.hasPermission('vessel_info.update'))
console.log('✅ user.list权限:', permissionStore.hasPermission('user.list'))

// 4. 测试canEditVesselInfo
console.log('🛠️ 能否编辑船舶信息:', permissionStore.canEditVesselInfo)
```

### 2. 检查DOM元素

```javascript
// 查找被权限指令隐藏的元素
const hiddenElements = document.querySelectorAll('[data-permission-hidden]')
console.log('🙈 被权限隐藏的元素:', hiddenElements)
hiddenElements.forEach(el => {
  console.log('元素:', el, '需要权限:', el.getAttribute('data-permission-hidden'))
})
```

### 3. 手动测试权限API

```javascript
// 测试权限API是否正常
fetch('/api/auth/permissions/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📡 权限API响应:', data)
})
.catch(error => {
  console.error('❌ 权限API错误:', error)
})
```

## 🔧 可能的修复方案

### 方案1：强制设置超级管理员权限
如果权限API没有正确返回权限，可以在权限Store中添加超级管理员的默认权限：

```javascript
// 在 hasPermission 函数开头添加
const hasPermission = (permission) => {
  // 从authStore直接检查超级管理员状态
  const { useAuthStore } = require('@/stores/auth')
  const authStore = useAuthStore()
  
  if (authStore.user?.is_superuser) {
    console.log(`👑 超级管理员自动拥有权限: ${permission}`)
    return true
  }
  
  // 原有逻辑...
}
```

### 方案2：修复权限API响应格式
确保后端API返回正确的权限数据格式。

### 方案3：添加权限缓存和备用逻辑
在权限Store中添加超级管理员的权限缓存机制。

## 📝 测试结果记录

请在浏览器控制台运行上述调试代码，并记录结果：

1. **authStore.user**: _______________
2. **is_superuser**: _______________
3. **permissionStore.isAdmin**: _______________
4. **vessel_info.update权限**: _______________
5. **user.list权限**: _______________
6. **权限API响应**: _______________

根据测试结果，我们可以确定具体的问题所在并进行针对性修复。