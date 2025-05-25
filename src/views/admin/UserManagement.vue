<template>
  <div class="user-management">
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
        <p>管理系统用户和角色分配</p>
      </div>
    </div>

    <div class="content-card">
      <!-- 搜索和筛选栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户邮箱或姓名"
          style="width: 300px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-button @click="loadUsers">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 用户表格 -->
      <el-table
        :data="filteredUsers"
        v-loading="loading"
        stripe
        class="user-table"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="email" label="邮箱" min-width="200">
          <template #default="{ row }">
            <div class="user-email">
              <el-avatar :size="32" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span>{{ row.email }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="full_name" label="姓名" min-width="120">
          <template #default="{ row }">
            {{ row.full_name || row.short_name || '未设置' }}
          </template>
        </el-table-column>
        
        <el-table-column label="用户角色" min-width="200">
          <template #default="{ row }">
            <div class="user-roles">
              <el-tag
                v-for="role in getUserRoles(row.id)"
                :key="role.id"
                size="small"
                type="primary"
                class="role-tag"
              >
                {{ role.name }}
              </el-tag>
              <span v-if="!getUserRoles(row.id).length" class="no-roles">
                暂无角色
              </span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="date_joined" label="注册时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date_joined) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="last_login" label="最后登录" width="120">
          <template #default="{ row }">
            {{ formatDate(row.last_login) || '从未登录' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              @click="handleAssignRoles(row)"
              v-if="authStore.hasPermission('user.role.assign')"
            >
              分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 角色分配对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配用户角色"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentUser" class="role-assignment">
        <div class="user-info">
          <el-avatar :size="40">
            <el-icon><User /></el-icon>
          </el-avatar>
          <div class="user-details">
            <h3>{{ currentUser.email }}</h3>
            <p>{{ currentUser.full_name || currentUser.short_name || '未设置姓名' }}</p>
          </div>
        </div>

        <el-divider />

        <div class="role-selection">
          <h4>选择角色</h4>
          <el-checkbox-group v-model="selectedRoleIds" class="role-checkboxes">
            <el-checkbox
              v-for="role in allRoles"
              :key="role.id"
              :label="role.id"
              class="role-checkbox"
            >
              <div class="role-option">
                <span class="role-name">{{ role.name }}</span>
                <span class="role-description">{{ role.description || '暂无描述' }}</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="submitting" 
          @click="handleSaveRoles"
        >
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Refresh, 
  User
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

// 数据状态
const users = ref([])
const allRoles = ref([])
const userRoles = ref({}) // 用户角色映射表
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 对话框状态
const roleDialogVisible = ref(false)
const currentUser = ref(null)
const selectedRoleIds = ref([])

// 计算属性
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.email.toLowerCase().includes(query) ||
    (user.full_name && user.full_name.toLowerCase().includes(query)) ||
    (user.short_name && user.short_name.toLowerCase().includes(query))
  )
})

// 获取用户角色
const getUserRoles = (userId) => {
  return userRoles.value[userId] || []
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const response = await authApi.getUsers({
      page: currentPage.value,
      page_size: pageSize.value
    })
    
    if (response.code === 200) {
      users.value = response.data.users || []
      total.value = response.data.total || 0
      
      // 加载每个用户的角色信息
      await loadAllUserRoles()
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 加载所有用户的角色信息
const loadAllUserRoles = async () => {
  const rolePromises = users.value.map(async (user) => {
    try {
      const response = await authApi.getUserRoles(user.id)
      if (response.code === 200) {
        userRoles.value[user.id] = response.data.roles || []
      }
    } catch (error) {
      console.error(`加载用户 ${user.id} 角色失败:`, error)
      userRoles.value[user.id] = []
    }
  })
  
  await Promise.all(rolePromises)
}

// 加载所有角色
const loadAllRoles = async () => {
  try {
    const response = await authApi.getRoles()
    if (response.code === 200) {
      allRoles.value = response.data.results || []
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  }
}

// 搜索处理
const handleSearch = () => {
  // 搜索在计算属性中处理，这里可以添加防抖逻辑
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadUsers()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadUsers()
}

// 分配角色
const handleAssignRoles = async (user) => {
  currentUser.value = user
  
  // 加载角色列表
  await loadAllRoles()
  
  // 设置当前用户已有的角色
  const userCurrentRoles = getUserRoles(user.id)
  selectedRoleIds.value = userCurrentRoles.map(role => role.id)
  
  roleDialogVisible.value = true
}

// 保存角色分配
const handleSaveRoles = async () => {
  if (!currentUser.value) return

  try {
    submitting.value = true
    
    const response = await authApi.updateUserRoles(
      currentUser.value.id, 
      selectedRoleIds.value
    )
    
    if (response.code === 200) {
      ElMessage.success('角色分配成功')
      roleDialogVisible.value = false
      
      // 更新本地用户角色数据
      userRoles.value[currentUser.value.id] = response.data.roles || []
    }
  } catch (error) {
    console.error('保存角色分配失败:', error)
    ElMessage.error('保存角色分配失败')
  } finally {
    submitting.value = false
  }
}

// 页面初始化
onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.user-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    
    .header-left {
      h2 {
        margin: 0 0 4px 0;
        font-size: 24px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .content-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    align-items: center;
  }
  
  .user-table {
    margin-bottom: 24px;
    
    .user-email {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .user-avatar {
        flex-shrink: 0;
      }
    }
    
    .user-roles {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      
      .role-tag {
        margin: 0;
      }
      
      .no-roles {
        color: #999;
        font-size: 12px;
        font-style: italic;
      }
    }
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
  
  .role-assignment {
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .user-details {
        h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .role-selection {
      h4 {
        margin: 0 0 16px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      .role-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        .role-checkbox {
          margin: 0;
          
          :deep(.el-checkbox__label) {
            width: 100%;
          }
          
          .role-option {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .role-name {
              font-weight: 500;
              color: #333;
            }
            
            .role-description {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-management {
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }
    
    .user-table {
      :deep(.el-table__body-wrapper) {
        overflow-x: auto;
      }
    }
    
    .pagination-wrapper {
      :deep(.el-pagination) {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}
</style> 