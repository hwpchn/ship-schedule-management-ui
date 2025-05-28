<template>
  <div class="avatar-upload">
    <!-- 头像显示区域 -->
    <div class="avatar-display">
      <el-avatar
        :size="size"
        :src="avatarUrl"
        class="avatar-image"
        @error="handleAvatarError"
      >
        <el-icon><User /></el-icon>
      </el-avatar>

      <!-- 上传遮罩层 -->
      <div class="upload-overlay" @click="triggerUpload">
        <el-icon><Camera /></el-icon>
        <span>更换头像</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".jpg,.jpeg,.png,.gif"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- 操作按钮 -->
    <div class="avatar-actions">
      <el-button
        type="primary"
        size="small"
        :icon="Upload"
        @click="triggerUpload"
        :loading="uploading"
      >
        {{ uploading ? '上传中...' : '上传头像' }}
      </el-button>

      <el-button
        v-if="avatarUrl"
        type="danger"
        size="small"
        :icon="Delete"
        @click="handleDeleteAvatar"
        :loading="deleting"
      >
        删除头像
      </el-button>
    </div>

    <!-- 上传提示 -->
    <div class="upload-tips">
      <p>支持 JPG、PNG、GIF 格式</p>
      <p>文件大小不超过 5MB</p>
      <p>建议尺寸：200x200 像素</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Delete, Camera, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'

const props = defineProps({
  size: {
    type: Number,
    default: 100
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showTips: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['upload-success', 'delete-success', 'upload-error'])

const authStore = useAuthStore()
const fileInputRef = ref()
const uploading = ref(false)
const deleting = ref(false)

// 计算头像URL
const avatarUrl = computed(() => {
  return getUserAvatarUrl(authStore.user, 'http://127.0.0.1:8000', authStore.avatarVersion)
})

// 触发文件选择
const triggerUpload = () => {
  if (uploading.value || deleting.value) return
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件
  if (!validateFile(file)) {
    // 清空input值，允许重新选择同一文件
    event.target.value = ''
    return
  }

  // 确认上传
  ElMessageBox.confirm(
    '确定要上传这张图片作为头像吗？',
    '确认上传',
    {
      confirmButtonText: '确定上传',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    uploadAvatar(file)
  }).catch(() => {
    // 用户取消，清空input值
    event.target.value = ''
  })
}

// 验证文件
const validateFile = (file) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('请选择 JPG、PNG 或 GIF 格式的图片')
    return false
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }

  return true
}

// 上传头像
const uploadAvatar = async (file) => {
  try {
    uploading.value = true

    const result = await authStore.uploadAvatar(file)

    ElMessage.success(result.message || '头像上传成功')
    emit('upload-success', result)

    // 清空input值
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error(error.message || '头像上传失败，请重试')
    emit('upload-error', error)

    // 清空input值
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } finally {
    uploading.value = false
  }
}

// 删除头像
const handleDeleteAvatar = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除当前头像吗？删除后将显示默认头像。',
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleting.value = true

    const result = await authStore.deleteAvatar()

    ElMessage.success(result.message || '头像删除成功')
    emit('delete-success', result)
  } catch (error) {
    if (error === 'cancel') return

    console.error('头像删除失败:', error)
    ElMessage.error(error.message || '头像删除失败，请重试')
  } finally {
    deleting.value = false
  }
}

// 头像加载错误处理
const handleAvatarError = () => {
  // 静默处理头像加载失败，显示默认头像
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-display {
  position: relative;
  cursor: pointer;

  .avatar-image {
    border: 3px solid #e4e7ed;
    transition: all 0.3s ease;
  }

  .upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-size: 12px;
    gap: 4px;

    .el-icon {
      font-size: 20px;
    }
  }

  &:hover {
    .avatar-image {
      border-color: #409eff;
    }

    .upload-overlay {
      opacity: 1;
    }
  }
}

.avatar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-tips {
  text-align: center;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;

  p {
    margin: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .avatar-actions {
    flex-direction: column;
    gap: 8px;

    .el-button {
      width: 120px;
    }
  }
}
</style>
