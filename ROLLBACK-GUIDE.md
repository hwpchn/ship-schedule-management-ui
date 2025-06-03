# 回退指南 - v2.0.0-test-fixes

## 🚨 紧急回退

如果需要紧急回退到此版本之前的状态：

### 方法1：回退到上一个稳定版本
```bash
# 查看所有标签
git tag -l

# 回退到上一个版本（如果存在）
git checkout v1.x.x

# 或者回退到上一个提交
git checkout eba2afd
```

### 方法2：创建回退分支
```bash
# 基于上一个稳定提交创建回退分支
git checkout -b rollback-from-v2.0.0 eba2afd

# 推送回退分支
git push origin rollback-from-v2.0.0
```

### 方法3：撤销提交（谨慎使用）
```bash
# 软回退（保留更改）
git reset --soft eba2afd

# 硬回退（丢失所有更改）
git reset --hard eba2afd

# 强制推送（危险操作）
git push --force-with-lease origin main
```

## 📋 版本信息

### 当前版本 (v2.0.0-test-fixes)
- **提交哈希**: `332ced6`
- **标签**: `v2.0.0-test-fixes`
- **分支**: `main`
- **推送时间**: 2024-12-19

### 上一个版本
- **提交哈希**: `eba2afd`
- **描述**: Merge pull request #2 from hwpchn/feature/ui-improvements-and-fixes
- **分支**: `main`

## 🔍 验证回退

回退后验证系统状态：

```bash
# 检查当前提交
git log --oneline -1

# 检查分支状态
git status

# 运行基础测试
pnpm install
pnpm test:run

# 启动开发服务器
pnpm dev
```

## ⚠️ 注意事项

1. **数据备份**: 回退前确保重要数据已备份
2. **依赖检查**: 回退后可能需要重新安装依赖
3. **配置文件**: 检查配置文件是否需要调整
4. **团队通知**: 通知团队成员回退操作

## 🆘 紧急联系

如果遇到回退问题：
1. 检查 Git 状态：`git status`
2. 查看提交历史：`git log --oneline -10`
3. 检查远程状态：`git remote -v`

## 📞 支持

- **项目仓库**: https://github.com/hwpchn/ship-schedule-management-ui
- **问题报告**: 在 GitHub Issues 中创建新问题
- **文档**: 查看 RELEASE-NOTES-v2.0.0.md 了解详细更改

---

**创建时间**: 2024-12-19  
**适用版本**: v2.0.0-test-fixes  
**维护者**: Augment Agent
