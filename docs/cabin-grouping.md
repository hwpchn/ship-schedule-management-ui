# 共舱分组API

## 概览

共舱分组API是船舶时刻表系统的核心功能，提供船舶共舱数据的分组查询和聚合计算。该API按照船舶的shareCabins载体代码组合进行分组，并计算每组的现舱状态、价格信息、开船计划等聚合数据。

## 接口信息

- **URL**: `/api/schedules/cabin-grouping-with-info/`
- **方法**: `GET`
- **认证**: ✅ 需要JWT Token
- **权限**: 需要'schedules.view_vesselschedule'权限
- **内容类型**: `application/json`

## 请求参数

### 查询参数 (Query Parameters)

| 参数 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `polCd` | string | ✅ | 起运港代码 | `CNSHK` |
| `podCd` | string | ✅ | 目的港代码 | `THBKK` |

> 注：系统始终返回最新版本的数据，不支持查询指定版本。

### 请求示例

```
GET /api/schedules/cabin-grouping-with-info/?polCd=CNSHK&podCd=THBKK
Authorization: Bearer <your_access_token>
```

## 响应格式

### 成功响应 (200 OK)

```json
{
  "success": true,
  "message": "共舱分组数据获取成功",
  "data": {
    "version": 6,
    "total_groups": 10,
    "filter": {
      "polCd": "CNSHK",
      "podCd": "THBKK"
    },
    "groups": [
      {
        "group_id": "group_2",
        "cabins_count": 4,
        "carrier_codes": ["ASL", "CKL", "CUL", "DJS"],
        "plan_open": "0",
        "plan_duration": "6",
        "cabin_price": 1500.00,
        "is_has_gp_20": "有现舱",
        "is_has_hq_40": "有现舱",
        "schedules": [
          {
            "id": 1001,
            "vessel": "EVER GIVEN",
            "voyage": "001N",
            "polCd": "CNSHK",
            "podCd": "THBKK", 
            "pol": "SHEKOU",
            "pod": "BANGKOK",
            "eta": "2025-06-15 14:00:00",
            "etd": "2025-06-10 09:00:00",
            "routeEtd": "0",
            "carriercd": "ASL",
            "totalDuration": "6",
            "vessel_info": {
              "id": 123,
              "price": 1500.00,
              "gp_20": "10",
              "hq_40": "5",
              "cut_off_time":"2025-06-1"
            },
            "shareCabins": [
              {
                "carrierCd": "ASL",
                "routeCd": "ASE1"
              },
              {
                "carrierCd": "CKL", 
                "routeCd": "CKE1"
              },
              {
                "carrierCd": "CUL",
                "routeCd": "CUE1"
              },
              {
                "carrierCd": "DJS",
                "routeCd": "DJE1"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 响应字段说明

#### 顶层字段
| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 请求是否成功 |
| `message` | string | 响应消息 |
| `data` | object | 响应数据主体 |

#### 数据字段 (data)
| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | integer | 数据版本号 |
| `total_groups` | integer | 总分组数量 |
| `filter` | object | 请求过滤条件 |
| `groups` | array | 分组数据列表 |

#### 分组字段 (groups[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `group_id` | string | 分组唯一标识 |
| `cabins_count` | integer | 共舱船司数量 |
| `carrier_codes` | array | 船司代码列表 |
| `plan_open` | string | 计划开船时间 (最频繁的routeEtd值，当多个值出现频率相同时选择最小值) |
| `plan_duration` | string | 计划航程时间 (最小totalDuration) |
| `cabin_price` | number/string | 舱位价格 (最早ETD日期的价格或'--') |
| `is_has_gp_20` | string | 20尺普柜现舱状态 ('有现舱'或'--') |
| `is_has_hq_40` | string | 40尺高柜现舱状态 ('有现舱'或'--') |
| `schedules` | array | 航线详情列表 |

#### 航线字段 (schedules[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 航线ID |
| `vessel` | string | 船舶名称 |
| `voyage` | string | 航次号 |
| `polCd` | string | 起运港代码 |
| `podCd` | string | 目的港代码 |
| `pol` | string | 起运港名称 |
| `pod` | string | 目的港名称 |
| `eta` | string | 预计到达时间 |
| `etd` | string | 预计开船时间 |
| `routeEtd` | string | 航线开船时间 |
| `carriercd` | string | 主船司代码 |
| `totalDuration` | string | 总航程时间 |
| `vessel_info` | object | 船舶额外信息 |
| `shareCabins` | array | 共舱信息 |

#### 船舶信息字段 (vessel_info)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 船舶信息记录ID |
| `price` | number/string | 舱位价格 (无数据时返回'--') |
| `gp_20` | string | 20尺普柜现舱数量 (无数据时返回'--') |
| `hq_40` | string | 40尺高柜现舱数量 (无数据时返回'--') |
| `cut_off_time` | string | 截关时间 (无数据时返回'--') |

#### 共舱信息字段 (shareCabins[])
| 字段 | 类型 | 说明 |
|------|------|------|
| `carrierCd` | string | 船司代码 |
| `routeCd` | string | 航线代码 |

## 核心业务逻辑

### 1. 分组逻辑
- **分组依据**: 按照`shareCabins`中载体代码的组合进行分组
- **唯一性**: 相同载体代码组合的航线归为一组
- **排序**: 载体代码按字母顺序排序确保一致性
- **无共舱信息处理**: 如果航线没有共舱信息，则使用其主船司代码(`carriercd`)作为分组依据

### 2. 现舱逻辑
- **检查逻辑**: 字段不为空且不为'0'
- **gp_20现舱**: 如果组内任一航线的`gp_20`不为空且不为'0'，则显示"有现舱"
- **hq_40现舱**: 如果组内任一航线的`hq_40`不为空且不为'0'，则显示"有现舱"
- **无现舱**: 如果所有航线都没有现舱，则显示"--"

### 3. 价格逻辑
- **选择策略**: 使用最早ETD日期的航线价格
- **数据来源**: 只查询主船司(`carriercd`)的价格数据
- **无价格**: 如果没有价格数据，显示"--"

### 4. 聚合计算
- **plan_open**: 组内最频繁出现的`routeEtd`值 (如有多个相同频率的值，则选择最小的值，即最早的航线)
- **plan_duration**: 组内最小的`totalDuration`值
- **cabin_price**: 最早ETD日期对应的价格

## 使用示例

### cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/schedules/cabin-grouping-with-info/?polCd=CNSHK&podCd=THBKK" \
  -H "Authorization: Bearer <your_access_token>"
```

### JavaScript (Fetch)
```javascript
const getCabinGrouping = async (polCd, podCd) => {
  const accessToken = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/schedules/cabin-grouping-with-info/?polCd=${polCd}&podCd=${podCd}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`获取到 ${data.data.total_groups} 个分组`);
      return data.data;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('获取共舱分组失败:', error);
    throw error;
  }
};

// 使用示例
getCabinGrouping('CNSHK', 'THBKK')
  .then(data => {
    data.groups.forEach((group, index) => {
      console.log(`分组 ${index + 1}:`);
      console.log(`  船司: ${group.carrier_codes.join(', ')}`);
      console.log(`  计划开船: ${group.plan_open}天`);
      console.log(`  航程时间: ${group.plan_duration}天`);
      console.log(`  20尺现舱: ${group.is_has_gp_20}`);
      console.log(`  40尺现舱: ${group.is_has_hq_40}`);
      console.log(`  价格: ${group.cabin_price}`);
    });
  })
  .catch(error => {
    console.error('处理失败:', error);
  });
```

### Python (requests)
```python
import requests

def get_cabin_grouping(access_token, pol_cd, pod_cd):
    """获取共舱分组数据"""
    url = "http://127.0.0.1:8000/api/schedules/cabin-grouping-with-info/"
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    params = {
        'polCd': pol_cd,
        'podCd': pod_cd
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            print(f"获取到 {data['data']['total_groups']} 个分组")
            
            return data['data']
        else:
            print(f"请求失败: {response.status_code} - {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"网络错误: {e}")
        return None

# 使用示例
token = "your_access_token_here"
result = get_cabin_grouping(token, "CNSHK", "THBKK")

if result:
    for i, group in enumerate(result['groups'], 1):
        print(f"\n分组 {i} ({group['group_id']}):")
        print(f"  船司: {', '.join(group['carrier_codes'])}")
        print(f"  计划开船: {group['plan_open']}天")
        print(f"  航程时间: {group['plan_duration']}天")
        print(f"  20尺现舱: {group['is_has_gp_20']}")
        print(f"  40尺现舱: {group['is_has_hq_40']}")
        print(f"  价格: {group['cabin_price']}")
        print(f"  航线数量: {len(group['schedules'])}")
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
  "success": false,
  "message": "没有权限查看船舶航线信息",
  "data": null
}
```

### 参数错误 (400 Bad Request)
```json
{
  "success": false,
  "message": "起运港和目的港不能为空",
  "data": null
}
```

### 无数据 (200 OK)
```json
{
  "success": true,
  "message": "未找到匹配的共舱数据",
  "data": {
    "version": 6,
    "total_groups": 0,
    "filter": {
      "polCd": "CNSHK",
      "podCd": "INVALID"
    },
    "groups": []
  }
}
```

## 性能优化

### 数据库优化
- 使用数据库索引加速查询
- 预计算聚合数据减少实时计算
- 分页支持大数据量查询

### 缓存策略
- Redis缓存热门港口对的查询结果
- 设置合理的缓存过期时间
- 支持缓存失效和刷新机制

### 响应优化
- 支持字段选择减少数据传输
- 压缩响应数据
- 异步加载详细信息

## 业务场景

### 1. 运价查询
客户可以通过该API查询特定港口对的所有可用共舱选择和价格信息。

### 2. 舱位预订
根据现舱状态帮助客户选择有可用舱位的航线进行预订。

### 3. 航线比较
比较不同船司组合的价格、航程时间和开船计划。

### 4. 数据分析
为业务分析提供港口对的航线密度和价格趋势数据。

## 测试用例

参考测试文件: `tests/final_verification.py`, `tests/test_cabin_grouping_api.py`

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/final_verification.py`, `tests/test_cabin_grouping_api.py`  
**相关文档**: [船舶信息API](vessel-info.md)
