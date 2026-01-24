# 后端 Spring Security + JWT 修复指南

## 问题根源

你的后端使用了 **Spring Security**，但只配置了 `LoginInterceptor` 来解析 JWT token。

问题是：
- `LoginInterceptor` 虽然解析了 token 并存入 ThreadLocal
- 但 **Spring Security 并不知道用户已经认证**
- 所以 Spring Security 仍然认为请求未授权，返回 403

## 解决方案

需要创建一个 JWT 过滤器，并将认证信息设置到 Spring Security 的上下文中。

---

## 步骤 1：创建 JWT 认证过滤器

创建文件：`JwtAuthenticationFilter.java`

```java
package com.yourpackage.filter;

import com.yourpackage.utils.JwtTokenUtils;
import com.yourpackage.utils.ThreadLocalUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT 认证过滤器
 * 从请求头中提取 JWT token，解析并设置到 Spring Security 上下文
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        log.info("JWT过滤器处理请求: {} from IP: {}", path, request.getRemoteAddr());
        
        // 从请求头获取 Authorization
        String authorization = request.getHeader("Authorization");
        
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                // 提取 token（去掉 "Bearer " 前缀）
                String token = authorization.substring(7).trim();
                
                // 解析 token
                Claims claims = JwtTokenUtils.getClaimsFromToken(token, JwtTokenUtils.ACCESS_TOKEN_SECRET);
                log.info("JWT解析成功，Claims: {}", claims);
                
                // 存入 ThreadLocal（供 Controller 使用）
                ThreadLocalUtils.set(claims);
                
                // 获取用户ID
                Long userId = claims.get("userId", Long.class);
                if (userId != null) {
                    // 创建 Spring Security 的认证对象
                    // principal: 用户ID
                    // credentials: null（已经通过 JWT 认证）
                    // authorities: 空列表（如果需要权限控制，可以从 token 中提取）
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                    
                    // 设置到 Spring Security 上下文
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("用户 {} 认证成功", userId);
                } else {
                    log.warn("Token 中没有 userId 字段");
                }
                
            } catch (Exception e) {
                log.error("JWT令牌解析失败", e);
                // 解析失败不阻止请求，让 Spring Security 处理未认证的情况
            }
        } else {
            log.debug("请求头中没有 Authorization 或格式不正确");
        }
        
        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            doFilterInternal(request, response, filterChain);
        } finally {
            // 请求结束后清理 ThreadLocal，避免内存泄漏
            ThreadLocalUtils.remove();
        }
    }
}
```

---

## 步骤 2：修改 Security 配置

修改你的 `SecurityConfig.java`：

```java
package com.yourpackage.config;

import com.yourpackage.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 允许访问的路径（不需要认证）
                .requestMatchers(
                    "/auth/login",
                    "/auth/register",
                    "/auth/forget",
                    "/auth/sendVerificationCode/**"
                ).permitAll()
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            )
            // 禁用 CSRF（因为使用 JWT，不需要 CSRF 保护）
            .csrf(AbstractHttpConfigurer::disable)
            // 禁用 Session（使用 JWT，不需要 Session）
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // 添加 JWT 过滤器（在 UsernamePasswordAuthenticationFilter 之前）
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 步骤 3：删除或禁用 LoginInterceptor

因为已经使用 `JwtAuthenticationFilter` 了，`LoginInterceptor` 就不需要了。

### 方案 A：删除 LoginInterceptor

直接删除 `LoginInterceptor.java` 文件。

### 方案 B：禁用 LoginInterceptor

如果你的 `WebMvcConfig` 中注册了 `LoginInterceptor`，注释掉：

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    // @Autowired
    // private LoginInterceptor loginInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注释掉或删除
        // registry.addInterceptor(loginInterceptor)
        //         .addPathPatterns("/**")
        //         .excludePathPatterns("/auth/**");
    }
}
```

---

## 步骤 4：确保 ThreadLocal 清理

在 `JwtAuthenticationFilter` 中添加清理逻辑（已包含在上面的代码中）：

```java
@Override
public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    try {
        super.doFilter(request, response, chain);
    } finally {
        // 请求结束后清理 ThreadLocal
        ThreadLocalUtils.remove();
    }
}
```

或者在 `ThreadLocalUtils` 中添加：

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

---

## 步骤 5：验证登录接口生成的 Token

确保登录接口生成的 token 包含 `userId`：

```java
@PostMapping("/login")
public Result<String> login(@RequestBody LoginDTO loginDTO) {
    // 验证用户
    User user = userService.authenticate(loginDTO);
    
    // 生成 token
    String token = Jwts.builder()
            .setSubject(user.getEmail())
            .claim("userId", user.getId())  // 必须包含 userId！
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(SignatureAlgorithm.HS256, ACCESS_TOKEN_SECRET)
            .compact();
    
    log.info("用户 {} 登录成功，生成 token", user.getId());
    return Result.success(token);
}
```

---

## 测试步骤

### 1. 重启后端服务

### 2. 前端重新登录

清除浏览器的 localStorage，重新登录获取新 token。

### 3. 查看后端日志

应该看到类似的日志：

```
JWT过滤器处理请求: /users/info from IP: 127.0.0.1
JWT解析成功，Claims: {userId=123, sub=user@example.com, ...}
用户 123 认证成功
正在获取123用户信息
用户信息获取成功: UserVO(id=123, ...)
```

### 4. 前端应该成功获取用户信息

浏览器控制台应该看到：

```
正在获取用户信息...
API: 调用 getUserInfo 接口
请求拦截器：已添加 Authorization 头 /users/info
fetchUserInfo: 开始获取用户信息
fetchUserInfo: 收到响应 {code: 0, msg: null, data: {...}}
fetchUserInfo: 用户信息已存储
用户信息获取成功
```

---

## 常见问题

### Q1: 仍然返回 403

**检查**：
- JWT 过滤器是否正确注册到 Spring Security？
- 过滤器的顺序是否正确（应该在 `UsernamePasswordAuthenticationFilter` 之前）？
- Token 是否包含 `userId`？

### Q2: 返回 401

**检查**：
- Token 是否已过期？
- Token 签名密钥是否正确？
- Authorization 头格式是否正确（`Bearer <token>`）？

### Q3: ThreadLocal 为 null

**检查**：
- JWT 过滤器是否成功解析了 token？
- 是否调用了 `ThreadLocalUtils.set(claims)`？
- 是否在请求结束后被清理了？（应该在 Controller 执行后才清理）

---

## 临时方案（不推荐）

如果暂时不想修改代码，可以临时将 `/users/**` 设为允许访问：

```java
.requestMatchers("/users/**").permitAll()
```

但这样做**不安全**，任何人都可以访问用户信息接口。

---

## 总结

修改后的架构：

```
前端请求
  ↓
Spring Security Filter Chain
  ↓
JwtAuthenticationFilter（解析 token，设置认证信息）
  ↓
Spring Security 授权检查（检查是否已认证）
  ↓
Controller（从 ThreadLocal 获取 userId）
  ↓
Service
  ↓
返回响应
```

关键点：
1. **JwtAuthenticationFilter** 负责解析 token
2. 将认证信息设置到 **SecurityContextHolder**
3. Spring Security 才能知道用户已认证
4. Controller 从 **ThreadLocal** 获取详细的 claims 信息
