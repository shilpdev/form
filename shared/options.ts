import type { Field, FormError, FormMode } from './types'
import { UNKNOWN_ERROR_MESSAGE, UNKNOWN_ERROR_NAME } from './messages'

/*
 * The fallback of each option prop of `Form`, used when the user does not pass one. "No item yet"
 * ids (`undefined`, `null`, `''`, `'+'`) mean create mode.
 */

export const defaultResolveMode = ({ itemId }: { itemId?: string | number }): FormMode => {
  if (itemId === undefined || itemId === null || itemId === '' || itemId === '+') {
    return 'create'
  }
  return 'update'
}

/** Accepts an array of `Field` objects as the schema, so no adapter is needed for that. */
export const defaultSchemaToFields = (schema: unknown): Field[] => {
  if (Array.isArray(schema)) {
    return schema as Field[]
  }
  return []
}

export const defaultValidateSchema = (): Promise<void> => {
  return Promise.resolve()
}

export const defaultErrorAdapter = (error: unknown): FormError => {
  const source = (error ?? {}) as {
    name?: string
    message?: string
    errors?: Record<string, string>
  }
  return {
    name: source.name || UNKNOWN_ERROR_NAME,
    message: source.message || UNKNOWN_ERROR_MESSAGE,
    fieldErrors: source.errors || {},
  }
}
