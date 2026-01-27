<script setup lang="ts">
import AIAssistant from '@/components/AIAssistant.vue'
import TranslateDrawer from '@/components/TranslateDrawer.vue'
</script>

<template>
  <div id="app-container">
    <router-view />
    <AIAssistant />
    <TranslateDrawer />
  </div>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保路由视图占满整个容器 */
#app {
  display: flex;
  flex-direction: column;
}
</style>
