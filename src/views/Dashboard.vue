<template>
  <div class="dashboard">
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 24 24" width="28" height="28">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="title">环海运通</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" src="/default-avatar.png">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ authStore.user?.email || '用户' }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="main">
        <div class="welcome-card">
          <div class="welcome-content">
            <h1>欢迎来到环海运通！</h1>
            <p>您已成功登录，现在可以开始使用我们的专业物流管理平台。</p>

            <div class="feature-grid">
              <div class="feature-card" @click="navigateToFeature('shipping')">
                <div class="feature-icon shipping">
                  <el-icon :size="32"><Ship /></el-icon>
                </div>
                <h3>船期管理</h3>
                <p>查看和管理船期信息，跟踪货物运输状态</p>
              </div>

              <div class="feature-card" @click="navigateToFeature('cargo')">
                <div class="feature-icon cargo">
                  <el-icon :size="32"><Box /></el-icon>
                </div>
                <h3>货物管理</h3>
                <p>管理货物信息，监控装载和卸载过程</p>
              </div>

              <div class="feature-card" @click="navigateToFeature('documents')">
                <div class="feature-icon documents">
                  <el-icon :size="32"><Document /></el-icon>
                </div>
                <h3>单据管理</h3>
                <p>处理运输单据，生成相关报表和文档</p>
              </div>

              <!-- 系统管理功能 -->
              <div
                v-if="authStore.user?.is_superuser || authStore.user?.is_staff || authStore.user?.email === 'admin@example.com' || authStore.hasAnyPermission(['user.list', 'role.list', 'permission.list'])"
                class="feature-card admin"
                @click="navigateToFeature('admin')"
              >
                <div class="feature-icon admin">
                  <el-icon :size="32"><Setting /></el-icon>
                </div>
                <h3>系统管理</h3>
                <p>用户管理、角色分配、权限配置</p>
              </div>
            </div>

            <!-- 权限调试信息 -->
            <div v-if="authStore.user?.email === 'admin@example.com'" class="debug-info">
              <el-card class="debug-card">
                <template #header>
                  <div class="debug-header">
                    <el-icon><Setting /></el-icon>
                    <span>权限调试信息</span>
                  </div>
                </template>

                <div class="debug-content">
                  <div class="debug-item">
                    <span class="debug-label">用户邮箱:</span>
                    <span class="debug-value">{{ authStore.user?.email }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">is_superuser:</span>
                    <span class="debug-value">{{ authStore.user?.is_superuser }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">is_staff:</span>
                    <span class="debug-value">{{ authStore.user?.is_staff }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">权限已加载:</span>
                    <span class="debug-value">{{ permissionStore.isPermissionsInitialized }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">是否管理员:</span>
                    <span class="debug-value">{{ permissionStore.isAdmin }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">vessel_info.update权限:</span>
                    <span class="debug-value">{{ permissionStore.hasPermission('vessel_info.update') }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">user.list权限:</span>
                    <span class="debug-value">{{ permissionStore.hasPermission('user.list') }}</span>
                  </div>

                  <div class="debug-item">
                    <span class="debug-label">canEditVesselInfo:</span>
                    <span class="debug-value">{{ permissionStore.canEditVesselInfo }}</span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import {
  Ship,
  User,
  ArrowDown,
  SwitchButton,
  Box,
  Document,
  Setting
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const permissionStore = usePermissionStore()

// 处理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}

// 导航到功能页面
const navigateToFeature = (feature) => {
  switch (feature) {
    case 'admin':
      router.push('/admin')
      break
    case 'shipping':
      router.push('/schedule')
      break
    case 'cargo':
      ElMessage.info('货物管理功能正在开发中...')
      break
    case 'documents':
      ElMessage.info('单据管理功能正在开发中...')
      break
    default:
      console.log(`Navigating to ${feature} feature`)
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  width: 100%;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

      .logo-icon {
        color: white;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
      }
    }

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease;

      &:hover {
        background: #f5f5f5;
      }

      .username {
        font-size: 14px;
        color: #333;
      }

      .arrow {
        font-size: 12px;
        color: #666;
      }
    }
  }
}

.main {
  padding: 24px;
}

.welcome-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.6s ease-out;

  .welcome-content {
    text-align: center;

    h1 {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #409eff, #667eea);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 48px;
      line-height: 1.6;
    }

    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 48px;

      .feature-card {
        text-align: center;
        padding: 32px 24px;
        border-radius: 16px;
        background: #f8f9fa;
        transition: all 0.3s ease;
        cursor: pointer;
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          border-color: #409eff;
        }

        .feature-icon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          border-radius: 16px;

          &.shipping {
            background: linear-gradient(135deg, #409eff, #5470c6);
            color: white;
          }

          &.cargo {
            background: linear-gradient(135deg, #67c23a, #85ce61);
            color: white;
          }

          &.documents {
            background: linear-gradient(135deg, #e6a23c, #f0b90b);
            color: white;
          }

          &.admin {
            background: linear-gradient(135deg, #f56c6c, #f78989);
            color: white;
          }
        }

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        p {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }
      }
    }
  }
}

// 动画
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 调试信息样式
.debug-info {
  margin-top: 2rem;
}

.debug-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.debug-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.debug-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.debug-label {
  font-weight: 500;
  color: #6c757d;
}

.debug-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
  color: #28a745;
}

// 响应式设计
@media (max-width: 768px) {
  .header {
    padding: 0 16px;

    .header-left .title {
      display: none;
    }
  }

  .main {
    padding: 16px;
  }

  .welcome-card {
    padding: 24px 16px;

    .welcome-content {
      h1 {
        font-size: 24px;
      }

      .feature-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        margin-top: 32px;
      }
    }
  }

  .debug-content {
    grid-template-columns: 1fr;
  }
}
</style>