import type { FormScope } from './form'

/** What `fieldsGenerator` returns per field: always has a `name` and a `label`. Extra keys are kept. */
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

export interface FieldScope extends FormScope {
  field: Field
  name: string
  label: string
  value: unknown
  error: string | null
  updateValue: (value: unknown) => void
}
