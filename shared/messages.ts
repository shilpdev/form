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
