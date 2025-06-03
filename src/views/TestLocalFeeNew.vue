<template>
  <div class="test-local-fee-new">
    <el-card class="test-card">
      <template #header>
        <h2>本地费用新API测试</h2>
      </template>

      <el-form :model="testParams" label-width="120px" class="test-form">
        <el-form-item label="起运港:">
          <el-input v-model="testParams.polCd" placeholder="请输入起运港代码" />
        </el-form-item>
        <el-form-item label="目的港:">
          <el-input v-model="testParams.podCd" placeholder="请输入目的港代码" />
        </el-form-item>
        <el-form-item label="船公司:">
          <el-input v-model="testParams.carriercd" placeholder="请输入船公司代码（可选）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testQueryAPI" :loading="loading">测试查询API</el-button>
          <el-button @click="testCreateAPI" :loading="loading">测试创建API</el-button>
          <el-button @click="clearResults">清空结果</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 查询结果 -->
    <el-card v-if="queryResults.length > 0" class="result-card">
      <template #header>
        <h3>查询结果 ({{ queryResults.length }} 条记录)</h3>
      </template>

      <el-table :data="queryResults" border stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="名称" label="名称" min-width="120" />
        <el-table-column prop="单位" label="单位" width="80" />
        <el-table-column prop="20GP" label="20GP" width="100" />
        <el-table-column prop="40GP" label="40GP" width="100" />
        <el-table-column prop="40HQ" label="40HQ" width="100" />
        <el-table-column prop="单票价格" label="单票价格" width="120" />
        <el-table-column prop="币种" label="币种" width="80" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="testUpdateAPI(scope.row)"
              :loading="loading"
            >
              测试更新
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="testDeleteAPI(scope.row)"
              :loading="loading"
            >
              测试删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- API响应日志 -->
    <el-card v-if="apiLogs.length > 0" class="log-card">
      <template #header>
        <h3>API调用日志</h3>
      </template>

      <div class="log-container">
        <div v-for="(log, index) in apiLogs" :key="index" class="log-item" :class="log.type">
          <div class="log-header">
            <span class="log-method">{{ log.method }}</span>
            <span class="log-url">{{ log.url }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
          <div class="log-content">
            <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryLocalFees, localFeeApi } from '@/api/localFee'

// 响应式状态
const loading = ref(false)
const queryResults = ref([])
const apiLogs = ref([])

// 测试参数
const testParams = reactive({
  polCd: 'CNSHK',
  podCd: 'INMAA',
  carriercd: 'IAL',
})

// 工具函数
const addLog = (method, url, data, type = 'success') => {
  apiLogs.value.unshift({
    method,
    url,
    data,
    type,
    time: new Date().toLocaleTimeString(),
  })

  // 限制日志数量
  if (apiLogs.value.length > 10) {
    apiLogs.value = apiLogs.value.slice(0, 10)
  }
}

// 测试查询API
const testQueryAPI = async () => {
  if (!testParams.polCd || !testParams.podCd) {
    ElMessage.warning('请输入起运港和目的港')
    return
  }

  loading.value = true

  try {
    const result = await queryLocalFees(testParams.polCd, testParams.podCd, testParams.carriercd)

    addLog(
      'GET',
      `/api/local-fees/local-fees/query/?polCd=${testParams.polCd}&podCd=${testParams.podCd}&carriercd=${testParams.carriercd}`,
      result,
      'success'
    )

    if (result && result.data) {
      queryResults.value = result.data
      ElMessage.success(`查询成功，获取到 ${result.data.length} 条记录`)
    } else {
      queryResults.value = []
      ElMessage.info('查询成功，但没有数据')
    }
  } catch (error) {
    addLog(
      'GET',
      `/api/local-fees/local-fees/query/?polCd=${testParams.polCd}&podCd=${testParams.podCd}&carriercd=${testParams.carriercd}`,
      { error: error.message },
      'error'
    )

    ElMessage.error('查询失败: ' + error.message)
    console.error('查询API测试失败:', error)
  } finally {
    loading.value = false
  }
}

// 测试创建API
const testCreateAPI = async () => {
  if (!testParams.polCd || !testParams.podCd) {
    ElMessage.warning('请输入起运港和目的港')
    return
  }

  loading.value = true

  try {
    const createData = {
      polCd: testParams.polCd,
      podCd: testParams.podCd,
      carriercd: testParams.carriercd || 'TEST',
      name: '测试费用项目',
      unit_name: '箱型',
      price_20gp: '100.00',
      price_40gp: '200.00',
      price_40hq: '200.00',
      currency: 'CNY',
    }

    const result = await localFeeApi.create(createData)

    addLog(
      'POST',
      '/api/local-fees/local-fees/',
      { request: createData, response: result },
      'success'
    )

    ElMessage.success('创建成功')

    // 重新查询以更新列表
    await testQueryAPI()
  } catch (error) {
    addLog('POST', '/api/local-fees/local-fees/', { error: error.message }, 'error')

    ElMessage.error('创建失败: ' + error.message)
    console.error('创建API测试失败:', error)
  } finally {
    loading.value = false
  }
}

// 测试更新API
const testUpdateAPI = async row => {
  loading.value = true

  try {
    const updateData = {
      polCd: testParams.polCd,
      podCd: testParams.podCd,
      carriercd: testParams.carriercd || 'TEST',
      name: row.名称 + ' (已更新)',
      unit_name: row.单位,
      price_20gp: row['20GP'],
      price_40gp: row['40GP'],
      price_40hq: row['40HQ'],
      price_per_bill: row.单票价格,
      currency: row.币种,
    }

    const result = await localFeeApi.update(row.id, updateData)

    addLog(
      'PUT',
      `/api/local-fees/local-fees/${row.id}/`,
      { request: updateData, response: result },
      'success'
    )

    ElMessage.success('更新成功')

    // 重新查询以更新列表
    await testQueryAPI()
  } catch (error) {
    addLog('PUT', `/api/local-fees/local-fees/${row.id}/`, { error: error.message }, 'error')

    ElMessage.error('更新失败: ' + error.message)
    console.error('更新API测试失败:', error)
  } finally {
    loading.value = false
  }
}

// 测试删除API
const testDeleteAPI = async row => {
  try {
    await ElMessageBox.confirm(`确定要删除"${row.名称}"吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    loading.value = true

    const result = await localFeeApi.delete(row.id)

    addLog('DELETE', `/api/local-fees/local-fees/${row.id}/`, result, 'success')

    ElMessage.success('删除成功')

    // 重新查询以更新列表
    await testQueryAPI()
  } catch (error) {
    if (error !== 'cancel') {
      addLog('DELETE', `/api/local-fees/local-fees/${row.id}/`, { error: error.message }, 'error')

      ElMessage.error('删除失败: ' + error.message)
      console.error('删除API测试失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 清空结果
const clearResults = () => {
  queryResults.value = []
  apiLogs.value = []
  ElMessage.info('已清空测试结果')
}
</script>

<style scoped>
.test-local-fee-new {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card,
.result-card,
.log-card {
  margin-bottom: 20px;
}

.test-form {
  max-width: 600px;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
}

.log-item {
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.log-item.success {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.log-item.error {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.log-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-weight: 600;
}

.log-method {
  background-color: #409eff;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.log-url {
  color: #606266;
  font-family: monospace;
  font-size: 12px;
}

.log-time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.log-content {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
  overflow-x: auto;
}

.log-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-local-fee-new {
    padding: 10px;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .log-time {
    margin-left: 0;
  }
}
</style>
