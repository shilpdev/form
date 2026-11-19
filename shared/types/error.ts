export type FieldErrors = Record<string, string>

/** The error shape every package works with. An operation's `onError` returns it to set the error. */
export interface OperationError {
  name: string
  message: string
  fieldErrors: FieldErrors
}
