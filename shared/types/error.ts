/** Field error messages keyed by field name. */
export type FieldErrors = Record<string, string>

/** The error shape every package works with. `errorAdapter` turns any thrown value into this. */
export interface FormError {
  name: string
  message: string
  fieldErrors: FieldErrors
}
