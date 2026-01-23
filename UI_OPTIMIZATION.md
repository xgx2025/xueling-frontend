# 登录和注册界面优化说明

## 优化内容

### 1. 添加Lottie动画
- 安装了 `vue3-lottie` 和 `lottie-web` 库
- 在登录和注册页面左侧添加了动画效果
- 使用LottieFiles提供的学习/教育主题动画

### 2. 双栏布局设计
- **左侧**: 动画展示区域，带有欢迎文字
- **右侧**: 登录/注册表单
- 更现代、更专业的视觉效果

### 3. 响应式优化
- **桌面端** (>968px): 显示完整双栏布局
- **平板端** (≤968px): 隐藏动画，只显示表单
- **移动端** (≤480px): 优化表单间距和按钮大小
- **小屏幕** (≤360px): 进一步压缩间距

### 4. 视觉改进
- 更大的卡片阴影效果
- 更圆润的边角 (20px)
- 优化的动画效果
- 更好的色彩对比度

## 使用的Lottie动画

动画来自LottieFiles，主题为教育/学习相关。你可以根据需要替换为其他动画：

1. 访问 [LottieFiles](https://lottiefiles.com/)
2. 搜索合适的动画
3. 获取动画的JSON链接
4. 替换 `animationLink` 属性

## 自定义动画

如果想使用本地动画文件：

```vue
<Vue3Lottie
  :animationData="animationData"
  :height="350"
  :width="350"
  :loop="true"
  :autoPlay="true"
/>
```

然后在script中导入：
```typescript
import animationData from '@/assets/animations/your-animation.json'
```

## 浏览器兼容性

- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- 移动浏览器 (iOS Safari, Chrome Mobile)
- IE11+ (需要polyfills)
