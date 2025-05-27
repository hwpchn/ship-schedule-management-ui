# 健康检查API

## 概览

健康检查API用于验证船舶时刻表系统API服务是否正常运行。这是一个公开的端点，不需要认证即可访问。

## 接口信息

- **URL**: `/api/`
- **方法**: `GET`
- **认证**: 不需要
- **权限**: 公开访问

## 请求参数

无需任何参数。

## 响应格式

### 成功响应 (200 OK)

```json
{
  "status": "ok",
  "message": "船舶调度系统API服务正常运行",
  "version": "1.0.0"
}
```

### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 服务状态，"ok"表示正常 |
| `message` | string | 状态描述信息 |
| `version` | string | API版本号 |

## 使用示例

### cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/"
```

### JavaScript (Fetch)
```javascript
fetch('http://127.0.0.1:8000/api/')
  .then(response => response.json())
  .then(data => {
    console.log('API状态:', data.status);
    console.log('版本:', data.version);
  });
```

### Python (requests)
```python
import requests

response = requests.get('http://127.0.0.1:8000/api/')
data = response.json()

print(f"API状态: {data['status']}")
print(f"版本: {data['version']}")
```

## 错误处理

健康检查API通常不会返回错误，除非服务器完全不可用。如果无法连接到服务器，您将收到网络连接错误而不是HTTP响应。

### 可能的网络错误
- **连接超时**: 服务器未响应
- **连接拒绝**: 服务器未启动或端口被阻止
- **DNS解析失败**: 域名无法解析

## 监控用途

这个API通常用于：

1. **服务监控**: 定期检查API服务是否可用
2. **负载均衡器健康检查**: 确定服务实例是否健康
3. **部署验证**: 确认新部署的服务正常工作
4. **调试网络连接**: 测试基本的HTTP连接

## 示例监控脚本

### Bash脚本
```bash
#!/bin/bash

API_URL="http://127.0.0.1:8000/api/"

# 检查API健康状态
check_api_health() {
    response=$(curl -s -w "%{http_code}" "$API_URL")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ API服务正常运行"
        return 0
    else
        echo "❌ API服务异常 (HTTP $http_code)"
        return 1
    fi
}

# 执行检查
check_api_health
```

### Python监控脚本
```python
#!/usr/bin/env python3
import requests
import time
import sys

def check_api_health(url):
    """检查API健康状态"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API服务正常 - 版本: {data.get('version', 'unknown')}")
            return True
        else:
            print(f"❌ API服务异常 - HTTP状态码: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ 连接失败: {e}")
        return False

def main():
    """主监控循环"""
    api_url = "http://127.0.0.1:8000/api/"
    interval = 30  # 检查间隔（秒）
    
    print(f"开始监控API服务: {api_url}")
    print(f"检查间隔: {interval}秒")
    
    while True:
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[{timestamp}] 检查API状态...")
        
        is_healthy = check_api_health(api_url)
        
        if not is_healthy:
            # 发送告警通知（这里可以集成邮件、短信等）
            print("⚠️  需要立即检查服务状态！")
        
        time.sleep(interval)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n监控已停止")
        sys.exit(0)
```

## 集成示例

### Docker健康检查
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/ || exit 1
```

### Kubernetes就绪探针
```yaml
readinessProbe:
  httpGet:
    path: /api/
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Nginx上游健康检查
```nginx
upstream ship_schedule_api {
    server 127.0.0.1:8000;
    health_check uri=/api/;
}
```

## 性能基准

- **响应时间**: 通常 < 50ms
- **内存使用**: 最小
- **CPU使用**: 可忽略
- **并发支持**: 高（无状态操作）

## 最佳实践

1. **频率控制**: 不要过于频繁地调用（建议间隔≥10秒）
2. **超时设置**: 设置合理的请求超时时间（建议5秒）
3. **错误处理**: 优雅处理网络错误和服务异常
4. **日志记录**: 记录健康检查结果用于问题排查
5. **告警机制**: 连续失败时触发告警通知

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_api.py` - 健康检查测试
