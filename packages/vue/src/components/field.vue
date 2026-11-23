<template>
  <div v-if="field" class="shilp-form__field">
    <slot v-bind="scope">
      <label>
        <span>{{ scope.label }}</span>
        <input v-bind="scope.nativeModel" />
        <span v-if="scope.error" class="shilp-form__field-error">{{ scope.error }}</span>
      </label>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { FormContext } from '@shared'
import { getFieldNotFoundMessage } from '@shared/constants/messages'
import { getInputValue } from '@shared/utils'
import { computed, inject, provide } from 'vue'
import type { VueFieldScope } from '../types'

defineOptions({
  name: 'FormField',
})

const { name } = defineProps<{ name: string }>()

const context = inject<FormContext>('shilp-form')!

function updateValue(input: unknown) {
  context.setFieldValue(name, getInputValue(input))
}

function getField() {
  const field = context.fields.find((item) => {
    return item.name === name
  })
  if (!field) {
    console.warn(getFieldNotFoundMessage(name))
    return null
  }
  return field
}

// Only read inside `v-if="field"`, so the field always exists here.
function getScope(): VueFieldScope {
  const value = context.values[name]
  return {
    context,
    field: field.value!,
    name,
    label: field.value!.label,
    value,
    error: context.fieldErrors[name] ?? null,
    updateValue,
    model: { modelValue: value, 'onUpdate:modelValue': updateValue },
    nativeModel: { name, value: value ?? '', onInput: updateValue },
  }
}

const field = computed(() => {
  return getField()
})

const scope = computed(() => {
  return getScope()
})

provide('shilp-form-field', scope)
</script>
