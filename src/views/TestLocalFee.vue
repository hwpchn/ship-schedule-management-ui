<template>
  <div class="test-local-fee">
    <h2>本地费用API测试</h2>

    <el-card class="test-card">
      <h3>测试参数</h3>
      <el-form :model="testParams" label-width="120px">
        <el-form-item label="船名:">
          <el-input v-model="testParams.vesselName" placeholder="请输入船名" />
        </el-form-item>
        <el-form-item label="起运港:">
          <el-input v-model="testParams.polCd" placeholder="请输入起运港代码" />
        </el-form-item>
        <el-form-item label="目的港:">
          <el-input v-model="testParams.podCd" placeholder="请输入目的港代码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testAPI" :loading="loading">测试API</el-button>
          <el-button @click="clearResults">清空结果</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="result-card" v-if="apiResult">
      <h3>API响应结果</h3>
      <div class="result-info">
        <p>
          <strong>状态:</strong>
          {{ apiResult.success ? '成功' : '失败' }}
        </p>
        <p>
          <strong>响应时间:</strong>
          {{ apiResult.responseTime }}ms
        </p>
        <p v-if="apiResult.error">
          <strong>错误信息:</strong>
          {{ apiResult.error }}
        </p>
      </div>

      <div v-if="apiResult.data" class="data-section">
        <h4>返回数据 ({{ apiResult.data.length }} 条记录)</h4>
        <el-table :data="apiResult.data" border style="width: 100%">
          <el-table-column prop="序号" label="序号" width="80" />
          <el-table-column prop="名称" label="名称" width="150" />
          <el-table-column prop="单位" label="单位" width="100" />
          <el-table-column prop="GP20" label="20GP" width="100" />
          <el-table-column prop="GP40" label="40GP" width="100" />
          <el-table-column prop="HQ40" label="40HQ" width="100" />
          <el-table-column prop="单票价格" label="单票价格" width="100" />
          <el-table-column prop="币种" label="币种" width="80" />
        </el-table>
      </div>

      <div class="raw-response">
        <h4>原始响应数据</h4>
        <pre>{{ JSON.stringify(apiResult.rawResponse, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getLocalFeesByVessel } from '@/api/localFee'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const apiResult = ref(null)

const testParams = reactive({
  vesselName: 'MSC MERAVIGLIA',
  polCd: 'CNSHK',
  podCd: 'USLA',
})

const testAPI = async () => {
  if (!testParams.vesselName || !testParams.polCd || !testParams.podCd) {
    ElMessage.warning('请填写完整的测试参数')
    return
  }

  loading.value = true
  const startTime = Date.now()

  try {
    console.log('开始测试API...')
    const data = await getLocalFeesByVessel(
      testParams.vesselName,
      testParams.polCd,
      testParams.podCd
    )

    const responseTime = Date.now() - startTime

    apiResult.value = {
      success: true,
      responseTime,
      data: data,
      rawResponse: data,
    }

    ElMessage.success(`API调用成功，返回 ${data.length} 条记录`)
  } catch (error) {
    const responseTime = Date.now() - startTime

    apiResult.value = {
      success: false,
      responseTime,
      error: error.message || '未知错误',
      rawResponse: error,
    }

    ElMessage.error(`API调用失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const clearResults = () => {
  apiResult.value = null
}
</script>

<style scoped>
.test-local-fee {
  padding: 20px;
}

.test-card,
.result-card {
  margin-bottom: 20px;
}

.result-info p {
  margin: 5px 0;
}

.data-section {
  margin: 20px 0;
}

.raw-response {
  margin-top: 20px;
}

.raw-response pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
}
</style>
