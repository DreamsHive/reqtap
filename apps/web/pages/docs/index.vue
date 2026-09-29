<script setup lang="ts">
const page = findDocsPage('introduction')!

useHead({ title: 'Docs · Reqtap' })
</script>

<template>
  <DocsArticle :page="page" />
</template>
