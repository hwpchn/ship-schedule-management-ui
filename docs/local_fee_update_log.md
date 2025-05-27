# 本地费用API更新日志

## 更新概述

本次更新完全重构了本地费用功能，使用新的API接口，提供更好的用户体验和更强的功能。

## 更新时间

2025-01-27

## 主要更新内容

### 1. API接口完全重构

#### 1.1 新的查询API
- **接口**: `GET /api/local-fees/local-fees/query/`
- **功能**: 查询本地费用（前端格式）⭐ 重要
- **参数**: 
  - `polCd` (必填): 起运港五字码
  - `podCd` (必填): 目的港五字码
  - `carriercd` (可选): 船公司英文名
- **响应格式**: 直接返回前端表格需要的中文字段格式

#### 1.2 CRUD操作API
- **创建**: `POST /api/local-fees/local-fees/`
- **更新**: `PUT /api/local-fees/local-fees/{id}/`
- **删除**: `DELETE /api/local-fees/local-fees/{id}/`
- **详情**: `GET /api/local-fees/local-fees/{id}/`
- **列表**: `GET /api/local-fees/local-fees/`

### 2. 前端组件更新

#### 2.1 LocalFeeDialog.vue 重构
- ✅ 使用新的查询API `queryLocalFees()`
- ✅ 支持前端格式的数据显示（中文字段名）
- ✅ 优化数据转换逻辑
- ✅ 改进编辑和保存功能
- ✅ 支持新增行功能
- ✅ 支持删除功能
- ✅ 支持批量保存
- ✅ 优化导出功能

#### 2.2 数据格式标准化
**前端显示格式**:
```json
{
  "id": 1,
  "名称": "起运港码头费",
  "单位": "箱型",
  "20GP": "760.00",
  "40GP": "1287.00", 
  "40HQ": "1287.00",
  "单票价格": null,
  "币种": "CNY"
}
```

**API交互格式**:
```json
{
  "polCd": "CNSHK",
  "podCd": "INMAA",
  "carriercd": "IAL",
  "name": "起运港码头费",
  "unit_name": "箱型",
  "price_20gp": "760.00",
  "price_40gp": "1287.00",
  "price_40hq": "1287.00",
  "price_per_bill": null,
  "currency": "CNY"
}
```

### 3. API客户端重构

#### 3.1 localFeeApi 对象更新
```javascript
export const localFeeApi = {
  // 新增：查询API（前端格式）
  async query(polCd, podCd, carriercd = ''),
  
  // 标准CRUD操作
  async getList(params = {}),
  async getDetail(id),
  async create(data),
  async update(id, data),
  async delete(id),
  
  // 批量操作
  async batchSave(changes)
}
```

#### 3.2 便捷函数更新
```javascript
// 新增：查询本地费用（前端格式）
export const queryLocalFees = async (polCd, podCd, carriercd = '')

// 保持向后兼容
export const getLocalFees = async (polCd, podCd)
export const getLocalFeesByVessel = async (vesselName, polCd, podCd)
```

### 4. 权限系统更新

#### 4.1 新增权限检查
```javascript
const canEditLocalFee = computed(() => {
  return hasPermission('local_fee.create') || 
         hasPermission('local_fee.update') || 
         hasPermission('local_fee.edit')
})

const canViewLocalFee = computed(() => {
  return hasPermission('local_fee.query') || 
         hasPermission('local_fee.list') || 
         hasPermission('local_fee.detail') ||
         hasPermission('local_fee.view')
})

// 新增权限
const canCreateLocalFee = computed(() => {
  return hasPermission('local_fee.create')
})

const canQueryLocalFee = computed(() => {
  return hasPermission('local_fee.query')
})
```

#### 4.2 权限映射
根据文档，支持以下权限：
- `local_fee.list` - 查看本地费用列表
- `local_fee.detail` - 查看本地费用详情  
- `local_fee.create` - 创建本地费用
- `local_fee.update` - 修改本地费用
- `local_fee.delete` - 删除本地费用
- `local_fee.query` - 查询本地费用（前台API专用）

### 5. 测试功能

#### 5.1 新增测试页面
- **路径**: `/test-local-fee-new`
- **组件**: `TestLocalFeeNew.vue`
- **功能**: 
  - 测试查询API
  - 测试创建API
  - 测试更新API
  - 测试删除API
  - API调用日志显示

#### 5.2 测试数据
使用文档中提供的测试数据：
- **起运港**: CNSHK (蛇口)
- **目的港**: INMAA (金奈)  
- **船公司**: IAL

### 6. 向后兼容性

#### 6.1 保持的接口
- `getLocalFees()` - 重定向到新的查询API
- `getLocalFeesByVessel()` - 重定向到新的查询API
- `localFeeApi.deleteRow()` - 别名到 `localFeeApi.delete()`

#### 6.2 移除的接口
- `localFeeApi.getByVessel()` - 替换为 `localFeeApi.query()`
- `localFeeApi.updateField()` - 替换为 `localFeeApi.update()`
- `localFeeApi.addRow()` - 替换为 `localFeeApi.create()`
- `localFeeApi.getEditableTable()` - 不再需要

### 7. 错误处理优化

#### 7.1 网络错误处理
- 保持模拟数据作为fallback
- 区分认证错误和网络错误
- 提供更友好的错误提示

#### 7.2 权限错误处理
- 403错误：权限不足提示
- 401错误：登录过期提示
- 404错误：数据不存在提示

### 8. 用户体验改进

#### 8.1 表格编辑
- ✅ 实时编辑支持
- ✅ 批量保存功能
- ✅ 取消更改功能
- ✅ 编辑状态提示

#### 8.2 数据操作
- ✅ 添加新行功能
- ✅ 删除确认对话框
- ✅ 操作结果反馈
- ✅ 自动刷新数据

#### 8.3 导出功能
- ✅ CSV格式导出
- ✅ 智能文件命名
- ✅ 包含船舶和航线信息

## 技术细节

### 数据转换逻辑

#### 前端到API格式转换
```javascript
const createData = {
  polCd: props.polCd,
  podCd: props.podCd,
  carriercd: props.vesselName || '',
  name: updateData.名称 || '',
  unit_name: updateData.单位 || '箱型',
  price_20gp: updateData['20GP'] || null,
  price_40gp: updateData['40GP'] || null,
  price_40hq: updateData['40HQ'] || null,
  price_per_bill: updateData.单票价格 || null,
  currency: updateData.币种 || 'CNY'
}
```

#### API到前端格式转换
```javascript
// 新API直接返回前端格式，无需转换
localFeeData.value = result.data.map((item, index) => ({
  ...item,
  editable: true,
  isNew: false,
  _originalData: { ...item }
}))
```

### 批量保存逻辑
```javascript
for (const update of pendingUpdates.value) {
  const { id, isNew, ...updateData } = update
  
  if (isNew) {
    // 新建记录
    await localFeeApi.create(createData)
  } else {
    // 更新记录
    await localFeeApi.update(id, updateApiData)
  }
}
```

## 测试验证

### 功能测试清单
- [x] 查询本地费用数据
- [x] 显示前端格式数据
- [x] 编辑表格字段
- [x] 添加新行
- [x] 删除行
- [x] 批量保存更改
- [x] 取消更改
- [x] 导出CSV文件
- [x] 权限控制
- [x] 错误处理

### API测试清单
- [x] GET `/api/local-fees/local-fees/query/`
- [x] POST `/api/local-fees/local-fees/`
- [x] PUT `/api/local-fees/local-fees/{id}/`
- [x] DELETE `/api/local-fees/local-fees/{id}/`

## 部署注意事项

### 1. 后端API要求
确保后端已实现新的API接口，特别是：
- 查询API返回前端格式数据
- 支持唯一性约束检查
- 正确的权限验证

### 2. 权限配置
为用户分配适当的权限：
- 普通用户：`local_fee.query`
- 管理员：`local_fee.create`, `local_fee.update`, `local_fee.delete`

### 3. 数据迁移
如果有旧数据，确保：
- 字段名称映射正确
- 数据格式兼容
- 唯一性约束满足

## 已知问题

### 1. 模拟数据
当后端API不可用时，会使用模拟数据，这可能导致：
- 创建/更新/删除操作无法持久化
- 数据与实际后端不同步

### 2. 网络错误处理
在网络不稳定环境下，可能出现：
- 部分操作失败但界面未及时更新
- 需要手动刷新数据

## 后续计划

### 短期计划
1. 完善错误处理机制
2. 添加更多测试用例
3. 优化性能表现

### 长期计划
1. 支持批量导入功能
2. 添加数据验证规则
3. 实现实时数据同步

## 总结

本次更新成功实现了：
1. ✅ 完全重构本地费用API
2. ✅ 优化用户界面和体验
3. ✅ 改进数据处理逻辑
4. ✅ 增强权限控制
5. ✅ 保持向后兼容性

更新后的本地费用功能更加稳定、易用，符合现代Web应用的标准。 