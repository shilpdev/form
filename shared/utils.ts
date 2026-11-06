import equal from 'fast-deep-equal'
import type {
  Field,
  FieldErrors,
  FormAction,
  FormMode,
  FormPropsBase,
  FormState,
  Values,
} from './types'
import { ACTION_LABELS } from './constants'
import { LOADING_MESSAGE } from './messages'

export const resolveSchema = (
  mode: FormMode,
  props: Pick<FormPropsBase, 'schema' | 'createSchema' | 'updateSchema'>,
): unknown => {
  if (mode === 'create' && props.createSchema) {
    return props.createSchema
  }
  if (mode === 'update' && props.updateSchema) {
    return props.updateSchema
  }
  return props.schema
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

/*
 * Create shows in create mode only. Update and delete show in update mode only, and delete is
 * hidden while the item is being read so a half-loaded item cannot be deleted.
 */
export const isActionVisible = (action: FormAction, state: FormState): boolean => {
  if (action === 'create') {
    return state.isCreateMode
  }
  if (!state.isUpdateMode) {
    return false
  }
  if (action === 'update') {
    return true
  }
  if (state.isReading) {
    return false
  }
  return true
}

export const getActionLabel = (action: FormAction, state: FormState): string => {
  const labels = ACTION_LABELS[action]
  if (state[labels.flag]) {
    return labels.running
  }
  if (state.isReading) {
    return LOADING_MESSAGE
  }
  return labels.idle
}
