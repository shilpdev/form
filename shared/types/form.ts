import type { OperationError, FieldErrors } from './error'
import type { Field, Values } from './field'

/** `create` when there is no item yet, `update` when `itemId` points at an existing item. */
export type FormMode = 'create' | 'update'

/** Loose object for consumer data the library passes through without reading it. */
export type Meta = Record<string, unknown>

/** What every `handler` must resolve with: `{ values }` to load into the form, plus any extra keys. */
export interface OperationResponse {
  /** Loaded into the form. Missing keys fall back to the field defaults. */
  values?: Values
  [key: string]: unknown
}

/** Data only (no methods): handed to the handlers and `schemaValidator`. */
export interface FormState {
  mode: FormMode
  itemId?: string | number
  /** The schema in use: the one of the operation being run, or of the current mode in the context. */
  schema?: unknown
  fields: Field[]
  values: Values
  initialValues: Values
  dirtyValues: Values
  /** Names of the fields the user has changed at least once. */
  touched: string[]
  /** Names of the fields whose value differs from `initialValues`. */
  dirty: string[]
  error: OperationError | null
  /** Per-field messages: from `error.fieldErrors`, plus any set with `setFieldError`. */
  fieldErrors: FieldErrors
  /** The `meta` of the operation being run. Not set in the context. */
  meta?: Meta
  response: OperationResponse | null
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

export type ItemHandler = (state: FormState) => Promise<OperationResponse>

/** What `create`, `read`, `update` and `delete` each take. */
export interface OperationConfig {
  /*
   * `unknown` because every operation may use a different schema type: the library never reads it,
   * only your `fieldsGenerator` and `schemaValidator` do.
   */
  schema?: unknown
  handler: ItemHandler
  /** Runs after the response is stored. */
  onSuccess?(response: OperationResponse, state: FormState): void
  /*
   * Gets whatever the handler or `schemaValidator` threw. Return an `OperationError` to set `error`
   * and `fieldErrors`; return nothing to leave them empty.
   */
  onError?(error: unknown, state: FormState): OperationError | undefined
  /** Passed to this operation's handler, `schemaValidator` and `onError` as `state.meta`. */
  meta?: Meta
}

/*
 * The option props are required and written as methods so a function that narrows its argument (for example
 * `fieldsGenerator({ schema }: { schema: ZodObject | undefined })`) can still be passed.
 */
export interface FormPropsBase {
  itemId?: string | number
  create?: OperationConfig
  read?: OperationConfig
  update?: OperationConfig
  delete?: OperationConfig
  /** Required: the library does not decide which item ids mean create mode. */
  modeDetector(input: { itemId?: string | number }): FormMode
  /** Required: turns the schema of the current mode into the list of fields. */
  fieldsGenerator(input: { schema: unknown }): Field[]
  /** Runs before `create` and `update`. Throw (or reject) to stop the request. */
  schemaValidator(state: FormState): Promise<unknown>
}

export interface FormScope {
  context: FormContext
}
