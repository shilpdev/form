import type { FormError, FieldErrors } from './error'
import type { Field, Values } from './field'

/** `create` when there is no item yet, `update` when `itemId` points at an existing item. */
export type FormMode = 'create' | 'update'

export type FormAction = 'create' | 'update' | 'delete'

/** Loose object for consumer data the library passes through without reading it. */
export type Meta = Record<string, unknown>

export interface ItemResponse {
  /** Loaded into the form. Missing keys fall back to the field defaults. */
  values?: Values
  [key: string]: unknown
}

/** Data only (no methods): handed to the handlers, `validateSchema` and `errorAdapter`. */
export interface FormState {
  mode: FormMode
  itemId?: string | number
  schema?: unknown
  createSchema?: unknown
  updateSchema?: unknown
  fields: Field[]
  values: Values
  initialValues: Values
  dirtyValues: Values
  /** Names of the fields the user has changed at least once. */
  touched: string[]
  /** Names of the fields whose value differs from `initialValues`. */
  dirty: string[]
  error: FormError | null
  /** Per-field messages: from `error.fieldErrors`, plus any set with `setFieldError`. */
  fieldErrors: FieldErrors
  meta?: Meta
  response: ItemResponse | null
  isCreateMode: boolean
  isUpdateMode: boolean
  isLoading: boolean
  isReading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export interface FormActions {
  readItem: () => Promise<void>
  createItem: () => Promise<void>
  updateItem: () => Promise<void>
  deleteItem: () => Promise<void>
  /** Sets one value, marks the field touched, updates `dirty` and clears that field's error. */
  setValue: (name: string, value: unknown) => void
  setFieldError: (name: string, message: string | null) => void
  setFieldErrors: (errors: FieldErrors) => void
  clearErrors: () => void
  /** Back to the field defaults (create mode) or the last loaded values (update mode). */
  resetForm: () => void
  /** Runs setup again: reads the item in update mode, loads the defaults in create mode. */
  refresh: () => void
}

export type FormContext = FormState & FormActions

export type ItemHandler = (state: FormState) => Promise<ItemResponse>

/*
 * `schema`, `createSchema` and `updateSchema` may each be a different type, so they are `unknown`:
 * the library never reads them, only your `schemaToFields` and `validateSchema` do. The option props
 * are written as methods so a function that narrows its argument (for example
 * `schemaToFields(schema: ZodObject | undefined)`) can still be passed.
 */
export interface FormPropsBase {
  itemId?: string | number
  schema?: unknown
  /** Used instead of `schema` in create mode. */
  createSchema?: unknown
  /** Used instead of `schema` in update mode. */
  updateSchema?: unknown
  read?: ItemHandler
  create?: ItemHandler
  update?: ItemHandler
  delete?: ItemHandler
  meta?: Meta
  resolveMode?(input: { itemId?: string | number }): FormMode
  schemaToFields?(schema: unknown): Field[]
  /** Runs before `create` and `update`. Throw (or reject) to stop the request. */
  validateSchema?(state: FormState): Promise<unknown>
  errorAdapter?(error: unknown, state: FormState): FormError
}

export interface FormScope {
  context: FormContext
}
