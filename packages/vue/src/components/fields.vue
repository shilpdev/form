<template>
  <div :class="`${CLASS_PREFIX}__fields`">
    <slot :context="context">
      <FormField v-for="field in context.fields" :key="field.name" :name="field.name" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { CLASS_PREFIX } from '@shared/constants'
import { useFormContext } from '../composables/use-form-context'
import FormField from './field.vue'

/** Wraps the fields. Without a slot it renders a `FormField` for every field. */
defineOptions({
  name: 'FormFields',
})

const context = useFormContext()
</script>
