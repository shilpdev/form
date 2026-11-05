<template>
  <ActionButton action="unarchive">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </ActionButton>
</template>

<script setup lang="ts">
import ActionButton from './action-button.vue'

/** Calls `unarchiveItem`. The slot gets `{ context }`. */
defineOptions({
  name: 'FormUnarchive',
})
</script>
