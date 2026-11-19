<template>
  <Form
    :item-id="itemId"
    :read="read"
    :create="create"
    :update="update"
    :delete="delete"
    :mode-detector="modeDetector"
    :fields-generator="fieldsGenerator"
    :schema-validator="schemaValidator"
  >
    <template #default="scope">
      <pre>{{ itemId }}</pre>
      <slot v-bind="scope" />
    </template>
  </Form>
</template>

<script setup lang="ts">
import {
  Form,
  type Field,
  type FormMode,
  type FormProps,
  type FormState,
} from '@shilp.dev/vue-form'
import type { ZodObject } from 'zod'

defineProps<Pick<FormProps, 'itemId' | 'read' | 'create' | 'update' | 'delete'>>()

// `+` in the URL is the "new user" id, so it means create mode like a missing id.
function modeDetector({ itemId }: { itemId?: string | number }): FormMode {
  if (itemId === undefined || itemId === '' || itemId === '+') {
    return 'create'
  }
  return 'update'
}

function fieldsGenerator({ schema }: { schema: ZodObject | undefined }): Field[] {
  if (!schema) {
    return []
  }
  return Object.keys(schema.shape).map((name) => {
    return { name, label: name.charAt(0).toUpperCase() + name.slice(1), value: '' }
  })
}

/*
 * Throws the Zod issues as `errors`, which `onError` on the user page turns into `fieldErrors`.
 */
async function schemaValidator(state: FormState) {
  const schema = state.schema as ZodObject | undefined
  if (!schema) {
    return
  }
  const result = schema.safeParse(state.values)
  if (result.success) {
    return
  }
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    errors[String(issue.path[0])] = issue.message
  })
  throw { name: 'ValidationError', message: 'Please fix the highlighted fields.', errors }
}
</script>
