针对弹窗编辑功能，我需要详细说明API使用和权限控制的实现方案：

## 🔐 权限控制实现

### 1. 权限检查逻辑
**需要的权限：** `vessel_info.update`

**权限验证步骤：**
1. 页面加载时调用 `/api/auth/me/permissions/` 获取当前用户权限
2. 检查是否包含 `vessel_info.update` 权限
3. 根据权限决定是否显示编辑功能

**前端权限控制：**
```javascript
// 权限检查示例
const hasEditPermission = userPermissions.some(perm => perm.code === 'vessel_info.update');

// 条件渲染编辑按钮
if (hasEditPermission) {
    // 显示可点击的航程时间（可编辑状态）
    renderEditableElement();
} else {
    // 显示只读的航程时间
    renderReadOnlyElement();
}
```

## 🛠️ API调用实现方案

### 2. 弹窗数据获取
**数据来源：** 从 `cabin-grouping-with-info` 返回的 `schedules` 数组

**弹窗触发时的数据结构：**
```javascript
// 点击航程时间时，传递整个group数据
const openEditModal = (groupData) => {
    const schedulesWithVesselInfo = groupData.schedules.map(schedule => ({
        id: schedule.id,
        vessel: schedule.vessel,
        voyage: schedule.voyage,
        vessel_info: schedule.vessel_info, // 包含可编辑字段
        // ... 其他schedule信息
    }));
};
```

### 3. 编辑API调用
**使用API：** `/api/vessel-info/{id}/` (PATCH方法)

**实现步骤：**

**Step 1: 获取vessel_info的ID**
```javascript
// 从schedule数据中需要获取vessel_info的ID
// 注意：当前API返回的vessel_info可能没有ID字段
// 需要通过schedule.id查询对应的vessel_info记录
const getVesselInfoId = async (scheduleId) => {
    const response = await fetch(`/api/vessel-info/?schedule_id=${scheduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.results[0]?.id; // 返回vessel_info的ID
};
```

**Step 2: 更新vessel_info数据**
```javascript
const updateVesselInfo = async (vesselInfoId, updateData) => {
    const response = await fetch(`/api/vessel-info/${vesselInfoId}/`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('更新失败');
    }
};
```

## 🎯 弹窗编辑功能详细实现

### 4. 弹窗组件结构
```javascript
const EditVesselInfoModal = {
    props: ['groupData', 'isVisible'],
    data() {
        return {
            editingData: {}, // 存储正在编辑的数据
            originalData: {}, // 存储原始数据用于取消时恢复
            loading: false,
            errors: {}
        };
    },
    
    computed: {
        hasEditPermission() {
            return this.$store.getters['auth/hasPermission']('vessel_info.update');
        }
    }
};
```

### 5. 可编辑字段列表
**根据VesselInfoFromCompany模型定义，当前系统中实际可编辑的字段包括：**
- `price` (价格)
- `gp_20` (20尺普通箱/普柜现舱)
- `hq_40` (40尺高箱/高柜现舱)
- `cut_off_time` (截关时间)

> **注意**：虽然vessel-info API文档中提到了更多字段(如gp_40, hq_20, ot_20等)，但这些字段在当前系统模型中尚未实现。前端开发时请仅使用上述4个字段，避免操作不存在的字段导致错误。

### 6. 编辑逻辑实现
**单条记录编辑：**
```javascript
const editSingleVesselInfo = async (scheduleId, fieldName, newValue) => {
    try {
        // 1. 获取vessel_info ID
        const vesselInfoId = await getVesselInfoId(scheduleId);
        
        if (!vesselInfoId) {
            throw new Error('未找到对应的船舶信息记录');
        }
        
        // 2. 构造更新数据 (只能更新 price, gp_20, hq_40, cut_off_time 字段)
        // 检查字段名是否有效
        if (!['price', 'gp_20', 'hq_40', 'cut_off_time'].includes(fieldName)) {
            throw new Error(`不支持编辑字段: ${fieldName}`);
        }
        
        const updateData = { [fieldName]: newValue };
        
        // 3. 调用更新API
        await updateVesselInfo(vesselInfoId, updateData);
        
        // 4. 更新本地数据
        updateLocalData(scheduleId, fieldName, newValue);
        
    } catch (error) {
        handleEditError(error);
    }
};
```

**批量编辑（可选）：**
```javascript
const batchUpdateVesselInfo = async (updates) => {
    // 预处理更新数据，确保只更新可编辑字段
    const validUpdates = updates.map(item => {
        const validFields = {};
        // 只保留有效字段
        ['price', 'gp_20', 'hq_40', 'cut_off_time'].forEach(field => {
            if (item[field] !== undefined) {
                validFields[field] = item[field];
            }
        });
        return {
            id: item.id, // 保留ID
            ...validFields   // 只包含有效字段
        };
    });
    
    // 使用批量更新API: /api/vessel-info/bulk-update/
    const response = await fetch('/api/vessel-info/bulk-update/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: validUpdates })
    });
    
    return await response.json();
};
```

## 🔄 数据同步策略

### 7. 编辑后数据刷新
**选项1：乐观更新**
- 立即更新UI显示
- 后台异步保存
- 失败时回滚数据

**选项2：保守更新**
- 保存成功后更新UI
- 显示保存状态
- 提供重试机制

**推荐实现：**
```javascript
const saveChanges = async () => {
    try {
        loading.value = true;
        
        // 保存所有修改
        await updateVesselInfo(vesselInfoId, editingData);
        
        // 成功后更新主页面数据
        await refreshMainPageData();
        
        // 关闭弹窗
        closeModal();
        
        // 显示成功提示
        showSuccessMessage('保存成功');
        
    } catch (error) {
        // 显示错误信息
        showErrorMessage('保存失败：' + error.message);
    } finally {
        loading.value = false;
    }
};
```

## ⚠️ 注意事项

### 8. 关键实现要点

**权限控制：**
- 每次API调用前验证权限
- 前端隐藏编辑功能给无权限用户
- 后端API也要进行权限验证

**数据一致性：**
- 编辑时锁定数据避免并发冲突
- 保存失败时提供重试机制
- 取消编辑时恢复原始数据

**用户体验：**
- 实时保存vs手动保存的选择
- 编辑状态的清晰指示
- 加载和错误状态的友好提示

**API数据映射：**
- 确认schedule.id与vessel_info的关联关系
- 处理可能不存在vessel_info记录的情况
- 验证API返回数据的完整性

这个方案确保了安全的权限控制和完整的编辑功能。您需要我详细解释任何特定部分吗？

# 航期查询页面编辑功能权限设计方案

## 1. 权限架构设计

### 身份验证系统
- 使用 Django REST Framework 结合 SimpleJWT 进行用户身份验证
- 利用 JWT token 携带用户身份和权限信息
- 在用户登录成功后获取 token 并存储在前端（localStorage 或 HTTP-only cookie）

### 用户角色划分
- **管理员用户**：拥有编辑权限（具有 `vessel_info.update` 权限）
- **普通用户**：仅有查看权限（不具有 `vessel_info.update` 权限）

## 2. 前端权限控制实现 (基于 Vite + Element-Plus)

### 用户身份识别
```javascript
// src/utils/auth.js
import axios from 'axios';
import { ElMessage } from 'element-plus';

export const getUserPermissions = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    const response = await axios.get('/api/auth/me/permissions/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    ElMessage.error('获取用户权限失败');
    console.error('获取用户权限失败:', error);
    return null;
  }
};

export const hasPermission = (permissions, requiredPermission) => {
  if (!permissions || !permissions.permissions) return false;
  
  for (const category in permissions.permissions) {
    const perms = permissions.permissions[category];
    for (const perm of perms) {
      if (perm.code === requiredPermission) {
        return true;
      }
    }
  }
  return false;
};
```

### 权限 Store 管理 (Pinia)
```javascript
// src/stores/permission.js
import { defineStore } from 'pinia';
import { getUserPermissions, hasPermission } from '@/utils/auth';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    userPermissions: null,
    permissionsLoaded: false,
  }),
  
  getters: {
    canEditVesselInfo: (state) => {
      return hasPermission(state.userPermissions, 'vessel_info.update');
    }
  },
  
  actions: {
    async loadUserPermissions() {
      this.userPermissions = await getUserPermissions();
      this.permissionsLoaded = true;
      return this.userPermissions;
    },
    
    checkPermission(permission) {
      return hasPermission(this.userPermissions, permission);
    }
  }
});
```

### 权限指令 (Vue Directive)
```javascript
// src/directives/permission.js
import { usePermissionStore } from '@/stores/permission';

export const permission = {
  mounted(el, binding) {
    const permissionStore = usePermissionStore();
    const hasPermission = permissionStore.checkPermission(binding.value);
    
    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
  
  updated(el, binding) {
    const permissionStore = usePermissionStore();
    const hasPermission = permissionStore.checkPermission(binding.value);
    
    if (!hasPermission) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  }
};

// 在 main.js 中注册
// app.directive('permission', permission);
```

### UI 动态控制 (Element-Plus)

#### 船期编辑按钮
```vue
<template>
  <div class="cabin-group-item">
    <div class="cabin-details">
      <!-- 常规信息显示 -->
      <div class="cabin-info">
        <span>航程时间: {{ group.plan_duration }} 天</span>
      </div>
      
      <!-- 编辑按钮，只对管理员显示 -->
      <el-button 
        v-permission="'vessel_info.update'"
        type="primary" 
        size="small" 
        icon="el-icon-edit"
        @click="openEditDialog(group)"
      >
        编辑
      </el-button>
      
      <!-- 或使用store的getter进行条件渲染 -->
      <el-button 
        v-if="permissionStore.canEditVesselInfo"
        type="primary" 
        size="small" 
        icon="el-icon-edit"
        @click="openEditDialog(group)"
      >
        编辑
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { usePermissionStore } from '@/stores/permission';
import { onMounted } from 'vue';

const permissionStore = usePermissionStore();

onMounted(async () => {
  // 确保权限已加载
  if (!permissionStore.permissionsLoaded) {
    await permissionStore.loadUserPermissions();
  }
});

const openEditDialog = (group) => {
  // 弹窗逻辑
};
</script>
```

#### 编辑弹窗组件
```vue
<template>
  <el-dialog
    title="编辑船舶信息"
    v-model="dialogVisible"
    width="600px"
  >
    <template v-if="permissionStore.canEditVesselInfo">
      <!-- 编辑表单 -->
      <el-form :model="form" label-width="120px">
        <!-- 价格字段 -->
        <el-form-item label="价格">
          <el-input-number 
            v-model="form.price" 
            :min="0" 
            :precision="2"
          />
        </el-form-item>
        
        <!-- 20尺普柜现舱字段 -->
        <el-form-item label="20尺普柜现舱">
          <el-input v-model="form.gp_20" />
        </el-form-item>
        
        <!-- 40尺高柜现舱字段 -->
        <el-form-item label="40尺高柜现舱">
          <el-input v-model="form.hq_40" />
        </el-form-item>
        
        <!-- 截关时间字段 -->
        <el-form-item label="截关时间">
          <el-date-picker
            v-model="form.cut_off_time"
            type="date"
            placeholder="选择截关日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChanges" :loading="loading">
            保存
          </el-button>
        </div>
      </template>
    </template>
    
    <!-- 非管理员用户只能查看 -->
    <template v-else>
      <div class="read-only-view">
        <el-alert
          title="您没有编辑权限，仅可查看信息"
          type="warning"
          :closable="false"
        />
        
        <div class="info-item">
          <span class="label">价格:</span>
          <span class="value">{{ vessel.vessel_info.price }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">20尺普柜现舱:</span>
          <span class="value">{{ vessel.vessel_info.gp_20 }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">40尺高柜现舱:</span>
          <span class="value">{{ vessel.vessel_info.hq_40 }}</span>
        </div>
        
        <div class="info-item">
          <span class="label">截关时间:</span>
          <span class="value">{{ vessel.vessel_info.cut_off_time }}</span>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </div>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { usePermissionStore } from '@/stores/permission';
import { updateVesselInfo } from '@/api/vessel';

const props = defineProps({
  vessel: Object,
  visible: Boolean
});

const emit = defineEmits(['update:visible', 'refresh']);

const permissionStore = usePermissionStore();
const dialogVisible = ref(props.visible);
const loading = ref(false);

// 初始化表单数据
const form = reactive({
  price: props.vessel?.vessel_info?.price || 0,
  gp_20: props.vessel?.vessel_info?.gp_20 || '',
  hq_40: props.vessel?.vessel_info?.hq_40 || '',
  cut_off_time: props.vessel?.vessel_info?.cut_off_time || '',
});

// 监听visible属性变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
});

// 监听dialogVisible变化，通知父组件
watch(dialogVisible, (val) => {
  emit('update:visible', val);
});

// 保存修改
const saveChanges = async () => {
  // 权限检查
  if (!permissionStore.canEditVesselInfo) {
    ElMessage.error('您没有编辑权限');
    return;
  }
  
  loading.value = true;
  try {
    const vesselInfoId = props.vessel.vessel_info.id;
    const updateData = {
      price: form.price,
      gp_20: form.gp_20,
      hq_40: form.hq_40,
      cut_off_time: form.cut_off_time,
    };
    
    await updateVesselInfo(vesselInfoId, updateData);
    
    ElMessage.success('保存成功');
    dialogVisible.value = false;
    emit('refresh'); // 通知父组件刷新数据
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.read-only-view {
  margin-top: 20px;
}

.info-item {
  margin: 12px 0;
  display: flex;
}

.label {
  width: 120px;
  color: #606266;
}

.value {
  flex: 1;
  color: #303133;
  font-weight: 500;
}
</style>
```

## 3. API 调用实现

### API 服务层
```javascript
// src/api/vessel.js
import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000
});

// 请求拦截器添加token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 获取vessel_info的ID
export const getVesselInfoId = async (scheduleId) => {
  const response = await apiClient.get(`/vessel-info/`, {
    params: { schedule_id: scheduleId }
  });
  return response.data.results[0]?.id;
};

// 更新vessel_info
export const updateVesselInfo = async (vesselInfoId, updateData) => {
  const response = await apiClient.patch(`/vessel-info/${vesselInfoId}/`, updateData);
  return response.data;
};

// 获取cabin-grouping数据
export const getCabinGrouping = async (polCd, podCd) => {
  const response = await apiClient.get('/schedules/cabin-grouping-with-info/', {
    params: { polCd, podCd }
  });
  return response.data.data;
};
```

## 4. 用户权限初始化

### 在应用启动时加载权限
```javascript
// src/App.vue
<script setup>
import { onMounted } from 'vue';
import { usePermissionStore } from '@/stores/permission';
import { ElLoading } from 'element-plus';

const permissionStore = usePermissionStore();

onMounted(async () => {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '加载用户信息...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  try {
    await permissionStore.loadUserPermissions();
  } finally {
    loadingInstance.close();
  }
});
</script>
```

## 5. 编辑流程实现

### 主页面组件
```vue
<template>
  <div class="schedule-query-page">
    <!-- 查询表单 -->
    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="起运港">
        <el-select v-model="queryForm.polCd" placeholder="请选择起运港">
          <el-option v-for="port in ports" :key="port.code" :label="port.name" :value="port.code" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="目的港">
        <el-select v-model="queryForm.podCd" placeholder="请选择目的港">
          <el-option v-for="port in ports" :key="port.code" :label="port.name" :value="port.code" />
        </el-select>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 查询结果 -->
    <div v-if="groupsData.length" class="result-container">
      <el-card v-for="(group, index) in groupsData" :key="index" class="group-card">
        <template #header>
          <div class="card-header">
            <span>船司: {{ group.carrier_codes.join(', ') }}</span>
            <span>航程时间: {{ group.plan_duration }} 天</span>
            
            <!-- 编辑按钮，只对管理员显示 -->
            <el-button 
              v-permission="'vessel_info.update'"
              type="primary" 
              size="small" 
              @click="openEditDialog(group)"
            >
              编辑
            </el-button>
          </div>
        </template>
        
        <div class="group-info">
          <div class="info-row">
            <span class="label">20尺普柜:</span>
            <span class="value">{{ group.is_has_gp_20 }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">40尺高柜:</span>
            <span class="value">{{ group.is_has_hq_40 }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">价格:</span>
            <span class="value">{{ group.cabin_price }}</span>
          </div>
        </div>
        
        <!-- 点击展开更多航线详情 -->
        <el-collapse>
          <el-collapse-item title="查看详情">
            <el-table :data="group.schedules" border>
              <el-table-column prop="vessel" label="船名" />
              <el-table-column prop="voyage" label="航次" />
              <el-table-column prop="etd" label="预计开船时间" />
              <el-table-column prop="eta" label="预计到达时间" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button 
                    v-permission="'vessel_info.update'"
                    type="primary" 
                    size="small" 
                    @click="openEditVesselDialog(scope.row)"
                  >
                    编辑
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
    
    <div v-else-if="!loading && searched" class="no-data">
      <el-empty description="未找到匹配的航线信息" />
    </div>
    
    <!-- 编辑弹窗 -->
    <edit-vessel-dialog
      v-if="selectedVessel"
      v-model:visible="dialogVisible"
      :vessel="selectedVessel"
      @refresh="refreshData"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { usePermissionStore } from '@/stores/permission';
import { getCabinGrouping } from '@/api/vessel';
import EditVesselDialog from '@/components/EditVesselDialog.vue';

const permissionStore = usePermissionStore();
const loading = ref(false);
const searched = ref(false);
const groupsData = ref([]);
const dialogVisible = ref(false);
const selectedVessel = ref(null);

// 港口数据示例
const ports = ref([
  { code: 'CNSHA', name: '上海' },
  { code: 'CNSHK', name: '蛇口' },
  { code: 'THBKK', name: '曼谷' },
  // 更多港口...
]);

const queryForm = reactive({
  polCd: '',
  podCd: ''
});

// 搜索
const handleSearch = async () => {
  if (!queryForm.polCd || !queryForm.podCd) {
    ElMessage.warning('请选择起运港和目的港');
    return;
  }
  
  loading.value = true;
  searched.value = true;
  
  try {
    const result = await getCabinGrouping(queryForm.polCd, queryForm.podCd);
    groupsData.value = result.groups || [];
    
    if (groupsData.value.length === 0) {
      ElMessage.info('未找到匹配的航线信息');
    }
  } catch (error) {
    console.error('查询失败:', error);
    ElMessage.error('查询失败: ' + (error.message || '未知错误'));
    groupsData.value = [];
  } finally {
    loading.value = false;
  }
};

// 打开船舶信息编辑弹窗
const openEditVesselDialog = (vessel) => {
  // 检查权限
  if (!permissionStore.canEditVesselInfo) {
    ElMessage.warning('您没有编辑权限');
    return;
  }
  
  selectedVessel.value = vessel;
  dialogVisible.value = true;
};

// 打开组内第一个船舶的编辑弹窗
const openEditDialog = (group) => {
  if (group.schedules && group.schedules.length > 0) {
    openEditVesselDialog(group.schedules[0]);
  }
};

// 刷新数据
const refreshData = () => {
  handleSearch();
};
</script>

<style scoped>
.query-form {
  margin-bottom: 20px;
}

.result-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.group-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row {
  margin: 8px 0;
  display: flex;
}

.label {
  width: 100px;
  color: #606266;
}

.value {
  flex: 1;
  color: #303133;
  font-weight: 500;
}

.no-data {
  margin: 40px 0;
}
</style>
```

## 6. 安全措施

1. **前后端双重权限验证**
   - 前端基于用户权限控制UI元素显示
   - 后端API接口也进行权限验证

2. **Token 安全**
   - 设置合理的JWT过期时间
   - 实现token刷新机制
   - 可选HTTP-only cookie存储

3. **编辑操作保护**
   - 关键修改添加二次确认
   - 编辑操作审计日志

4. **错误处理机制**
   - 友好的权限错误提示
   - Token过期自动跳转登录

## 7. 错误处理最佳实践

```javascript
// src/utils/error-handler.js
import { ElMessage } from 'element-plus';
import router from '@/router';

export const handleApiError = (error) => {
  if (!error.response) {
    ElMessage.error('网络错误，请检查您的网络连接');
    return;
  }
  
  const { status } = error.response;
  
  switch (status) {
    case 401:
      ElMessage.error('登录已过期，请重新登录');
      // 清除token
      localStorage.removeItem('access_token');
      // 跳转到登录页
      router.push('/login');
      break;
      
    case 403:
      ElMessage.error('您没有权限执行此操作');
      break;
      
    case 404:
      ElMessage.error('请求的资源不存在');
      break;
      
    case 500:
      ElMessage.error('服务器错误，请稍后重试');
      break;
      
    default:
      ElMessage.error(error.response.data.message || '请求失败');
  }
};
```

## 8. 实现要点总结

1. **技术栈**：Vite + Vue 3 + Element-Plus + Pinia
2. **权限控制**：基于JWT和权限代码
3. **关键API**：
   - 获取用户权限：`/api/auth/me/permissions/`
   - 查询船期：`/api/schedules/cabin-grouping-with-info/`
   - 更新信息：`/api/vessel-info/{id}/`
4. **UI交互**：
   - 只对管理员显示编辑按钮
   - 弹窗中根据权限显示可编辑表单或只读视图
5. **数据流程**：
   - 加载用户权限 → 显示/隐藏编辑功能 → 编辑数据 → 保存 → 刷新页面

# 设计方案总结

## 核心设计要点

1. **权限控制机制**
   - 基于`vessel_info.update`权限判断用户是否可编辑
   - 前后端双重权限验证确保安全性
   - 无权限用户仅可查看，有权限用户可进行编辑

2. **可编辑字段范围**
   - 仅支持4个核心字段编辑：`price`, `gp_20`, `hq_40`, `cut_off_time`
   - 前端表单验证确保数据有效性

3. **技术实现框架**
   - 前端：Vite + Vue 3 + Element-Plus + Pinia
   - 身份验证：JWT令牌机制
   - 状态管理：Pinia存储权限状态

4. **API接口设计**
   - 权限获取：`/api/auth/me/permissions/`
   - 数据查询：`/api/schedules/cabin-grouping-with-info/`
   - 单条更新：`/api/vessel-info/{id}/` (PATCH)
   - 批量更新：`/api/vessel-info/bulk-update/` (POST)

5. **用户体验优化**
   - 编辑状态清晰指示
   - 操作结果即时反馈
   - 加载状态可视化
   - 错误处理友好提示

## 实现流程

1. **用户权限初始化**
   - 应用启动时加载用户权限
   - 使用权限存储管理权限状态

2. **UI条件渲染**
   - 基于权限控制编辑按钮显示
   - 提供权限指令简化权限判断

3. **编辑流程**
   - 点击编辑按钮→打开弹窗→修改数据→保存→刷新页面
   - 权限不足时仅显示只读视图

4. **数据同步策略**
   - 保守更新：保存成功后更新UI
   - 提供加载状态和操作结果反馈

5. **错误处理机制**
   - 请求错误分类处理
   - 权限错误友好提示
   - Token过期自动跳转登录

## 安全措施

1. **令牌安全**
   - 合理的JWT过期时间
   - 令牌刷新机制
   - 可选HTTP-only cookie存储

2. **数据一致性**
   - 编辑锁定防并发冲突
   - 取消编辑恢复原始数据
   - 保存失败重试机制