<template>
  <div class="test-local-fee-update">
    <h1>本地费用更新API测试</h1>
    
    <el-card>
      <template #header>
        <span>测试更新ID为17的记录</span>
      </template>
      
      <el-form :model="updateData" label-width="120px">
        <el-form-item label="polCd">
          <el-input v-model="updateData.polCd" />
        </el-form-item>
        <el-form-item label="podCd">
          <el-input v-model="updateData.podCd" />
        </el-form-item>
        <el-form-item label="carriercd">
          <el-input v-model="updateData.carriercd" />
        </el-form-item>
        <el-form-item label="name">
          <el-input v-model="updateData.name" />
        </el-form-item>
        <el-form-item label="unit_name">
          <el-input v-model="updateData.unit_name" />
        </el-form-item>
        <el-form-item label="price_20gp">
          <el-input v-model="updateData.price_20gp" />
        </el-form-item>
        <el-form-item label="price_40gp">
          <el-input v-model="updateData.price_40gp" />
        </el-form-item>
        <el-form-item label="price_40hq">
          <el-input v-model="updateData.price_40hq" />
        </el-form-item>
        <el-form-item label="price_per_bill">
          <el-input v-model="updateData.price_per_bill" />
        </el-form-item>
        <el-form-item label="currency">
          <el-input v-model="updateData.currency" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="testUpdate" :loading="loading">
            测试更新API
          </el-button>
          <el-button @click="testGet">
            先获取记录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="response" class="response-section">
        <h3>API响应:</h3>
        <pre>{{ JSON.stringify(response, null, 2) }}</pre>
      </div>
      
      <div v-if="error" class="error-section">
        <h3>错误信息:</h3>
        <pre>{{ JSON.stringify(error, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const response = ref(null)
const error = ref(null)

// 测试数据
const updateData = ref({
  polCd: 'CNSHK',
  podCd: 'INMAA',
  carriercd: 'IAL',
  name: '文件费',
  unit_name: '票',
  price_20gp: null,
  price_40gp: null,
  price_40hq: '90',
  price_per_bill: null,
  currency: 'CNY'
})

const testGet = async () => {
  loading.value = true
  response.value = null
  error.value = null
  
  try {
    console.log('🔍 获取ID为17的记录...')
    const result = await request.get('/local-fees/local-fees/17/')
    response.value = result
    console.log('✅ 获取成功:', result)
    
    // 更新表单数据
    if (result && result.data) {
      updateData.value = {
        polCd: result.data.polCd || 'CNSHK',
        podCd: result.data.podCd || 'INMAA', 
        carriercd: result.data.carriercd || 'IAL',
        name: result.data.name || '文件费',
        unit_name: result.data.unit_name || '票',
        price_20gp: result.data.price_20gp,
        price_40gp: result.data.price_40gp,
        price_40hq: result.data.price_40hq || '90',
        price_per_bill: result.data.price_per_bill,
        currency: result.data.currency || 'CNY'
      }
    }
    
    ElMessage.success('获取记录成功')
  } catch (err) {
    error.value = {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data
    }
    console.error('❌ 获取失败:', err)
    ElMessage.error('获取记录失败')
  } finally {
    loading.value = false
  }
}

const testUpdate = async () => {
  loading.value = true
  response.value = null
  error.value = null
  
  try {
    console.log('🔄 测试更新API，数据:', updateData.value)
    const result = await request.put('/local-fees/local-fees/17/', updateData.value)
    response.value = result
    console.log('✅ 更新成功:', result)
    ElMessage.success('更新成功')
  } catch (err) {
    error.value = {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      config: {
        url: err.config?.url,
        method: err.config?.method,
        data: err.config?.data
      }
    }
    console.error('❌ 更新失败:', err)
    console.error('❌ 错误响应:', err.response)
    ElMessage.error('更新失败: ' + (err.response?.data?.message || err.message))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-local-fee-update {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.response-section,
.error-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.error-section {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 