# 船舶信息API

## 概览

船舶信息API提供船舶额外信息的完整管理功能，包括价格、舱位数量、备注等扩展信息的CRUD操作。该API与船舶时刻表系统紧密集成，为共舱分组功能提供现舱状态和价格数据支持。

## 接口信息

### 基础CRUD接口
- **列表/创建**: `/api/vessel-info/` (GET/POST)
- **详情/更新/删除**: `/api/vessel-info/{id}/` (GET/PUT/PATCH/DELETE)

### 扩展功能接口
- **批量创建**: `/api/vessel-info/bulk-create/` (POST)
- **批量更新**: `/api/vessel-info/bulk-update/` (POST)
- **批量删除**: `/api/vessel-info/bulk-delete/` (POST)

## 船舶信息列表API

### 接口信息
- **URL**: `/api/vessel-info/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.list` 或已登录用户

### 请求参数

#### 查询参数 (Query Parameters)

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `page` | integer | ❌ | 页码，默认1 | `1` |
| `page_size` | integer | ❌ | 每页数量，默认20 | `20` |
| `schedule_id` | integer | ❌ | 时刻表ID过滤 | `1001` |
| `carrier_cd` | string | ❌ | 船司代码过滤 | `ASL` |
| `vessel` | string | ❌ | 船舶名称过滤 | `EVER` |
| `pol_cd` | string | ❌ | 起运港代码过滤 | `CNSHK` |
| `pod_cd` | string | ❌ | 目的港代码过滤 | `THBKK` |
| `has_price` | boolean | ❌ | 是否有价格信息 | `true` |
| `has_gp_20` | boolean | ❌ | 是否有20尺现舱 | `true` |
| `has_hq_40` | boolean | ❌ | 是否有40尺现舱 | `true` |
| `price_min` | decimal | ❌ | 最低价格 | `1000` |
| `price_max` | decimal | ❌ | 最高价格 | `2000` |
| `ordering` | string | ❌ | 排序字段 | `price`, `-price`, `created_at` |

### 请求示例

```
GET /api/vessel-info/?carrier_cd=ASL&has_price=true&page=1&page_size=10&ordering=-price
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "count": 85,
  "next": "http://127.0.0.1:8000/api/vessel-info/?page=2&carrier_cd=ASL&has_price=true",
  "previous": null,
  "results": [
    {
      "id": 101,
      "schedule": {
        "id": 1001,
        "vessel": "EVER GIVEN",
        "voyage": "001N",
        "pol_cd": "CNSHK",
        "pod_cd": "THBKK",
        "pol": "SHEKOU",
        "pod": "BANGKOK",
        "eta": "2025-06-15T14:00:00+08:00",
        "etd": "2025-06-10T09:00:00+08:00",
        "carrier_cd": "ASL"
      },
      "price": 1500.00,
      "gp_20": "10",
      "hq_40": "5",
      "gp_40": "",
      "hq_20": "",
      "ot_20": "",
      "ot_40": "",
      "rf_20": "",
      "rf_40": "",
      "remarks": "舱位充足，价格优惠",
      "is_active": true,
      "created_at": "2025-05-25T08:00:00+08:00",
      "updated_at": "2025-05-25T08:30:00+08:00"
    }
  ]
}
```

### 响应字段说明

#### 分页信息
| 字段 | 类型 | 说明 |
|------|------|------|
| `count` | integer | 总记录数 |
| `next` | string | 下一页URL，无下一页时为null |
| `previous` | string | 上一页URL，无上一页时为null |
| `results` | array | 当前页数据列表 |

#### 船舶信息字段 (results[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 船舶信息唯一标识 |
| `schedule` | object | 关联的时刻表信息 |
| `price` | decimal | 舱位价格（可为null） |
| `gp_20` | string | 20尺普柜现舱数量 |
| `hq_40` | string | 40尺高柜现舱数量 |
| `gp_40` | string | 40尺普柜现舱数量 |
| `hq_20` | string | 20尺高柜现舱数量 |
| `ot_20` | string | 20尺开顶柜现舱数量 |
| `ot_40` | string | 40尺开顶柜现舱数量 |
| `rf_20` | string | 20尺冷藏柜现舱数量 |
| `rf_40` | string | 40尺冷藏柜现舱数量 |
| `remarks` | string | 备注信息 |
| `is_active` | boolean | 是否有效 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

#### 时刻表信息 (schedule)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 时刻表ID |
| `vessel` | string | 船舶名称 |
| `voyage` | string | 航次号 |
| `pol_cd` | string | 起运港代码 |
| `pod_cd` | string | 目的港代码 |
| `pol` | string | 起运港名称 |
| `pod` | string | 目的港名称 |
| `eta` | datetime | 预计到达时间 |
| `etd` | datetime | 预计开船时间 |
| `carrier_cd` | string | 主船司代码 |

## 创建船舶信息API

### 接口信息
- **URL**: `/api/vessel-info/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.create`

### 请求参数

#### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 | 限制 |
|------|------|------|------|------|
| `schedule_id` | integer | ✅ | 关联的时刻表ID | 必须存在 |
| `price` | decimal | ❌ | 舱位价格 | 大于0，最多2位小数 |
| `gp_20` | string | ❌ | 20尺普柜现舱数量 | 最大50字符 |
| `hq_40` | string | ❌ | 40尺高柜现舱数量 | 最大50字符 |
| `gp_40` | string | ❌ | 40尺普柜现舱数量 | 最大50字符 |
| `hq_20` | string | ❌ | 20尺高柜现舱数量 | 最大50字符 |
| `ot_20` | string | ❌ | 20尺开顶柜现舱数量 | 最大50字符 |
| `ot_40` | string | ❌ | 40尺开顶柜现舱数量 | 最大50字符 |
| `rf_20` | string | ❌ | 20尺冷藏柜现舱数量 | 最大50字符 |
| `rf_40` | string | ❌ | 40尺冷藏柜现舱数量 | 最大50字符 |
| `remarks` | string | ❌ | 备注信息 | 最大500字符 |
| `is_active` | boolean | ❌ | 是否有效 | 默认true |

### 请求示例

```json
{
  "schedule_id": 1002,
  "price": 1800.00,
  "gp_20": "15",
  "hq_40": "8",
  "gp_40": "5",
  "remarks": "价格含基本港费，舱位紧张时价格可能上调",
  "is_active": true
}
```

### 成功响应 (201 Created)

```json
{
  "message": "船舶信息创建成功",
  "data": {
    "id": 102,
    "schedule": {
      "id": 1002,
      "vessel": "EVER FORWARD",
      "voyage": "002N",
      "pol_cd": "CNSHK",
      "pod_cd": "THBKK",
      "pol": "SHEKOU",
      "pod": "BANGKOK",
      "eta": "2025-06-20T14:00:00+08:00",
      "etd": "2025-06-15T09:00:00+08:00",
      "carrier_cd": "ASL"
    },
    "price": 1800.00,
    "gp_20": "15",
    "hq_40": "8",
    "gp_40": "5",
    "hq_20": "",
    "ot_20": "",
    "ot_40": "",
    "rf_20": "",
    "rf_40": "",
    "remarks": "价格含基本港费，舱位紧张时价格可能上调",
    "is_active": true,
    "created_at": "2025-05-25T09:00:00+08:00",
    "updated_at": "2025-05-25T09:00:00+08:00"
  }
}
```

## 船舶信息详情API

### 接口信息
- **URL**: `/api/vessel-info/{id}/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.detail` 或已登录用户

### 请求示例

```
GET /api/vessel-info/101/
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

响应格式与创建成功响应相同。

## 更新船舶信息API

### 接口信息
- **URL**: `/api/vessel-info/{id}/`
- **方法**: `PUT` (完整更新) 或 `PATCH` (部分更新)
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.update`

### 请求示例 (PATCH)

```json
{
  "price": 1600.00,
  "gp_20": "12",
  "hq_40": "6",
  "remarks": "价格调整，舱位有所减少"
}
```

### 成功响应 (200 OK)

```json
{
  "message": "船舶信息更新成功",
  "data": {
    "id": 101,
    "schedule": {
      "id": 1001,
      "vessel": "EVER GIVEN",
      "voyage": "001N",
      "pol_cd": "CNSHK",
      "pod_cd": "THBKK",
      "pol": "SHEKOU",
      "pod": "BANGKOK",
      "eta": "2025-06-15T14:00:00+08:00",
      "etd": "2025-06-10T09:00:00+08:00",
      "carrier_cd": "ASL"
    },
    "price": 1600.00,
    "gp_20": "12",
    "hq_40": "6",
    "gp_40": "",
    "hq_20": "",
    "ot_20": "",
    "ot_40": "",
    "rf_20": "",
    "rf_40": "",
    "remarks": "价格调整，舱位有所减少",
    "is_active": true,
    "created_at": "2025-05-25T08:00:00+08:00",
    "updated_at": "2025-05-25T09:15:00+08:00"
  }
}
```

## 删除船舶信息API

### 接口信息
- **URL**: `/api/vessel-info/{id}/`
- **方法**: `DELETE`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.delete`

### 请求示例

```
DELETE /api/vessel-info/101/
Authorization: Bearer <your_access_token>
```

### 成功响应 (204 No Content)

删除成功，无响应体内容。

## 批量创建API

### 接口信息
- **URL**: `/api/vessel-info/bulk-create/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.create`

### 请求参数

#### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `vessel_infos` | array | ✅ | 船舶信息数组，每个元素包含创建单条记录所需的字段 |

### 请求示例

```json
{
  "vessel_infos": [
    {
      "schedule_id": 1003,
      "price": 1700.00,
      "gp_20": "20",
      "hq_40": "10",
      "remarks": "新增航线，价格优惠"
    },
    {
      "schedule_id": 1004,
      "price": 1900.00,
      "gp_20": "8",
      "hq_40": "12",
      "remarks": "热门航线，舱位紧张"
    }
  ]
}
```

### 成功响应 (201 Created)

```json
{
  "message": "批量创建成功",
  "data": {
    "created_count": 2,
    "failed_count": 0,
    "created_ids": [103, 104],
    "errors": []
  }
}
```

### 部分成功响应 (207 Multi-Status)

```json
{
  "message": "批量创建部分成功",
  "data": {
    "created_count": 1,
    "failed_count": 1,
    "created_ids": [103],
    "errors": [
      {
        "index": 1,
        "schedule_id": 1004,
        "error": "具有 时刻表 的 船舶额外信息 已存在。"
      }
    ]
  }
}
```

## 批量更新API

### 接口信息
- **URL**: `/api/vessel-info/bulk-update/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.update`

### 请求参数

#### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `updates` | array | ✅ | 更新信息数组，每个元素包含id和要更新的字段 |

### 请求示例

```json
{
  "updates": [
    {
      "id": 101,
      "price": 1650.00,
      "gp_20": "15"
    },
    {
      "id": 102,
      "price": 1750.00,
      "hq_40": "6"
    }
  ]
}
```

### 成功响应 (200 OK)

```json
{
  "message": "批量更新成功",
  "data": {
    "updated_count": 2,
    "failed_count": 0,
    "updated_ids": [101, 102],
    "errors": []
  }
}
```

## 批量删除API

### 接口信息
- **URL**: `/api/vessel-info/bulk-delete/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `vessel_info.delete`

### 请求参数

#### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `ids` | array | ✅ | 要删除的船舶信息ID列表 |

### 请求示例

```json
{
  "ids": [103, 104, 105]
}
```

### 成功响应 (200 OK)

```json
{
  "message": "批量删除成功",
  "data": {
    "deleted_count": 3,
    "failed_count": 0,
    "deleted_ids": [103, 104, 105],
    "errors": []
  }
}
```

## 使用示例

### JavaScript (Fetch API)

```javascript
// 船舶信息管理类
class VesselInfoManager {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'http://127.0.0.1:8000/api';
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getVesselInfos(filters = {}) {
    """获取船舶信息列表"""
    const params = new URLSearchParams(filters);
    const url = `${this.baseUrl}/vessel-info/?${params}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('获取船舶信息失败:', error);
      throw error;
    }
  }

  async createVesselInfo(vesselInfoData) {
    """创建船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(vesselInfoData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('船舶信息创建成功:', result.data.schedule.vessel);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('创建船舶信息失败:', error);
      throw error;
    }
  }

  async updateVesselInfo(vesselInfoId, updateData) {
    """更新船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/${vesselInfoId}/`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('船舶信息更新成功:', result.data.schedule.vessel);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('更新船舶信息失败:', error);
      throw error;
    }
  }

  async deleteVesselInfo(vesselInfoId) {
    """删除船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/${vesselInfoId}/`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (response.ok || response.status === 204) {
        console.log('船舶信息删除成功');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('删除船舶信息失败:', error);
      throw error;
    }
  }

  async bulkCreateVesselInfos(vesselInfos) {
    """批量创建船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/bulk-create/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ vessel_infos: vesselInfos })
      });

      if (response.ok || response.status === 207) {
        const result = await response.json();
        console.log(`批量创建完成: 成功 ${result.data.created_count}, 失败 ${result.data.failed_count}`);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('批量创建船舶信息失败:', error);
      throw error;
    }
  }

  async bulkUpdateVesselInfos(updates) {
    """批量更新船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/bulk-update/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ updates: updates })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`批量更新完成: 成功 ${result.data.updated_count}, 失败 ${result.data.failed_count}`);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('批量更新船舶信息失败:', error);
      throw error;
    }
  }

  async bulkDeleteVesselInfos(ids) {
    """批量删除船舶信息"""
    try {
      const response = await fetch(`${this.baseUrl}/vessel-info/bulk-delete/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ ids: ids })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`批量删除完成: 成功 ${result.data.deleted_count}, 失败 ${result.data.failed_count}`);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('批量删除船舶信息失败:', error);
      throw error;
    }
  }
}

// 使用示例
const accessToken = localStorage.getItem('access_token');
const vesselInfoManager = new VesselInfoManager(accessToken);

// 获取船舶信息列表
vesselInfoManager.getVesselInfos({
  carrier_cd: 'ASL',
  has_price: true,
  page: 1,
  page_size: 10
}).then(data => {
  console.log(`获取到 ${data.count} 条船舶信息记录`);
  data.results.forEach(info => {
    console.log(`${info.schedule.vessel}: 价格 $${info.price}, 20尺现舱 ${info.gp_20}`);
  });
});

// 创建新船舶信息
const newVesselInfo = {
  schedule_id: 1005,
  price: 1750.00,
  gp_20: '18',
  hq_40: '9',
  remarks: '新增价格信息'
};

vesselInfoManager.createVesselInfo(newVesselInfo)
  .then(info => {
    console.log('新船舶信息创建成功:', info.id);
  })
  .catch(error => {
    console.error('创建失败:', error);
  });

// 批量创建示例
const batchData = [
  {
    schedule_id: 1006,
    price: 1800.00,
    gp_20: '15',
    hq_40: '7'
  },
  {
    schedule_id: 1007,
    price: 1650.00,
    gp_20: '20',
    hq_40: '10'
  }
];

vesselInfoManager.bulkCreateVesselInfos(batchData)
  .then(result => {
    console.log('批量创建结果:', result);
    if (result.errors.length > 0) {
      console.log('创建失败的记录:', result.errors);
    }
  })
  .catch(error => {
    console.error('批量创建失败:', error);
  });
```

### Python使用示例

```python
import requests
import json

class VesselInfoManager:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "http://127.0.0.1:8000/api"
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_vessel_infos(self, **filters):
        """获取船舶信息列表"""
        try:
            response = requests.get(
                f"{self.base_url}/vessel-info/",
                headers=self.headers,
                params=filters
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"获取船舶信息失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def create_vessel_info(self, vessel_info_data):
        """创建船舶信息"""
        try:
            response = requests.post(
                f"{self.base_url}/vessel-info/",
                headers=self.headers,
                json=vessel_info_data
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"船舶信息创建成功: {result['data']['schedule']['vessel']}")
                return result['data']
            else:
                error_data = response.json()
                print(f"创建船舶信息失败: {error_data}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def bulk_create_vessel_infos(self, vessel_infos):
        """批量创建船舶信息"""
        try:
            response = requests.post(
                f"{self.base_url}/vessel-info/bulk-create/",
                headers=self.headers,
                json={'vessel_infos': vessel_infos}
            )
            
            if response.status_code in [201, 207]:
                result = response.json()
                print(f"批量创建完成: 成功 {result['data']['created_count']}, 失败 {result['data']['failed_count']}")
                return result['data']
            else:
                error_data = response.json()
                print(f"批量创建失败: {error_data}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def bulk_update_vessel_infos(self, updates):
        """批量更新船舶信息"""
        try:
            response = requests.post(
                f"{self.base_url}/vessel-info/bulk-update/",
                headers=self.headers,
                json={'updates': updates}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"批量更新完成: 成功 {result['data']['updated_count']}, 失败 {result['data']['failed_count']}")
                return result['data']
            else:
                error_data = response.json()
                print(f"批量更新失败: {error_data}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None

# 使用示例
def main():
    access_token = "your_access_token_here"
    vim = VesselInfoManager(access_token)
    
    # 获取船舶信息列表
    print("📋 获取船舶信息列表...")
    vessel_infos = vim.get_vessel_infos(
        has_price=True,
        page_size=5
    )
    
    if vessel_infos:
        print(f"共找到 {vessel_infos['count']} 条记录")
        for info in vessel_infos['results']:
            schedule = info['schedule']
            print(f"  {schedule['vessel']} ({schedule['voyage']})")
            print(f"    价格: ${info['price']}")
            print(f"    20尺现舱: {info['gp_20']}, 40尺现舱: {info['hq_40']}")
    
    # 批量创建船舶信息
    print("\n📦 批量创建船舶信息...")
    batch_data = [
        {
            'schedule_id': 1008,
            'price': 1700.00,
            'gp_20': '15',
            'hq_40': '8',
            'remarks': '批量导入测试数据1'
        },
        {
            'schedule_id': 1009,
            'price': 1850.00,
            'gp_20': '12',
            'hq_40': '6',
            'remarks': '批量导入测试数据2'
        }
    ]
    
    result = vim.bulk_create_vessel_infos(batch_data)
    if result:
        print(f"成功创建 {result['created_count']} 条记录")
        if result['errors']:
            print("失败记录:")
            for error in result['errors']:
                print(f"  索引 {error['index']}: {error['error']}")
    
    # 批量更新船舶信息
    print("\n🔄 批量更新船舶信息...")
    update_data = [
        {
            'id': 101,
            'price': 1650.00,
            'gp_20': '18'
        },
        {
            'id': 102,
            'price': 1750.00,
            'hq_40': '9'
        }
    ]
    
    result = vim.bulk_update_vessel_infos(update_data)
    if result:
        print(f"成功更新 {result['updated_count']} 条记录")

if __name__ == "__main__":
    main()
```

### Vue.js组件示例

```vue
<template>
  <div class="vessel-info-management">
    <h2>船舶信息管理</h2>
    
    <!-- 搜索过滤 -->
    <div class="search-filters">
      <div class="filter-group">
        <label>船司代码:</label>
        <input v-model="filters.carrier_cd" placeholder="如: ASL" />
      </div>
      <div class="filter-group">
        <label>船舶名称:</label>
        <input v-model="filters.vessel" placeholder="如: EVER" />
      </div>
      <div class="filter-group">
        <label>是否有价格:</label>
        <select v-model="filters.has_price">
          <option value="">全部</option>
          <option value="true">有价格</option>
          <option value="false">无价格</option>
        </select>
      </div>
      <button @click="loadVesselInfos" :disabled="loading">
        {{ loading ? '查询中...' : '查询' }}
      </button>
    </div>
    
    <!-- 批量操作 -->
    <div class="bulk-operations">
      <button 
        @click="showBulkCreateModal = true" 
        v-permission="'vessel_info.create'"
        class="btn btn-primary"
      >
        批量创建
      </button>
      <button 
        @click="bulkUpdate"
        v-permission="'vessel_info.update'"
        :disabled="selectedIds.length === 0"
        class="btn btn-secondary"
      >
        批量更新
      </button>
      <button 
        @click="bulkDelete"
        v-permission="'vessel_info.delete'"
        :disabled="selectedIds.length === 0"
        class="btn btn-danger"
      >
        批量删除
      </button>
    </div>
    
    <!-- 数据表格 -->
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                @change="toggleSelectAll"
                :checked="isAllSelected"
              />
            </th>
            <th>船舶名称</th>
            <th>航次号</th>
            <th>航线</th>
            <th>价格</th>
            <th>20尺现舱</th>
            <th>40尺现舱</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="info in vesselInfos" :key="info.id">
            <td>
              <input 
                type="checkbox" 
                :value="info.id"
                v-model="selectedIds"
              />
            </td>
            <td>{{ info.schedule.vessel }}</td>
            <td>{{ info.schedule.voyage }}</td>
            <td>{{ info.schedule.pol }} → {{ info.schedule.pod }}</td>
            <td>
              <span v-if="info.price">${{ info.price }}</span>
              <span v-else class="no-data">--</span>
            </td>
            <td>
              <span v-if="info.gp_20" class="cabin-count">{{ info.gp_20 }}</span>
              <span v-else class="no-data">--</span>
            </td>
            <td>
              <span v-if="info.hq_40" class="cabin-count">{{ info.hq_40 }}</span>
              <span v-else class="no-data">--</span>
            </td>
            <td class="remarks">{{ info.remarks || '--' }}</td>
            <td class="actions">
              <button 
                @click="editVesselInfo(info)"
                v-permission="'vessel_info.update'"
                class="btn btn-sm btn-outline"
              >
                编辑
              </button>
              <button 
                @click="deleteVesselInfo(info.id)"
                v-permission="'vessel_info.delete'"
                class="btn btn-sm btn-danger"
              >
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination">
      <button 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage <= 1"
      >
        上一页
      </button>
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button 
        @click="changePage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
      >
        下一页
      </button>
    </div>
    
    <!-- 批量创建弹窗 -->
    <div v-if="showBulkCreateModal" class="modal">
      <div class="modal-content">
        <h3>批量创建船舶信息</h3>
        <textarea 
          v-model="bulkCreateData"
          placeholder="请输入JSON格式的数据"
          rows="10"
        ></textarea>
        <div class="modal-actions">
          <button @click="executeBulkCreate" class="btn btn-primary">
            创建
          </button>
          <button @click="showBulkCreateModal = false" class="btn btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VesselInfoManager } from '@/utils/api'

export default {
  name: 'VesselInfoManagement',
  data() {
    return {
      vesselInfos: [],
      filters: {
        carrier_cd: '',
        vessel: '',
        has_price: ''
      },
      selectedIds: [],
      currentPage: 1,
      pageSize: 20,
      totalCount: 0,
      loading: false,
      showBulkCreateModal: false,
      bulkCreateData: '',
      vesselInfoManager: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.pageSize)
    },
    isAllSelected() {
      return this.vesselInfos.length > 0 && 
             this.selectedIds.length === this.vesselInfos.length
    }
  },
  mounted() {
    const accessToken = this.$store.state.auth.accessToken
    this.vesselInfoManager = new VesselInfoManager(accessToken)
    this.loadVesselInfos()
  },
  methods: {
    async loadVesselInfos() {
      this.loading = true
      
      try {
        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
          ...this.filters
        }
        
        const data = await this.vesselInfoManager.getVesselInfos(params)
        this.vesselInfos = data.results
        this.totalCount = data.count
        
      } catch (error) {
        this.$message.error('获取船舶信息失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.loadVesselInfos()
      }
    },
    
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = []
      } else {
        this.selectedIds = this.vesselInfos.map(info => info.id)
      }
    },
    
    async executeBulkCreate() {
      try {
        const data = JSON.parse(this.bulkCreateData)
        const result = await this.vesselInfoManager.bulkCreateVesselInfos(data)
        
        this.$message.success(`批量创建完成: 成功 ${result.created_count}, 失败 ${result.failed_count}`)
        
        if (result.errors.length > 0) {
          console.log('创建失败的记录:', result.errors)
        }
        
        this.showBulkCreateModal = false
        this.bulkCreateData = ''
        this.loadVesselInfos()
        
      } catch (error) {
        this.$message.error('批量创建失败: ' + error.message)
      }
    },
    
    async bulkDelete() {
      if (this.selectedIds.length === 0) return
      
      if (confirm(`确定要删除选中的 ${this.selectedIds.length} 条记录吗？`)) {
        try {
          const result = await this.vesselInfoManager.bulkDeleteVesselInfos(this.selectedIds)
          this.$message.success(`批量删除完成: 成功 ${result.deleted_count}`)
          
          this.selectedIds = []
          this.loadVesselInfos()
          
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      }
    },
    
    async deleteVesselInfo(id) {
      if (confirm('确定要删除这条船舶信息吗？')) {
        try {
          await this.vesselInfoManager.deleteVesselInfo(id)
          this.$message.success('删除成功')
          this.loadVesselInfos()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.vessel-info-management {
  padding: 20px;
}

.search-filters {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: bold;
  font-size: 12px;
}

.filter-group input,
.filter-group select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.bulk-operations {
  margin-bottom: 20px;
}

.bulk-operations button {
  margin-right: 10px;
}

.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.data-table th,
.data-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.no-data {
  color: #6c757d;
  font-style: italic;
}

.cabin-count {
  font-weight: bold;
  color: #28a745;
}

.remarks {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  white-space: nowrap;
}

.actions button {
  margin-right: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
}

.modal-content h3 {
  margin-bottom: 15px;
}

.modal-content textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #007bff;
  color: #007bff;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

## 错误处理

### 认证错误 (401 Unauthorized)

```json
{
  "detail": "身份认证信息未提供。"
}
```

### 权限错误 (403 Forbidden)

```json
{
  "detail": "您没有执行该操作的权限。"
}
```

### 验证错误 (400 Bad Request)

```json
{
  "schedule_id": ["该字段是必填项。"],
  "price": ["请确保这个值大于等于 0。"],
  "schedule": ["具有 时刻表 的 船舶额外信息 已存在。"]
}
```

### 资源不存在 (404 Not Found)

```json
{
  "detail": "未找到。"
}
```

## 数据验证

### 业务规则
- 每个时刻表只能有一条船舶额外信息记录
- 价格必须大于等于0
- 舱位数量字段允许为空或非负数字符串
- 备注信息不能超过500字符

### 关联验证
- schedule_id必须存在于船舶时刻表中
- 删除时刻表时会级联删除对应的船舶信息

## 业务场景

### 价格管理
- 为不同航线设置差异化价格
- 支持价格历史追踪
- 批量价格调整

### 现舱管理
- 实时更新各类型集装箱现舱数量
- 支持多种集装箱类型
- 现舱状态查询和统计

### 数据同步
- 与船舶时刻表自动同步
- 支持外部系统数据导入
- 批量操作提高效率

## 最佳实践

### 数据完整性
1. 创建船舶信息前确保时刻表存在
2. 定期清理无关联时刻表的孤立记录
3. 使用事务确保批量操作的原子性
4. 建立数据备份和恢复机制

### 性能优化
1. 使用数据库索引加速查询
2. 合理使用分页避免大数据量查询
3. 缓存常用的价格和现舱数据
4. 异步处理批量操作

### 业务逻辑
1. 价格变更需要记录历史
2. 现舱数据更新要及时
3. 支持多币种价格管理
4. 实现价格审批流程

## 测试用例

参考测试文件: `tests/test_vessel_info.py`

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_vessel_info.py`  
**相关文档**: [船舶时刻表API](vessel-schedules.md), [共舱分组API](cabin-grouping.md)
