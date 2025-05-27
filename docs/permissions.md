# 权限管理API

## 概览

权限管理API提供系统权限的查询和管理功能，包括获取权限分类列表、用户权限查询等。权限系统采用基于角色的访问控制(RBAC)模型，通过权限分类来组织和管理不同的功能权限。

## 接口信息

### 权限列表API
- **URL**: `/api/auth/permissions/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: 已登录用户

### 用户权限API
- **URL**: `/api/auth/me/permissions/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: 已登录用户

## 权限分类列表API

### 请求参数

无需参数，返回所有权限分类。

### 请求示例

```
GET /api/auth/permissions/
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "权限列表获取成功",
  "data": {
    "permission_categories": {
      "user_management": {
        "category_name": "用户管理",
        "description": "用户账户的创建、修改、删除等管理功能",
        "permissions": [
          {
            "id": 1,
            "code": "user.create",
            "name": "创建用户",
            "description": "允许创建新用户账户"
          },
          {
            "id": 2,
            "code": "user.update",
            "name": "修改用户",
            "description": "允许修改用户信息"
          },
          {
            "id": 3,
            "code": "user.delete",
            "name": "删除用户", 
            "description": "允许删除用户账户"
          },
          {
            "id": 4,
            "code": "user.list",
            "name": "查看用户列表",
            "description": "允许查看系统用户列表"
          }
        ]
      },
      "role_management": {
        "category_name": "角色管理",
        "description": "系统角色的创建、修改、删除等管理功能",
        "permissions": [
          {
            "id": 5,
            "code": "role.create",
            "name": "创建角色",
            "description": "允许创建新角色"
          },
          {
            "id": 6,
            "code": "role.update",
            "name": "修改角色",
            "description": "允许修改角色信息和权限"
          },
          {
            "id": 7,
            "code": "role.delete",
            "name": "删除角色",
            "description": "允许删除角色"
          },
          {
            "id": 8,
            "code": "role.list",
            "name": "查看角色列表",
            "description": "允许查看系统角色列表"
          }
        ]
      },
      "船舶信息管理": {
        "category_name": "船舶信息管理",
        "description": "船舶额外信息的管理功能",
        "permissions": [
          {
            "id": 20,
            "code": "vessel_info.create",
            "name": "创建船舶额外信息",
            "description": "允许添加船舶的额外信息"
          },
          {
            "id": 21,
            "code": "vessel_info.update",
            "name": "修改船舶额外信息",
            "description": "允许修改船舶的额外信息"
          },
          {
            "id": 22,
            "code": "vessel_info.delete",
            "name": "删除船舶额外信息",
            "description": "允许删除船舶的额外信息"
          },
          {
            "id": 23,
            "code": "vessel_info.list",
            "name": "查看船舶额外信息列表",
            "description": "允许查看船舶额外信息列表"
          },
          {
            "id": 24,
            "code": "vessel_info.detail",
            "name": "查看船舶额外信息详情",
            "description": "允许查看船舶额外信息的详细内容"
          }
        ]
      },
      "schedule_management": {
        "category_name": "船舶调度管理",
        "description": "船舶时刻表和航线的管理功能",
        "permissions": [
          {
            "id": 15,
            "code": "schedule.create",
            "name": "创建船舶时刻表",
            "description": "允许添加新的船舶时刻表"
          },
          {
            "id": 16,
            "code": "schedule.update",
            "name": "修改船舶时刻表",
            "description": "允许修改船舶时刻表信息"
          },
          {
            "id": 17,
            "code": "schedule.delete",
            "name": "删除船舶时刻表",
            "description": "允许删除船舶时刻表"
          },
          {
            "id": 18,
            "code": "schedule.list",
            "name": "查看船舶时刻表列表",
            "description": "允许查看船舶时刻表列表"
          }
        ]
      }
    },
    "total_categories": 4,
    "total_permissions": 17
  }
}
```

### 响应字段说明

#### 权限分类 (permission_categories)
| 字段 | 类型 | 说明 |
|------|------|------|
| `category_name` | string | 分类中文名称 |
| `description` | string | 分类功能描述 |
| `permissions` | array | 该分类下的权限列表 |

#### 权限信息 (permissions[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 权限唯一标识 |
| `code` | string | 权限代码，格式为 `模块.操作` |
| `name` | string | 权限中文名称 |
| `description` | string | 权限功能描述 |

## 用户权限API

### 请求参数

无需参数，返回当前用户的权限。

### 请求示例

```
GET /api/auth/me/permissions/
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "用户权限获取成功",
  "data": {
    "user": {
      "id": 3,
      "email": "zhang.san@example.com",
      "full_name": "张 三",
      "is_superuser": false
    },
    "permissions": {
      "船舶信息管理": [
        {
          "code": "vessel_info.create",
          "name": "创建船舶额外信息",
          "description": "允许添加船舶的额外信息"
        },
        {
          "code": "vessel_info.update",
          "name": "修改船舶额外信息",
          "description": "允许修改船舶的额外信息"
        },
        {
          "code": "vessel_info.list",
          "name": "查看船舶额外信息列表",
          "description": "允许查看船舶额外信息列表"
        }
      ],
      "schedule_management": [
        {
          "code": "schedule.list",
          "name": "查看船舶时刻表列表",
          "description": "允许查看船舶时刻表列表"
        }
      ]
    },
    "roles": [
      {
        "id": 2,
        "name": "船务操作员",
        "description": "负责船舶调度和信息管理"
      }
    ],
    "total_permissions": 4
  }
}
```

### 响应字段说明

#### 用户信息 (user)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 用户ID |
| `email` | string | 用户邮箱 |
| `full_name` | string | 用户全名 |
| `is_superuser` | boolean | 是否为超级用户 |

#### 权限信息 (permissions)
按权限分类组织的用户权限列表，每个分类包含该用户在该分类下拥有的权限。

#### 角色信息 (roles)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 角色ID |
| `name` | string | 角色名称 |
| `description` | string | 角色描述 |

## 使用示例

### cURL

```bash
# 获取权限分类列表
curl -X GET "http://127.0.0.1:8000/api/auth/permissions/" \
  -H "Authorization: Bearer <your_access_token>"

# 获取用户权限
curl -X GET "http://127.0.0.1:8000/api/auth/me/permissions/" \
  -H "Authorization: Bearer <your_access_token>"
```

### JavaScript (Fetch)

```javascript
// 权限管理类
class PermissionManager {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'http://127.0.0.1:8000/api/auth';
  }

  async getAllPermissions() {
    """获取所有权限分类"""
    try {
      const response = await fetch(`${this.baseUrl}/permissions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.permission_categories;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('获取权限列表失败:', error);
      throw error;
    }
  }

  async getUserPermissions() {
    """获取当前用户权限"""
    try {
      const response = await fetch(`${this.baseUrl}/me/permissions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('获取用户权限失败:', error);
      throw error;
    }
  }

  hasPermission(userPermissions, requiredPermission) {
    """检查用户是否有特定权限"""
    for (const category in userPermissions.permissions) {
      const permissions = userPermissions.permissions[category];
      for (const permission of permissions) {
        if (permission.code === requiredPermission) {
          return true;
        }
      }
    }
    return false;
  }

  hasAnyPermission(userPermissions, requiredPermissions) {
    """检查用户是否有任意一个权限"""
    return requiredPermissions.some(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }

  hasAllPermissions(userPermissions, requiredPermissions) {
    """检查用户是否有所有权限"""
    return requiredPermissions.every(permission => 
      this.hasPermission(userPermissions, permission)
    );
  }
}

// 使用示例
const accessToken = localStorage.getItem('access_token');
const permissionManager = new PermissionManager(accessToken);

// 获取并显示所有权限
permissionManager.getAllPermissions()
  .then(categories => {
    console.log('权限分类:');
    for (const [categoryCode, category] of Object.entries(categories)) {
      console.log(`${category.category_name} (${categoryCode}):`);
      category.permissions.forEach(permission => {
        console.log(`  - ${permission.name} (${permission.code})`);
      });
    }
  })
  .catch(error => {
    console.error('权限加载失败:', error);
  });

// 获取用户权限并进行权限检查
permissionManager.getUserPermissions()
  .then(userPermissions => {
    console.log(`用户 ${userPermissions.user.full_name} 的权限:`);
    
    // 检查特定权限
    if (permissionManager.hasPermission(userPermissions, 'vessel_info.create')) {
      console.log('✓ 用户有创建船舶信息的权限');
    } else {
      console.log('✗ 用户没有创建船舶信息的权限');
    }
    
    // 检查多个权限
    const requiredPermissions = ['vessel_info.create', 'vessel_info.update'];
    if (permissionManager.hasAllPermissions(userPermissions, requiredPermissions)) {
      console.log('✓ 用户有船舶信息管理的完整权限');
    } else {
      console.log('✗ 用户缺少部分船舶信息管理权限');
    }
  })
  .catch(error => {
    console.error('用户权限加载失败:', error);
  });
```

### Python (requests)

```python
import requests

class PermissionManager:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "http://127.0.0.1:8000/api/auth"
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_all_permissions(self):
        """获取所有权限分类"""
        try:
            response = requests.get(f"{self.base_url}/permissions/", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                return data['data']['permission_categories']
            else:
                print(f"获取权限列表失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def get_user_permissions(self):
        """获取当前用户权限"""
        try:
            response = requests.get(f"{self.base_url}/me/permissions/", headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                return data['data']
            else:
                print(f"获取用户权限失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def has_permission(self, user_permissions, required_permission):
        """检查用户是否有特定权限"""
        if not user_permissions or 'permissions' not in user_permissions:
            return False
            
        for category, permissions in user_permissions['permissions'].items():
            for permission in permissions:
                if permission['code'] == required_permission:
                    return True
        return False
    
    def has_any_permission(self, user_permissions, required_permissions):
        """检查用户是否有任意一个权限"""
        return any(self.has_permission(user_permissions, perm) for perm in required_permissions)
    
    def has_all_permissions(self, user_permissions, required_permissions):
        """检查用户是否有所有权限"""
        return all(self.has_permission(user_permissions, perm) for perm in required_permissions)
    
    def print_permission_tree(self, categories):
        """打印权限树形结构"""
        for category_code, category in categories.items():
            print(f"\n📂 {category['category_name']} ({category_code})")
            print(f"   {category['description']}")
            for permission in category['permissions']:
                print(f"   ├─ {permission['name']} ({permission['code']})")
                print(f"      └─ {permission['description']}")

# 使用示例
def main():
    # 假设已经有了access_token
    access_token = "your_access_token_here"
    pm = PermissionManager(access_token)
    
    # 获取所有权限分类
    print("🔍 获取系统权限分类...")
    categories = pm.get_all_permissions()
    if categories:
        pm.print_permission_tree(categories)
    
    # 获取用户权限
    print("\n👤 获取用户权限...")
    user_permissions = pm.get_user_permissions()
    if user_permissions:
        user = user_permissions['user']
        print(f"用户: {user['full_name']} ({user['email']})")
        print(f"角色: {', '.join([role['name'] for role in user_permissions['roles']])}")
        print(f"权限总数: {user_permissions['total_permissions']}")
        
        # 权限检查示例
        print("\n🔐 权限检查:")
        
        test_permissions = [
            'vessel_info.create',
            'vessel_info.update', 
            'vessel_info.delete',
            'schedule.create',
            'user.create'
        ]
        
        for perm in test_permissions:
            has_perm = pm.has_permission(user_permissions, perm)
            status = "✓" if has_perm else "✗"
            print(f"   {status} {perm}")
        
        # 检查船舶信息管理权限
        vessel_permissions = ['vessel_info.create', 'vessel_info.update', 'vessel_info.delete']
        if pm.has_all_permissions(user_permissions, vessel_permissions):
            print("\n✅ 用户具有完整的船舶信息管理权限")
        elif pm.has_any_permission(user_permissions, vessel_permissions):
            print("\n⚠️  用户具有部分船舶信息管理权限")
        else:
            print("\n❌ 用户没有船舶信息管理权限")

if __name__ == "__main__":
    main()
```

### Vue.js 权限指令

```javascript
// permission.js - Vue权限指令
export default {
  install(app, options) {
    // 权限检查指令
    app.directive('permission', {
      mounted(el, binding) {
        const { value } = binding
        const permissions = app.config.globalProperties.$store.state.auth.permissions
        
        if (value && !hasPermission(permissions, value)) {
          el.style.display = 'none'
        }
      },
      updated(el, binding) {
        const { value } = binding
        const permissions = app.config.globalProperties.$store.state.auth.permissions
        
        if (value && !hasPermission(permissions, value)) {
          el.style.display = 'none'
        } else {
          el.style.display = ''
        }
      }
    })
    
    // 角色检查指令
    app.directive('role', {
      mounted(el, binding) {
        const { value } = binding
        const roles = app.config.globalProperties.$store.state.auth.roles
        
        if (value && !hasRole(roles, value)) {
          el.style.display = 'none'
        }
      }
    })
  }
}

function hasPermission(permissions, requiredPermission) {
  if (!permissions) return false
  
  for (const category in permissions) {
    const perms = permissions[category]
    for (const perm of perms) {
      if (perm.code === requiredPermission) {
        return true
      }
    }
  }
  return false
}

function hasRole(roles, requiredRole) {
  if (!roles) return false
  return roles.some(role => role.name === requiredRole)
}
```

```vue
<!-- 使用权限指令的Vue组件 -->
<template>
  <div class="vessel-management">
    <h2>船舶信息管理</h2>
    
    <!-- 只有有创建权限的用户才能看到这个按钮 -->
    <button 
      v-permission="'vessel_info.create'"
      @click="createVessel"
      class="btn btn-primary"
    >
      创建船舶信息
    </button>
    
    <!-- 只有有更新权限的用户才能看到编辑按钮 -->
    <button 
      v-permission="'vessel_info.update'"
      @click="editVessel"
      class="btn btn-secondary"
    >
      编辑船舶信息
    </button>
    
    <!-- 只有有删除权限的用户才能看到删除按钮 -->
    <button 
      v-permission="'vessel_info.delete'"
      @click="deleteVessel"
      class="btn btn-danger"
    >
      删除船舶信息
    </button>
    
    <!-- 角色检查示例 -->
    <div v-role="'管理员'" class="admin-panel">
      <h3>管理员面板</h3>
      <!-- 管理员专用功能 -->
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'VesselManagement',
  setup() {
    const store = useStore()
    
    // 计算属性：检查权限
    const canCreate = computed(() => {
      return store.getters['auth/hasPermission']('vessel_info.create')
    })
    
    const canUpdate = computed(() => {
      return store.getters['auth/hasPermission']('vessel_info.update')
    })
    
    const canDelete = computed(() => {
      return store.getters['auth/hasPermission']('vessel_info.delete')
    })
    
    return {
      canCreate,
      canUpdate,
      canDelete
    }
  },
  methods: {
    createVessel() {
      // 创建船舶信息逻辑
    },
    editVessel() {
      // 编辑船舶信息逻辑
    },
    deleteVessel() {
      // 删除船舶信息逻辑
    }
  }
}
</script>
```

## 错误响应

### 认证错误 (401 Unauthorized)

```json
{
  "detail": "身份认证信息未提供。"
}
```

### Token无效 (401 Unauthorized)

```json
{
  "detail": "给定的令牌无效或已过期。"
}
```

## 权限系统设计

### 权限分类

#### 系统权限
- **用户管理** (`user_management`): 用户账户的CRUD操作
- **角色管理** (`role_management`): 角色的创建和管理
- **权限管理** (`permission_management`): 权限的查看和管理
- **用户角色管理** (`user_role_management`): 用户角色分配
- **系统管理** (`system_management`): 系统级别的管理功能

#### 业务权限
- **船舶调度管理** (`schedule_management`): 船舶时刻表管理
- **船舶信息管理** (`船舶信息管理`): 船舶额外信息管理

### 权限代码规范

权限代码采用 `模块.操作` 的格式：

- **CRUD操作**: `create`, `update`, `delete`, `list`, `detail`
- **业务操作**: `approve`, `publish`, `export`, `import`
- **查看权限**: `view`, `list`, `detail`
- **管理权限**: `manage`, `admin`

### 超级用户

超级用户 (`is_superuser=True`) 自动拥有所有权限，无需显式分配。

## 最佳实践

### 前端权限控制
1. **页面级权限**: 路由守卫检查页面访问权限
2. **组件级权限**: 使用指令隐藏无权限的组件
3. **接口级权限**: 调用API前检查相应权限
4. **菜单权限**: 根据权限动态生成菜单

### 后端权限校验
1. **装饰器**: 使用权限装饰器保护视图函数
2. **中间件**: 全局权限检查中间件
3. **序列化器**: 字段级权限控制
4. **查询集**: 基于权限过滤数据

### 权限缓存
1. **用户权限缓存**: 缓存用户权限减少数据库查询
2. **权限列表缓存**: 缓存系统权限列表
3. **角色权限缓存**: 缓存角色权限映射
4. **缓存更新**: 权限变更时及时更新缓存

## 测试用例

参考测试文件: `tests/test_permissions_api.py`

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_permissions_api.py`  
**相关文档**: [认证概览](auth-overview.md)
