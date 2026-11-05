<template>
  <div v-if="scope" :class="`${CLASS_PREFIX}__field`">
    <slot v-bind="scope">
      <label>
        <span>{{ scope.label }}</span>
        <input v-bind="scope.nativeModel" />
        <span v-if="scope.error" :class="`${CLASS_PREFIX}__field-error`">{{ scope.error }}</span>
      </label>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { CLASS_PREFIX } from '@shared/constants'
import { getFieldNotFoundMessage } from '@shared/messages'
import { getInputValue } from '@shared/utils'
import { computed } from 'vue'
import { useFormContext } from '../composables/use-form-context'
import type { VueFieldScope } from '../types'

/** One field of the schema. The slot gets `VueFieldScope`. */
defineOptions({
  name: 'FormField',
})

const { name } = defineProps<{ name: string }>()

const context = useFormContext()

function updateValue(input: unknown) {
  context.setValue(name, getInputValue(input))
}

const scope = computed((): VueFieldScope | null => {
  const field = context.fields.find((item) => {
    return item.name === name
  })
  if (!field) {
    console.warn(getFieldNotFoundMessage(name))
    return null
  }
  const value = context.values[name]
  return {
    context,
    field,
    name,
    label: field.label,
    value,
    error: context.fieldErrors[name] ?? null,
    updateValue,
    model: { modelValue: value, 'onUpdate:modelValue': updateValue },
    nativeModel: { name, value: value ?? '', onInput: updateValue },
  }
})
</script>
