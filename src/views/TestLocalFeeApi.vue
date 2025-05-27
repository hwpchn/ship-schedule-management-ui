<template>
  <div class="test-local-fee-api">
    <el-card class="test-card">
      <template #header>
        <h2>本地费用API直接测试</h2>
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
          <el-button type="primary" @click="testQueryAPI" :loading="loading">
            测试查询API
          </el-button>
          <el-button @click="testListAPI" :loading="loading">
            测试列表API
          </el-button>
          <el-button @click="clearResults">
            清空结果
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- API调用结果 -->
    <el-card v-if="apiResults.length > 0" class="result-card">
      <template #header>
        <h3>API调用结果</h3>
      </template>
      
      <div v-for="(result, index) in apiResults" :key="index" class="api-result">
        <el-divider>{{ result.title }}</el-divider>
        
        <div class="result-info">
          <p><strong>请求URL:</strong> {{ result.url }}</p>
          <p><strong>请求参数:</strong> {{ JSON.stringify(result.params) }}</p>
          <p><strong>状态:</strong> 
            <el-tag :type="result.success ? 'success' : 'danger'">
              {{ result.success ? '成功' : '失败' }}
            </el-tag>
          </p>
          <p><strong>响应时间:</strong> {{ result.responseTime }}ms</p>
        </div>
        
        <div v-if="result.error" class="error-info">
          <el-alert type="error" :title="result.error" show-icon />
        </div>
        
        <div v-if="result.data" class="data-section">
          <h4>返回数据 ({{ Array.isArray(result.data) ? result.data.length : '1' }} 条记录)</h4>
          
          <!-- 如果是数组数据，显示表格 -->
          <el-table v-if="Array.isArray(result.data)" :data="result.data" border stripe max-height="300">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="名称" label="名称" min-width="120" />
            <el-table-column prop="单位" label="单位" width="80" />
            <el-table-column prop="20GP" label="20GP" width="100" />
            <el-table-column prop="40GP" label="40GP" width="100" />
            <el-table-column prop="40HQ" label="40HQ" width="100" />
            <el-table-column prop="单票价格" label="单票价格" width="120" />
            <el-table-column prop="币种" label="币种" width="80" />
          </el-table>
          
          <!-- 原始JSON数据 -->
          <div class="raw-data">
            <h5>原始响应数据:</h5>
            <pre>{{ JSON.stringify(result.rawData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

// 响应式状态
const loading = ref(false)
const apiResults = ref([])

// 测试参数
const testParams = reactive({
  polCd: 'CNSHK',
  podCd: 'INMAA',
  carriercd: 'IAL'
})

// 添加结果到列表
const addResult = (title, url, params, success, data, error, responseTime, rawData) => {
  apiResults.value.unshift({
    title,
    url,
    params,
    success,
    data,
    error,
    responseTime,
    rawData,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // 限制结果数量
  if (apiResults.value.length > 10) {
    apiResults.value = apiResults.value.slice(0, 10)
  }
}

// 测试查询API
const testQueryAPI = async () => {
  if (!testParams.polCd || !testParams.podCd) {
    ElMessage.warning('请输入起运港和目的港')
    return
  }
  
  loading.value = true
  const startTime = Date.now()
  
  try {
    const params = {
      polCd: testParams.polCd,
      podCd: testParams.podCd
    }
    
    if (testParams.carriercd) {
      params.carriercd = testParams.carriercd
    }
    
    console.log('🔍 测试查询API - 参数:', params)
    
    const response = await request.get('/local-fees/local-fees/query/', { params })
    const responseTime = Date.now() - startTime
    
    console.log('📊 查询API响应:', response)
    
    // 提取实际的数据数组用于表格显示
    let displayData = null
    if (response.data && response.data.data) {
      displayData = response.data.data
    } else if (response.data) {
      displayData = response.data
    }
    
    addResult(
      '查询API测试',
      '/local-fees/local-fees/query/',
      params,
      true,
      displayData,
      null,
      responseTime,
      response
    )
    
    ElMessage.success(`查询成功，响应时间: ${responseTime}ms`)
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('❌ 查询API失败:', error)
    
    addResult(
      '查询API测试',
      '/local-fees/local-fees/query/',
      { polCd: testParams.polCd, podCd: testParams.podCd, carriercd: testParams.carriercd },
      false,
      null,
      error.message || '未知错误',
      responseTime,
      error.response
    )
    
    ElMessage.error('查询失败: ' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

// 测试列表API
const testListAPI = async () => {
  loading.value = true
  const startTime = Date.now()
  
  try {
    const params = {}
    
    if (testParams.polCd) params.polCd = testParams.polCd
    if (testParams.podCd) params.podCd = testParams.podCd
    if (testParams.carriercd) params.carriercd = testParams.carriercd
    
    console.log('🔍 测试列表API - 参数:', params)
    
    const response = await request.get('/local-fees/local-fees/', { params })
    const responseTime = Date.now() - startTime
    
    console.log('📊 列表API响应:', response)
    
    addResult(
      '列表API测试',
      '/local-fees/local-fees/',
      params,
      true,
      response.data,
      null,
      responseTime,
      response
    )
    
    ElMessage.success(`列表查询成功，响应时间: ${responseTime}ms`)
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    console.error('❌ 列表API失败:', error)
    
    addResult(
      '列表API测试',
      '/local-fees/local-fees/',
      { polCd: testParams.polCd, podCd: testParams.podCd, carriercd: testParams.carriercd },
      false,
      null,
      error.message || '未知错误',
      responseTime,
      error.response
    )
    
    ElMessage.error('列表查询失败: ' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

// 清空结果
const clearResults = () => {
  apiResults.value = []
  ElMessage.info('已清空测试结果')
}
</script>

<style scoped>
.test-local-fee-api {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card,
.result-card {
  margin-bottom: 20px;
}

.test-form {
  max-width: 600px;
}

.api-result {
  margin-bottom: 30px;
}

.result-info {
  margin-bottom: 16px;
  
  p {
    margin: 8px 0;
    
    strong {
      color: #333;
    }
  }
}

.error-info {
  margin-bottom: 16px;
}

.data-section {
  .raw-data {
    margin-top: 20px;
    
    h5 {
      margin-bottom: 8px;
      color: #666;
    }
    
    pre {
      background-color: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-local-fee-api {
    padding: 10px;
  }
  
  .test-form {
    max-width: 100%;
  }
}
</style> 