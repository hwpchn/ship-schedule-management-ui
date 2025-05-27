# 本地费用按船名查询 API 设计文档

## 📋 概述
本文档描述了按船名、起运港、目的港查询和管理本地费用的API接口设计。

## 🎯 核心需求
- 本地费用与**船名、起运港、目的港**三个维度关联
- 支持按船舶查询特定的本地费用
- 支持编辑、添加、删除本地费用项目
- 保持向后兼容性

## 🏗️ 数据模型

### LocalFeeRate 扩展模型
```python
class LocalFeeRate(models.Model):
    vessel_name = models.CharField(max_length=100)     # 船舶名称 (新增)
    pol_code = models.CharField(max_length=10)         # 起运港代码
    pod_code = models.CharField(max_length=10)         # 目的港代码
    fee_type = models.ForeignKey(FeeType)              # 费用类型
    currency = models.ForeignKey(Currency)             # 币种
    rate_20gp = models.DecimalField(null=True, blank=True)     # 20GP价格
    rate_40gp = models.DecimalField(null=True, blank=True)     # 40GP价格
    rate_40hq = models.DecimalField(null=True, blank=True)     # 40HQ价格
    per_bill_rate = models.DecimalField(null=True, blank=True) # 单票价格
    unit = models.CharField(max_length=20, default='箱')       # 单位
    effective_date = models.DateField()                # 生效日期
    expiry_date = models.DateField()                   # 失效日期
    is_active = models.BooleanField(default=True)      # 是否启用
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['vessel_name', 'pol_code', 'pod_code', 'fee_type']
```

## 🔌 API 接口

### 1. 按船名查询本地费用
```http
GET /api/local-fees/rates/by-vessel/
```

**请求参数**:
```
vessel_name: string (必填) - 船舶名称
pol_cd: string (必填) - 起运港代码
pod_cd: string (必填) - 目的港代码
```

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "vessel_name": "MSC MERAVIGLIA",
      "pol_code": "CNSHK",
      "pod_code": "INMAA",
      "name": "起运港码头费",
      "unit": "箱型",
      "rate_20gp": "760.00",
      "rate_40gp": "1287.00",
      "rate_40hq": "1287.00",
      "per_bill_rate": null,
      "currency_code": "CNY",
      "effective_date": "2025-01-01",
      "expiry_date": "2025-12-31",
      "is_active": true
    }
  ],
  "meta": {
    "total_count": 5,
    "vessel_name": "MSC MERAVIGLIA",
    "pol_cd": "CNSHK",
    "pod_cd": "INMAA",
    "permissions": {
      "can_edit": true,
      "can_add": true,
      "can_delete": true
    }
  }
}
```

### 2. 获取可编辑表格数据（按船名）
```http
GET /api/local-fees/rates/editable_table/
```

**请求参数**:
```
vessel_name: string (可选) - 船舶名称
pol_cd: string (必填) - 起运港代码
pod_cd: string (必填) - 目的港代码
```

**说明**: 
- 如果提供 `vessel_name`，返回该船舶的本地费用
- 如果不提供 `vessel_name`，返回该航线的通用本地费用

### 3. 创建船舶本地费用
```http
POST /api/local-fees/rates/add_row/
```

**请求体**:
```json
{
  "vessel_name": "MSC MERAVIGLIA",
  "pol_code": "CNSHK",
  "pod_code": "INMAA",
  "fee_type_id": 1,
  "currency_id": 1,
  "rate_20gp": "760.00",
  "rate_40gp": "1287.00",
  "rate_40hq": "1287.00",
  "unit": "箱型",
  "effective_date": "2025-01-01",
  "expiry_date": "2025-12-31"
}
```

### 4. 批量创建或更新
```http
POST /api/local-fees/rates/batch/
```

**请求体**:
```json
{
  "vessel_name": "MSC MERAVIGLIA",
  "pol_code": "CNSHK",
  "pod_code": "INMAA",
  "rates": [
    {
      "fee_type_id": 1,
      "currency_id": 1,
      "rate_20gp": "760.00",
      "rate_40gp": "1287.00",
      "rate_40hq": "1287.00",
      "unit": "箱型"
    }
  ]
}
```

## 🔄 数据迁移策略

### 现有数据处理
1. **保持兼容性**: 现有的按航线查询接口继续工作
2. **数据迁移**: 为现有记录添加默认船名或标记为通用费用
3. **渐进式升级**: 新功能逐步替换旧功能

### 迁移脚本示例
```python
# 为现有记录添加vessel_name字段
def migrate_existing_data():
    for rate in LocalFeeRate.objects.filter(vessel_name__isnull=True):
        rate.vessel_name = 'GENERAL'  # 标记为通用费用
        rate.save()
```

## 🎨 前端集成

### 调用示例
```javascript
// 按船名查询
const vesselFees = await getLocalFeesByVessel('MSC MERAVIGLIA', 'CNSHK', 'INMAA')

// 按航线查询（兼容旧功能）
const routeFees = await getLocalFees('CNSHK', 'INMAA')
```

### 组件使用
```vue
<local-fee-dialog
  v-model:visible="dialogVisible"
  :pol-cd="polCd"
  :pod-cd="podCd"
  :vessel-name="vesselName"
/>
```

## 🔐 权限控制

### 权限级别
- `local_fee.view`: 查看本地费用
- `local_fee.edit`: 编辑本地费用
- `local_fee.delete`: 删除本地费用
- `local_fee.vessel_specific`: 管理船舶特定费用

### 业务规则
1. **船舶特定费用优先**: 如果存在船舶特定费用，优先显示
2. **回退到通用费用**: 如果没有船舶特定费用，显示航线通用费用
3. **权限继承**: 有船舶特定权限的用户自动拥有通用权限

## 📊 查询优化

### 数据库索引
```sql
-- 复合索引优化查询性能
CREATE INDEX idx_localfee_vessel_route ON local_fee_rate(vessel_name, pol_code, pod_code);
CREATE INDEX idx_localfee_route ON local_fee_rate(pol_code, pod_code);
CREATE INDEX idx_localfee_active ON local_fee_rate(is_active, effective_date, expiry_date);
```

### 缓存策略
- 使用Redis缓存常用船舶的费用数据
- 缓存键格式: `local_fee:{vessel_name}:{pol_code}:{pod_code}`
- 缓存时间: 1小时

## 🧪 测试用例

### API测试
```python
def test_get_vessel_local_fees():
    response = client.get('/api/local-fees/rates/by-vessel/', {
        'vessel_name': 'MSC MERAVIGLIA',
        'pol_cd': 'CNSHK',
        'pod_cd': 'INMAA'
    })
    assert response.status_code == 200
    assert len(response.data['data']) > 0

def test_fallback_to_general_fees():
    # 测试当没有船舶特定费用时，回退到通用费用
    response = client.get('/api/local-fees/rates/by-vessel/', {
        'vessel_name': 'NON_EXISTENT_VESSEL',
        'pol_cd': 'CNSHK',
        'pod_cd': 'INMAA'
    })
    assert response.status_code == 200
    # 应该返回通用费用
```

## 📈 性能监控

### 关键指标
- API响应时间
- 数据库查询次数
- 缓存命中率
- 用户操作频率

### 监控告警
- 响应时间超过500ms
- 数据库连接数过高
- 缓存命中率低于80%

---

**更新时间**: 2025年5月26日
**版本**: v2.0.0
**负责人**: 前端开发团队 