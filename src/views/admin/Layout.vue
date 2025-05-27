<template>
  <div class="admin-layout">
    <el-container>
      <!-- 头部 -->
      <el-header class="admin-header">
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
          <span class="title">环海运通 - 系统管理</span>
        </div>
        <div class="header-right">
          <el-button
            link
            @click="$router.push('/dashboard')"
            class="back-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </el-button>

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

      <el-container class="admin-body">
        <!-- 左侧导航 -->
        <el-aside class="admin-aside" width="240px">
          <el-menu
            :default-active="$route.path"
            class="admin-menu"
            router
            :unique-opened="true"
          >
            <el-menu-item index="/admin/users" v-if="authStore.hasPermission('user.list')">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>

            <el-menu-item index="/admin/roles" v-if="authStore.hasPermission('role.list')">
              <el-icon><UserFilled /></el-icon>
              <span>角色管理</span>
            </el-menu-item>

            <el-menu-item index="/admin/permissions" v-if="authStore.hasPermission('permission.list')">
              <el-icon><Lock /></el-icon>
              <span>权限管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-main class="admin-main">
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Ship,
  User,
  UserFilled,
  Lock,
  ArrowLeft,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

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
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  background: #f5f5f5;
}

.admin-header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

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
    display: flex;
    align-items: center;
    gap: 16px;

    .back-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #409eff;

      &:hover {
        background: rgba(64, 158, 255, 0.1);
      }
    }

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

.admin-body {
  height: calc(100vh - 60px);
}

.admin-aside {
  background: white;
  border-right: 1px solid #e8e8e8;
  overflow: hidden;

  .admin-menu {
    border: none;
    height: 100%;

    :deep(.el-menu-item) {
      height: 56px;
      line-height: 56px;
      margin: 4px 8px;
      border-radius: 8px;

      &:hover {
        background: rgba(64, 158, 255, 0.1);
        color: #409eff;
      }

      &.is-active {
        background: #409eff;
        color: white;

        &:hover {
          background: #337ecc;
        }
      }
    }
  }
}

.admin-main {
  padding: 24px;
  background: #f5f5f5;
  overflow-y: auto;

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .admin-aside {
    width: 200px !important;
  }

  .header-left .title {
    display: none;
  }

  .admin-main {
    padding: 16px;
  }
}
</style>