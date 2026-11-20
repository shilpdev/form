import equal from 'fast-deep-equal'
import type {
  Field,
  FieldErrors,
  FormMode,
  FormPropsBase,
  OperationItem,
  Values,
} from './types'

export const resolveSchema = (
  mode: FormMode,
  props: Pick<FormPropsBase, 'create' | 'update'>,
): unknown => {
  if (mode === 'create') {
    return props.create?.schema
  }
  return props.update?.schema
}

/*
 * The built-in operations first, each with its key, then the custom ones. A built-in operation is
 * listed only when its prop is given.
 */
export const getOperations = (
  props: Pick<FormPropsBase, 'create' | 'read' | 'update' | 'delete' | 'operations'>,
): OperationItem[] => {
  const operations: OperationItem[] = []
  if (props.create) {
    operations.push({ ...props.create, key: 'create' })
  }
  if (props.read) {
    operations.push({ ...props.read, key: 'read' })
  }
  if (props.update) {
    operations.push({ ...props.update, key: 'update' })
  }
  if (props.delete) {
    operations.push({ ...props.delete, key: 'delete' })
  }
  return [...operations, ...(props.operations ?? [])]
}

export const getDefaultValues = (fields: Field[]): Values => {
  return fields.reduce<Values>((acc, field) => {
    acc[field.name] = field.value ?? null
    return acc
  }, {})
}

/*
 * Every field gets a key, even when the loaded item has no value for it.
 * Example: fields `name`, `email` and loaded `{ name: 'A' }` -> `{ name: 'A', email: null }`
 */
export const mergeWithDefaults = (fields: Field[], values: Values | null | undefined): Values => {
  return { ...getDefaultValues(fields), ...(values ?? {}) }
}

export const getDirtyValues = (dirty: string[], values: Values): Values => {
  return dirty.reduce<Values>((acc, name) => {
    acc[name] = values[name]
    return acc
  }, {})
}

export const addTouched = (touched: string[], name: string): string[] => {
  if (touched.includes(name)) {
    return touched
  }
  return [...touched, name]
}

export const toggleDirty = (
  dirty: string[],
  name: string,
  value: unknown,
  initialValues: Values,
): string[] => {
  const isDirty = !equal(initialValues[name], value)
  if (isDirty && !dirty.includes(name)) {
    return [...dirty, name]
  }
  if (!isDirty && dirty.includes(name)) {
    return dirty.filter((item) => {
      return item !== name
    })
  }
  return dirty
}

/*
 * A new `fieldErrors` object: `errors` with `updates` applied. An update with an empty message
 * removes that field's error. With no arguments it is an empty object.
 * Example: `({ email: 'Taken' }, { email: null, name: 'Required' })` -> `{ name: 'Required' }`
 */
export const generateFieldErrors = (
  errors: FieldErrors = {},
  updates: Record<string, string | null | undefined> = {},
): FieldErrors => {
  const next = { ...errors }
  Object.entries(updates).forEach(([name, message]) => {
    if (message) {
      next[name] = message
    } else {
      delete next[name]
    }
  })
  return next
}

/*
 * Input events come in two forms: a plain value from a UI library (`'some text'`, `true`) or a
 * native DOM event (`event.target.value`). A checkbox event gives `checked`.
 */
export const getInputValue = (input: unknown): unknown => {
  if (input == null || typeof input !== 'object' || !('target' in input)) {
    return input
  }
  const target = (input as { target: unknown }).target as {
    type?: string
    value?: unknown
    checked?: boolean
  } | null
  if (target == null || typeof target !== 'object') {
    return input
  }
  if (target.type === 'checkbox') {
    return target.checked
  }
  return target.value
}
