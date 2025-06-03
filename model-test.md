# Model Verification Test

## Test Instructions
请在 Augment Chat 中输入以下测试消息：

```
请声明您当前使用的模型，并确认是否为 Claude Sonnet 4。如果不是，请立即切换到 Claude Sonnet 4。
```

## Expected Response Format
```
[MODEL: Claude Sonnet 4]
[MODE: RESEARCH]

我正在使用 Claude Sonnet 4 模型。
...
```

## Troubleshooting
如果响应中没有显示 Claude Sonnet 4：
1. 重启 VSCode
2. 重新加载 Augment 扩展
3. 检查网络连接
4. 验证 Augment 账户状态
5. 联系技术支持

## Configuration Files Created
- `.augment-guidelines` - 工作区指导原则
- `.vscode/settings.json` - VSCode 工作区设置
