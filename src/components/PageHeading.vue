<script setup lang="ts">
import PageBreadcrumb, { type BreadcrumbItem } from './PageBreadcrumb.vue'

defineProps<{
  items: BreadcrumbItem[]
  title: string
  description?: string
}>()
</script>

<template>
  <header class="page-heading">
    <PageBreadcrumb :items="items" />
    <div class="heading-row">
      <div class="heading-main">
        <div v-if="$slots.mark" class="heading-mark" aria-hidden="true"><slot name="mark" /></div>
        <div class="heading-copy">
          <h1>{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
        </div>
      </div>
      <div v-if="$slots.actions" class="heading-actions"><slot name="actions" /></div>
    </div>
  </header>
</template>

<style scoped>
.page-heading { margin-bottom: 32px; }
.heading-row { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-top: 18px; }
.heading-main { display: flex; align-items: center; gap: 18px; min-width: 0; }
.heading-mark { flex: none; width: 64px; height: 64px; display: grid; place-items: center; border-radius: 16px; background: #e3ecdf; color: var(--xl-brand); font: 700 33px/1 var(--xl-font-display); }
.heading-copy { min-width: 0; }
.heading-copy h1 { font: 700 clamp(29px, 3vw, 38px)/1.2 var(--xl-font-display); letter-spacing: -.025em; overflow-wrap: anywhere; }
.heading-copy p { margin-top: 7px; color: var(--xl-ink-soft); font-size: 14px; line-height: 1.55; }
.heading-actions { flex: none; }
@media (max-width: 760px) {
  .page-heading { margin-bottom: 24px; }
  .heading-row { margin-top: 12px; }
  .heading-main { gap: 13px; }
  .heading-mark { width: 52px; height: 52px; border-radius: 13px; font-size: 27px; }
  .heading-copy p { font-size: 13px; }
}
@media (max-width: 560px) {
  .heading-row { align-items: stretch; flex-direction: column; gap: 18px; }
  .heading-actions { align-self: flex-start; }
}
</style>
