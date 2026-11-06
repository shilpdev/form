import type { FormScope } from './form'

/** What `schemaToFields` returns per field: always has a `name` and a `label`. Extra keys are kept. */
export interface Field {
  name: string
  label: string
  /** Default value used in create mode and by `resetForm`. */
  value?: unknown
  [key: string]: unknown
}

/** Form values keyed by field name. Loose on purpose: the library does not read the values. */
export type Values = Record<string, unknown>

export interface FieldPropsBase {
  name: string
}

/** Scope of `FormField`: the context plus what it computes for one field. */
export interface FieldScope extends FormScope {
  field: Field
  name: string
  label: string
  value: unknown
  error: string | null
  /** Sets this field's value (`setValue` bound to the field name). */
  updateValue: (value: unknown) => void
}
