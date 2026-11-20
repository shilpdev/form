export type FieldErrors = Record<string, string>

/*
 * The error shape every package works with. An operation's `onError` returns it to set the error.
 * Example: `{ name: 'ValidationError', message: 'Fix the fields.', fieldErrors: { email: 'Taken' } }`
 */
export interface OperationError {
  name: string
  message: string
  fieldErrors: FieldErrors
}
