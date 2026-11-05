<template>
  <ActionButton action="archive">
    <template v-if="$slots.default" #default="scope">
      <slot v-bind="scope" />
    </template>
  </ActionButton>
</template>

<script setup lang="ts">
import ActionButton from './action-button.vue'

/** Calls `archiveItem`. The slot gets `{ context }`. */
defineOptions({
  name: 'FormArchive',
})
</script>
