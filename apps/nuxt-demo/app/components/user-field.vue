<template>
  <UFormField :label="label" :error="error ?? false">
    <slot />
  </UFormField>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  error: string | null
}>()
</script>
