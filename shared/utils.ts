import equal from 'fast-deep-equal'
import type {
  Field,
  FieldErrors,
  FieldInput,
  FormAction,
  FormError,
  FormMode,
  FormOptions,
  FormPropsBase,
  FormState,
  ItemHandler,
  ItemResponse,
  Values,
} from './types'
import { DEFAULT_OPTIONS } from './constants'
import { ACTION_LABELS } from './constants'
import { getMissingHandlerMessage, LOADING_MESSAGE } from './messages'

/** `firstName` and `first_name` become `First Name`. */
export const startCase = (text: string): string => {
  if (!text) {
    return text
  }
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export const isEqual = (a: unknown, b: unknown): boolean => {
  return equal(a, b)
}

/**
 * Turns field names or partial field objects into `Field` objects with a `label`, nested `attrs` too.
 * A `label` that is already set is kept.
 */
export const attrSerializer = (attrs: FieldInput[]): Field[] => {
  return attrs.map((item) => {
    if (typeof item === 'string') {
      return { name: item, label: startCase(item) }
    }
    const field: Field = { ...item, label: item.label ?? startCase(item.name) } as Field
    if (item.attrs) {
      field.attrs = attrSerializer(item.attrs)
    }
    return field
  })
}

/** Same as `attrSerializer`, but skips entries that are neither a name nor an object with a `name`. */
export const normalizeFields = (inputs: FieldInput[] | null | undefined): Field[] => {
  if (!Array.isArray(inputs)) {
    return []
  }
  const valid = inputs.filter((input) => {
    if (typeof input === 'string') {
      return input.length > 0
    }
    return input != null && typeof input === 'object' && typeof input.name === 'string'
  })
  return attrSerializer(valid)
}

/** App options over the defaults, then the form's own props over both. */
export const resolveOptions = <Schema>(
  globalOptions: Partial<FormOptions<Schema>> | null | undefined,
  props: Partial<FormOptions<Schema>>,
): FormOptions<Schema> => {
  const merged = { ...DEFAULT_OPTIONS, ...(globalOptions ?? {}) } as FormOptions<Schema>
  const keys = Object.keys(DEFAULT_OPTIONS) as (keyof FormOptions)[]
  keys.forEach((key) => {
    if (props[key]) {
      ;(merged as unknown as Record<string, unknown>)[key] = props[key]
    }
  })
  return merged
}

/** `createSchema` in create mode and `updateSchema` in update mode when given, `schema` otherwise. */
export const resolveSchema = <Schema>(
  mode: FormMode,
  props: Pick<FormPropsBase<Schema>, 'schema' | 'createSchema' | 'updateSchema'>,
): Schema | undefined => {
  if (mode === 'create' && props.createSchema) {
    return props.createSchema
  }
  if (mode === 'update' && props.updateSchema) {
    return props.updateSchema
  }
  return props.schema
}

/** Field defaults: `field.value` or `null`. */
export const getDefaultValues = (fields: Field[]): Values => {
  return fields.reduce<Values>((acc, field) => {
    acc[field.name] = field.value ?? null
    return acc
  }, {})
}

/** Loaded values over the field defaults, so every field has a key. */
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

/** Adds or removes `name` from `dirty` by comparing the value with its initial value. */
export const toggleDirty = (
  dirty: string[],
  name: string,
  value: unknown,
  initialValues: Values,
): string[] => {
  const isDirty = !isEqual(initialValues[name], value)
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

/** Sets one message, or removes it when `message` is empty. */
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

/** `values` passed through `structuredClone`, so editing the form never changes `initialValues`. */
export const cloneValues = (values: Values): Values => {
  return structuredClone(values)
}

interface RunItemActionInput<Schema> {
  /** Handler prop name, used in the "not provided" error. */
  name: string
  handler: ItemHandler<Schema> | undefined
  /** `create` and `update` run `validateSchema` first. */
  isValidated: boolean
  options: FormOptions<Schema>
  /** Returns the latest state, so the handler sees values set in the same event. */
  getState: () => FormState<Schema>
  setIsRunning: (isRunning: boolean) => void
  setError: (error: FormError | null) => void
  onResponse: (response: ItemResponse) => void
}

/**
 * The one request flow every action uses: flag on, clear the error, validate (create and update),
 * call the handler, store the response, adapt any error, flag off. Errors are stored, never thrown,
 * so a click handler can call an action without a `catch`.
 */
export const runItemAction = async <Schema>(input: RunItemActionInput<Schema>): Promise<void> => {
  const { name, handler, isValidated, options, getState, setIsRunning, setError, onResponse } =
    input
  setIsRunning(true)
  setError(null)
  try {
    if (!handler) {
      throw new Error(getMissingHandlerMessage(name))
    }
    if (isValidated) {
      await options.validateSchema(getState())
    }
    const response = await handler(getState())
    onResponse(response ?? {})
  } catch (error) {
    // A TypeError is a bug in the consumer's code, not an API error, so it is logged too.
    if (error instanceof TypeError) {
      console.error(error)
    }
    setError(options.errorAdapter(error, getState()))
  } finally {
    setIsRunning(false)
  }
}

/**
 * Input events come in two forms: a plain value from a UI library (`'some text'`, `true`) or a native
 * DOM event (`event.target.value`). A checkbox event gives `checked`.
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

/** Shown in update mode only, except create. Hidden while the item is being read. */
export const isActionVisible = (action: FormAction, state: FormState<unknown>): boolean => {
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
  if (action === 'archive') {
    return !state.isArchived
  }
  if (action === 'unarchive') {
    return state.isArchived
  }
  return true
}

/** Default button text: the running text while the action runs, `Loading...` while reading. */
export const getActionLabel = (action: FormAction, state: FormState<unknown>): string => {
  const labels = ACTION_LABELS[action]
  if (state[labels.flag]) {
    return labels.running
  }
  if (state.isReading) {
    return LOADING_MESSAGE
  }
  return labels.idle
}
