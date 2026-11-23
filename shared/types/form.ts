import type { OperationError, FieldErrors } from './error'
import type { Field, Values } from './field'

/** `create` when there is no item yet, `update` when `itemId` points at an existing item. */
export type FormMode = 'create' | 'update'

/** Loose object for consumer data the library passes through without reading it. */
export type Meta = Record<string, unknown>

/*
 * What every `handler` must resolve with: `{ values }` to load into the form, plus any extra keys.
 * Example: `{ values: { name: 'Aarav' }, id: 1 }`
 */
export interface OperationResponse {
  /** Loaded into the form. Missing keys fall back to the field defaults. */
  values?: Values
  [key: string]: unknown
}

/** Data only (no methods): handed to the handlers, `schemaValidator` and the callbacks. */
export interface FormState {
  mode: FormMode
  itemId?: string | number
  operations: OperationItem[]
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
  response: OperationResponse | null
  isCreateMode: boolean
  isUpdateMode: boolean
  /*
   * Whether each operation is running, by key.
   * Example: `{ create: true, approve: false }`
   */
  running: Record<string, boolean>
  isLoading: boolean
  isReading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
}

export interface FormActions {
  /** Runs the operation with this `key`: a built-in one (`create`, ...) or a custom one. */
  runOperation: (key: string) => Promise<void>
  isRunning: (key: string) => boolean
  /** Sets one value, marks the field touched, updates `dirty` and clears that field's error. */
  setFieldValue: (name: string, value: unknown) => void
  setFieldError: (name: string, message: string | null) => void
  /** Replaces all field errors with `errors`; the old ones are dropped. */
  setFieldErrors: (errors: FieldErrors) => void
  clearErrors: () => void
  /** Back to the field defaults (create mode) or the last loaded values (update mode). */
  reset: () => void
  /** Runs setup again: reads the item in update mode, loads the defaults in create mode. */
  refresh: () => void
}

export type FormContext = FormState & FormActions

export type ItemHandler = (state: FormState) => Promise<OperationResponse>

export interface OperationConfig {
  /*
   * `unknown` because every operation may use a different schema type: the library never reads it,
   * only your `fieldsGenerator` and `schemaValidator` do. When set, `schemaValidator` runs before
   * the handler; without it, nothing is validated.
   */
  schema?: unknown
  handler: ItemHandler
  /*
   * Runs after the response is stored and its `values` are loaded, so `state.response` is the
   * response.
   */
  onSuccess?(state: FormState): void
  /*
   * Gets whatever the handler or `schemaValidator` threw. Return an `OperationError` to set `error`
   * and `fieldErrors`; return nothing to leave them empty.
   */
  onError?(error: unknown, state: FormState): OperationError | undefined
  /** Free-form data for your own use. Read it back from `state.operations`. */
  meta?: Meta
}

export interface OperationItem extends OperationConfig {
  /** Unique. `create`, `read`, `update` and `delete` are taken by the built-in operations. */
  key: string
}

/*
 * The option props are required and written as methods so a function that narrows its argument
 * (for example `fieldsGenerator({ schema }: { schema: ZodObject | undefined })`) can still be
 * passed.
 */
export interface FormPropsBase {
  itemId?: string | number
  create?: OperationConfig
  read?: OperationConfig
  update?: OperationConfig
  delete?: OperationConfig
  /** Custom operations. Each needs a unique `key`; run one with `runOperation(key)`. */
  operations?: OperationItem[]
  /*
   * Required: the library does not decide which item ids mean create mode.
   * Example: `{ itemId: '+' }` -> `'create'`, `{ itemId: '12' }` -> `'update'`
   */
  modeDetector(input: { itemId?: string | number }): FormMode
  fieldsGenerator(input: { schema: unknown }): Field[]
  /*
   * Runs before the handler of an operation that has a `schema`. Throw (or reject) to stop the
   * request.
   */
  schemaValidator(state: FormState, operation: OperationItem): Promise<unknown>
}

export interface FormScope {
  context: FormContext
}

export interface OperationScope extends FormScope {
  run: () => Promise<void>
}

export interface OperationPropsBase {
  operation: string
}
