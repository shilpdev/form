/*
 * One place for every message, so both packages say the same thing. To change the UI copy, pass
 * your own slot / render function instead of editing these.
 */
export const LOADING_MESSAGE = 'Loading...'
export const CREATE_MESSAGE = 'Create'
export const CREATING_MESSAGE = 'Creating...'
export const UPDATE_MESSAGE = 'Update'
export const UPDATING_MESSAGE = 'Updating...'
export const DELETE_MESSAGE = 'Delete'
export const DELETING_MESSAGE = 'Deleting...'
export const CONTEXT_OUTSIDE_FORM_MESSAGE = 'useFormContext must be used within a Form'
export const FIELD_CONTEXT_OUTSIDE_FIELD_MESSAGE = 'FormFieldError must be used within a FormField or be given a name'

export const getErrorMessage = (error: { name: string; message: string }): string => {
  return `${error.name}: ${error.message}`
}

/** Warned when two operations share a `key`; the first one is used. */
export const getDuplicateOperationKeyMessage = (key: string): string => {
  return `More than one operation has the key "${key}". The first one is used.`
}

export const getFieldNotFoundMessage = (name: string): string => {
  return `Field "${name}" not found in the schema`
}

/** Warned when `modeDetector` returns something other than `'create'` or `'update'`. */
export const getInvalidModeMessage = (mode: unknown): string => {
  return `modeDetector returned "${String(mode)}". Expected 'create' or 'update'; any other value is treated as 'update'.`
}
