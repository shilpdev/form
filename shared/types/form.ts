import type { FormError, FieldErrors } from './error'
import type { Field, FieldInput, Values } from './field'

/** `create` when there is no item yet, `update` when `itemId` points at an existing item. */
export type FormMode = 'create' | 'update'

/** The actions that have a button component. */
export type FormAction = 'create' | 'update' | 'delete' | 'archive' | 'unarchive'

/** Loose object for consumer data the library passes through without reading it. */
export type Meta = Record<string, unknown>

/** What every handler (`read`, `create`, `update`, `delete`, `archive`, `unarchive`) resolves with. */
export interface ItemResponse {
  /** Loaded into the form. Missing keys fall back to the field defaults. */
  values?: Values
  [key: string]: unknown
}

/** Data only (no methods): handed to the handlers, `validateSchema` and `errorAdapter`. */
export interface FormState<Schema = unknown> {
  mode: FormMode
  itemId?: string | number
  schema?: Schema
  createSchema?: Schema
  updateSchema?: Schema
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
  isArchived: boolean
  isLoading: boolean
  isReading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isArchiving: boolean
  isUnarchiving: boolean
}

export interface FormActions {
  readItem: () => Promise<void>
  createItem: () => Promise<void>
  updateItem: () => Promise<void>
  deleteItem: () => Promise<void>
  archiveItem: () => Promise<void>
  unarchiveItem: () => Promise<void>
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
export type FormContext<Schema = unknown> = FormState<Schema> & FormActions

export type ItemHandler<Schema = unknown> = (state: FormState<Schema>) => Promise<ItemResponse>

/** Options that can be set once for the app and overridden per form. */
/**
 * Options that can be set once for the app and overridden per form. Written as methods so options
 * typed for one schema library (for example `FormOptions<ZodObject>`) can be passed where
 * `FormOptions<unknown>` is expected.
 */
export interface FormOptions<Schema = unknown> {
  /** Decides create or update from the item id. */
  resolveMode(input: { itemId?: string | number }): FormMode
  /** Turns your schema (Zod, Yup, an array, ...) into the list of fields. */
  schemaToFields(schema: Schema | undefined): FieldInput[]
  /** Runs before `create` and `update`. Throw (or reject) to stop the request. */
  validateSchema(state: FormState<Schema>): Promise<unknown> | unknown
  /** Turns any thrown value into a `FormError`. */
  errorAdapter(error: unknown, state: FormState<Schema>): FormError
  /** Reads `isArchived` from an item response. */
  isArchivedItemCheck(response: ItemResponse): boolean
}

export interface FormPropsBase<Schema = unknown> extends Partial<FormOptions<Schema>> {
  itemId?: string | number
  schema?: Schema
  /** Used instead of `schema` in create mode. */
  createSchema?: Schema
  /** Used instead of `schema` in update mode. */
  updateSchema?: Schema
  read?: ItemHandler<Schema>
  create?: ItemHandler<Schema>
  update?: ItemHandler<Schema>
  delete?: ItemHandler<Schema>
  archive?: ItemHandler<Schema>
  unarchive?: ItemHandler<Schema>
  /** Free-form data passed through to the handlers in `state.meta`. */
  meta?: Meta
}

/** Scope of `Form`, `FormFields`, `FormError` and the action buttons. */
export interface FormScope<Schema = unknown> {
  context: FormContext<Schema>
}

export interface FormFieldPropsBase {
  name: string
}

/** Scope of `FormField`: the context plus what it computes for one field. */
export interface FieldScope<Schema = unknown> extends FormScope<Schema> {
  field: Field
  name: string
  label: string
  value: unknown
  error: string | null
  /** Sets this field's value (`setValue` bound to the field name). */
  updateValue: (value: unknown) => void
}
