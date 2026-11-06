/*
 * Form options for Zod schemas, spread on `Form` by `AppForm`:
 * `schemaToFields` reads the field names from the object shape, and `validateSchema` throws the Zod
 * issues as `errors`, which the default `errorAdapter` turns into `fieldErrors`.
 */
import type { Field, FormProps, FormState } from '@shilp.dev/react-form'
import type { ZodObject } from 'zod'

const schemaToFields = (schema: ZodObject | undefined): Field[] => {
  if (!schema) {
    return []
  }
  return Object.keys(schema.shape).map((name) => {
    return { name, label: name.charAt(0).toUpperCase() + name.slice(1), value: '' }
  })
}

const validateSchema = async (state: FormState) => {
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

export const formOptions: Pick<FormProps, 'schemaToFields' | 'validateSchema'> = {
  schemaToFields,
  validateSchema,
}
