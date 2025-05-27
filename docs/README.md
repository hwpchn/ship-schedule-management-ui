# 船舶时刻表系统 API 文档

本文档提供了船舶时刻表系统所有API接口的详细说明和使用指南。

## 📋 目录结构

```
api/
├── README.md                           # 本文档
├── 🏥 系统接口
│   └── health-check.md                # 健康检查API
├── 🔐 认证模块 (Authentication)
│   ├── auth-overview.md               # 认证模块概览
│   ├── user-registration.md           # 用户注册API
│   ├── user-login.md                  # 用户登录API
│   └── permissions.md                 # 权限管理API
└── 🚢 船舶调度模块 (Schedules)
    ├── vessel-schedules.md            # 船舶时刻表API
    ├── vessel-info.md                 # 船舶额外信息API
    ├── cabin-grouping.md              # 共舱分组API
    ├── cabin-config.md                # 共舱配置API
    ├── bulk-operations.md             # 批量操作API
    └── ui-edit-design.md              # 前端编辑功能设计方案
```

## 🚀 快速开始

### 基础信息
- **API Base URL**: `http://127.0.0.1:8000/api`
- **API版本**: v1.0.0
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {},
  "error": null
}
```

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## 🔑 认证流程

1. **用户注册**: `POST /api/auth/register/`
2. **用户登录**: `POST /api/auth/login/` (获取access_token)
3. **API调用**: 在请求头中添加 `Authorization: Bearer <access_token>`
4. **Token刷新**: `POST /api/auth/token/refresh/`

## 📚 API分类

### 🏥 系统接口
| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 健康检查 | GET | `/api/` | 检查API服务状态 |

### 🔐 认证模块 (Authentication)
| 功能分类 | 接口数量 | 说明 |
|----------|----------|------|
| 用户管理 | 3个 | 注册、登录、Token刷新 |
| 权限管理 | 1个 | 权限查询 |

### 🚢 船舶调度模块 (Schedules)
| 功能分类 | 接口数量 | 说明 |
|----------|----------|------|
| 船舶时刻表 | 4个 | CRUD操作、搜索统计 |
| 船舶额外信息 | 6个 | CRUD操作、批量操作 |
| 共舱功能 | 8个 | 分组查询、配置管理 |

## 🛡️ 权限系统

### 权限分类
- **船舶调度管理** (`vessel_schedule.*`)
- **船舶信息管理** (`vessel_info.*`)

### 权限检查
大部分API需要相应的权限才能访问，详细权限要求请查看各API文档。

## 📖 使用示例

### 1. 健康检查
```bash
curl -X GET "http://127.0.0.1:8000/api/"
```

### 2. 用户注册
```bash
curl -X POST "http://127.0.0.1:8000/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "张",
    "last_name": "三"
  }'
```

### 3. 用户登录
```bash
curl -X POST "http://127.0.0.1:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 4. 带认证的API调用
```bash
curl -X GET "http://127.0.0.1:8000/api/schedules/" \
  -H "Authorization: Bearer <your_access_token>"
```

## 🔧 测试工具

### 运行API测试
```bash
# 进入测试目录
cd tests/

# 运行API综合测试
python tests/api_full_test.py

# 或使用测试脚本
./run_api_test.sh

# 运行特定API测试
python tests/test_cabin_grouping_api.py
python tests/test_cabin_config_api.py
python tests/test_vessel_info_bulk_operations.py
```

### Postman集合
推荐使用Postman进行API测试，可以导入以下环境变量：
- `base_url`: `http://127.0.0.1:8000/api`
- `access_token`: `<your_access_token>`

## 📝 注意事项

1. **时间格式**: 所有时间字段使用ISO 8601格式 (`YYYY-MM-DDTHH:MM:SS+08:00`)
2. **分页**: 列表接口支持分页，使用`page`和`page_size`参数
3. **过滤**: 支持多种过滤参数，详见各API文档
4. **排序**: 使用`ordering`参数进行排序
5. **中文支持**: 所有接口完全支持中文字符
6. **错误处理**: 详细的错误信息和状态码

## 🚨 错误码参考

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 📞 支持联系

如有API使用问题，请：
1. 查看相关API文档
2. 运行对应的测试文件
3. 检查错误日志
4. 联系开发团队

---

**最后更新**: 2025年5月25日  
**API版本**: v1.0.0  
**维护团队**: 船舶时刻表项目组
