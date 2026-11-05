import type {
  FieldInput,
  FormAction,
  FormError,
  FormMode,
  FormOptions,
  FormState,
  ItemResponse,
} from './types'
import {
  ARCHIVE_MESSAGE,
  ARCHIVING_MESSAGE,
  CREATE_MESSAGE,
  CREATING_MESSAGE,
  DELETE_MESSAGE,
  DELETING_MESSAGE,
  UNARCHIVE_MESSAGE,
  UNARCHIVING_MESSAGE,
  UNKNOWN_ERROR_MESSAGE,
  UNKNOWN_ERROR_NAME,
  UPDATE_MESSAGE,
  UPDATING_MESSAGE,
} from './messages'

/** Item ids that mean "no item yet" with the default `resolveMode`. */
export const CREATE_ITEM_IDS: readonly unknown[] = Object.freeze([undefined, null, '', '+'])

/** Prefix of every CSS class the packages render, e.g. `shilp-form__field`. */
export const CLASS_PREFIX = 'shilp-form'

/** Key of the global options (Vue `provide` / React context). */
export const OPTIONS_KEY = 'shilp-form-options'

/** Key of the form context (Vue `provide`). */
export const CONTEXT_KEY = 'shilp-form-context'

const resolveMode = ({ itemId }: { itemId?: string | number }): FormMode => {
  if (CREATE_ITEM_IDS.includes(itemId)) {
    return 'create'
  }
  return 'update'
}

/** Accepts an array of field names or field objects as the schema, so no adapter is needed for that. */
const schemaToFields = (schema: unknown): FieldInput[] => {
  if (Array.isArray(schema)) {
    return schema as FieldInput[]
  }
  return []
}

const validateSchema = (): Promise<void> => {
  return Promise.resolve()
}

const errorAdapter = (error: unknown): FormError => {
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

const isArchivedItemCheck = (response: ItemResponse): boolean => {
  return response?.isArchived === true
}

/** Used for any option that neither the app nor the form sets. Frozen so nothing can change them. */
export const DEFAULT_OPTIONS: Readonly<FormOptions> = Object.freeze({
  resolveMode,
  schemaToFields,
  validateSchema,
  errorAdapter,
  isArchivedItemCheck,
})

type BooleanStateKey = {
  [Key in keyof FormState]-?: FormState[Key] extends boolean ? Key : never
}[keyof FormState]

/** Per button: the state flag set while it runs, and its idle and running text. */
export const ACTION_LABELS: Readonly<
  Record<FormAction, { flag: BooleanStateKey; idle: string; running: string }>
> = Object.freeze({
  create: { flag: 'isCreating', idle: CREATE_MESSAGE, running: CREATING_MESSAGE },
  update: { flag: 'isUpdating', idle: UPDATE_MESSAGE, running: UPDATING_MESSAGE },
  delete: { flag: 'isDeleting', idle: DELETE_MESSAGE, running: DELETING_MESSAGE },
  archive: { flag: 'isArchiving', idle: ARCHIVE_MESSAGE, running: ARCHIVING_MESSAGE },
  unarchive: { flag: 'isUnarchiving', idle: UNARCHIVE_MESSAGE, running: UNARCHIVING_MESSAGE },
})
