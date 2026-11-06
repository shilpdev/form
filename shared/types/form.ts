import type { FormError, FieldErrors } from './error'
import type { Field, Values } from './field'

/** `create` when there is no item yet, `update` when `itemId` points at an existing item. */
export type FormMode = 'create' | 'update'

/** The actions that have a button component. */
export type FormAction = 'create' | 'update' | 'delete'

/** Loose object for consumer data the library passes through without reading it. */
export type Meta = Record<string, unknown>

/** What every handler (`read`, `create`, `update`, `delete`) resolves with. */
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
  /** The fields of the schema in use for the current mode, normalized. */
  fields: Field[]
  values: Values
  initialValues: Values
  /** Only the values that differ from `initialValues`. */
  dirtyValues: Values
  /** Names of the fields the user has changed at least once. */
  touched: string[]
  /** Names of the fields whose value differs from `initialValues`. */
  dirty: string[]
  error: FormError | null
  /** Per-field messages: from `error.fieldErrors`, plus any set with `setFieldError`. */
  fieldErrors: FieldErrors
  meta?: Meta
  /** The last handler response. */
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

/** State plus actions: what every slot / render prop gets as `context`. */
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
  /** Free-form data passed through to the handlers in `state.meta`. */
  meta?: Meta
  /** Decides create or update from the item id. */
  resolveMode?(input: { itemId?: string | number }): FormMode
  /** Turns your schema (Zod, Yup, an array, ...) into the list of fields. */
  schemaToFields?(schema: unknown): Field[]
  /** Runs before `create` and `update`. Throw (or reject) to stop the request. */
  validateSchema?(state: FormState): Promise<unknown>
  /** Turns any thrown value into a `FormError`. */
  errorAdapter?(error: unknown, state: FormState): FormError
}

/** Scope of `Form`, `FormFields`, `FormError` and the action buttons. */
export interface FormScope {
  context: FormContext
}
