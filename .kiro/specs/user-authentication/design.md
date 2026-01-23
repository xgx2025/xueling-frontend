# 设计文档

## 概述

学灵用户认证系统采用前后端分离架构，前端使用 Vue 3 + TypeScript + Element Plus 构建用户界面，通过 Axios 与后端 API 通信。系统实现了基于 JWT 的双令牌认证机制（AccessToken + RefreshToken），其中 RefreshToken 通过 HttpOnly Cookie 存储以提高安全性。

## 架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  登录页面     │  │  注册页面     │  │  主页面       │      │
│  │ LoginView    │  │ RegisterView │  │  HomeView    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        状态管理层                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pinia Store (useTokenStore, useUserStore)          │   │
│  │  - 管理 AccessToken                                   │   │
│  │  - 管理用户信息                                        │   │
│  │  - 持久化到 localStorage                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        API 服务层                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Axios Instance (request.ts)                         │   │
│  │  - 请求拦截器：添加 Authorization header              │   │
│  │  - 响应拦截器：处理 401 错误，自动刷新 Token           │   │
│  │  - 错误处理：统一错误提示                              │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API 服务模块 (authService.ts)                        │   │
│  │  - login(email, password)                            │   │
│  │  - register(email, password, code)                   │   │
│  │  - sendVerificationCode(email)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        后端 API                               │
│  POST /api/auth/login                                       │
│  POST /api/auth/register                                    │
│  POST /api/sendVerificationCode/{email}                     │
│  POST /api/refreshToken                                     │
└─────────────────────────────────────────────────────────────┘
```

### 认证流程

**登录流程：**
```
用户输入邮箱密码 → 前端验证 → 调用登录 API → 后端验证 
→ 返回 AccessToken + 设置 RefreshToken Cookie 
→ 前端存储 AccessToken → 跳转主页
```

**Token 刷新流程：**
```
API 请求 → 401 错误 → 检查是否正在刷新 
→ 调用 refreshToken API（自动携带 Cookie）
→ 获取新 AccessToken → 重试原请求
```

## 组件和接口

### 1. 页面组件

#### LoginView.vue
登录页面组件，提供邮箱密码登录功能。

**Props:** 无

**Data:**
```typescript
interface LoginForm {
  email: string
  password: string
}

interface LoginFormRules {
  email: FormItemRule[]
  password: FormItemRule[]
}
```

**Methods:**
- `handleLogin()`: 处理登录表单提交
- `validateForm()`: 验证表单数据
- `navigateToRegister()`: 跳转到注册页面

**Emits:** 无

#### RegisterView.vue
注册页面组件，提供邮箱注册功能。

**Props:** 无

**Data:**
```typescript
interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}

interface RegisterFormRules {
  email: FormItemRule[]
  password: FormItemRule[]
  confirmPassword: FormItemRule[]
  verificationCode: FormItemRule[]
}
```

**Methods:**
- `handleRegister()`: 处理注册表单提交
- `sendVerificationCode()`: 发送邮箱验证码
- `startCountdown()`: 启动验证码倒计时
- `validatePassword()`: 自定义密码验证
- `validateConfirmPassword()`: 自定义确认密码验证
- `navigateToLogin()`: 跳转到登录页面

**Emits:** 无

### 2. API 服务

#### authService.ts
认证相关的 API 服务封装。

```typescript
interface LoginDTO {
  email: string
  password: string
  ip?: string
}

interface RegisterDTO {
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}

interface AuthResponse {
  code: number
  message: string
  data: string  // AccessToken
}

// 登录
export const login = (loginData: LoginDTO): Promise<AuthResponse>

// 注册
export const register = (registerData: RegisterDTO): Promise<AuthResponse>

// 发送验证码
export const sendVerificationCode = (email: string): Promise<{ code: number; message: string }>
```

### 3. 状态管理

#### useTokenStore (已存在)
管理用户认证令牌。

```typescript
interface TokenStore {
  accessToken: Ref<string>
  setToken: (token: string) => void
  removeToken: () => void
}
```

#### useUserStore (新增)
管理用户信息。

```typescript
interface UserInfo {
  id: string
  email: string
  nickname?: string
  avatar?: string
}

interface UserStore {
  userInfo: Ref<UserInfo | null>
  isLoggedIn: Ref<boolean>
  setUserInfo: (info: UserInfo) => void
  clearUserInfo: () => void
  logout: () => void
}
```

### 4. 工具函数

#### validators.ts
表单验证工具函数。

```typescript
// 邮箱格式验证
export const validateEmail = (email: string): boolean

// 密码强度验证
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  strength: 'weak' | 'medium' | 'strong'
  message: string
}

// 验证码格式验证
export const validateVerificationCode = (code: string): boolean
```

#### crypto.ts
加密工具函数。

```typescript
// 密码加密（前端简单加密，后端再次加密）
export const encryptPassword = (password: string): string
```

## 数据模型

### 前端数据模型

```typescript
// 登录表单
interface LoginFormData {
  email: string        // 邮箱地址
  password: string     // 密码
}

// 注册表单
interface RegisterFormData {
  email: string              // 邮箱地址
  password: string           // 密码
  confirmPassword: string    // 确认密码
  verificationCode: string   // 验证码
}

// 用户信息
interface UserInfo {
  id: string           // 用户ID
  email: string        // 邮箱
  nickname?: string    // 昵称（可选）
  avatar?: string      // 头像URL（可选）
}

// API 响应
interface ApiResponse<T = any> {
  code: number         // 状态码：0-成功，其他-失败
  message: string      // 提示信息
  data: T             // 响应数据
}
```

### 后端 DTO（参考）

```typescript
// 登录请求
interface LoginDTO {
  email: string
  phone?: string  // 预留手机号登录
  password: string
  ip?: string     // 客户端IP
}

// 注册请求
interface RegisterDTO {
  email: string
  password: string
  confirmPassword: string
  verificationCode: string
}
```

## 正确性属性

*属性是关于系统应该做什么的特征或行为的正式陈述，它应该在系统的所有有效执行中保持为真。属性是人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1: 邮箱格式验证一致性
*对于任意* 邮箱字符串，验证函数应该正确识别有效的邮箱格式（包含 @ 符号，有域名部分），并拒绝无效格式（缺少 @、空字符串、纯空格等）
**验证需求: Requirements 1.1, 2.1, 3.1**

### 属性 2: 密码确认一致性
*对于任意* 密码和确认密码输入对，当且仅当两者完全相同时验证应该通过
**验证需求: Requirements 1.2**

### 属性 3: 验证码格式验证
*对于任意* 验证码字符串，验证函数应该正确识别有效格式（非空、符合长度要求），并拒绝无效格式（空字符串、纯空格、长度不符）
**验证需求: Requirements 1.3**

### 属性 4: 密码强度验证
*对于任意* 密码字符串，验证函数应该：
- 拒绝长度小于 6 的密码
- 拒绝空字符串和纯空格
- 正确计算密码强度（弱/中/强）
- 对于相同的密码输入返回相同的强度评级
**验证需求: Requirements 3.2, 4.1, 4.2**

### 属性 5: 密码加密不可逆性
*对于任意* 非空密码字符串，加密后的结果应该：
- 与原始密码不同
- 对于相同的输入产生相同的输出（确定性）
- 长度符合预期的加密输出格式
**验证需求: Requirements 4.4**

### 属性 6: 令牌存储往返一致性
*对于任意* 有效的令牌字符串，执行以下操作序列应该保持数据一致性：
- 存储到 Pinia store → 从 store 读取 = 原始令牌
- 存储到 localStorage → 从 localStorage 读取 = 原始令牌
- 存储到 store 和 localStorage → 刷新页面 → 从 store 读取 = 原始令牌
**验证需求: Requirements 3.5, 6.2, 6.3**

### 属性 7: 表单验证反馈一致性
*对于任意* 表单字段和无效输入值，验证系统应该：
- 在字段失去焦点时触发验证
- 显示具体的错误信息
- 错误信息应该描述问题而不是泄露敏感信息
- 对于相同的无效输入返回相同的错误信息
**验证需求: Requirements 5.1, 5.5**

### 属性 8: 验证码倒计时单调递减
*对于任意* 初始倒计时值 N（秒），倒计时过程应该：
- 每秒递减 1
- 到达 0 时停止
- 在倒计时期间禁用发送按钮
- 倒计时结束后重新启用发送按钮
**验证需求: Requirements 2.3**

### 属性 9: 请求拦截器认证头一致性
*对于任意* 需要认证的 API 请求，请求拦截器应该：
- 自动添加 Authorization header
- header 格式为 "Bearer {token}"
- 对于登录、注册、发送验证码等公开接口不添加 header
- 当 token 不存在时跳转到登录页
**验证需求: Requirements 8.5**

## 错误处理

### 网络错误处理

```typescript
// HTTP 状态码错误处理
const errorHandlers = {
  401: () => {
    // Token 过期，尝试刷新
    // 如果刷新失败，清除 token 并跳转登录页
  },
  403: () => {
    ElMessage.error('您没有权限执行此操作！')
  },
  404: () => {
    ElMessage.error('请求的资源不存在！')
  },
  500: () => {
    ElMessage.error('服务器异常，请稍后再试！')
  },
  timeout: () => {
    ElMessage.error('请求超时，请检查网络连接！')
  }
}
```

### 表单验证错误

```typescript
// 表单验证规则
const validationRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePasswordMatch, trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' }
  ]
}
```

### 业务逻辑错误

```typescript
// 业务错误码映射
const businessErrorMessages = {
  'EMAIL_EXISTS': '该邮箱已被注册',
  'INVALID_CODE': '验证码错误或已过期',
  'INVALID_CREDENTIALS': '邮箱或密码错误',
  'ACCOUNT_LOCKED': '账号已被锁定，请联系管理员',
  'TOO_MANY_REQUESTS': '请求过于频繁，请稍后再试'
}
```

## 测试策略

### 单元测试

使用 Vitest 进行单元测试，覆盖以下模块：

1. **工具函数测试**
   - 邮箱验证函数
   - 密码强度验证函数
   - 密码加密函数
   - 验证码格式验证函数

2. **Store 测试**
   - Token 存储和读取
   - 用户信息管理
   - 登出清除数据

3. **API 服务测试**
   - 使用 Mock 测试 API 调用
   - 测试请求参数格式
   - 测试响应处理

4. **组件测试**
   - 表单验证逻辑
   - 用户交互行为
   - 路由跳转

### 属性测试

使用 fast-check 进行属性测试，每个测试至少运行 100 次迭代：

1. **属性 1: 邮箱格式验证一致性**
   ```typescript
   // Feature: user-authentication, Property 1: 邮箱格式验证一致性
   // 生成各种邮箱字符串，测试验证函数的正确性
   ```

2. **属性 2: 密码确认一致性**
   ```typescript
   // Feature: user-authentication, Property 2: 密码确认一致性
   // 生成随机密码对，测试一致性验证
   ```

3. **属性 3: 验证码格式验证**
   ```typescript
   // Feature: user-authentication, Property 3: 验证码格式验证
   // 生成各种验证码字符串，测试格式验证
   ```

4. **属性 4: 密码强度验证**
   ```typescript
   // Feature: user-authentication, Property 4: 密码强度验证
   // 生成各种密码，测试强度计算和最小长度验证
   ```

5. **属性 5: 密码加密不可逆性**
   ```typescript
   // Feature: user-authentication, Property 5: 密码加密不可逆性
   // 生成随机密码，测试加密函数的确定性和不可逆性
   ```

6. **属性 6: 令牌存储往返一致性**
   ```typescript
   // Feature: user-authentication, Property 6: 令牌存储往返一致性
   // 生成随机令牌，测试存储和恢复的一致性
   ```

7. **属性 7: 表单验证反馈一致性**
   ```typescript
   // Feature: user-authentication, Property 7: 表单验证反馈一致性
   // 生成各种无效输入，测试验证反馈的一致性
   ```

8. **属性 8: 验证码倒计时单调递减**
   ```typescript
   // Feature: user-authentication, Property 8: 验证码倒计时单调递减
   // 测试倒计时逻辑的正确性
   ```

9. **属性 9: 请求拦截器认证头一致性**
   ```typescript
   // Feature: user-authentication, Property 9: 请求拦截器认证头一致性
   // 测试请求拦截器对各种请求的处理
   ```

### 集成测试

1. **完整登录流程**
   - 输入邮箱密码 → 提交 → 接收 token → 存储 → 跳转

2. **完整注册流程**
   - 输入邮箱 → 发送验证码 → 输入密码 → 提交 → 跳转登录

3. **Token 刷新流程**
   - 模拟 401 错误 → 自动刷新 → 重试请求

4. **会话恢复**
   - 登录 → 刷新页面 → 验证会话保持

### 端到端测试

使用 Playwright 或 Cypress 进行 E2E 测试：

1. 用户注册完整流程
2. 用户登录完整流程
3. 验证码发送和倒计时
4. 表单验证错误提示
5. 响应式布局测试

## 技术选型

- **前端框架**: Vue 3 (Composition API)
- **类型系统**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **表单验证**: Element Plus + 自定义验证器
- **加密**: crypto-js (可选，用于前端简单加密)
- **单元测试**: Vitest
- **属性测试**: fast-check
- **E2E 测试**: Playwright (可选)

## 安全考虑

1. **密码安全**
   - 前端进行基本加密（可选）
   - 后端使用强加密算法（bcrypt/argon2）
   - 不在前端存储明文密码

2. **Token 安全**
   - AccessToken 存储在 localStorage（短期有效）
   - RefreshToken 存储在 HttpOnly Cookie（长期有效，防 XSS）
   - 实现自动刷新机制

3. **传输安全**
   - 使用 HTTPS
   - 敏感数据加密传输

4. **防护措施**
   - 验证码防止暴力破解
   - 倒计时防止频繁请求
   - 错误信息不泄露敏感信息（如"邮箱或密码错误"而不是"邮箱不存在"）

## 性能优化

1. **组件懒加载**
   ```typescript
   const LoginView = () => import('@/views/auth/LoginView.vue')
   const RegisterView = () => import('@/views/auth/RegisterView.vue')
   ```

2. **请求优化**
   - 防抖处理表单验证
   - 请求队列管理（Token 刷新时）
   - 合理的超时设置

3. **缓存策略**
   - Token 持久化到 localStorage
   - 用户信息缓存

## 可访问性

1. **键盘导航**
   - 支持 Tab 键切换表单字段
   - 支持 Enter 键提交表单

2. **屏幕阅读器**
   - 表单字段添加适当的 label
   - 错误信息使用 aria-live

3. **视觉反馈**
   - 清晰的焦点状态
   - 明显的错误提示
   - 加载状态指示
