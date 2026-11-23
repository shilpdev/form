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
import type { FormContext, OperationPropsBase } from '@shared'
import { inject } from 'vue'

defineOptions({
  name: 'FormOperation',
})

const props = defineProps<OperationPropsBase>()

const context = inject<FormContext>('shilp-form')!

function run() {
  return context.runOperation(props.operation)
}
</script>
