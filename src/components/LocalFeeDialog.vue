<template>
  <el-dialog
    title="本地费用"
    v-model="dialogVisible"
    width="90%"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <div class="local-fee-dialog">
      <!-- 路线信息 -->
      <div class="route-info">
        <el-tag type="primary" size="large">
          <el-icon><Ship /></el-icon>
          <span v-if="props.vesselName">
            船舶：{{ props.vesselName }} | 航线：{{ getPortName(props.polCd) }} → {{ getPortName(props.podCd) }}
          </span>
          <span v-else>
            航线：{{ getPortName(props.polCd) }} → {{ getPortName(props.podCd) }}
          </span>
        </el-tag>
      </div>

      <!-- 本地费用表格 -->
      <div class="fee-table-container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="5" animated />
        </div>
        
        <!-- 错误状态显示 -->
        <div v-else-if="error" class="error-state">
          <el-alert
            :title="error"
            type="error"
            :closable="false"
            show-icon
          />
          <div class="error-actions">
            <el-button @click="loadLocalFeeData" :loading="loading">
              重新加载
            </el-button>
          </div>
        </div>
        
        <!-- 表格 -->
        <div v-else>
          <el-table 
            :data="localFeeData" 
            border
            stripe
            max-height="500"
            :empty-text="'暂无本地费用数据'"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            
            <el-table-column prop="名称" label="费用名称" width="160">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-input
                    v-model="scope.row.名称"
                    size="small"
                    @change="handleFieldUpdate(scope.row, '名称', scope.row.名称)"
                    placeholder="费用名称"
                  />
                </div>
                <span v-else>{{ scope.row.名称 }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="单位" label="单位" width="100" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-select
                    v-model="scope.row.单位"
                    size="small"
                    @change="handleFieldUpdate(scope.row, '单位', scope.row.单位)"
                    style="width: 100%"
                  >
                    <el-option label="箱" value="箱" />
                    <el-option label="箱型" value="箱型" />
                    <el-option label="票" value="票" />
                    <el-option label="单" value="单" />
                  </el-select>
                </div>
                <span v-else>{{ scope.row.单位 }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="20GP" width="140" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-input-number
                    :model-value="scope.row['20GP']"
                    size="small"
                    :min="0"
                    :precision="2"
                    @update:model-value="handleFieldUpdate(scope.row, '20GP', $event)"
                    placeholder="--"
                    style="width: 100%"
                  />
                </div>
                <span v-else>{{ scope.row['20GP'] || '--' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="40GP" width="140" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-input-number
                    :model-value="scope.row['40GP']"
                    size="small"
                    :min="0"
                    :precision="2"
                    @update:model-value="handleFieldUpdate(scope.row, '40GP', $event)"
                    placeholder="--"
                    style="width: 100%"
                  />
                </div>
                <span v-else>{{ scope.row['40GP'] || '--' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="40HQ" width="140" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-input-number
                    :model-value="scope.row['40HQ']"
                    size="small"
                    :min="0"
                    :precision="2"
                    @update:model-value="handleFieldUpdate(scope.row, '40HQ', $event)"
                    placeholder="--"
                    style="width: 100%"
                  />
                </div>
                <span v-else>{{ scope.row['40HQ'] || '--' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="单票价格" width="140" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-input-number
                    :model-value="scope.row.单票价格"
                    size="small"
                    :min="0"
                    :precision="2"
                    @update:model-value="handleFieldUpdate(scope.row, '单票价格', $event)"
                    placeholder="--"
                    style="width: 100%"
                  />
                </div>
                <span v-else>{{ scope.row.单票价格 || '--' }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="币种" label="币种" width="100" align="center">
              <template #default="scope">
                <div v-if="permissionStore.canEditLocalFee && scope.row.editable">
                  <el-select
                    v-model="scope.row.币种"
                    size="small"
                    @change="handleFieldUpdate(scope.row, '币种', scope.row.币种)"
                    style="width: 100%"
                  >
                    <el-option label="CNY" value="CNY" />
                    <el-option label="USD" value="USD" />
                    <el-option label="EUR" value="EUR" />
                    <el-option label="JPY" value="JPY" />
                    <el-option label="INR" value="INR" />
                  </el-select>
                </div>
                <span v-else>{{ scope.row.币种 }}</span>
              </template>
            </el-table-column>
            
            <el-table-column 
              v-if="permissionStore.canEditLocalFee"
              label="操作" 
              width="100" 
              align="center"
              fixed="right"
            >
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="handleDeleteRow(scope.row)"
                  :disabled="!scope.row.editable"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 添加新行按钮 -->
          <div v-if="permissionStore.canEditLocalFee" class="add-row-section">
            <el-button 
              type="default" 
              class="dashed-button"
              @click="handleAddRow"
              style="width: 100%; margin-top: 16px;"
              :loading="loading"
            >
              <el-icon><Plus /></el-icon>
              添加新费用项目
            </el-button>
          </div>
          
          <!-- 批量操作按钮 -->
          <div v-if="permissionStore.canEditLocalFee && pendingUpdates.length > 0" class="batch-actions">
            <el-alert
              :title="`有 ${pendingUpdates.length} 项待保存的更改`"
              type="warning"
              :closable="false"
              show-icon
            />
            <div class="action-buttons">
              <el-button @click="clearPendingUpdates" :disabled="loading">
                取消更改
              </el-button>
              <el-button type="primary" @click="savePendingUpdates" :loading="loading">
                保存全部更改
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button 
          v-if="permissionStore.canEditLocalFee" 
          type="primary" 
          @click="handleExport"
        >
          导出费用表
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Ship,
  Plus,
  Download
} from '@element-plus/icons-vue'
import { usePermissionStore } from '@/stores/permission'
import { useAuthStore } from '@/stores/auth'
import request from '@/api/request'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  polCd: {
    type: String,
    required: true
  },
  podCd: {
    type: String,
    required: true
  },
  vesselName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// Stores
const permissionStore = usePermissionStore()
const authStore = useAuthStore()

// 响应式状态
const loading = ref(false)
const localFeeData = ref([])
const pendingUpdates = ref([])
const error = ref(null)

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 港口名称映射
const portNames = {
  'CNSHK': '蛇口',
  'INMAA': '金奈',
  'CNSHA': '上海',
  'THBKK': '曼谷',
  'CNNGB': '宁波',
  'CNQGD': '青岛',
  'CNTXG': '天津新港',
  'CNXMN': '厦门',
  'CNHKG': '香港',
  'SGSIN': '新加坡',
  'MYLPG': '巴生港',
  'IDJKT': '雅加达',
  'VNHPH': '海防',
  'VNSGN': '胡志明市'
}

// 工具函数
const getPortName = (code) => {
  return portNames[code] || code
}

// 主要方法 - 加载本地费用数据
const loadLocalFeeData = async () => {
  loading.value = true
  error.value = null
  
  try {
    console.log('🔍 查询本地费用:', `${props.polCd} → ${props.podCd} (${props.vesselName || '所有船司'})`)
    
    // 构建查询参数
    const params = {
      polCd: props.polCd,
      podCd: props.podCd
    }
    
    if (props.vesselName) {
      params.carriercd = props.vesselName
    }
    
    // 调用查询API - 根据文档使用正确的端点
    const response = await request.get('/local-fees/local-fees/query/', { params })
    
    console.log('📊 API响应状态:', response?.status || response?.code)
    
    // 处理双层数据结构
    let apiData = null
    if (response && response.data && response.data.data) {
      // API返回格式: {code: 200, data: {status: "success", data: [...]}}
      apiData = response.data.data
    } else if (response && response.data) {
      // 直接返回格式: {status: "success", data: [...]}
      apiData = response.data
    }
    
    if (apiData && Array.isArray(apiData)) {
      // 根据文档，API返回的是前端格式的数据
      localFeeData.value = apiData.map((item, index) => ({
        ...item,
        // 确保数字字段是数字类型而不是字符串
        '20GP': item['20GP'] ? parseFloat(item['20GP']) : null,
        '40GP': item['40GP'] ? parseFloat(item['40GP']) : null,
        '40HQ': item['40HQ'] ? parseFloat(item['40HQ']) : null,
        '单票价格': item['单票价格'] ? parseFloat(item['单票价格']) : null,
        editable: true, // 标记为可编辑
        isNew: false,   // 标记为非新增
        _originalData: { ...item } // 保存原始数据用于比较
      }))
      
      console.log(`✅ 加载成功: ${localFeeData.value.length} 条本地费用记录`)
      ElMessage.success(`加载成功，共 ${localFeeData.value.length} 条本地费用记录`)
    } else {
      localFeeData.value = []
      console.log('⚠️ 未找到有效的数据数组:', { response, apiData })
      ElMessage.info('暂无本地费用数据')
    }
  } catch (err) {
    console.error('❌ 加载本地费用失败:', err)
    
    // 检查是否为认证错误且已经有token刷新机制处理
    if (err.code === 401 || err.response?.status === 401) {
      // 401错误通常已经由request拦截器处理了token刷新
      // 这里只是设置错误状态，但允许重试
      error.value = '认证失败，请稍后重试或刷新页面'
      console.log('🔄 认证错误，可能正在刷新token...')
    } else if (err.code === 403 || err.response?.status === 403) {
      error.value = '您没有查看本地费用的权限，请联系管理员'
      ElMessage.error('权限不足，无法查看本地费用')
    } else if (err.code === 404 || err.response?.status === 404) {
      error.value = '未找到相关的本地费用数据'
      ElMessage.warning('未找到本地费用数据')
    } else {
      error.value = '加载本地费用失败，请稍后重试'
      ElMessage.error('加载失败: ' + (err.message || '网络错误'))
    }
    
    localFeeData.value = []
  } finally {
    loading.value = false
  }
}

// 字段更新处理
const handleFieldUpdate = async (row, field, value) => {
  if (!permissionStore.canEditLocalFee) {
    ElMessage.warning('您没有编辑本地费用的权限')
    return
  }
  
  // 更新行数据
  row[field] = value
  
  // 添加到待更新列表
  const existingIndex = pendingUpdates.value.findIndex(item => item.id === row.id)
  if (existingIndex >= 0) {
    // 更新现有的待更新项
    pendingUpdates.value[existingIndex] = {
      ...pendingUpdates.value[existingIndex],
      id: row.id,
      isNew: row.isNew || false,
      [field]: value
    }
  } else {
    // 添加新的待更新项
    pendingUpdates.value.push({
      id: row.id,
      isNew: row.isNew || false,
      [field]: value
    })
  }
  
  console.log(`📝 字段更新: ID=${row.id}, 字段=${field}, 值=${value}, 待更新项=${pendingUpdates.value.length}`)
}

// 添加新行
const handleAddRow = () => {
  const newRow = {
    id: Date.now(), // 临时ID
    名称: '',
    单位: '箱型',
    '20GP': null,
    '40GP': null,
    '40HQ': null,
    单票价格: null,
    币种: 'CNY',
    editable: true,
    isNew: true,
    _originalData: {}
  }
  
  localFeeData.value.push(newRow)
  ElMessage.success('已添加新行，请填写费用信息')
}

// 删除行
const handleDeleteRow = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除费用项目"${row.名称}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    if (row.isNew) {
      // 新添加的行，直接从列表中移除
      const index = localFeeData.value.findIndex(item => item.id === row.id)
      if (index !== -1) {
        localFeeData.value.splice(index, 1)
        ElMessage.success('已删除新添加的费用项目')
      }
    } else {
      // 现有行，调用API删除
      loading.value = true
      try {
        await request.delete(`/local-fees/local-fees/${row.id}/`)
        const index = localFeeData.value.findIndex(item => item.id === row.id)
        if (index !== -1) {
          localFeeData.value.splice(index, 1)
        }
        ElMessage.success('费用项目删除成功')
      } catch (error) {
        ElMessage.error('删除失败: ' + (error.message || '网络错误'))
      } finally {
        loading.value = false
      }
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 保存待更新的更改
const savePendingUpdates = async () => {
  if (pendingUpdates.value.length === 0) {
    ElMessage.info('没有待保存的更改')
    return
  }
  
  loading.value = true
  
  try {
    let successCount = 0
    let errorCount = 0
    const errors = []
    
    console.log(`📝 开始保存 ${pendingUpdates.value.length} 项更改`)
    
    // 逐个处理更新
    for (const update of pendingUpdates.value) {
      try {
        // 安全地获取属性，避免解构错误
        const id = update.id
        const isNew = update.isNew || false
        
        console.log(`📋 处理项目 ID:${id}, 是否新建:${isNew}`)
        
        // 查找对应的记录
        const currentRecord = localFeeData.value.find(item => item.id === id)
        if (!currentRecord) {
          throw new Error(`找不到ID为 ${id} 的记录`)
        }
        
        if (isNew) {
          // 新建记录 - 转换为API格式
          const createData = {
            polCd: props.polCd,
            podCd: props.podCd,
            carriercd: props.vesselName || '',
            name: currentRecord.名称 || '',
            unit_name: currentRecord.单位 || '箱型',
            price_20gp: currentRecord['20GP'] ? currentRecord['20GP'].toString() : null,
            price_40gp: currentRecord['40GP'] ? currentRecord['40GP'].toString() : null,
            price_40hq: currentRecord['40HQ'] ? currentRecord['40HQ'].toString() : null,
            price_per_bill: currentRecord.单票价格 ? currentRecord.单票价格.toString() : null,
            currency: currentRecord.币种 || 'CNY'
          }
          
          console.log('🆕 创建新记录:', createData)
          const response = await request.post('/local-fees/local-fees/', createData)
          console.log('✅ 创建成功:', response)
          successCount++
                  } else {
            // 更新现有记录 - 转换为API格式，包含所有必需字段
            const updateApiData = {
              polCd: props.polCd,
              podCd: props.podCd,
              carriercd: props.vesselName || '',
              name: currentRecord.名称 || '',
              unit_name: currentRecord.单位 || '箱型',
              price_20gp: currentRecord['20GP'] ? currentRecord['20GP'].toString() : null,
              price_40gp: currentRecord['40GP'] ? currentRecord['40GP'].toString() : null,
              price_40hq: currentRecord['40HQ'] ? currentRecord['40HQ'].toString() : null,
              price_per_bill: currentRecord.单票价格 ? currentRecord.单票价格.toString() : null,
              currency: currentRecord.币种 || 'CNY'
            }
          
          console.log(`🔄 更新记录 ID:${id}:`, updateApiData)
          const response = await request.put(`/local-fees/local-fees/${id}/`, updateApiData)
          console.log('✅ 更新成功:', response)
          successCount++
        }
      } catch (error) {
        errorCount++
        const errorMsg = error.response?.data?.message || error.message || '未知错误'
        errors.push(`ID ${update.id}: ${errorMsg}`)
        
        console.error(`❌ 处理失败 ID:${update.id}:`, {
          error: error,
          status: error.response?.status,
          message: errorMsg,
          data: error.response?.data
        })
      }
    }
    
    console.log(`📊 保存结果: 成功 ${successCount} 项, 失败 ${errorCount} 项`)
    
    // 显示结果
    if (successCount > 0) {
      if (errorCount === 0) {
        ElMessage.success(`✅ 成功保存 ${successCount} 项更改`)
        // 清空待更新列表
        pendingUpdates.value = []
        // 刷新数据
        await loadLocalFeeData()
      } else {
        ElMessage.warning(`⚠️ 成功保存 ${successCount} 项，失败 ${errorCount} 项`)
        console.log('失败详情:', errors)
      }
    } else {
      ElMessage.error(`❌ 所有更改都保存失败`)
      if (errors.length > 0) {
        console.error('所有错误:', errors)
        // 显示第一个错误的详细信息
        ElMessage.error(`详细错误: ${errors[0]}`)
      }
    }
    
  } catch (error) {
    console.error('❌ 保存过程出现异常:', error)
    ElMessage.error(`保存失败: ${error.message || '系统错误'}`)
  } finally {
    loading.value = false
  }
}

// 清空待更新的更改
const clearPendingUpdates = () => {
  console.log(`🧹 清空 ${pendingUpdates.value.length} 项待更新更改`)
  pendingUpdates.value = []
  // 重新加载数据以恢复原始值
  loadLocalFeeData()
  ElMessage.info('已取消所有更改')
}

// 导出费用表
const handleExport = () => {
  // 简单的CSV导出
  const headers = ['序号', '名称', '单位', '20GP', '40GP', '40HQ', '单票价格', '币种']
  const csvContent = [
    headers.join(','),
    ...localFeeData.value.map((row, index) => [
      index + 1,
      row.名称,
      row.单位,
      row['20GP'] || '--',
      row['40GP'] || '--',
      row['40HQ'] || '--',
      row.单票价格 || '--',
      row.币种
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  
  // 构建文件名
  const vesselPart = props.vesselName ? `${props.vesselName}_` : ''
  const fileName = `本地费用_${vesselPart}${getPortName(props.polCd)}-${getPortName(props.podCd)}.csv`
  link.setAttribute('download', fileName)
  
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('费用表导出成功')
}

// 关闭弹窗
const handleClose = () => {
  if (pendingUpdates.value.length > 0) {
    ElMessageBox.confirm(
      '有未保存的更改，确定要关闭吗？',
      '确认关闭',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(() => {
      dialogVisible.value = false
      pendingUpdates.value = []
    }).catch(() => {
      // 用户取消
    })
  } else {
    dialogVisible.value = false
  }
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadLocalFeeData()
  }
})

// 监听认证状态变化，当token刷新后重新加载数据
watch(() => authStore.token, (newToken, oldToken) => {
  // 当token变化且弹窗打开时，重新加载数据
  if (newToken && newToken !== oldToken && props.visible && error.value) {
    console.log('🔄 检测到token更新，重新加载本地费用数据')
    setTimeout(() => {
      loadLocalFeeData()
    }, 500) // 稍微延迟，确保token已经生效
  }
})

// 生命周期
onMounted(async () => {
  // 确保权限已加载
  if (!permissionStore.isPermissionsInitialized) {
    await permissionStore.loadUserPermissions()
  }
  
  // 如果已经打开，立即加载数据
  if (props.visible) {
    loadLocalFeeData()
  }
})
</script>

<style scoped>
.local-fee-dialog {
  .route-info {
    margin-bottom: 20px;
    text-align: center;
    
    .el-tag {
      padding: 12px 20px;
      font-size: 16px;
      font-weight: 600;
      
      .el-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
  
  .fee-table-container {
    .loading-state {
      margin-bottom: 20px;
    }
    
    .error-state {
      margin-bottom: 20px;
      text-align: center;
      
      .error-actions {
        margin-top: 16px;
      }
    }
    
    .add-row-section {
      margin-top: 16px;
    }
    
    .batch-actions {
      margin-top: 20px;
      
      .action-buttons {
        margin-top: 12px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 表格样式优化 */
:deep(.el-table) {
  .el-table__header {
    background-color: #f8f9fa;
    
    th {
      background-color: #f8f9fa !important;
      color: #333;
      font-weight: 600;
    }
  }
  
  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

/* 输入框样式 */
:deep(.el-input-number) {
  .el-input__inner {
    text-align: center;
  }
}

/* 虚线按钮样式 */
.dashed-button {
  border-style: dashed !important;
  border-color: #d9d9d9 !important;
  color: #666 !important;
  
  &:hover {
    border-color: #409eff !important;
    color: #409eff !important;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .local-fee-dialog {
    .route-info .el-tag {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
  
  .batch-actions {
    .action-buttons {
      flex-direction: column;
    }
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 