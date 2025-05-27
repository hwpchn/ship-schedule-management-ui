# 认证模块 API 概览

## 模块介绍

认证模块提供了完整的用户认证、授权和权限管理功能，包括用户注册、登录、JWT Token管理、角色权限系统等核心功能。

## 架构设计

### 认证流程
```
用户注册 → 用户登录 → 获取JWT Token → 访问受保护的API → Token刷新 → 用户登出
```

### 权限体系
```
用户 (User) ← 多对多 → 角色 (Role) ← 多对多 → 权限 (Permission)
```

## API 端点总览

### 用户管理
| 端点 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| 用户注册 | POST | `/api/auth/register/` | 新用户注册 | ❌ |
| 用户登录 | POST | `/api/auth/login/` | 用户登录获取Token | ❌ |
| 用户登出 | POST | `/api/auth/logout/` | 用户登出并黑名单Token | ✅ |
| 获取用户信息 | GET | `/api/auth/user/` | 获取当前用户详细信息 | ✅ |
| 更新用户信息 | PATCH | `/api/auth/user/` | 更新当前用户信息 | ✅ |
| 用户信息简版 | GET | `/api/auth/me/` | 获取当前用户基本信息 | ✅ |

### Token管理
| 端点 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| Token刷新 | POST | `/api/auth/token/refresh/` | 刷新访问Token | ❌ |

### 权限管理
| 端点 | 方法 | 路径 | 说明 | 权限要求 |
|------|------|------|------|----------|
| 权限列表 | GET | `/api/auth/permissions/` | 获取所有权限分类 | ✅ 已登录 |
| 用户权限 | GET | `/api/auth/me/permissions/` | 获取当前用户权限 | ✅ 已登录 |
| 用户列表 | GET | `/api/auth/users/` | 获取用户列表 | 👑 管理员 |

### 角色管理
| 端点 | 方法 | 路径 | 说明 | 权限要求 |
|------|------|------|------|----------|
| 角色列表 | GET | `/api/auth/roles/` | 获取角色列表 | 👑 角色管理 |
| 创建角色 | POST | `/api/auth/roles/` | 创建新角色 | 👑 角色管理 |
| 角色详情 | GET | `/api/auth/roles/{id}/` | 获取角色详情 | 👑 角色管理 |
| 更新角色 | PUT/PATCH | `/api/auth/roles/{id}/` | 更新角色信息 | 👑 角色管理 |
| 删除角色 | DELETE | `/api/auth/roles/{id}/` | 删除角色 | 👑 角色管理 |

### 用户角色管理
| 端点 | 方法 | 路径 | 说明 | 权限要求 |
|------|------|------|------|----------|
| 用户角色列表 | GET | `/api/auth/users/{id}/roles/` | 获取用户的角色 | 👑 用户角色管理 |
| 分配角色 | POST | `/api/auth/users/{id}/roles/` | 为用户分配角色 | 👑 用户角色管理 |
| 更新用户角色 | PUT | `/api/auth/users/{id}/roles/` | 更新用户角色 | 👑 用户角色管理 |
| 移除角色 | DELETE | `/api/auth/users/{id}/roles/{role_id}/` | 移除用户角色 | 👑 用户角色管理 |

## 权限分类

### 系统权限
- **用户管理** (`user_management`): 用户信息的增删改查
- **角色管理** (`role_management`): 角色的创建、修改、删除
- **权限管理** (`permission_management`): 权限的查看和管理
- **用户角色管理** (`user_role_management`): 用户角色分配管理
- **系统管理** (`system_management`): 系统级别的管理功能

### 业务权限
- **船舶调度管理** (`schedule_management`): 船舶时刻表管理
- **船舶信息管理** (`船舶信息管理`): 船舶额外信息管理

## 数据模型

### 用户模型 (User)
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "张",
  "last_name": "三",
  "full_name": "张 三",
  "short_name": "张",
  "date_joined": "2025-05-25T08:00:00+08:00",
  "last_login": "2025-05-25T08:30:00+08:00",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false
}
```

### 权限模型 (Permission)
```json
{
  "id": 1,
  "code": "user.create",
  "name": "创建用户",
  "category": "user_management",
  "description": "允许创建新用户账户"
}
```

### 角色模型 (Role)
```json
{
  "id": 1,
  "name": "船务操作员",
  "description": "负责船舶调度和信息管理",
  "permissions": ["schedule.create", "schedule.update", "vessel_info.list"],
  "permission_count": 3,
  "user_count": 5,
  "created_at": "2025-05-25T08:00:00+08:00"
}
```

## JWT Token 结构

### Access Token
```json
{
  "token_type": "access",
  "exp": 1748137167,
  "iat": 1748133567,
  "jti": "unique-token-id",
  "user_id": 1
}
```

### Refresh Token
```json
{
  "token_type": "refresh",
  "exp": 1748738367,
  "iat": 1748133567,
  "jti": "unique-refresh-id",
  "user_id": 1
}
```

## 安全特性

### 密码安全
- **最小长度**: 8个字符
- **复杂度要求**: 支持数字、字母、特殊字符
- **哈希算法**: Django默认PBKDF2算法
- **盐值**: 每个密码使用唯一盐值

### Token安全
- **过期时间**: Access Token 1小时，Refresh Token 7天
- **黑名单机制**: 登出时Token加入黑名单
- **自动刷新**: 支持无感刷新机制
- **防重放攻击**: 每个Token包含唯一JTI

### 权限安全
- **最小权限原则**: 用户仅获得必需的最小权限
- **角色继承**: 支持角色权限继承
- **权限检查**: 每个API调用都进行权限验证
- **超级用户**: 拥有所有权限的特殊用户

## 错误处理

### 认证错误
```json
{
  "detail": "身份认证信息未提供。"
}
```

### 权限错误
```json
{
  "detail": "您没有执行该操作的权限。"
}
```

### 登录错误
```json
{
  "non_field_errors": ["邮箱或密码错误"]
}
```

### 注册错误
```json
{
  "email": ["具有 邮箱地址 的 用户 已存在。"],
  "password": ["请确保这个字段至少包含 8 个字符。"]
}
```

## 使用流程示例

### 1. 完整认证流程
```python
import requests

base_url = "http://127.0.0.1:8000/api/auth"

# 1. 用户注册
register_data = {
    "email": "user@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "张",
    "last_name": "三"
}
response = requests.post(f"{base_url}/register/", json=register_data)
tokens = response.json()['tokens']

# 2. 用户登录
login_data = {
    "email": "user@example.com",
    "password": "securepassword123"
}
response = requests.post(f"{base_url}/login/", json=login_data)
access_token = response.json()['tokens']['access']

# 3. 访问受保护的API
headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get(f"{base_url}/user/", headers=headers)
user_info = response.json()

# 4. 刷新Token
refresh_data = {"refresh": tokens['refresh']}
response = requests.post(f"{base_url}/token/refresh/", json=refresh_data)
new_access_token = response.json()['access']

# 5. 用户登出
logout_data = {"refresh": tokens['refresh']}
response = requests.post(f"{base_url}/logout/", json=logout_data, headers=headers)
```

### 2. 权限检查流程
```python
# 获取用户权限
response = requests.get(f"{base_url}/me/permissions/", headers=headers)
permissions = response.json()['permissions']

# 检查特定权限
def has_permission(permissions, required_permission):
    for category, perms in permissions.items():
        for perm in perms:
            if perm['code'] == required_permission:
                return True
    return False

# 使用示例
if has_permission(permissions, 'vessel_info.create'):
    print("用户有创建船舶信息的权限")
else:
    print("用户没有创建船舶信息的权限")
```

## 最佳实践

### 客户端集成
1. **Token存储**: 使用安全的本地存储（如HttpOnly Cookie）
2. **自动刷新**: 在Token即将过期时自动刷新
3. **错误处理**: 优雅处理401/403错误
4. **登出清理**: 登出时清除所有本地Token

### 服务端安全
1. **HTTPS**: 生产环境必须使用HTTPS
2. **CORS配置**: 正确配置跨域访问策略
3. **速率限制**: 对登录等敏感接口进行速率限制
4. **日志审计**: 记录所有认证和权限相关操作

### 权限设计
1. **粒度控制**: 权限设计要足够细粒度
2. **角色分层**: 合理设计角色层次结构
3. **权限检查**: 在每个业务操作前进行权限检查
4. **定期审查**: 定期审查用户权限分配

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_api.py`, `tests/test_permissions_api.py`  
**相关文档**: [权限管理API](permissions.md)
