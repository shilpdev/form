'use client'

import { Form, type Field, type FormMode, type FormProps, type FormState, type OperationItem } from '@shilp.dev/react-form'
import type { ZodObject } from 'zod'

type AppFormProps = Pick<FormProps, 'itemId' | 'read' | 'create' | 'update' | 'delete' | 'children'>

// `+` in the URL is the "new user" id, so it means create mode like a missing id.
const modeDetector = ({ itemId }: { itemId?: string | number }): FormMode => {
  if (itemId === undefined || itemId === '' || itemId === '+') {
    return 'create'
  }
  return 'update'
}

const fieldsGenerator = ({ schema }: { schema: ZodObject | undefined }): Field[] => {
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
const schemaValidator = async (state: FormState, operation: OperationItem) => {
  const schema = operation.schema as ZodObject | undefined
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

export function AppForm({ itemId, read, create, update, delete: remove, children }: AppFormProps) {
  return (
    <Form
      itemId={itemId}
      read={read}
      create={create}
      update={update}
      delete={remove}
      modeDetector={modeDetector}
      fieldsGenerator={fieldsGenerator}
      schemaValidator={schemaValidator}
    >
      {children}
    </Form>
  )
}
