<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug || 'introduction'))
const page = computed(() => findDocsPage(slug.value))

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Docs page not found' })
}

useHead(() => ({
  title: `${page.value?.title || 'Docs'} · Reqtap`,
}))
</script>

<template>
  <DocsArticle v-if="page" :page="page" />
</template>
