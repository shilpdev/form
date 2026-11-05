<template>
  <ActionButton action="create">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </ActionButton>
</template>

<script setup lang="ts">
import ActionButton from './action-button.vue'

/** Calls `createItem`. The slot gets `{ context }`. */
defineOptions({
  name: 'FormCreate',
})
</script>
