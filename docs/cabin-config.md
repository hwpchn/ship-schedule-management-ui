# 共舱配置API

## 概览

共舱配置API提供了对船舶共舱设置的详细管理功能，支持查询、更新、删除和批量操作。共舱配置存储在VesselSchedule模型的shareCabins字段中，以JSON格式记录不同船公司的共舱信息。

## 接口列表

| 接口名称 | 方法 | 路径 | 说明 |
|---------|-----|------|------|
| 配置详情 | GET | `/api/cabin-config/detail/` | 获取单个航线的共舱配置详情 |
| 配置更新 | PUT/PATCH | `/api/cabin-config/update/` | 更新航线的共舱配置 |
| 配置删除 | DELETE | `/api/cabin-config/delete/` | 删除航线的共舱配置 |
| 批量更新 | POST | `/api/cabin-config/bulk-update/` | 批量更新多个航线的共舱配置 |

## 详细API说明

### 1. 配置详情 API

#### 基本信息
- **URL**: `/api/cabin-config/detail/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_schedule_detail` 或 `schedules.view_vesselschedule`

#### 请求参数

**查询参数 (Query Parameters)**

可以通过schedule_id查询，或者使用组合字段查询：

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `schedule_id` | integer | ❌ | 航线ID | `123` |
| `polCd` | string | ❓ | 起运港代码(如无schedule_id则必需) | `CNSHA` |
| `podCd` | string | ❓ | 目的港代码(如无schedule_id则必需) | `USNYC` |
| `vessel` | string | ❓ | 船名(如无schedule_id则必需) | `EVER GIVEN` |
| `voyage` | string | ❓ | 航次(如无schedule_id则必需) | `2501E` |

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "共舱配置获取成功",
  "data": {
    "schedule_id": 123,
    "schedule_info": {
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "carriercd": "ONE",
      "routeEtd": "3",
      "eta": "2025-06-15",
      "etd": "2025-06-10"
    },
    "share_cabins_config": [
      {
        "carrierCd": "ONE",
        "price": 4200.00,
        "available": true,
        "remark": "主要承运商"
      },
      {
        "carrierCd": "MSK",
        "price": 4500.00,
        "available": true,
        "remark": "共舱承运商"
      }
    ],
    "carrier_count": 2
  }
}
```

**错误响应 (404 Not Found)**

```json
{
  "success": false,
  "message": "航线记录不存在: 123",
  "data": null
}
```

### 2. 配置更新 API

#### 基本信息
- **URL**: `/api/cabin-config/update/`
- **方法**: `PUT` (完全替换) / `PATCH` (部分更新)
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_schedule_update` 或 `schedules.change_vesselschedule`

#### 请求体

```json
{
  "schedule_id": 123,  // 或者使用组合字段
  "share_cabins_config": [
    {
      "carrierCd": "ONE",
      "price": 4200.00,
      "available": true,
      "remark": "主要承运商"
    },
    {
      "carrierCd": "MSK",
      "price": 4500.00,
      "available": true,
      "remark": "共舱承运商"
    }
  ]
}
```

或者使用组合字段：

```json
{
  "polCd": "CNSHA",
  "podCd": "USNYC",
  "vessel": "EVER GIVEN",
  "voyage": "2501E",
  "share_cabins_config": [...]
}
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "共舱配置更新成功",
  "data": {
    "schedule_id": 123,
    "schedule_info": {
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "carriercd": "ONE"
    },
    "share_cabins_config": [...],
    "carrier_count": 2,
    "update_method": "replace",
    "replaced_items": [...]
  }
}
```

### 3. 配置删除 API

#### 基本信息
- **URL**: `/api/cabin-config/delete/`
- **方法**: `DELETE`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_schedule_update` 或 `schedules.change_vesselschedule`

#### 请求体

```json
{
  "schedule_id": 123,  // 或者使用组合字段
  "carrier_codes": ["ONE", "MSK"]  // 要删除的船公司代码，如果为空则删除全部
}
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "共舱配置删除成功: 删除了2项配置",
  "data": {
    "schedule_id": 123,
    "schedule_info": {
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "carriercd": "ONE"
    },
    "deleted_items": [...],
    "remaining_config": [...],
    "remaining_count": 0
  }
}
```

### 4. 批量更新 API

#### 基本信息
- **URL**: `/api/cabin-config/bulk-update/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_schedule_update` 或 `schedules.change_vesselschedule`

#### 请求体

```json
{
  "updates": [
    {
      "schedule_id": 123,  // 或者使用组合字段
      "share_cabins_config": [...],
      "update_method": "replace"  // "replace" 或 "merge"
    },
    {
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "share_cabins_config": [...],
      "update_method": "merge"
    }
  ]
}
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "批量更新完成: 2/2 成功",
  "data": {
    "updated": [
      {
        "index": 0,
        "success": true,
        "data": {
          "schedule_id": 123,
          "schedule_info": {...},
          "share_cabins_config": [...],
          "carrier_count": 2
        }
      },
      {
        "index": 1,
        "success": true,
        "data": {...}
      }
    ],
    "failed": [],
    "summary": {
      "total_requests": 2,
      "success_count": 2,
      "failed_count": 0
    }
  }
}
```

## 共舱配置字段说明

共舱配置(`share_cabins_config`)是一个JSON数组，每个元素代表一个船公司的共舱信息：

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `carrierCd` | string | ✅ | 船公司代码 |
| `routeCd` | string | ❌ | 航线代码 |
| `price` | decimal | ❌ | 价格 |
| `available` | boolean | ❌ | 是否可用 |
| `remark` | string | ❌ | 备注信息 |

## 使用示例

### cURL

#### 获取共舱配置
```bash
curl -X GET "http://127.0.0.1:8000/api/cabin-config/detail/?schedule_id=123" \
  -H "Authorization: Bearer <your_access_token>"
```

#### 更新共舱配置
```bash
curl -X PUT "http://127.0.0.1:8000/api/cabin-config/update/" \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": 123,
    "share_cabins_config": [
      {
        "carrierCd": "ONE",
        "price": 4200.00,
        "available": true
      },
      {
        "carrierCd": "MSK",
        "price": 4500.00,
        "available": true
      }
    ]
  }'
```

## 错误处理

### 权限错误 (403 Forbidden)
```json
{
  "success": false,
  "message": "没有权限查看共舱配置",
  "data": null
}
```

### 参数错误 (400 Bad Request)
```json
{
  "success": false,
  "message": "缺少必需参数: schedule_id 或 (polCd, podCd, vessel, voyage)",
  "data": null
}
```

### 内部错误 (500 Internal Server Error)
```json
{
  "success": false,
  "message": "更新共舱配置失败: ...",
  "data": null
}
```

## 相关测试

相关测试文件: `tests/test_cabin_config_api.py`

```python
# 测试用例示例
def test_cabin_config_detail():
    # 测试共舱配置详情API

def test_cabin_config_update():
    # 测试共舱配置更新API

def test_cabin_config_delete():
    # 测试共舱配置删除API

def test_cabin_config_bulk_update():
    # 测试批量更新API
```

---

**最后更新**: 2025年5月25日  
**相关API**: [船舶航线API](vessel-schedules.md), [共舱分组API](cabin-grouping.md) 