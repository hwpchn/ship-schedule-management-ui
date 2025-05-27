# 用户登录API

## 概览

用户登录API允许已注册用户使用邮箱和密码进行身份验证，成功后获取JWT访问Token和刷新Token，用于后续API调用的身份认证。

## 接口信息

- **URL**: `/api/auth/login/`
- **方法**: `POST`
- **认证**: 不需要
- **权限**: 公开访问
- **内容类型**: `application/json`

## 请求参数

### 请求体 (JSON)

| 字段 | 类型 | 必需 | 说明 | 限制 |
|------|------|------|------|------|
| `email` | string | ✅ | 用户邮箱地址 | 必须是已注册的有效邮箱 |
| `password` | string | ✅ | 用户密码 | 与注册时设置的密码一致 |

### 请求示例

```json
{
  "email": "zhang.san@example.com",
  "password": "securepassword123"
}
```

## 响应格式

### 成功响应 (200 OK)

```json
{
  "message": "登录成功",
  "user": {
    "id": 3,
    "email": "zhang.san@example.com",
    "first_name": "三",
    "last_name": "张",
    "full_name": "张 三",
    "short_name": "三",
    "date_joined": "2025-05-25T08:39:27.828044+08:00",
    "last_login": "2025-05-25T08:45:30.123456+08:00"
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
| `last_login` | datetime | 最后登录时间 (自动更新为当前时间) |

#### Token信息 (tokens)
| 字段 | 类型 | 说明 | 有效期 |
|------|------|------|--------|
| `access` | string | 访问Token，用于API调用认证 | 1小时 |
| `refresh` | string | 刷新Token，用于获取新的访问Token | 7天 |

## 错误响应

### 邮箱或密码错误 (400 Bad Request)

```json
{
  "non_field_errors": [
    "邮箱或密码错误"
  ]
}
```

### 字段缺失 (400 Bad Request)

```json
{
  "email": [
    "该字段是必填项。"
  ],
  "password": [
    "该字段是必填项。"
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

### 用户账户被禁用 (400 Bad Request)

```json
{
  "non_field_errors": [
    "用户账户已被禁用"
  ]
}
```

## 使用示例

### cURL

```bash
curl -X POST "http://127.0.0.1:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhang.san@example.com",
    "password": "securepassword123"
  }'
```

### JavaScript (Fetch)

```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('登录成功:', data.user.full_name);
      
      // 存储Token
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      
      return data;
    } else {
      const errorData = await response.json();
      console.error('登录失败:', errorData);
      throw errorData;
    }
  } catch (error) {
    console.error('网络错误:', error);
    throw error;
  }
};

// 使用示例
loginUser('zhang.san@example.com', 'securepassword123')
  .then(data => {
    console.log(`欢迎回来，${data.user.full_name}！`);
    // 可以在这里进行页面跳转或其他操作
    window.location.href = '/dashboard';
  })
  .catch(error => {
    if (error.non_field_errors) {
      alert('邮箱或密码错误，请重试');
    } else {
      alert('登录失败，请稍后重试');
    }
  });
```

### Python (requests)

```python
import requests
import json

def login_user(email, password):
    """用户登录函数"""
    url = "http://127.0.0.1:8000/api/auth/login/"
    
    data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"登录成功: 欢迎回来，{result['user']['full_name']}！")
            
            # 保存用户信息和Token
            user_session = {
                'user': result['user'],
                'access_token': result['tokens']['access'],
                'refresh_token': result['tokens']['refresh']
            }
            
            # 可以保存到文件或会话存储
            with open('user_session.json', 'w', encoding='utf-8') as f:
                json.dump(user_session, f, ensure_ascii=False, indent=2)
            
            return user_session
        else:
            error_data = response.json()
            if 'non_field_errors' in error_data:
                print("登录失败: 邮箱或密码错误")
            else:
                print(f"登录失败: {error_data}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"网络错误: {e}")
        return None

# 使用示例
session = login_user("zhang.san@example.com", "securepassword123")

if session:
    print(f"用户ID: {session['user']['id']}")
    print(f"最后登录: {session['user']['last_login']}")
    print(f"访问Token: {session['access_token'][:50]}...")
    
    # 使用Token进行后续API调用
    headers = {'Authorization': f"Bearer {session['access_token']}"}
    # API调用示例...
```

### Vue.js 组件示例

```vue
<template>
  <div class="login-form">
    <h2>用户登录</h2>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">邮箱地址 *</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          :class="{ 'error': errors.email }"
          placeholder="请输入邮箱地址"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email[0] }}</span>
      </div>
      
      <div class="form-group">
        <label for="password">密码 *</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          :class="{ 'error': errors.password }"
          placeholder="请输入密码"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password[0] }}</span>
      </div>
      
      <div v-if="errors.non_field_errors" class="form-group">
        <div class="general-error">
          {{ errors.non_field_errors[0] }}
        </div>
      </div>
      
      <div class="form-group">
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </div>
      
      <div class="form-links">
        <router-link to="/register">还没有账户？立即注册</router-link>
        <router-link to="/forgot-password">忘记密码？</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import axios from 'axios'

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      errors: {},
      loading: false
    }
  },
  methods: {
    ...mapActions('auth', ['setUser', 'setTokens']),
    
    async handleLogin() {
      this.loading = true
      this.errors = {}
      
      try {
        const response = await axios.post('/api/auth/login/', this.form)
        
        // 登录成功
        const { user, tokens } = response.data
        
        // 存储到Vuex store
        this.setUser(user)
        this.setTokens(tokens)
        
        // 存储到localStorage
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        localStorage.setItem('user_info', JSON.stringify(user))
        
        // 提示用户
        this.$message.success(`欢迎回来，${user.full_name}！`)
        
        // 跳转到主页或用户指定的页面
        const redirectTo = this.$route.query.redirect || '/dashboard'
        this.$router.push(redirectTo)
        
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // 显示表单验证错误
          this.errors = error.response.data
        } else {
          // 显示通用错误
          this.$message.error('登录失败，请稍后重试')
        }
      } finally {
        this.loading = false
      }
    },
    
    // 记住邮箱功能
    saveEmail() {
      if (this.form.email) {
        localStorage.setItem('remembered_email', this.form.email)
      }
    },
    
    // 加载记住的邮箱
    loadRememberedEmail() {
      const email = localStorage.getItem('remembered_email')
      if (email) {
        this.form.email = email
      }
    }
  },
  
  mounted() {
    this.loadRememberedEmail()
  },
  
  beforeUnmount() {
    this.saveEmail()
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #007bff;
  outline: none;
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

.general-error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.form-links {
  text-align: center;
  margin-top: 20px;
}

.form-links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 10px;
  font-size: 14px;
}

.form-links a:hover {
  text-decoration: underline;
}
</style>
```

### React组件示例

```jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { setUser, setTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post('/api/auth/login/', form);
      
      // 登录成功
      const { user, tokens } = response.data;
      
      // 存储到Context
      setUser(user);
      setTokens(tokens);
      
      // 存储到localStorage
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user_info', JSON.stringify(user));
      
      // 提示用户
      alert(`欢迎回来，${user.full_name}！`);
      
      // 跳转到主页
      navigate('/dashboard');
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data);
      } else {
        alert('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form">
      <h2>用户登录</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">邮箱地址 *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={errors.email ? 'error' : ''}
            placeholder="请输入邮箱地址"
          />
          {errors.email && (
            <span className="error-message">{errors.email[0]}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">密码 *</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className={errors.password ? 'error' : ''}
            placeholder="请输入密码"
          />
          {errors.password && (
            <span className="error-message">{errors.password[0]}</span>
          )}
        </div>
        
        {errors.non_field_errors && (
          <div className="form-group">
            <div className="general-error">
              {errors.non_field_errors[0]}
            </div>
          </div>
        )}
        
        <div className="form-group">
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
        
        <div className="form-links">
          <Link to="/register">还没有账户？立即注册</Link>
          <Link to="/forgot-password">忘记密码？</Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
```

## 安全特性

### 密码验证
- 服务端使用安全的密码验证算法
- 密码错误不会泄露具体错误信息
- 防止暴力破解攻击

### Token安全
- JWT Token包含用户身份信息
- Access Token短期有效 (1小时)
- Refresh Token长期有效 (7天)
- 支持Token黑名单机制

### 登录保护
- 可以实施登录频率限制
- 记录登录日志用于审计
- 支持多设备同时登录

## 最佳实践

### 客户端实现
1. **Token存储**: 安全存储Token，避免XSS攻击
2. **自动登录**: 使用Refresh Token实现无感刷新
3. **错误处理**: 友好的错误提示和处理
4. **表单验证**: 客户端预验证减少服务器压力

### 安全建议
1. **HTTPS**: 生产环境必须使用HTTPS传输
2. **密码策略**: 实施强密码策略
3. **会话管理**: 合理设置Token过期时间
4. **监控告警**: 监控异常登录行为

### 用户体验
1. **记住邮箱**: 方便用户重复登录
2. **加载状态**: 显示登录进度
3. **错误反馈**: 清晰的错误信息
4. **跳转逻辑**: 登录后合理的页面跳转

## 相关API

- [用户注册API](user-registration.md) - 新用户注册
- Token刷新API - POST /api/auth/token/refresh/
- 用户登出API - POST /api/auth/logout/
- 用户信息API - GET /api/auth/me/

## 测试用例

参考测试文件: `tests/test_api.py`

```python
# 测试成功登录
def test_successful_login():
    # 测试用例在 tests/test_api.py 中

# 测试错误登录
def test_invalid_credentials():
    # 测试用例在 tests/test_api.py 中

# 测试字段验证
def test_missing_fields():
    # 测试用例在 tests/test_api.py 中
```

---

**最后更新**: 2025年5月25日  
**相关测试**: `tests/test_api.py`  
**相关文档**: [用户注册API](user-registration.md), [认证概览](auth-overview.md)
