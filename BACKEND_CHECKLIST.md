# 后端配置检查清单

## 问题：/users/info 接口返回 403

前端已确认：
- ✅ Token 存在于 localStorage
- ✅ 请求头正确添加了 `Authorization: Bearer xxx`
- ❌ 后端返回 403 Forbidden

## 后端需要检查的地方

### 1. JWT 拦截器/过滤器配置

检查是否有类似这样的拦截器：

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) {
        // 1. 从请求头获取 token
        String token = request.getHeader("Authorization");
        
        // 2. 解析 token
        Claims claims = parseToken(token);
        
        // 3. 存入 ThreadLocal
        ThreadLocalUtils.set(claims);
        
        // 4. 继续执行
        filterChain.doFilter(request, response);
    }
}
```

**检查项：**
- [ ] 拦截器是否存在？
- [ ] 拦截器是否正确注册到 Spring？
- [ ] 拦截器的执行顺序是否正确？

### 2. 拦截器路径配置

检查拦截器是否配置了 `/users/**` 路径：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/**")  // 拦截所有路径
                .excludePathPatterns(
                    "/auth/login",
                    "/auth/register",
                    "/auth/sendVerificationCode/**"
                );
                // 确保 /users/** 没有被排除！
    }
}
```

**检查项：**
- [ ] `/users/info` 路径是否被拦截器处理？
- [ ] `/users/**` 是否被错误地排除了？

### 3. Token 解析逻辑

检查 token 解析是否正确：

```java
public Claims parseToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("无效的 token");
    }
    
    String token = authHeader.substring(7); // 去掉 "Bearer "
    
    try {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    } catch (Exception e) {
        throw new UnauthorizedException("Token 解析失败");
    }
}
```

**检查项：**
- [ ] 是否正确处理了 "Bearer " 前缀？
- [ ] 签名密钥是否正确？
- [ ] Token 是否已过期？

### 4. ThreadLocal 存储

检查 ThreadLocalUtils 是否正确实现：

```java
public class ThreadLocalUtils {
    private static final ThreadLocal<Claims> THREAD_LOCAL = new ThreadLocal<>();
    
    public static void set(Claims claims) {
        THREAD_LOCAL.set(claims);
    }
    
    public static Claims get() {
        return THREAD_LOCAL.get();
    }
    
    public static void remove() {
        THREAD_LOCAL.remove();
    }
}
```

**检查项：**
- [ ] ThreadLocal 是否正确存储了 claims？
- [ ] 是否在请求结束后清理了 ThreadLocal？

### 5. Controller 中的 userId 获取

检查 Controller 中是否能正确获取 userId：

```java
@GetMapping("/info")
public Result<UserVO> info() {
    Claims claims = ThreadLocalUtils.get();
    
    // 添加日志
    log.info("Claims: {}", claims);
    
    if (claims == null) {
        log.error("Claims 为 null，拦截器可能没有执行");
        return Result.error("未授权");
    }
    
    Long userId = claims.get("userId", Long.class);
    
    if (userId == null) {
        log.error("Token 中没有 userId 字段");
        return Result.error("Token 无效");
    }
    
    log.info("正在获取用户 {} 的信息", userId);
    UserVO userInfo = userService.getUserInfo(userId);
    return Result.success(userInfo);
}
```

**检查项：**
- [ ] Claims 是否为 null？
- [ ] Claims 中是否包含 userId？
- [ ] userId 的类型是否正确（Long）？

### 6. 登录时 Token 的生成

检查登录接口生成的 token 是否包含 userId：

```java
@PostMapping("/login")
public Result<String> login(@RequestBody LoginDTO loginDTO) {
    // 验证用户
    User user = userService.authenticate(loginDTO);
    
    // 生成 token
    String token = Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())  // 确保包含 userId！
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
            .compact();
    
    return Result.success(token);
}
```

**检查项：**
- [ ] Token 中是否包含 `userId` claim？
- [ ] `userId` 的值是否正确？

## 调试步骤

### 步骤 1：在拦截器中添加日志

```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                               HttpServletResponse response, 
                               FilterChain filterChain) {
    String path = request.getRequestURI();
    log.info("拦截器处理请求: {}", path);
    
    String authHeader = request.getHeader("Authorization");
    log.info("Authorization 头: {}", authHeader);
    
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        try {
            Claims claims = parseToken(authHeader);
            log.info("解析的 Claims: {}", claims);
            ThreadLocalUtils.set(claims);
        } catch (Exception e) {
            log.error("Token 解析失败", e);
            response.setStatus(403);
            return;
        }
    }
    
    filterChain.doFilter(request, response);
}
```

### 步骤 2：检查日志输出

启动后端，发起请求，查看日志：
- 拦截器是否执行？
- Authorization 头是否正确？
- Claims 是否解析成功？
- userId 是否存在？

### 步骤 3：使用 Postman 测试

1. 从前端复制 token
2. 在 Postman 中发起请求：
   ```
   GET http://localhost:8080/users/info
   Headers:
   Authorization: Bearer <your-token>
   ```
3. 查看响应

## 常见问题

### 问题 1：拦截器没有执行

**原因**：拦截器没有正确注册或路径配置错误

**解决**：检查 WebMvcConfig 配置

### 问题 2：Token 解析失败

**原因**：
- 签名密钥不匹配
- Token 格式错误
- Token 已过期

**解决**：检查密钥配置和 token 生成逻辑

### 问题 3：Claims 为 null

**原因**：ThreadLocal 没有正确设置

**解决**：检查拦截器中的 ThreadLocalUtils.set() 调用

### 问题 4：userId 不存在

**原因**：登录时没有将 userId 放入 token

**解决**：修改登录接口，添加 `.claim("userId", user.getId())`

## 前端临时方案

在后端问题解决之前，前端已经注释掉了自动获取用户信息的逻辑。

等后端修复后，在 `src/router/index.ts` 中取消注释即可。
