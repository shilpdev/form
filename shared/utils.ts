import equal from 'fast-deep-equal'
import type {
  Field,
  FieldErrors,
  FormMode,
  FormPropsBase,
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

export const getDefaultValues = (fields: Field[]): Values => {
  return fields.reduce<Values>((acc, field) => {
    acc[field.name] = field.value ?? null
    return acc
  }, {})
}

// Every field gets a key, even when the loaded item has no value for it.
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

export const setFieldErrorIn = (
  errors: FieldErrors,
  name: string,
  message: string | null | undefined,
): FieldErrors => {
  const next = { ...errors }
  if (message == null || message === '') {
    delete next[name]
  } else {
    next[name] = message
  }
  return next
}

export const setFieldErrorsIn = (errors: FieldErrors, updates: FieldErrors): FieldErrors => {
  return Object.keys(updates).reduce((acc, name) => {
    return setFieldErrorIn(acc, name, updates[name])
  }, errors)
}

// A copy, so editing the form never changes `initialValues`.
export const cloneValues = (values: Values): Values => {
  return structuredClone(values)
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
