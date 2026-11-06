<template>
  <Form v-bind="formProps">
    <template #default="scope">
      <slot v-bind="scope" />
    </template>
  </Form>
</template>

<script setup lang="ts">
import { Form, type FormProps } from '@shilp.dev/vue-form'
import { formOptions } from '~/utils/form-options'

// The app's `Form`: Zod options set once here, any of them can still be overridden by a prop.
const props = defineProps<FormProps>()

const formProps = computed(() => {
  const given = Object.entries(props).filter(([, value]) => {
    return value !== undefined
  })
  return { ...formOptions, ...Object.fromEntries(given) }
})
</script>
