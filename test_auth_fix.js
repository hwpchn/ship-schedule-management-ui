// 测试脚本：模拟清除 refresh token 的场景
console.log('开始测试认证修复...');

// 1. 检查当前本地存储状态
console.log('当前本地存储状态:');
console.log('token:', localStorage.getItem('token') ? '存在' : '不存在');
console.log('refreshToken:', localStorage.getItem('refreshToken') ? '存在' : '不存在');

// 2. 模拟问题场景：只保留 access token，清除 refresh token
console.log('\n模拟问题场景：清除 refresh token...');
localStorage.removeItem('refreshToken');

console.log('清除后的本地存储状态:');
console.log('token:', localStorage.getItem('token') ? '存在' : '不存在');
console.log('refreshToken:', localStorage.getItem('refreshToken') ? '存在' : '不存在');

// 3. 刷新页面测试我们的修复
console.log('\n刷新页面测试修复效果...');
window.location.reload();
