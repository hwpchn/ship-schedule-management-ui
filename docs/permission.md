# 权限管理系统 API 文档

## 概述

本系统实现了基于角色的权限控制（RBAC），包含以下核心概念：
- **权限（Permission）**: 系统中的具体操作权限，如 `user.list`、`role.create` 等
- **角色（Role）**: 权限的集合，如"管理员"、"普通用户"等
- **用户角色关联**: 用户通过角色获得权限

## 权限树状结构

```
系统管理
├── 用户管理
│   ├── 用户列表查看（user.list）
│   ├── 用户详情查看（user.detail）
│   ├── 用户创建（user.create）
│   ├── 用户修改（user.update）
│   └── 用户删除（user.delete）
├── 角色管理
│   ├── 角色列表查看（role.list）
│   ├── 角色详情查看（role.detail）
│   ├── 角色创建（role.create）
│   ├── 角色修改（role.update）
│   └── 角色删除（role.delete）
├── 权限管理
│   ├── 权限列表查看（permission.list）
│   └── 权限详情查看（permission.detail）
├── 用户角色管理
│   ├── 查看用户角色（user.role.view）
│   ├── 分配用户角色（user.role.assign）
│   └── 移除用户角色（user.role.remove）
└── 船期管理（示例扩展）
    ├── 船期列表查看（schedule.list）
    ├── 船期详情查看（schedule.detail）
    ├── 船期创建（schedule.create）
    ├── 船期修改（schedule.update）
    └── 船期删除（schedule.delete）
```

## API 接口详细说明

### 1. 权限相关接口

#### 获取权限列表
```http
GET /api/auth/permissions/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "permissions": {
    "user_management": [
      {
        "id": 1,
        "code": "user.list",
        "name": "查看用户列表",
        "description": "允许查看系统中所有用户的列表",
        "category": "user_management",
        "created_at": "2025-05-23T13:27:00Z"
      }
    ],
    "role_management": [
      {
        "id": 6,
        "code": "role.list",
        "name": "查看角色列表",
        "description": "允许查看系统中所有角色的列表",
        "category": "role_management",
        "created_at": "2025-05-23T13:27:00Z"
      }
    ]
  },
  "total": 22
}
```

**权限要求：** `permission.list` 或超级管理员

---

### 2. 角色相关接口

#### 获取角色列表
```http
GET /api/auth/roles/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "超级管理员",
      "description": "拥有系统所有权限的管理员角色",
      "is_active": true,
      "permission_count": 22,
      "created_at": "2025-05-23T13:27:00Z",
      "updated_at": "2025-05-23T13:27:00Z"
    }
  ]
}
```

**权限要求：** `role.list` 或超级管理员

#### 获取角色详情
```http
GET /api/auth/roles/{role_id}/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "id": 1,
  "name": "超级管理员",
  "description": "拥有系统所有权限的管理员角色",
  "is_active": true,
  "permissions": [
    {
      "id": 1,
      "code": "user.list",
      "name": "查看用户列表",
      "description": "允许查看系统中所有用户的列表",
      "category": "user_management",
      "created_at": "2025-05-23T13:27:00Z"
    }
  ],
  "created_at": "2025-05-23T13:27:00Z",
  "updated_at": "2025-05-23T13:27:00Z"
}
```

**权限要求：** `role.detail` 或超级管理员

#### 创建角色
```http
POST /api/auth/roles/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "普通管理员",
  "description": "可查看用户列表、船期列表",
  "permission_codes": ["user.list", "schedule.list"]
}
```

**响应示例：**
```json
{
  "message": "角色创建成功",
  "role": {
    "id": 4,
    "name": "普通管理员",
    "description": "可查看用户列表、船期列表",
    "is_active": true,
    "permissions": [
      {
        "id": 1,
        "code": "user.list",
        "name": "查看用户列表",
        "description": "允许查看系统中所有用户的列表",
        "category": "user_management",
        "created_at": "2025-05-23T13:27:00Z"
      }
    ],
    "created_at": "2025-05-23T13:27:00Z",
    "updated_at": "2025-05-23T13:27:00Z"
  }
}
```

**权限要求：** `role.create` 或超级管理员

#### 更新角色
```http
PUT /api/auth/roles/{role_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "更新后的角色名",
  "description": "更新后的描述",
  "permission_codes": ["user.list", "user.create"]
}
```

**响应示例：**
```json
{
  "message": "角色更新成功",
  "role": {
    "id": 4,
    "name": "更新后的角色名",
    "description": "更新后的描述",
    "is_active": true,
    "permissions": [
      {
        "id": 1,
        "code": "user.list",
        "name": "查看用户列表",
        "description": "允许查看系统中所有用户的列表",
        "category": "user_management",
        "created_at": "2025-05-23T13:27:00Z"
      }
    ],
    "created_at": "2025-05-23T13:27:00Z",
    "updated_at": "2025-05-23T13:27:00Z"
  }
}
```

**权限要求：** `role.update` 或超级管理员

#### 删除角色
```http
DELETE /api/auth/roles/{role_id}/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "message": "角色删除成功"
}
```

**权限要求：** `role.delete` 或超级管理员

---

### 3. 用户角色管理接口

#### 获取用户角色
```http
GET /api/auth/users/{user_id}/roles/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "user_id": 1,
  "roles": [
    {
      "id": 1,
      "name": "超级管理员",
      "description": "拥有系统所有权限的管理员角色",
      "is_active": true,
      "permission_count": 22,
      "created_at": "2025-05-23T13:27:00Z",
      "updated_at": "2025-05-23T13:27:00Z"
    }
  ]
}
```

**权限要求：** `user.role.view` 或超级管理员

#### 给用户分配角色
```http
POST /api/auth/users/{user_id}/roles/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "roles": [1, 2]
}
```

**响应示例：**
```json
{
  "message": "角色分配成功",
  "user_id": 1,
  "roles": [
    {
      "id": 1,
      "name": "超级管理员",
      "description": "拥有系统所有权限的管理员角色",
      "is_active": true,
      "permission_count": 22,
      "created_at": "2025-05-23T13:27:00Z",
      "updated_at": "2025-05-23T13:27:00Z"
    }
  ]
}
```

**权限要求：** `user.role.assign` 或超级管理员

#### 修改用户角色
```http
PUT /api/auth/users/{user_id}/roles/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "roles": [2, 3]
}
```

**响应示例：** 同分配角色

**权限要求：** `user.role.assign` 或超级管理员

#### 移除用户的特定角色
```http
DELETE /api/auth/users/{user_id}/roles/{role_id}/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "message": "成功移除用户 user@example.com 的角色 普通管理员"
}
```

**权限要求：** `user.role.remove` 或超级管理员

---

### 4. 用户权限查询接口

#### 获取当前用户权限
```http
GET /api/auth/me/permissions/
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "permissions": [
    "user.list",
    "user.detail",
    "user.create",
    "user.update",
    "user.delete",
    "role.list",
    "role.detail",
    "role.create",
    "role.update",
    "role.delete",
    "permission.list",
    "permission.detail",
    "user.role.view",
    "user.role.assign",
    "user.role.remove",
    "schedule.list",
    "schedule.detail",
    "schedule.create",
    "schedule.update",
    "schedule.delete",
    "system.admin"
  ],
  "roles": [
    "超级管理员"
  ]
}
```

**权限要求：** 已认证用户

---

### 5. 用户列表接口（需要权限）

#### 获取用户列表
```http
GET /api/auth/users/?page=1&page_size=20
Authorization: Bearer <access_token>
```

**响应示例：**
```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "管理员",
      "last_name": "用户",
      "full_name": "管理员 用户",
      "short_name": "管理员",
      "date_joined": "2025-05-23T13:27:00Z",
      "last_login": "2025-05-23T14:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

**权限要求：** `user.list` 或超级管理员

---

## 错误响应

### 权限不足
```json
{
  "detail": "您没有权限执行此操作，需要权限: user.list"
}
```
**状态码：** 403 Forbidden

### 未认证
```json
{
  "detail": "认证信息未提供"
}
```
**状态码：** 401 Unauthorized

### 资源不存在
```json
{
  "detail": "未找到。"
}
```
**状态码：** 404 Not Found

### 验证错误
```json
{
  "permission_codes": [
    "以下权限代码不存在: invalid.permission"
  ]
}
```
**状态码：** 400 Bad Request

---

## 默认角色和权限

系统初始化时会创建以下默认角色：

### 1. 超级管理员
- **描述**: 拥有系统所有权限的管理员角色
- **权限**: 所有权限（22个）

### 2. 普通管理员
- **描述**: 普通管理员，拥有用户和角色管理权限
- **权限**: 
  - user.list, user.detail, user.create, user.update
  - role.list, role.detail
  - permission.list, permission.detail
  - user.role.view, user.role.assign

### 3. 普通用户
- **描述**: 普通用户角色，只能查看基本信息
- **权限**: 
  - schedule.list, schedule.detail

---

## 使用示例

### 1. 创建一个新角色并分配权限
```bash
# 1. 登录获取token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# 2. 创建角色
curl -X POST http://localhost:8000/api/auth/roles/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "船期管理员",
    "description": "负责船期管理的角色",
    "permission_codes": ["schedule.list", "schedule.detail", "schedule.create", "schedule.update"]
  }'
```

### 2. 给用户分配角色
```bash
# 给用户ID为2的用户分配角色ID为4的角色
curl -X POST http://localhost:8000/api/auth/users/2/roles/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"roles": [4]}'
```

### 3. 检查用户权限
```bash
# 获取当前用户的权限列表
curl -X GET http://localhost:8000/api/auth/me/permissions/ \
  -H "Authorization: Bearer <access_token>"
```

---

## 注意事项

1. **超级管理员权限**: 超级用户（is_superuser=True）拥有所有权限，无需通过角色分配
2. **权限继承**: 用户通过角色获得权限，一个用户可以拥有多个角色
3. **权限检查**: 所有需要权限的接口都会检查用户是否拥有相应权限
4. **角色删除限制**: 如果角色被用户使用，则无法删除该角色
5. **权限代码格式**: 权限代码采用 `模块.操作` 的格式，如 `user.list`、`role.create` 