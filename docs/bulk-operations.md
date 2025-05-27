# 批量操作API

## 概览

批量操作API提供了对船舶额外信息(VesselInfoFromCompany)的批量查询、创建、更新和删除功能，支持一次操作多条记录，大幅提高数据处理效率。适用于批量导入、更新和维护船舶信息的场景。

## 接口列表

| 接口名称 | 方法 | 路径 | 说明 |
|---------|-----|------|------|
| 批量查询 | GET | `/api/vessel-info/bulk-query/` | 根据条件批量查询船舶额外信息 |
| 批量创建 | POST | `/api/vessel-info/bulk-create/` | 批量创建船舶额外信息记录 |
| 批量更新 | PATCH | `/api/vessel-info/bulk-update/` | 批量更新船舶额外信息记录 |
| 批量删除 | DELETE | `/api/vessel-info/bulk-delete/` | 批量删除船舶额外信息记录 |

## 详细API说明

### 1. 批量查询 API

#### 基本信息
- **URL**: `/api/vessel-info/bulk-query/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.list` 或 `vessel_info_list`

#### 请求参数

**查询参数 (Query Parameters)**

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `queries` | JSON字符串 | ✅ | 查询条件数组 | `[{"polCd":"CNSHA","podCd":"USNYC"}]` |
| `fields` | string | ❌ | 返回字段(逗号分隔) | `id,vessel,voyage,price` |
| `page` | integer | ❌ | 页码 | `1` |
| `page_size` | integer | ❌ | 每页记录数 | `10` |

**查询条件格式**

`queries`参数应是JSON格式的数组，每个元素包含一组查询条件：

```json
[
  {
    "polCd": "CNSHA",
    "podCd": "USNYC",
    "vessel": "EVER GIVEN"
  },
  {
    "polCd": "CNSHK",
    "podCd": "THBKK"
  }
]
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "批量查询成功",
  "data": {
    "count": 2,
    "next": null,
    "previous": null,
    "results": [
      {
        "query_index": 0,
        "matches": [
          {
            "id": 1,
            "polCd": "CNSHA",
            "podCd": "USNYC",
            "vessel": "EVER GIVEN",
            "voyage": "2501E",
            "carriercd": "ONE",
            "price": 4200.00,
            "gp_20": "10",
            "hq_40": "5",
            "cut_off_time": "2025-06-10"
          }
        ],
        "count": 1
      },
      {
        "query_index": 1,
        "matches": [
          {
            "id": 2,
            "polCd": "CNSHK",
            "podCd": "THBKK",
            "vessel": "COSCO ASIA",
            "voyage": "001N",
            "carriercd": "COS",
            "price": 3800.00,
            "gp_20": "15",
            "hq_40": "8",
            "cut_off_time": "2025-06-15"
          }
        ],
        "count": 1
      }
    ]
  }
}
```

### 2. 批量创建 API

#### 基本信息
- **URL**: `/api/vessel-info/bulk-create/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.create` 或 `vessel_info_create`

#### 请求体

```json
{
  "data": [
    {
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "carriercd": "ONE",
      "price": 4200.00,
      "gp_20": "10",
      "hq_40": "5",
      "cut_off_time": "2025-06-10"
    },
    {
      "polCd": "CNSHK",
      "podCd": "THBKK",
      "vessel": "COSCO ASIA",
      "voyage": "001N",
      "carriercd": "COS",
      "price": 3800.00,
      "gp_20": "15",
      "hq_40": "8",
      "cut_off_time": "2025-06-15"
    }
  ]
}
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "批量创建完成: 2/2 成功",
  "data": {
    "created": [
      {
        "index": 0,
        "success": true,
        "data": {
          "id": 1,
          "polCd": "CNSHA",
          "podCd": "USNYC",
          "vessel": "EVER GIVEN",
          "voyage": "2501E",
          "carriercd": "ONE",
          "price": 4200.00,
          "gp_20": "10",
          "hq_40": "5",
          "cut_off_time": "2025-06-10"
        }
      },
      {
        "index": 1,
        "success": true,
        "data": {
          "id": 2,
          "polCd": "CNSHK",
          "podCd": "THBKK",
          "vessel": "COSCO ASIA",
          "voyage": "001N",
          "carriercd": "COS",
          "price": 3800.00,
          "gp_20": "15",
          "hq_40": "8",
          "cut_off_time": "2025-06-15"
        }
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

### 3. 批量更新 API

#### 基本信息
- **URL**: `/api/vessel-info/bulk-update/`
- **方法**: `PATCH`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.update` 或 `vessel_info_update`

#### 请求体

```json
{
  "data": [
    {
      "carriercd": "ONE",
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E",
      "price": 4500.00,
      "gp_20": "8"
    },
    {
      "carriercd": "COS",
      "polCd": "CNSHK",
      "podCd": "THBKK",
      "vessel": "COSCO ASIA",
      "voyage": "001N",
      "price": 4000.00,
      "hq_40": "10"
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
          "id": 1,
          "polCd": "CNSHA",
          "podCd": "USNYC",
          "vessel": "EVER GIVEN",
          "voyage": "2501E",
          "carriercd": "ONE",
          "price": 4500.00,
          "gp_20": "8",
          "hq_40": "5",
          "cut_off_time": "2025-06-10"
        }
      },
      {
        "index": 1,
        "success": true,
        "data": {
          "id": 2,
          "polCd": "CNSHK",
          "podCd": "THBKK",
          "vessel": "COSCO ASIA",
          "voyage": "001N",
          "carriercd": "COS",
          "price": 4000.00,
          "gp_20": "15",
          "hq_40": "10",
          "cut_off_time": "2025-06-15"
        }
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

### 4. 批量删除 API

#### 基本信息
- **URL**: `/api/vessel-info/bulk-delete/`
- **方法**: `DELETE`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.delete` 或 `vessel_info_delete`

#### 请求体

```json
{
  "items": [
    {
      "carriercd": "ONE",
      "polCd": "CNSHA",
      "podCd": "USNYC",
      "vessel": "EVER GIVEN",
      "voyage": "2501E"
    },
    {
      "carriercd": "COS",
      "polCd": "CNSHK",
      "podCd": "THBKK",
      "vessel": "COSCO ASIA",
      "voyage": "001N"
    }
  ]
}
```

或直接通过ID删除:

```json
{
  "item_ids": [1, 2, 3]
}
```

#### 响应格式

**成功响应 (200 OK)**

```json
{
  "success": true,
  "message": "批量删除完成: 2/2 成功",
  "data": {
    "deleted": [
      {
        "index": 0,
        "success": true,
        "data": {
          "id": 1,
          "polCd": "CNSHA",
          "podCd": "USNYC",
          "vessel": "EVER GIVEN",
          "voyage": "2501E",
          "carriercd": "ONE"
        }
      },
      {
        "index": 1,
        "success": true,
        "data": {
          "id": 2,
          "polCd": "CNSHK",
          "podCd": "THBKK",
          "vessel": "COSCO ASIA",
          "voyage": "001N",
          "carriercd": "COS"
        }
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

## 字段说明

VesselInfoFromCompany模型的主要字段：

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `polCd` | string | ✅ | 起运港代码 |
| `podCd` | string | ✅ | 目的港代码 |
| `vessel` | string | ✅ | 船名 |
| `voyage` | string | ✅ | 航次 |
| `carriercd` | string | ✅ | 承运人代码 |
| `price` | decimal | ❌ | 价格 |
| `gp_20` | string | ❌ | 20尺普柜现舱量 |
| `hq_40` | string | ❌ | 40尺高柜现舱量 |
| `gp_40` | string | ❌ | 40尺普柜现舱量 |
| `hq_20` | string | ❌ | 20尺高柜现舱量 |
| `ot_20` | string | ❌ | 20尺开顶柜现舱量 |
| `ot_40` | string | ❌ | 40尺开顶柜现舱量 |
| `rf_20` | string | ❌ | 20尺冷藏柜现舱量 |
| `rf_40` | string | ❌ | 40尺冷藏柜现舱量 |
| `cut_off_time` | string | ❌ | 截关时间 |
| `remark` | string | ❌ | 备注 |

## 使用示例

### 批量查询示例

```javascript
// 批量查询示例
const bulkQuery = async () => {
  const queries = [
    { polCd: 'CNSHA', podCd: 'USNYC' },
    { polCd: 'CNSHK', podCd: 'THBKK' }
  ];
  
  const params = new URLSearchParams({
    queries: JSON.stringify(queries),
    fields: 'id,vessel,voyage,price,gp_20,hq_40',
    page: 1,
    page_size: 10
  });
  
  const response = await fetch(`/api/vessel-info/bulk-query/?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### 批量创建示例

```python
import requests

def bulk_create(token, vessel_info_data):
    """批量创建船舶额外信息"""
    url = "http://127.0.0.1:8000/api/vessel-info/bulk-create/"
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'data': vessel_info_data
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# 使用示例
token = "your_access_token"
data_to_create = [
    {
        "polCd": "CNSHA",
        "podCd": "USNYC",
        "vessel": "EVER GIVEN",
        "voyage": "2501E",
        "carriercd": "ONE",
        "price": 4200.00,
        "gp_20": "10",
        "hq_40": "5"
    },
    # 更多记录...
]

result = bulk_create(token, data_to_create)
print(f"成功创建: {result['data']['summary']['success_count']} 条记录")
```

## 错误处理

### 权限错误 (403 Forbidden)
```json
{
  "success": false,
  "message": "没有权限创建船舶额外信息",
  "data": null
}
```

### 请求格式错误 (400 Bad Request)
```json
{
  "success": false,
  "message": "data字段必须是数组格式",
  "data": null
}
```

### 批量操作限制错误 (400 Bad Request)
```json
{
  "success": false,
  "message": "一次最多创建100条记录",
  "data": null
}
```

## 性能考虑

- 批量操作API支持一次处理多达100条记录
- 批量操作使用事务保证数据一致性
- 返回详细的成功/失败记录，便于客户端处理
- 支持字段筛选减少数据传输量

## 相关测试

相关测试文件: `tests/test_vessel_info_bulk_operations.py`

```python
# 测试用例示例
def test_bulk_query():
    # 测试批量查询API

def test_bulk_create():
    # 测试批量创建API

def test_bulk_update():
    # 测试批量更新API

def test_bulk_delete():
    # 测试批量删除API
```

---

**最后更新**: 2025年5月25日  
**相关API**: [船舶信息API](vessel-info.md), [共舱配置API](cabin-config.md) 