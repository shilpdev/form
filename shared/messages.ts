/**
 * Every message the packages show or throw, so @shilp.dev/react-form and @shilp.dev/vue-form say
 * the same thing. Static text is a `*_MESSAGE` constant; text built from values is a `get*Message`
 * function. Override the UI copy by passing your own slot / render function.
 */
export const LOADING_MESSAGE = 'Loading...'
export const CREATE_MESSAGE = 'Create'
export const CREATING_MESSAGE = 'Creating...'
export const UPDATE_MESSAGE = 'Update'
export const UPDATING_MESSAGE = 'Updating...'
export const DELETE_MESSAGE = 'Delete'
export const DELETING_MESSAGE = 'Deleting...'
export const UNKNOWN_ERROR_NAME = 'Unknown Error'
export const UNKNOWN_ERROR_MESSAGE = 'There was an unknown error. Please try again.'
/** Thrown by `useFormContext` when no `Form` is above it. */
export const CONTEXT_OUTSIDE_FORM_MESSAGE = 'useFormContext must be used within a Form'

export const getErrorMessage = (error: { name: string; message: string }): string => {
  return `${error.name}: ${error.message}`
}

/** Warned by `FormField` when its `name` is not in the schema. */
export const getFieldNotFoundMessage = (name: string): string => {
  return `Field "${name}" not found in the schema`
}
