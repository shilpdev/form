<template>
  <ActionButton action="delete">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </ActionButton>
</template>

<script setup lang="ts">
import ActionButton from './action-button.vue'

defineOptions({
  name: 'FormDelete',
})
</script>
