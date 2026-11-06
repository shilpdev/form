<template>
  <div v-if="isActionVisible(action, context)" :class="`shilp-form__${action}`">
    <slot :context="context">
      <button type="button" :disabled="context.isLoading" @click="onClick">
        {{ getActionLabel(action, context) }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormAction } from '@shared'
import { getActionLabel, isActionVisible } from '@shared/utils'
import { useFormContext } from '../composables/use-form-context'

defineOptions({
  name: 'FormActionButton',
})

/** Shared by the three action buttons: they differ only in the action name. */
const { action } = defineProps<{ action: FormAction }>()

const context = useFormContext()

const ACTION_METHODS = {
  create: context.createItem,
  update: context.updateItem,
  delete: context.deleteItem,
}

function onClick() {
  ACTION_METHODS[action]()
}
</script>
