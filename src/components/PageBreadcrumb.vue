<script setup lang="ts">
export interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{ items: BreadcrumbItem[] }>()
</script>

<template>
  <nav class="page-breadcrumb" aria-label="面包屑">
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <span v-if="index > 0" class="divider" aria-hidden="true">/</span>
      <router-link v-if="item.to" :to="item.to">{{ item.label }}</router-link>
      <span v-else class="current" aria-current="page">{{ item.label }}</span>
    </template>
  </nav>
</template>

<style scoped>
.page-breadcrumb { display: flex; align-items: center; gap: 9px; min-width: 0; min-height: 36px; color: var(--xl-ink-soft); font-size: 13px; white-space: nowrap; }
.page-breadcrumb a { display: inline-flex; align-items: center; min-height: 36px; flex: none; color: var(--xl-brand); font-weight: 700; text-decoration: none; }
.page-breadcrumb a:hover { text-decoration: underline; text-underline-offset: 4px; }
.divider { flex: none; color: #9aaa9a; }
.current { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
</style>
