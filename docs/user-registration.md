# 用户注册API

## 概览

用户注册API允许新用户创建账户并获取JWT认证Token。注册成功后，用户可以立即使用返回的Token访问需要认证的API。

## 接口信息

- **URL**: `/api/auth/register/`
- **方法**: `POST`
- **认证**: 不需要
- **权限**: 公开访问
- **内容类型**: `application/json`

## 请求参数

### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 | 限制 |
|------|------|------|------|------|
| `email` | string | ✅ | 用户邮箱地址 | 必须是有效的邮箱格式，系统内唯一 |
| `password` | string | ✅ | 用户密码 | 最少8个字符 |
| `password_confirm` | string | ✅ | 确认密码 | 必须与password字段一致 |
| `first_name` | string | ✅ | 名字 | 支持中文，最大30个字符 |
| `last_name` | string | ✅ | 姓氏 | 支持中文，最大30个字符 |

### 请求示例

```json
{
  "email": "zhang.san@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "first_name": "三",
  "last_name": "张"
}
```

## 响应格式

### 成功响应 (201 Created)

```json
{
  "message": "注册成功",
  "user": {
    "id": 3,
    "email": "zhang.san@example.com",
    "first_name": "三",
    "last_name": "张",
    "full_name": "张 三",
    "short_name": "三",
    "date_joined": "2025-05-25T08:39:27.828044+08:00",
    "last_login": null
  },
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 响应字段说明

#### 用户信息 (user)
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 用户唯一标识 |
| `email` | string | 用户邮箱地址 |
| `first_name` | string | 用户名字 |
| `last_name` | string | 用户姓氏 |
| `full_name` | string | 完整姓名 (姓 + 名) |
| `short_name` | string | 简短姓名 (通常是名字) |
| `date_joined` | datetime | 注册时间 (ISO 8601格式) |
| `last_login` | datetime | 最后登录时间 (新注册用户为null) |

#### Token信息 (tokens)
| 字段 | 类型 | 说明 | 有效期 |
|------|------|------|--------|
| `access` | string | 访问Token | 1小时 |
| `refresh` | string | 刷新Token | 7天 |

## 错误响应

### 邮箱已存在 (400 Bad Request)

```json
{
  "email": [
    "具有 邮箱地址 的 用户 已存在。"
  ]
}
```

### 密码不匹配 (400 Bad Request)

```json
{
  "password_confirm": [
    "两次输入的密码不一致"
  ]
}
```

### 密码过短 (400 Bad Request)

```json
{
  "password": [
    "请确保这个字段至少包含 8 个字符。"
  ]
}
```

### 邮箱格式错误 (400 Bad Request)

```json
{
  "email": [
    "请输入一个有效的电子邮件地址。"
  ]
}
```

### 字段缺失 (400 Bad Request)

```json
{
  "email": [
    "该字段是必填项。"
  ],
  "first_name": [
    "该字段是必填项。"
  ]
}
```

## 使用示例

### cURL

```bash
curl -X POST "http://127.0.0.1:8000/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhang.san@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "三",
    "last_name": "张"
  }'
```

### JavaScript (Fetch)

```javascript
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('注册成功:', data.user);
      
      // 存储Token以供后续使用
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      
      return data;
    } else {
      const errorData = await response.json();
      console.error('注册失败:', errorData);
      throw errorData;
    }
  } catch (error) {
    console.error('网络错误:', error);
    throw error;
  }
};

// 使用示例
const newUser = {
  email: 'zhang.san@example.com',
  password: 'securepassword123',
  password_confirm: 'securepassword123',
  first_name: '三',
  last_name: '张'
};

registerUser(newUser)
  .then(data => {
    console.log('用户注册成功:', data.user.full_name);
  })
  .catch(error => {
    console.error('注册失败:', error);
  });
```

### Python (requests)

```python
import requests

def register_user(email, password, first_name, last_name):
    """用户注册函数"""
    url = "http://127.0.0.1:8000/api/auth/register/"
    
    data = {
        "email": email,
        "password": password,
        "password_confirm": password,
        "first_name": first_name,
        "last_name": last_name
    }
    
    try:
        response = requests.post(url, json=data)
        
        if response.status_code == 201:
            result = response.json()
            print(f"注册成功: {result['user']['full_name']}")
            
            # 返回用户信息和Token
            return {
                'user': result['user'],
                'access_token': result['tokens']['access'],
                'refresh_token': result['tokens']['refresh']
            }
        else:
            error_data = response.json()
            print(f"注册失败: {error_data}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"网络错误: {e}")
        return None

# 使用示例
user_data = register_user(
    email="zhang.san@example.com",
    password="securepassword123",
    first_name="三",
    last_name="张"
)

if user_data:
    print(f"用户ID: {user_data['user']['id']}")
    print(f"访问Token: {user_data['access_token'][:50]}...")
```

### Vue.js 组件示例

```vue
<template>
  <div class="register-form">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">邮箱地址 *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :class="{ 'error': errors.email }"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email[0] }}</span>
      </div>
      
      <div class="form-group">
        <label for="lastName">姓氏 *</label>
        <input
          id="lastName"
          v-model="form.last_name"
          type="text"
          required
          :class="{ 'error': errors.last_name }"
        />
        <span v-if="errors.last_name" class="error-message">{{ errors.last_name[0] }}</span>
      </div>
      
      <div class="form-group">
        <label for="firstName">名字 *</label>
        <input
          id="firstName"
          v-model="form.first_name"
          type="text"
          required
          :class="{ 'error': errors.first_name }"
        />
        <span v-if="errors.first_name" class="error-message">{{ errors.first_name[0] }}</span>
      </div>
      
      <div class="form-group">
        <label for="password">密码 *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          minlength="8"
          :class="{ 'error': errors.password }"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password[0] }}</span>
      </div>
      
      <div class="form-group">
        <label for="passwordConfirm">确认密码 *</label>
        <input
          id="passwordConfirm"
          v-model="form.password_confirm"
          type="password"
          required
          :class="{ 'error': errors.password_confirm }"
        />
        <span v-if="errors.password_confirm" class="error-message">{{ errors.password_confirm[0] }}</span>
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: ''
      },
      errors: {},
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      this.loading = true
      this.errors = {}
      
      try {
        const response = await axios.post('/api/auth/register/', this.form)
        
        // 注册成功
        const { user, tokens } = response.data
        
        // 存储Token
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        
        // 通知父组件或路由跳转
        this.$emit('registration-success', user)
        
        // 提示用户
        this.$message.success(`欢迎，${user.full_name}！注册成功。`)
        
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // 显示表单验证错误
          this.errors = error.response.data
        } else {
          // 显示通用错误
          this.$message.error('注册失败，请稍后重试。')
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
```

## 验证规则

### 邮箱验证
- 必须符合标准邮箱格式
- 在系统中必须唯一
- 不区分大小写
- 支持国际化域名

### 密码验证
- 最小长度: 8个字符
- 支持字母、数字、特殊字符
- 与确认密码必须一致
- 不能与邮箱相同

### 姓名验证
- 支持中文、英文、数字
- 最大长度: 30个字符
- 不能为空或只包含空格
- 自动去除首尾空格

## 安全考虑

### 密码安全
- 密码使用PBKDF2算法加密存储
- 每个密码使用唯一盐值
- 明文密码不会存储在服务器上
- 支持密码强度检查

### 防刷机制
- 建议实施IP频率限制
- 可以添加图形验证码
- 邮箱验证可选实施

### 数据验证
- 所有输入都经过服务端验证
- 防止SQL注入和XSS攻击
- 输入长度和格式严格限制

## 后续操作

注册成功后，用户可以：

1. **立即使用API**: 使用返回的access_token访问受保护的API
2. **更新个人信息**: 调用用户信息更新API
3. **查看权限**: 获取用户权限列表
4. **正常登录**: 后续可以使用邮箱密码正常登录

## 测试用例

参考测试文件: `tests/test_api.py`

```python
# 测试成功注册
def test_successful_registration():
    # 测试用例在 tests/test_api.py 中

# 测试重复邮箱
def test_duplicate_email():
    # 测试用例在 tests/test_api.py 中

# 测试密码不匹配
def test_password_mismatch():
    # 测试用例在 tests/test_api.py 中
```

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_api.py`  
**相关文档**: [用户登录API](user-login.md), [认证概览](auth-overview.md)
