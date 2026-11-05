/*
 * App-wide form options for Zod schemas, passed once to the `ShilpForm` plugin:
 * `schemaToFields` reads the field names from the object shape, and `validateSchema` throws the Zod
 * issues as `errors`, which the default `errorAdapter` turns into `fieldErrors`.
 */
import type { FieldInput, FormOptions, FormState } from '@shilp.dev/vue-form'
import type { ZodObject } from 'zod'

type Schema = ZodObject

const schemaToFields = (schema: Schema | undefined): FieldInput[] => {
  if (!schema) {
    return []
  }
  return Object.keys(schema.shape).map((name) => {
    return { name, value: '' }
  })
}

const validateSchema = (state: FormState<Schema>) => {
  if (!state.schema) {
    return
  }
  const result = state.schema.safeParse(state.values)
  if (result.success) {
    return
  }
  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    errors[String(issue.path[0])] = issue.message
  })
  throw { name: 'ValidationError', message: 'Please fix the highlighted fields.', errors }
}

export const formOptions: Partial<FormOptions<Schema>> = {
  schemaToFields,
  validateSchema,
}
