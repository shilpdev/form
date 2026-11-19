<template>
  <div class="shilp-form__operation">
    <slot :context="context" :run="run">
      <button type="button" :disabled="context.isLoading" @click="run">
        {{ operation }}
      </button>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { OperationPropsBase } from '@shared'
import { useFormContext } from '../composables/use-form-context'

defineOptions({
  name: 'FormOperation',
})

const props = defineProps<OperationPropsBase>()

const context = useFormContext()

function run() {
  return context.runOperation(props.operation)
}
</script>
