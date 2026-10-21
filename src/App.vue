<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AIAssistant from '@/components/AIAssistant.vue'
import TranslateDrawer from '@/components/TranslateDrawer.vue'

const route = useRoute()
const focusedRoutes = new Set(['english', 'english-vocab-study', 'english-vocab-review', 'english-article-detail'])
const showUtilities = computed(() => !focusedRoutes.has(String(route.name)))
</script>

<template>
  <div id="app-container">
    <router-view />
    <AIAssistant v-if="showUtilities" />
    <TranslateDrawer v-if="showUtilities" />
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
  font-family: var(--xl-font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保路由视图占满整个容器 */
#app {
  display: flex;
  flex-direction: column;
}
</style>
