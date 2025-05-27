# 船舶时刻表API

## 概览

船舶时刻表API提供船舶航线时刻表的完整CRUD操作，包括创建、查询、更新、删除船舶时刻表，以及高级搜索和统计功能。这是船舶调度系统的核心数据管理接口。

## 接口信息

### 基础CRUD接口
- **列表/创建**: `/api/schedules/` (GET/POST)
- **详情/更新/删除**: `/api/schedules/{id}/` (GET/PUT/PATCH/DELETE)

### 扩展功能接口
- **搜索接口**: `/api/schedules/search/` (GET)
- **统计接口**: `/api/schedules/stats/` (GET)

## 船舶时刻表列表API

### 接口信息
- **URL**: `/api/schedules/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `schedule.list` 或已登录用户

### 请求参数

#### 查询参数 (Query Parameters)

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `page` | integer | ❌ | 页码，默认1 | `1` |
| `page_size` | integer | ❌ | 每页数量，默认20 | `20` |
| `pol_cd` | string | ❌ | 起运港代码过滤 | `CNSHK` |
| `pod_cd` | string | ❌ | 目的港代码过滤 | `THBKK` |
| `carrier_cd` | string | ❌ | 船司代码过滤 | `ASL` |
| `vessel` | string | ❌ | 船舶名称过滤 | `EVER` |
| `etd_start` | date | ❌ | 开船时间起始 | `2025-06-01` |
| `etd_end` | date | ❌ | 开船时间结束 | `2025-06-30` |
| `ordering` | string | ❌ | 排序字段 | `etd`, `-etd`, `pol_cd` |

### 请求示例

```
GET /api/schedules/?pol_cd=CNSHK&pod_cd=THBKK&page=1&page_size=10&ordering=etd
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "count": 156,
  "next": "http://127.0.0.1:8000/api/schedules/?page=2&pol_cd=CNSHK&pod_cd=THBKK",
  "previous": null,
  "results": [
    {
      "id": 1001,
      "vessel": "EVER GIVEN",
      "voyage": "001N",
      "pol_cd": "CNSHK",
      "pod_cd": "THBKK",
      "pol": "SHEKOU",
      "pod": "BANGKOK",
      "eta": "2025-06-15T14:00:00+08:00",
      "etd": "2025-06-10T09:00:00+08:00",
      "route_etd": "0",
      "carrier_cd": "ASL",
      "total_duration": "6",
      "share_cabins": [
        {
          "carrier_cd": "ASL",
          "route_cd": "ASE1"
        },
        {
          "carrier_cd": "CKL",
          "route_cd": "CKE1"
        }
      ],
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

#### 时刻表字段 (results[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 时刻表唯一标识 |
| `vessel` | string | 船舶名称 |
| `voyage` | string | 航次号 |
| `pol_cd` | string | 起运港代码 |
| `pod_cd` | string | 目的港代码 |
| `pol` | string | 起运港名称 |
| `pod` | string | 目的港名称 |
| `eta` | datetime | 预计到达时间 |
| `etd` | datetime | 预计开船时间 |
| `route_etd` | string | 航线开船时间 |
| `carrier_cd` | string | 主船司代码 |
| `total_duration` | string | 总航程时间（天） |
| `share_cabins` | array | 共舱信息列表 |
| `is_active` | boolean | 是否有效 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

## 创建船舶时刻表API

### 接口信息
- **URL**: `/api/schedules/`
- **方法**: `POST`
- **认证**: ✅ 需要JWT Token
- **权限**: `schedule.create`

### 请求参数

#### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 | 限制 |
|------|------|------|------|------|
| `vessel` | string | ✅ | 船舶名称 | 最大100字符 |
| `voyage` | string | ✅ | 航次号 | 最大50字符 |
| `pol_cd` | string | ✅ | 起运港代码 | 5字符港口代码 |
| `pod_cd` | string | ✅ | 目的港代码 | 5字符港口代码 |
| `pol` | string | ✅ | 起运港名称 | 最大100字符 |
| `pod` | string | ✅ | 目的港名称 | 最大100字符 |
| `eta` | datetime | ✅ | 预计到达时间 | ISO 8601格式 |
| `etd` | datetime | ✅ | 预计开船时间 | ISO 8601格式 |
| `route_etd` | string | ❌ | 航线开船时间 | 默认为"0" |
| `carrier_cd` | string | ✅ | 主船司代码 | 3-10字符 |
| `total_duration` | string | ❌ | 总航程时间 | 默认自动计算 |
| `share_cabins` | array | ❌ | 共舱信息 | JSON数组 |
| `is_active` | boolean | ❌ | 是否有效 | 默认true |

### 请求示例

```json
{
  "vessel": "EVER FORWARD",
  "voyage": "002N",
  "pol_cd": "CNSHK",
  "pod_cd": "THBKK",
  "pol": "SHEKOU",
  "pod": "BANGKOK",
  "eta": "2025-06-20T14:00:00+08:00",
  "etd": "2025-06-15T09:00:00+08:00",
  "route_etd": "0",
  "carrier_cd": "ASL",
  "total_duration": "5",
  "share_cabins": [
    {
      "carrier_cd": "ASL",
      "route_cd": "ASE1"
    },
    {
      "carrier_cd": "CKL",
      "route_cd": "CKE1"
    }
  ],
  "is_active": true
}
```

### 成功响应 (201 Created)

```json
{
  "message": "船舶时刻表创建成功",
  "data": {
    "id": 1002,
    "vessel": "EVER FORWARD",
    "voyage": "002N",
    "pol_cd": "CNSHK",
    "pod_cd": "THBKK",
    "pol": "SHEKOU", 
    "pod": "BANGKOK",
    "eta": "2025-06-20T14:00:00+08:00",
    "etd": "2025-06-15T09:00:00+08:00",
    "route_etd": "0",
    "carrier_cd": "ASL",
    "total_duration": "5",
    "share_cabins": [
      {
        "carrier_cd": "ASL",
        "route_cd": "ASE1"
      },
      {
        "carrier_cd": "CKL",
        "route_cd": "CKE1"
      }
    ],
    "is_active": true,
    "created_at": "2025-05-25T09:00:00+08:00",
    "updated_at": "2025-05-25T09:00:00+08:00"
  }
}
```

## 船舶时刻表详情API

### 接口信息
- **URL**: `/api/schedules/{id}/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: `schedule.detail` 或已登录用户

### 请求示例

```
GET /api/schedules/1001/
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "id": 1001,
  "vessel": "EVER GIVEN",
  "voyage": "001N",
  "pol_cd": "CNSHK",
  "pod_cd": "THBKK",
  "pol": "SHEKOU",
  "pod": "BANGKOK",
  "eta": "2025-06-15T14:00:00+08:00",
  "etd": "2025-06-10T09:00:00+08:00",
  "route_etd": "0",
  "carrier_cd": "ASL",
  "total_duration": "6",
  "share_cabins": [
    {
      "carrier_cd": "ASL",
      "route_cd": "ASE1"
    },
    {
      "carrier_cd": "CKL",
      "route_cd": "CKE1"
    }
  ],
  "is_active": true,
  "created_at": "2025-05-25T08:00:00+08:00",
  "updated_at": "2025-05-25T08:30:00+08:00",
  "vessel_info": {
    "id": 101,
    "price": 1500.00,
    "gp_20": "10",
    "hq_40": "5",
    "remarks": "舱位充足"
  }
}
```

## 更新船舶时刻表API

### 接口信息
- **URL**: `/api/schedules/{id}/`
- **方法**: `PUT` (完整更新) 或 `PATCH` (部分更新)
- **认证**: ✅ 需要JWT Token
- **权限**: `schedule.update`

### 请求示例 (PATCH)

```json
{
  "eta": "2025-06-16T14:00:00+08:00",
  "etd": "2025-06-11T09:00:00+08:00",
  "total_duration": "5"
}
```

### 成功响应 (200 OK)

```json
{
  "message": "船舶时刻表更新成功",
  "data": {
    "id": 1001,
    "vessel": "EVER GIVEN",
    "voyage": "001N",
    "pol_cd": "CNSHK",
    "pod_cd": "THBKK",
    "pol": "SHEKOU",
    "pod": "BANGKOK",
    "eta": "2025-06-16T14:00:00+08:00",
    "etd": "2025-06-11T09:00:00+08:00",
    "route_etd": "0",
    "carrier_cd": "ASL",
    "total_duration": "5",
    "share_cabins": [
      {
        "carrier_cd": "ASL",
        "route_cd": "ASE1"
      }
    ],
    "is_active": true,
    "created_at": "2025-05-25T08:00:00+08:00",
    "updated_at": "2025-05-25T09:15:00+08:00"
  }
}
```

## 删除船舶时刻表API

### 接口信息
- **URL**: `/api/schedules/{id}/`
- **方法**: `DELETE`
- **认证**: ✅ 需要JWT Token
- **权限**: `schedule.delete`

### 请求示例

```
DELETE /api/schedules/1001/
Authorization: Bearer <your_access_token>
```

### 成功响应 (204 No Content)

删除成功，无响应体内容。

## 船舶时刻表搜索API

### 接口信息
- **URL**: `/api/schedules/search/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: 已登录用户

### 请求参数

#### 高级搜索参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `q` | string | ❌ | 关键词搜索 | `EVER` |
| `pol_cd` | string | ❌ | 起运港代码 | `CNSHK` |
| `pod_cd` | string | ❌ | 目的港代码 | `THBKK` |
| `carrier_cd` | string | ❌ | 船司代码 | `ASL` |
| `vessel` | string | ❌ | 船舶名称 | `EVER GIVEN` |
| `voyage` | string | ❌ | 航次号 | `001N` |
| `etd_start` | date | ❌ | 开船起始日期 | `2025-06-01` |
| `etd_end` | date | ❌ | 开船结束日期 | `2025-06-30` |
| `duration_min` | integer | ❌ | 最小航程天数 | `3` |
| `duration_max` | integer | ❌ | 最大航程天数 | `10` |
| `is_active` | boolean | ❌ | 是否有效 | `true` |
| `has_share_cabin` | boolean | ❌ | 是否有共舱 | `true` |

### 请求示例

```
GET /api/schedules/search/?q=EVER&pol_cd=CNSHK&etd_start=2025-06-01&etd_end=2025-06-30&duration_max=7
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "搜索完成",
  "data": {
    "total_count": 25,
    "search_params": {
      "q": "EVER",
      "pol_cd": "CNSHK",
      "etd_start": "2025-06-01",
      "etd_end": "2025-06-30",
      "duration_max": "7"
    },
    "results": [
      {
        "id": 1001,
        "vessel": "EVER GIVEN",
        "voyage": "001N",
        "pol_cd": "CNSHK",
        "pod_cd": "THBKK",
        "pol": "SHEKOU",
        "pod": "BANGKOK",
        "eta": "2025-06-15T14:00:00+08:00",
        "etd": "2025-06-10T09:00:00+08:00",
        "carrier_cd": "ASL",
        "total_duration": "6",
        "share_cabins_count": 2,
        "is_active": true
      }
    ],
    "facets": {
      "carriers": [
        {"carrier_cd": "ASL", "count": 12},
        {"carrier_cd": "CKL", "count": 8},
        {"carrier_cd": "EMC", "count": 5}
      ],
      "ports": {
        "pol": [
          {"pol_cd": "CNSHK", "pol": "SHEKOU", "count": 15},
          {"pol_cd": "CNSHA", "pol": "SHANGHAI", "count": 10}
        ],
        "pod": [
          {"pod_cd": "THBKK", "pod": "BANGKOK", "count": 20},
          {"pod_cd": "THSKP", "pod": "SATTAHIP", "count": 5}
        ]
      }
    }
  }
}
```

## 船舶时刻表统计API

### 接口信息
- **URL**: `/api/schedules/stats/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: 已登录用户

### 请求参数

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `start_date` | date | ❌ | 统计起始日期 | `2025-06-01` |
| `end_date` | date | ❌ | 统计结束日期 | `2025-06-30` |
| `group_by` | string | ❌ | 分组维度 | `carrier`, `route`, `month` |

### 请求示例

```
GET /api/schedules/stats/?start_date=2025-06-01&end_date=2025-06-30&group_by=carrier
Authorization: Bearer <your_access_token>
```

### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "统计数据获取成功",
  "data": {
    "period": {
      "start_date": "2025-06-01",
      "end_date": "2025-06-30"
    },
    "summary": {
      "total_schedules": 156,
      "active_schedules": 145,
      "unique_vessels": 38,
      "unique_routes": 12,
      "unique_carriers": 8
    },
    "group_by": "carrier",
    "statistics": [
      {
        "carrier_cd": "ASL",
        "carrier_name": "美国总统轮船",
        "schedule_count": 45,
        "vessel_count": 12,
        "route_count": 5,
        "avg_duration": 6.2,
        "share": 28.8
      },
      {
        "carrier_cd": "CKL",
        "carrier_name": "中远海运",
        "schedule_count": 38,
        "vessel_count": 10,
        "route_count": 4,
        "avg_duration": 5.8,
        "share": 24.4
      }
    ],
    "trends": {
      "daily_count": [
        {"date": "2025-06-01", "count": 5},
        {"date": "2025-06-02", "count": 7},
        {"date": "2025-06-03", "count": 4}
      ]
    }
  }
}
```

## 使用示例

### JavaScript (Fetch API)

```javascript
// 船舶时刻表管理类
class VesselScheduleManager {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = 'http://127.0.0.1:8000/api';
    this.headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  async getSchedules(filters = {}) {
    """获取船舶时刻表列表"""
    const params = new URLSearchParams(filters);
    const url = `${this.baseUrl}/schedules/?${params}`;
    
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
      console.error('获取时刻表失败:', error);
      throw error;
    }
  }

  async createSchedule(scheduleData) {
    """创建船舶时刻表"""
    try {
      const response = await fetch(`${this.baseUrl}/schedules/`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('时刻表创建成功:', result.data.vessel);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('创建时刻表失败:', error);
      throw error;
    }
  }

  async updateSchedule(scheduleId, updateData) {
    """更新船舶时刻表"""
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${scheduleId}/`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('时刻表更新成功:', result.data.vessel);
        return result.data;
      } else {
        const errorData = await response.json();
        throw errorData;
      }
    } catch (error) {
      console.error('更新时刻表失败:', error);
      throw error;
    }
  }

  async deleteSchedule(scheduleId) {
    """删除船舶时刻表"""
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${scheduleId}/`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (response.ok || response.status === 204) {
        console.log('时刻表删除成功');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('删除时刻表失败:', error);
      throw error;
    }
  }

  async searchSchedules(searchParams) {
    """搜索船舶时刻表"""
    const params = new URLSearchParams(searchParams);
    const url = `${this.baseUrl}/schedules/search/?${params}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('搜索时刻表失败:', error);
      throw error;
    }
  }

  async getStatistics(statsParams = {}) {
    """获取时刻表统计"""
    const params = new URLSearchParams(statsParams);
    const url = `${this.baseUrl}/schedules/stats/?${params}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
      throw error;
    }
  }
}

// 使用示例
const accessToken = localStorage.getItem('access_token');
const scheduleManager = new VesselScheduleManager(accessToken);

// 获取时刻表列表
scheduleManager.getSchedules({
  pol_cd: 'CNSHK',
  pod_cd: 'THBKK',
  page: 1,
  page_size: 10
}).then(data => {
  console.log(`获取到 ${data.count} 条时刻表记录`);
  data.results.forEach(schedule => {
    console.log(`${schedule.vessel} (${schedule.voyage}): ${schedule.pol} -> ${schedule.pod}`);
  });
});

// 创建新时刻表
const newSchedule = {
  vessel: 'MSC GULSUN',
  voyage: '003W',
  pol_cd: 'CNSHK',
  pod_cd: 'THBKK',
  pol: 'SHEKOU',
  pod: 'BANGKOK',
  eta: '2025-06-25T14:00:00+08:00',
  etd: '2025-06-20T09:00:00+08:00',
  carrier_cd: 'MSC',
  total_duration: '5'
};

scheduleManager.createSchedule(newSchedule)
  .then(schedule => {
    console.log('新时刻表创建成功:', schedule.id);
  })
  .catch(error => {
    console.error('创建失败:', error);
  });
```

### Python使用示例

```python
import requests
from datetime import datetime, date
import json

class VesselScheduleManager:
    def __init__(self, access_token):
        self.access_token = access_token
        self.base_url = "http://127.0.0.1:8000/api"
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_schedules(self, **filters):
        """获取船舶时刻表列表"""
        try:
            response = requests.get(
                f"{self.base_url}/schedules/",
                headers=self.headers,
                params=filters
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"获取时刻表失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def create_schedule(self, schedule_data):
        """创建船舶时刻表"""
        try:
            response = requests.post(
                f"{self.base_url}/schedules/",
                headers=self.headers,
                json=schedule_data
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"时刻表创建成功: {result['data']['vessel']}")
                return result['data']
            else:
                error_data = response.json()
                print(f"创建时刻表失败: {error_data}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def search_schedules(self, **search_params):
        """搜索船舶时刻表"""
        try:
            response = requests.get(
                f"{self.base_url}/schedules/search/",
                headers=self.headers,
                params=search_params
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['data']
            else:
                print(f"搜索失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None
    
    def get_statistics(self, **stats_params):
        """获取统计信息"""
        try:
            response = requests.get(
                f"{self.base_url}/schedules/stats/",
                headers=self.headers,
                params=stats_params
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['data']
            else:
                print(f"获取统计失败: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"网络错误: {e}")
            return None

# 使用示例
def main():
    access_token = "your_access_token_here"
    sm = VesselScheduleManager(access_token)
    
    # 获取时刻表列表
    print("📋 获取时刻表列表...")
    schedules = sm.get_schedules(
        pol_cd='CNSHK',
        pod_cd='THBKK',
        page_size=5
    )
    
    if schedules:
        print(f"共找到 {schedules['count']} 条记录")
        for schedule in schedules['results']:
            print(f"  {schedule['vessel']} ({schedule['voyage']})")
            print(f"    {schedule['pol']} -> {schedule['pod']}")
            print(f"    开船: {schedule['etd']}")
    
    # 搜索功能
    print("\n🔍 搜索时刻表...")
    search_results = sm.search_schedules(
        q='EVER',
        etd_start='2025-06-01',
        etd_end='2025-06-30'
    )
    
    if search_results:
        print(f"搜索到 {search_results['total_count']} 条结果")
        
        # 显示船司统计
        print("\n📊 船司分布:")
        for carrier in search_results['facets']['carriers']:
            print(f"  {carrier['carrier_cd']}: {carrier['count']} 条")
    
    # 统计信息
    print("\n📈 获取统计信息...")
    stats = sm.get_statistics(
        start_date='2025-06-01',
        end_date='2025-06-30',
        group_by='carrier'
    )
    
    if stats:
        print(f"统计期间: {stats['period']['start_date']} 到 {stats['period']['end_date']}")
        print(f"总时刻表数: {stats['summary']['total_schedules']}")
        print(f"船舶数量: {stats['summary']['unique_vessels']}")
        
        print("\n按船司统计:")
        for stat in stats['statistics']:
            print(f"  {stat['carrier_cd']}: {stat['schedule_count']} 条 ({stat['share']:.1f}%)")

if __name__ == "__main__":
    main()
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
  "vessel": ["该字段是必填项。"],
  "etd": ["请输入一个有效的日期时间。"],
  "pol_cd": ["确保这个字段不超过 5 个字符。"]
}
```

### 资源不存在 (404 Not Found)

```json
{
  "detail": "未找到。"
}
```

## 数据验证

### 时间验证
- ETD必须早于ETA
- 时间格式必须为ISO 8601
- 不能创建过去时间的时刻表

### 港口验证
- 港口代码必须为5位字符
- 起运港和目的港不能相同
- 港口代码必须存在于系统中

### 船司验证
- 船司代码长度3-10字符
- 必须是有效的船司代码

## 业务规则

### 自动同步
- 创建/更新时刻表时自动同步到船舶额外信息表
- 删除时刻表时清理相关的船舶信息

### 共舱管理
- 共舱信息以JSON格式存储
- 支持多船司共舱安排
- 自动提取载体代码用于分组

## 最佳实践

### 查询优化
1. 使用适当的分页大小
2. 添加必要的过滤条件
3. 合理使用排序参数
4. 缓存常用查询结果

### 数据完整性
1. 创建前验证港口代码
2. 确保时间逻辑正确
3. 维护船司代码的一致性
4. 定期清理无效数据

### 性能考虑
1. 对大数据量查询使用分页
2. 合理设置数据库索引
3. 使用搜索接口进行复杂查询
4. 缓存统计数据

## 测试用例

参考测试文件: `tests/test_vessel_schedules.py`

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_vessel_schedules.py`  
**相关文档**: [船舶信息API](vessel-info.md), [共舱分组API](cabin-grouping.md)
